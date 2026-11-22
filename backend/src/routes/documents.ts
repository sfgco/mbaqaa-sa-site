import { Router } from "express";
import {
  documentCategorySchema,
  documentCategoryUpdateSchema,
  documentListQuery,
  documentSchema,
  documentUpdateSchema,
  reorderSchema,
} from "@mbaqaa/shared";
import { Types } from "mongoose";
import { z } from "zod";
import { requireEditor } from "../lib/auth";
import { HttpError, notFound } from "../lib/errors";
import { assertId, reorder, searchFilter } from "../lib/http";
import { limiter } from "../lib/rateLimit";
import { DocumentCategoryModel, DocumentModel } from "../models/Media";

export const documentsRouter = Router();

const categoryPopulate = { path: "category", select: "slug title" };
/** Published and not scheduled for later (missing/null publishedAt counts as live). */
const liveFilter = () => ({ status: "published", publishedAt: { $not: { $gt: new Date() } } });

/** Categories with their document counts (published only, or all for admins). */
async function categoriesWithCounts(filter: Record<string, unknown>, countFilter: Record<string, unknown>) {
  const [categories, counts] = await Promise.all([
    DocumentCategoryModel.find(filter).sort({ order: 1, createdAt: 1 }).lean(),
    DocumentModel.aggregate<{ _id: Types.ObjectId; n: number }>([{ $match: countFilter }, { $group: { _id: "$category", n: { $sum: 1 } } }]),
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.n]));
  return categories.map((c) => ({ ...c, documentCount: byId.get(String(c._id)) ?? 0 }));
}

async function categoryIdFromSlug(slug?: string) {
  if (!slug) return undefined;
  const cat = await DocumentCategoryModel.findOne({ slug, active: true }).select("_id").lean();
  if (!cat) throw notFound("Category");
  return cat._id;
}

// ---------- Public ----------
documentsRouter.get("/categories", async (_req, res) => {
  const items = await categoriesWithCounts({ active: true }, liveFilter());
  res.json({ items });
});

