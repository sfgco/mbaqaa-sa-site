import { Router } from "express";
import { paginationQuery, requestTypes, userCreateSchema, userUpdateSchema } from "@mbaqaa/shared";
import { requireAdmin, requireEditor } from "../lib/auth";
import { HttpError, notFound } from "../lib/errors";
import { assertId, paginate, searchFilter } from "../lib/http";
import { ContactModel } from "../models/Contact";
import { PostModel } from "../models/Content";
import { DonationNotificationModel } from "../models/Donation";
import { AlbumModel, DocumentModel, GalleryImageModel } from "../models/Media";
import { RequestModel } from "../models/Request";
import { UserModel, hashPassword, publicUser } from "../models/User";

// ---------- Users ----------
export const usersRouter = Router();
usersRouter.use(requireAdmin);

usersRouter.get("/", async (req, res) => {
  const q = paginationQuery.parse(req.query);
  const page = await paginate(UserModel, searchFilter(q.q, ["name", "email"]), q, { select: "-passwordHash" });
  res.json(page);
});

usersRouter.post("/", async (req, res) => {
  const { password, ...data } = userCreateSchema.parse(req.body);
  const user = await UserModel.create({ ...data, passwordHash: await hashPassword(password) });
  res.status(201).json(publicUser(user));
});

usersRouter.patch("/:id", async (req, res) => {
  const id = assertId(req.params.id);
  const { password, ...data } = userUpdateSchema.parse(req.body);
  const self = String(req.user!._id) === id;
  if (self && (data.role === "editor" || data.active === false)) {
    throw new HttpError(400, "SELF_ACTION", "You can't demote or deactivate yourself");
  }
  const user = await UserModel.findById(id);
  if (!user) throw notFound("User");
  user.set(data);
  if (password) user.passwordHash = await hashPassword(password);
  await user.save();
  res.json(publicUser(user));
});

usersRouter.delete("/:id", async (req, res) => {
  const id = assertId(req.params.id);
  if (String(req.user!._id) === id) throw new HttpError(400, "SELF_ACTION", "You can't delete yourself");
  const user = await UserModel.findByIdAndDelete(id);
  if (!user) throw notFound("User");
  res.status(204).end();
});

// ---------- Stats ----------
export const statsRouter = Router();

statsRouter.get("/", requireEditor, async (_req, res) => {
  const [requestCounts, contactTotal, contactNew, donationCounts, confirmed, postCounts, docsPublished, downloads, albumsPublished, images] = await Promise.all([
    RequestModel.aggregate<{ _id: { type: string; status: string }; n: number }>([
      { $group: { _id: { type: "$type", status: "$status" }, n: { $sum: 1 } } },
    ]),
    ContactModel.countDocuments(),
    ContactModel.countDocuments({ status: "new" }),
    DonationNotificationModel.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    DonationNotificationModel.aggregate<{ sum: number }>([{ $match: { status: "confirmed" } }, { $group: { _id: null, sum: { $sum: "$amount" } } }]),
    PostModel.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    DocumentModel.countDocuments({ status: "published" }),
    DocumentModel.aggregate<{ sum: number }>([{ $group: { _id: null, sum: { $sum: "$downloads" } } }]),
    AlbumModel.countDocuments({ status: "published" }),
    GalleryImageModel.countDocuments(),
  ]);

  const requests = Object.fromEntries(requestTypes.map((t) => [t, { total: 0, new: 0 }])) as Record<string, { total: number; new: number }>;
  for (const r of requestCounts) {
    requests[r._id.type].total += r.n;
    if (r._id.status === "new") requests[r._id.type].new += r.n;
  }
  const count = (rows: { _id: string; n: number }[], key: string) => rows.find((r) => r._id === key)?.n ?? 0;

  res.json({
    requests,
    contact: { total: contactTotal, new: contactNew },
    donations: { pending: count(donationCounts, "pending"), confirmed: count(donationCounts, "confirmed"), confirmedTotal: confirmed[0]?.sum ?? 0 },
    posts: { published: count(postCounts, "published"), draft: count(postCounts, "draft") },
    documents: { published: docsPublished, downloads: downloads[0]?.sum ?? 0 },
    albums: { published: albumsPublished, images },
  });
});
