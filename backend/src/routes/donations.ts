import { Router } from "express";
import {
  donationChannelSchema,
  donationChannelUpdateSchema,
  donationNotifySchema,
  notificationAdminUpdateSchema,
  notificationListQuery,
  reorderSchema,
} from "@mbaqaa/shared";
import { requireAdmin } from "../lib/auth";
import { HttpError, notFound } from "../lib/errors";
import { assertId, dropHoneypot, paginate, reorder, searchFilter, toCsv } from "../lib/http";
import { limiter } from "../lib/rateLimit";
import { DonationChannelModel, DonationNotificationModel } from "../models/Donation";

export const donationsRouter = Router();

// ---------- Channels (bank accounts / QR codes) ----------
donationsRouter.get("/channels", async (_req, res) => {
  const items = await DonationChannelModel.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean();
  res.json({ items });
});

donationsRouter.get("/admin/channels", requireAdmin, async (_req, res) => {
  res.json({ items: await DonationChannelModel.find().sort({ order: 1, createdAt: 1 }).lean() });
});

donationsRouter.post("/admin/channels", requireAdmin, async (req, res) => {
  const data = donationChannelSchema.parse(req.body);
  if (data.type === "bank" && !data.iban) throw new HttpError(400, "VALIDATION_ERROR", "IBAN required", { fields: { iban: ["required"] } });
  if (data.type === "qr" && !data.qrImageUrl) throw new HttpError(400, "VALIDATION_ERROR", "QR image required", { fields: { qrImageUrl: ["required"] } });
  const order = await DonationChannelModel.countDocuments();
  res.status(201).json(await DonationChannelModel.create({ ...data, order }));
});

donationsRouter.post("/admin/channels/reorder", requireAdmin, async (req, res) => {
  await reorder(DonationChannelModel, reorderSchema.parse(req.body).ids);
  res.status(204).end();
});

donationsRouter.patch("/admin/channels/:id", requireAdmin, async (req, res) => {
  const doc = await DonationChannelModel.findByIdAndUpdate(assertId(req.params.id), donationChannelUpdateSchema.parse(req.body), { new: true });
  if (!doc) throw notFound("Channel");
  res.json(doc);
});

donationsRouter.delete("/admin/channels/:id", requireAdmin, async (req, res) => {
  const doc = await DonationChannelModel.findByIdAndDelete(assertId(req.params.id));
  if (!doc) throw notFound("Channel");
  res.status(204).end();
});

// ---------- Transfer notifications ----------
donationsRouter.post("/notify", limiter(60, 5), async (req, res) => {
  const { amount, channelId, ...data } = dropHoneypot(donationNotifySchema.parse(req.body));
  if (channelId && !(await DonationChannelModel.exists({ _id: channelId }))) {
    throw new HttpError(400, "VALIDATION_ERROR", "Unknown channel", { fields: { channelId: ["invalid_id"] } });
  }
  const doc = await DonationNotificationModel.create({ ...data, channel: channelId, amount: Math.round(amount * 100) });
  res.status(201).json({ ok: true, id: doc._id });
});

const notificationFilter = (q: { q?: string; status?: string }) => ({
  ...searchFilter(q.q, ["name", "phone", "email", "reference"]),
  ...(q.status && { status: q.status }),
});

donationsRouter.get("/admin/notifications", requireAdmin, async (req, res) => {
  const q = notificationListQuery.parse(req.query);
  const [page, totals] = await Promise.all([
    paginate(DonationNotificationModel, notificationFilter(q), q, { populate: { path: "channel", select: "title" } }),
    DonationNotificationModel.aggregate<{ sum: number }>([{ $match: { status: "confirmed" } }, { $group: { _id: null, sum: { $sum: "$amount" } } }]),
  ]);
  res.json({ ...page, confirmedTotal: totals[0]?.sum ?? 0 });
});

donationsRouter.get("/admin/notifications/export.csv", requireAdmin, async (_req, res) => {
  const rows = await DonationNotificationModel.find().sort({ createdAt: -1 }).limit(10_000).populate("channel", "title").lean();
  const csv = toCsv(
    rows.map((r) => ({ ...r, amountSar: (r.amount / 100).toFixed(2), recurring: r.recurring ? "نعم" : "لا" })) as Record<string, unknown>[],
    [
      { key: "createdAt", label: "تاريخ الإشعار" },
      { key: "name", label: "الاسم" },
      { key: "phone", label: "الجوال" },
      { key: "email", label: "البريد" },
      { key: "amountSar", label: "المبلغ (ر.س)" },
      { key: "channel.title.ar", label: "قناة التبرع" },
      { key: "transferDate", label: "تاريخ التحويل" },
      { key: "reference", label: "رقم العملية" },
      { key: "recurring", label: "المانح الدائم" },
      { key: "status", label: "الحالة" },
      { key: "notes", label: "ملاحظات" },
    ],
  );
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="donations.csv"');
  res.send(csv);
});

donationsRouter.get("/admin/notifications/:id", requireAdmin, async (req, res) => {
  const doc = await DonationNotificationModel.findById(assertId(req.params.id)).populate("channel", "title");
  if (!doc) throw notFound("Notification");
  res.json(doc);
});

donationsRouter.patch("/admin/notifications/:id", requireAdmin, async (req, res) => {
  const update = notificationAdminUpdateSchema.parse(req.body);
  const doc = await DonationNotificationModel.findById(assertId(req.params.id));
  if (!doc) throw notFound("Notification");
  if (update.status && update.status !== doc.status) {
    doc.status = update.status;
    doc.reviewedBy = req.user!._id;
    doc.reviewedAt = new Date();
  }
  if (update.adminNotes !== undefined) doc.adminNotes = update.adminNotes;
  await doc.save();
  res.json(await doc.populate("channel", "title"));
});

donationsRouter.delete("/admin/notifications/:id", requireAdmin, async (req, res) => {
  const doc = await DonationNotificationModel.findByIdAndDelete(assertId(req.params.id));
  if (!doc) throw notFound("Notification");
  res.status(204).end();
});
