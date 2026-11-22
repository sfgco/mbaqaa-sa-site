import request from "supertest";
import { describe, expect, it } from "vitest";
import { app, loginAs } from "./setup";

const pdf = { url: "https://files.example.com/governance/bylaws.pdf", thumbnailUrl: "https://files.example.com/governance/bylaws.jpg", pages: 12, bytes: 345678 };

async function setupDocs() {
  const editor = await loginAs("editor");
  const cat = (await editor.post("/api/documents/admin/categories").send({ slug: "bylaws", title: { ar: "اللائحة الأساسية" } }).expect(201)).body;
  const other = (await editor.post("/api/documents/admin/categories").send({ slug: "reports", title: { ar: "التقارير" } }).expect(201)).body;
  return { editor, cat, other };
}

describe("governance documents", () => {
  it("validates file URL and category", async () => {
    const { editor, cat } = await setupDocs();
    const bad = await editor.post("/api/documents/admin").send({ category: cat._id, slug: "x", title: { ar: "س" }, file: { url: "javascript:alert(1)" } }).expect(400);
    expect(bad.body.error.details.fields["file.url"]).toEqual(["invalid_url"]);
    await editor.post("/api/documents/admin").send({ category: "0".repeat(24), slug: "x", title: { ar: "س" }, file: pdf }).expect(400);
  });

  it("publishes, filters, hides drafts/scheduled/inactive, and counts downloads", async () => {
    const { editor, cat, other } = await setupDocs();
    const live = (await editor
      .post("/api/documents/admin")
      .send({ category: cat._id, slug: "bylaws-2025", title: { ar: "اللائحة الأساسية 2025", en: "Bylaws 2025" }, year: 2025, file: pdf })
      .expect(201)).body;
    expect(live.category.slug).toBe("bylaws");
    await editor.post("/api/documents/admin").send({ category: cat._id, slug: "draft-doc", title: { ar: "مسودة" }, file: pdf, status: "draft" }).expect(201);
    await editor.post("/api/documents/admin").send({ category: cat._id, slug: "later", title: { ar: "لاحقًا" }, file: pdf, publishedAt: "2999-01-01" }).expect(201);
    await editor.post("/api/documents/admin").send({ category: other._id, slug: "report-2024", title: { ar: "تقرير" }, year: 2024, file: pdf }).expect(201);

    const all = await request(app).get("/api/documents").expect(200);
    expect(all.body.items.map((d: { slug: string }) => d.slug).sort()).toEqual(["bylaws-2025", "report-2024"]);
    expect(all.body.years).toEqual([2025, 2024]);

    const byCat = await request(app).get("/api/documents?category=bylaws&q=اللائحة").expect(200);
    expect(byCat.body.total).toBe(1);
    expect(byCat.body.years).toEqual([2025]);
    await request(app).get("/api/documents?category=nope").expect(404);

    const cats = await request(app).get("/api/documents/categories").expect(200);
    expect(cats.body.items.map((c: { documentCount: number }) => c.documentCount)).toEqual([1, 1]);

    await request(app).get("/api/documents/draft-doc").expect(404);
    await request(app).get("/api/documents/later").expect(404);
    const one = await request(app).get("/api/documents/bylaws-2025").expect(200);
    expect(one.body.file).toMatchObject({ pages: 12, bytes: 345678 });

    const dl = await request(app).get("/api/documents/bylaws-2025/download").expect(302);
    expect(dl.headers.location).toBe(pdf.url);
    expect((await editor.get(`/api/documents/admin/${live._id}`)).body.downloads).toBe(1);

    // Deactivating a category hides its documents
    await editor.patch(`/api/documents/admin/categories/${other._id}`).send({ active: false }).expect(200);
    expect((await request(app).get("/api/documents")).body.total).toBe(1);
    await request(app).get("/api/documents/report-2024").expect(404);
  });

  it("won't delete a non-empty category", async () => {
    const { editor, cat } = await setupDocs();
    const d = (await editor.post("/api/documents/admin").send({ category: cat._id, slug: "a", title: { ar: "أ" }, file: pdf }).expect(201)).body;
    const res = await editor.delete(`/api/documents/admin/categories/${cat._id}`).expect(409);
    expect(res.body.error.code).toBe("CATEGORY_NOT_EMPTY");
    await editor.delete(`/api/documents/admin/${d._id}`).expect(204);
    await editor.delete(`/api/documents/admin/categories/${cat._id}`).expect(204);
  });

  it("requires sign-in for admin routes", async () => {
    await request(app).get("/api/documents/admin").expect(401);
    await request(app).post("/api/documents/admin/categories").send({}).expect(401);
  });
});

describe("gallery", () => {
  it("albums with images, cover fallback, drafts hidden, cascade delete", async () => {
    const editor = await loginAs("editor");
    const album = (await editor.post("/api/gallery/admin/albums").send({ slug: "ramadan-drive", title: { ar: "حملة رمضان" }, eventDate: "2026-03-01" }).expect(201)).body;
    await editor.post("/api/gallery/admin/albums").send({ slug: "hidden", title: { ar: "مخفي" }, status: "draft" }).expect(201);

    const imgs = (await editor
      .post("/api/gallery/admin/images")
      .send({ album: album._id, images: [{ url: "https://files.example.com/1.jpg" }, { url: "https://files.example.com/2.jpg", caption: { ar: "فرز" } }] })
      .expect(201)).body.items;
    expect(imgs.map((i: { order: number }) => i.order)).toEqual([0, 1]);
    await editor.post("/api/gallery/admin/images/reorder").send({ ids: [imgs[1]._id, imgs[0]._id] }).expect(204);

    const list = await request(app).get("/api/gallery/albums").expect(200);
    expect(list.body.total).toBe(1);
    expect(list.body.items[0]).toMatchObject({ imageCount: 2, coverImage: "https://files.example.com/2.jpg" });

    const one = await request(app).get("/api/gallery/albums/ramadan-drive").expect(200);
    expect(one.body.images.map((i: { url: string }) => i.url)).toEqual(["https://files.example.com/2.jpg", "https://files.example.com/1.jpg"]);
    await request(app).get("/api/gallery/albums/hidden").expect(404);
    expect((await request(app).get("/api/gallery/latest?limit=1")).body.items).toHaveLength(1);

    await editor.delete(`/api/gallery/admin/albums/${album._id}`).expect(204);
    expect((await request(app).get("/api/gallery/latest")).body.items).toHaveLength(0);
  });

  it("stats include documents and albums", async () => {
    const editor = await loginAs("editor");
    const s = (await editor.get("/api/stats").expect(200)).body;
    expect(s.documents).toEqual({ published: 0, downloads: 0 });
    expect(s.albums).toEqual({ published: 0, images: 0 });
  });
});
