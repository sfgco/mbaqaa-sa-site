import { Router } from "express";
import {
  faqSchema,
  faqUpdateSchema,
  paginationQuery,
  postListQuery,
  postSchema,
  postUpdateSchema,
  publishStatus,
  reorderSchema,
  settingsSchema,
  settingsUpdateSchema,
} from "@mbaqaa/shared";
import { z } from "zod";
import { requireAdmin, requireEditor } from "../lib/auth";
import { notFound } from "../lib/errors";
import { assertId, paginate, reorder, searchFilter } from "../lib/http";
import { FaqModel, PostModel, SettingsModel } from "../models/Content";

// ---------- FAQs ----------
export const faqsRouter = Router();

faqsRouter.get("/", async (_req, res) => {
  res.json({ items: await FaqModel.find({ status: "published" }).sort({ order: 1, createdAt: 1 }).lean() });
});

faqsRouter.get("/admin", requireEditor, async (req, res) => {
  const q = paginationQuery.extend({ status: publishStatus.optional() }).parse(req.query);
  const filter = { ...searchFilter(q.q, ["question.ar", "question.en"]), ...(q.status && { status: q.status }) };
  res.json(await paginate(FaqModel, filter, { page: q.page, limit: 50 }, { sort: { order: 1, createdAt: 1 } }));
});

faqsRouter.post("/admin", requireEditor, async (req, res) => {
  const data = faqSchema.parse(req.body);
  res.status(201).json(await FaqModel.create({ ...data, order: await FaqModel.countDocuments() }));
});

faqsRouter.post("/admin/reorder", requireEditor, async (req, res) => {
  await reorder(FaqModel, reorderSchema.parse(req.body).ids);
  res.status(204).end();
});

faqsRouter.patch("/admin/:id", requireEditor, async (req, res) => {
  const doc = await FaqModel.findByIdAndUpdate(assertId(req.params.id), faqUpdateSchema.parse(req.body), { new: true });
  if (!doc) throw notFound("FAQ");
  res.json(doc);
});

faqsRouter.delete("/admin/:id", requireEditor, async (req, res) => {
  const doc = await FaqModel.findByIdAndDelete(assertId(req.params.id));
  if (!doc) throw notFound("FAQ");
  res.status(204).end();
});

// ---------- Posts (news, campaigns, events) ----------
export const postsRouter = Router();
const authorPopulate = { path: "author", select: "name" };

postsRouter.get("/", async (req, res) => {
  const q = postListQuery.parse(req.query);
  const filter = {
    status: "published",
    publishedAt: { $lte: new Date() },
    ...searchFilter(q.q, ["title.ar", "title.en"]),
    ...(q.category && { category: q.category }),
  };
  res.json(await paginate(PostModel, filter, q, { sort: { publishedAt: -1 }, select: "-content" }));
});

postsRouter.get("/admin", requireEditor, async (req, res) => {
  const q = postListQuery.parse(req.query);
  const filter = {
    ...searchFilter(q.q, ["title.ar", "title.en", "slug"]),
    ...(q.category && { category: q.category }),
    ...(q.status && { status: q.status }),
  };
  res.json(await paginate(PostModel, filter, q, { select: "-content", populate: authorPopulate }));
});

postsRouter.post("/admin", requireEditor, async (req, res) => {
  const data = postSchema.parse(req.body);
  const publishedAt = data.publishedAt ?? (data.status === "published" ? new Date() : undefined);
  res.status(201).json(await PostModel.create({ ...data, publishedAt, author: req.user!._id }));
});

postsRouter.get("/admin/:id", requireEditor, async (req, res) => {
  const doc = await PostModel.findById(assertId(req.params.id)).populate(authorPopulate);
  if (!doc) throw notFound("Post");
  res.json(doc);
});

postsRouter.patch("/admin/:id", requireEditor, async (req, res) => {
  const data = postUpdateSchema.parse(req.body);
  const doc = await PostModel.findById(assertId(req.params.id));
  if (!doc) throw notFound("Post");
  doc.set(data);
  if (doc.status === "published" && !doc.publishedAt) doc.publishedAt = new Date();
  await doc.save();
  res.json(doc);
});

postsRouter.delete("/admin/:id", requireEditor, async (req, res) => {
  const doc = await PostModel.findByIdAndDelete(assertId(req.params.id));
  if (!doc) throw notFound("Post");
  res.status(204).end();
});

postsRouter.get("/:slug", async (req, res) => {
  const slug = z.string().max(120).parse(req.params.slug);
  const doc = await PostModel.findOne({ slug, status: "published", publishedAt: { $lte: new Date() } }).populate(authorPopulate);
  if (!doc) throw notFound("Post");
  res.json(doc);
});

// ---------- Settings ----------
export const settingsRouter = Router();

export async function getSettings() {
  const doc = await SettingsModel.findOne({ key: "site" }).lean();
  return settingsSchema.parse(doc?.value ?? {});
}

settingsRouter.get("/", async (_req, res) => {
  res.json(await getSettings());
});

settingsRouter.patch("/", requireAdmin, async (req, res) => {
  const next = settingsSchema.parse({ ...(await getSettings()), ...settingsUpdateSchema.parse(req.body) });
  await SettingsModel.updateOne({ key: "site" }, { $set: { value: next } }, { upsert: true });
  res.json(next);
});
