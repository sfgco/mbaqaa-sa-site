import { Router } from "express";
import { albumSchema, albumUpdateSchema, imageUpdateSchema, imagesBulkSchema, paginationQuery, publishStatus, reorderSchema } from "@mbaqaa/shared";
import type { Types } from "mongoose";
import { z } from "zod";
import { requireEditor } from "../lib/auth";
import { notFound } from "../lib/errors";
import { assertId, reorder, searchFilter } from "../lib/http";
import { AlbumModel, GalleryImageModel } from "../models/Media";

export const galleryRouter = Router();

type AlbumLean = { _id: Types.ObjectId; coverImage?: string | null } & Record<string, unknown>;

/** Adds imageCount, and falls back to the first image when there's no cover. */
async function withCounts<T extends AlbumLean>(albums: T[]) {
  if (!albums.length) return [];
  const ids = albums.map((a) => a._id);
  const stats = await GalleryImageModel.aggregate<{ _id: Types.ObjectId; n: number; first: string }>([
    { $match: { album: { $in: ids } } },
    { $sort: { order: 1, createdAt: 1 } },
    { $group: { _id: "$album", n: { $sum: 1 }, first: { $first: "$url" } } },
  ]);
  const byId = new Map(stats.map((s) => [String(s._id), s]));
  return albums.map((a) => {
    const s = byId.get(String(a._id));
    return { ...a, imageCount: s?.n ?? 0, coverImage: a.coverImage || s?.first };
  });
}

const albumSort = { order: 1, eventDate: -1, createdAt: -1 } as const;

// ---------- Public ----------
galleryRouter.get("/albums", async (req, res) => {
  const q = paginationQuery.parse(req.query);
  const filter = { status: "published", ...searchFilter(q.q, ["title.ar", "title.en"]) };
  const [albums, total] = await Promise.all([
    AlbumModel.find(filter).sort(albumSort).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
    AlbumModel.countDocuments(filter),
  ]);
  res.json({ items: await withCounts(albums as AlbumLean[]), page: q.page, limit: q.limit, total });
});

galleryRouter.get("/albums/:slug", async (req, res) => {
  const slug = z.string().max(120).parse(req.params.slug);
  const album = await AlbumModel.findOne({ slug, status: "published" }).lean();
  if (!album) throw notFound("Album");
  const images = await GalleryImageModel.find({ album: album._id }).sort({ order: 1, createdAt: 1 }).lean();
  const [withCount] = await withCounts([album as AlbumLean]);
  res.json({ ...withCount, images });
});

galleryRouter.get("/latest", async (req, res) => {
  const limit = z.coerce.number().int().min(1).max(24).default(8).parse(req.query.limit);
  const published = await AlbumModel.find({ status: "published" }).distinct("_id");
  const items = await GalleryImageModel.find({ album: { $in: published } }).sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ items });
});

// ---------- Admin: albums ----------
galleryRouter.get("/admin/albums", requireEditor, async (req, res) => {
  const q = paginationQuery.extend({ status: publishStatus.optional() }).parse(req.query);
  const filter = { ...searchFilter(q.q, ["title.ar", "title.en", "slug"]), ...(q.status && { status: q.status }) };
  const [albums, total] = await Promise.all([
    AlbumModel.find(filter).sort(albumSort).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
    AlbumModel.countDocuments(filter),
  ]);
  res.json({ items: await withCounts(albums as AlbumLean[]), page: q.page, limit: q.limit, total });
});

galleryRouter.post("/admin/albums", requireEditor, async (req, res) => {
  const data = albumSchema.parse(req.body);
  res.status(201).json(await AlbumModel.create({ ...data, order: 0 }));
});

galleryRouter.post("/admin/albums/reorder", requireEditor, async (req, res) => {
  await reorder(AlbumModel, reorderSchema.parse(req.body).ids);
  res.status(204).end();
});

galleryRouter.get("/admin/albums/:id", requireEditor, async (req, res) => {
  const album = await AlbumModel.findById(assertId(req.params.id)).lean();
  if (!album) throw notFound("Album");
  const images = await GalleryImageModel.find({ album: album._id }).sort({ order: 1, createdAt: 1 }).lean();
  res.json({ ...album, imageCount: images.length, images });
});

galleryRouter.patch("/admin/albums/:id", requireEditor, async (req, res) => {
  const doc = await AlbumModel.findByIdAndUpdate(assertId(req.params.id), albumUpdateSchema.parse(req.body), { new: true });
  if (!doc) throw notFound("Album");
  res.json(doc);
});

galleryRouter.delete("/admin/albums/:id", requireEditor, async (req, res) => {
  const doc = await AlbumModel.findByIdAndDelete(assertId(req.params.id));
  if (!doc) throw notFound("Album");
  await GalleryImageModel.deleteMany({ album: doc._id });
  res.status(204).end();
});

// ---------- Admin: images ----------
galleryRouter.post("/admin/images", requireEditor, async (req, res) => {
  const { album, images } = imagesBulkSchema.parse(req.body);
  if (!(await AlbumModel.exists({ _id: album }))) throw notFound("Album");
  const start = await GalleryImageModel.countDocuments({ album });
  const items = await GalleryImageModel.insertMany(images.map((img, i) => ({ ...img, album, order: start + i })));
  res.status(201).json({ items });
});

galleryRouter.post("/admin/images/reorder", requireEditor, async (req, res) => {
  await reorder(GalleryImageModel, reorderSchema.parse(req.body).ids);
  res.status(204).end();
});

galleryRouter.patch("/admin/images/:id", requireEditor, async (req, res) => {
  const doc = await GalleryImageModel.findByIdAndUpdate(assertId(req.params.id), imageUpdateSchema.parse(req.body), { new: true });
  if (!doc) throw notFound("Image");
  res.json(doc);
});

galleryRouter.delete("/admin/images/:id", requireEditor, async (req, res) => {
  const doc = await GalleryImageModel.findByIdAndDelete(assertId(req.params.id));
  if (!doc) throw notFound("Image");
  res.status(204).end();
});