documentsRouter.get("/", async (req, res) => {
  const q = documentListQuery.parse(req.query);
  const categoryId = await categoryIdFromSlug(q.category);
  const activeCategories = await DocumentCategoryModel.find({ active: true }).distinct("_id");
  const base = { ...liveFilter(), category: categoryId ?? { $in: activeCategories } };
  const filter = { ...base, ...searchFilter(q.q, ["title.ar", "title.en"]), ...(q.year && { year: q.year }) };
  const [items, total, years] = await Promise.all([
    DocumentModel.find(filter)
      .sort({ order: 1, year: -1, createdAt: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .populate(categoryPopulate)
      .lean(),
    DocumentModel.countDocuments(filter),
    DocumentModel.distinct("year", base),
  ]);
  res.json({ items, page: q.page, limit: q.limit, total, years: (years as (number | null)[]).filter((y): y is number => !!y).sort((a, b) => b - a) });
});

// ---------- Admin: categories ----------
documentsRouter.get("/admin/categories", requireEditor, async (_req, res) => {
  res.json({ items: await categoriesWithCounts({}, {}) });
});

documentsRouter.post("/admin/categories", requireEditor, async (req, res) => {
  const data = documentCategorySchema.parse(req.body);
  res.status(201).json(await DocumentCategoryModel.create({ ...data, order: await DocumentCategoryModel.countDocuments() }));
});

documentsRouter.post("/admin/categories/reorder", requireEditor, async (req, res) => {
  await reorder(DocumentCategoryModel, reorderSchema.parse(req.body).ids);
  res.status(204).end();
});

documentsRouter.patch("/admin/categories/:id", requireEditor, async (req, res) => {
  const doc = await DocumentCategoryModel.findByIdAndUpdate(assertId(req.params.id), documentCategoryUpdateSchema.parse(req.body), { new: true });
  if (!doc) throw notFound("Category");
  res.json(doc);
});

documentsRouter.delete("/admin/categories/:id", requireEditor, async (req, res) => {
  const id = assertId(req.params.id);
  if (await DocumentModel.exists({ category: id })) {
    throw new HttpError(409, "CATEGORY_NOT_EMPTY", "Move or delete this category's documents first");
  }
  const doc = await DocumentCategoryModel.findByIdAndDelete(id);
  if (!doc) throw notFound("Category");
  res.status(204).end();
});

// ---------- Admin: documents ----------
async function assertCategory(id?: string) {
  if (id && !(await DocumentCategoryModel.exists({ _id: id }))) {
    throw new HttpError(400, "VALIDATION_ERROR", "Unknown category", { fields: { category: ["invalid_id"] } });
  }
}

documentsRouter.get("/admin", requireEditor, async (req, res) => {
  const q = documentListQuery.parse(req.query);
  const filter = {
    ...searchFilter(q.q, ["title.ar", "title.en", "slug"]),
    ...(q.category && { category: assertId(q.category) }),
    ...(q.status && { status: q.status }),
    ...(q.year && { year: q.year }),
  };
  const [items, total] = await Promise.all([
    DocumentModel.find(filter).sort({ order: 1, createdAt: -1 }).skip((q.page - 1) * q.limit).limit(q.limit).populate(categoryPopulate).lean(),
    DocumentModel.countDocuments(filter),
  ]);
  res.json({ items, page: q.page, limit: q.limit, total });
});

documentsRouter.post("/admin", requireEditor, async (req, res) => {
  const data = documentSchema.parse(req.body);
  await assertCategory(data.category);
  const doc = await DocumentModel.create({ ...data, order: await DocumentModel.countDocuments({ category: data.category }) });
  res.status(201).json(await doc.populate(categoryPopulate));
});

documentsRouter.post("/admin/reorder", requireEditor, async (req, res) => {
  await reorder(DocumentModel, reorderSchema.parse(req.body).ids);
  res.status(204).end();
});

documentsRouter.get("/admin/:id", requireEditor, async (req, res) => {
  const doc = await DocumentModel.findById(assertId(req.params.id)).populate(categoryPopulate);
  if (!doc) throw notFound("Document");
  res.json(doc);
});

documentsRouter.patch("/admin/:id", requireEditor, async (req, res) => {
  const data = documentUpdateSchema.parse(req.body);
  await assertCategory(data.category);
  const doc = await DocumentModel.findByIdAndUpdate(assertId(req.params.id), data, { new: true }).populate(categoryPopulate);
  if (!doc) throw notFound("Document");
  res.json(doc);
});

documentsRouter.delete("/admin/:id", requireEditor, async (req, res) => {
  const doc = await DocumentModel.findByIdAndDelete(assertId(req.params.id));
  if (!doc) throw notFound("Document");
  res.status(204).end();
});

// ---------- Public, by slug (after /admin so it doesn't shadow it) ----------
async function findLive(slugParam: unknown) {
  const slug = z.string().max(120).parse(slugParam);
  const doc = await DocumentModel.findOne({ slug, ...liveFilter() }).populate(categoryPopulate);
  if (!doc || !doc.category) throw notFound("Document");
  if (!(await DocumentCategoryModel.exists({ _id: doc.category._id, active: true }))) throw notFound("Document");
  return doc;
}

documentsRouter.get("/:slug", async (req, res) => {
  res.json(await findLive(req.params.slug));
});

/** Counts a download started by the site's download button (which saves the file itself). */
documentsRouter.post("/:slug/downloads", limiter(1, 30), async (req, res) => {
  const doc = await findLive(req.params.slug);
  await DocumentModel.updateOne({ _id: doc._id }, { $inc: { downloads: 1 } });
  res.status(204).end();
});

/** No-JS fallback: counts the download, then sends the browser to the file. */
documentsRouter.get("/:slug/download", async (req, res) => {
  const doc = await findLive(req.params.slug);
  await DocumentModel.updateOne({ _id: doc._id }, { $inc: { downloads: 1 } });
  const url = doc.file!.url;
  res.redirect(302, url.startsWith("/") ? new URL(url, `${req.protocol}://${req.get("host")}`).toString() : url);
});
