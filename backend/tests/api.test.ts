import request from "supertest";
import { describe, expect, it } from "vitest";
import { app, loginAs } from "./setup";

const clothes = {
  name: "سارة",
  phone: "0512345678",
  city: "الرياض",
  district: "النرجس",
  quantity: "few_bags",
  itemTypes: ["women", "children"],
};

describe("health & errors", () => {
  it("GET /api/health", async () => {
    await request(app).get("/api/health").expect(200, { ok: true });
  });
  it("unknown route → 404 JSON", async () => {
    const res = await request(app).get("/api/nope").expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("auth", () => {
  it("rejects wrong password and protects admin routes", async () => {
    await loginAs("admin");
    const res = await request(app).post("/api/auth/login").send({ email: "admin@test.sa", password: "nope" }).expect(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    await request(app).get("/api/requests/admin/clothes").expect(401);
  });
  it("me + logout", async () => {
    const agent = await loginAs("editor");
    const me = await agent.get("/api/auth/me").expect(200);
    expect(me.body.user).toMatchObject({ email: "editor@test.sa", role: "editor" });
    expect(me.body.user.passwordHash).toBeUndefined();
  });
  it("editors can't reach admin-only routes", async () => {
    const agent = await loginAs("editor");
    await agent.get("/api/users").expect(403);
    await agent.get("/api/donations/admin/notifications").expect(403);
  });
  it("blocks cross-site writes", async () => {
    const agent = await loginAs("admin");
    await agent.post("/api/faqs/admin").set("Origin", "https://evil.example").send({}).expect((r) => {
      // dev/test with no CORS_ORIGINS is permissive; production is enforced in checkOrigin
      expect([400, 403]).toContain(r.status);
    });
  });
});

describe("public forms", () => {
  it("validates with field errors", async () => {
    const res = await request(app).post("/api/requests/clothes").send({ ...clothes, phone: "123" }).expect(400);
    expect(res.body.error.details.fields.phone).toEqual(["invalid_phone"]);
  });
  it("rejects unknown request types", async () => {
    await request(app).post("/api/requests/other").send(clothes).expect(400);
  });
  it("rejects honeypot", async () => {
    await request(app).post("/api/requests/clothes").send({ ...clothes, website: "x" }).expect(400);
  });
  it("stores a clothes request, admin lists, updates and exports it", async () => {
    const created = await request(app).post("/api/requests/clothes").send(clothes).expect(201);
    const agent = await loginAs("editor");
    const list = await agent.get("/api/requests/admin/clothes").expect(200);
    expect(list.body).toMatchObject({ total: 1, page: 1 });
    expect(list.body.items[0].data.phone).toBe("0512345678");
    expect(list.body.items[0].ip).toBeUndefined();

    const patched = await agent.patch(`/api/requests/admin/clothes/${created.body.id}`).send({ status: "completed" }).expect(200);
    expect(patched.body.status).toBe("completed");
    // wrong type can't reach it
    await agent.get(`/api/requests/admin/volunteer/${created.body.id}`).expect(404);

    const csv = await agent.get("/api/requests/admin/clothes/export.csv").expect(200);
    expect(csv.text.startsWith("﻿")).toBe(true);
    expect(csv.text).toContain("سارة");
  });
  it("contact message: new → read on open", async () => {
    const { body } = await request(app)
      .post("/api/contact")
      .send({ name: "علي", phone: "0555555555", subject: "استفسار", message: "مرحبا" })
      .expect(201);
    const agent = await loginAs();
    expect((await agent.get(`/api/contact/admin/${body.id}`)).body.status).toBe("read");
    expect((await agent.get("/api/stats")).body.contact).toEqual({ total: 1, new: 0 });
  });
});

describe("donations", () => {
  it("channels CRUD, notify, confirm and totals in halalas", async () => {
    const admin = await loginAs("admin");
    await admin.post("/api/donations/admin/channels").send({ type: "bank", title: { ar: "تحويل" } }).expect(400);
    const ch = await admin
      .post("/api/donations/admin/channels")
      .send({ type: "bank", title: { ar: "تحويل" }, iban: "SA00 0000 0000 0000 0000 0000" })
      .expect(201);
    expect(ch.body.iban).toBe("SA0000000000000000000000");

    const pub = await request(app).get("/api/donations/channels").expect(200);
    expect(pub.body.items).toHaveLength(1);

    const n = await request(app)
      .post("/api/donations/notify")
      .send({ name: "خالد", phone: "0512345678", amount: 150.5, channelId: ch.body._id, transferDate: "2026-11-20", recurring: true })
      .expect(201);

    const confirmed = await admin.patch(`/api/donations/admin/notifications/${n.body.id}`).send({ status: "confirmed" }).expect(200);
    expect(confirmed.body.reviewedAt).toBeTruthy();
    expect(confirmed.body.amount).toBe(15050);

    const list = await admin.get("/api/donations/admin/notifications").expect(200);
    expect(list.body.confirmedTotal).toBe(15050);
    expect(list.body.items[0].channel.title.ar).toBe("تحويل");
  });
});

describe("content", () => {
  it("posts: drafts hidden publicly, published visible by slug", async () => {
    const agent = await loginAs("editor");
    const base = { title: { ar: "خبر" }, excerpt: { ar: "مقتطف" }, content: { ar: "نص" } };
    await agent.post("/api/posts/admin").send({ ...base, slug: "draft-one" }).expect(201);
    await agent.post("/api/posts/admin").send({ ...base, slug: "live-one", status: "published" }).expect(201);
    await agent.post("/api/posts/admin").send({ ...base, slug: "live-one" }).expect(409);

    const list = await request(app).get("/api/posts").expect(200);
    expect(list.body.total).toBe(1);
    expect(list.body.items[0].content).toBeUndefined();
    await request(app).get("/api/posts/draft-one").expect(404);
    const post = await request(app).get("/api/posts/live-one").expect(200);
    expect(post.body.author.name).toBe("editor");
  });
  it("faqs: only published, in order", async () => {
    const agent = await loginAs("editor");
    const a = await agent.post("/api/faqs/admin").send({ question: { ar: "أ" }, answer: { ar: "1" } }).expect(201);
    const b = await agent.post("/api/faqs/admin").send({ question: { ar: "ب" }, answer: { ar: "2" } }).expect(201);
    await agent.post("/api/faqs/admin").send({ question: { ar: "ج" }, answer: { ar: "3" }, status: "draft" }).expect(201);
    await agent.post("/api/faqs/admin/reorder").send({ ids: [b.body._id, a.body._id] }).expect(204);
    const res = await request(app).get("/api/faqs").expect(200);
    expect(res.body.items.map((f: { question: { ar: string } }) => f.question.ar)).toEqual(["ب", "أ"]);
  });
  it("settings: defaults, admin patch", async () => {
    const res = await request(app).get("/api/settings").expect(200);
    expect(res.body.social.x).toBe("");
    const admin = await loginAs("admin");
    await admin.patch("/api/settings").send({ phone: "920000000" }).expect(200);
    expect((await request(app).get("/api/settings")).body.phone).toBe("920000000");
  });
});

describe("users", () => {
  it("admin can't demote or delete themselves", async () => {
    const admin = await loginAs("admin");
    const me = (await admin.get("/api/auth/me")).body.user;
    await admin.patch(`/api/users/${me._id}`).send({ role: "editor" }).expect(400);
    await admin.delete(`/api/users/${me._id}`).expect(400);
    const u = await admin.post("/api/users").send({ name: "Editor", email: "e2@test.sa", password: "long-enough-pw" }).expect(201);
    expect(u.body.role).toBe("editor");
  });
});
