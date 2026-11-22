import { Router } from "express";
import {
  contactAdminUpdateSchema,
  contactListQuery,
  contactSchema,
  requestAdminUpdateSchema,
  requestListQuery,
  requestSchemas,
  requestType,
} from "@mbaqaa/shared";
import { requireEditor } from "../lib/auth";
import { notFound } from "../lib/errors";
import { assertId, dropHoneypot, paginate, searchFilter, toCsv } from "../lib/http";
import { limiter } from "../lib/rateLimit";
import { ContactModel } from "../models/Contact";
import { RequestModel } from "../models/Request";

// ---------- Contact ----------
export const contactRouter = Router();

contactRouter.post("/", limiter(10, 5), async (req, res) => {
  const data = dropHoneypot(contactSchema.parse(req.body));
  const doc = await ContactModel.create(data);
  res.status(201).json({ ok: true, id: doc._id });
});

contactRouter.get("/admin", requireEditor, async (req, res) => {
  const q = contactListQuery.parse(req.query);
  const filter = { ...searchFilter(q.q, ["name", "phone", "email", "subject"]), ...(q.status && { status: q.status }) };
  res.json(await paginate(ContactModel, filter, q));
});

contactRouter.get("/admin/:id", requireEditor, async (req, res) => {
  const doc = await ContactModel.findById(assertId(req.params.id));
  if (!doc) throw notFound("Message");
  if (doc.status === "new") {
    doc.status = "read";
    await doc.save();
  }
  res.json(doc);
});

contactRouter.patch("/admin/:id", requireEditor, async (req, res) => {
  const doc = await ContactModel.findByIdAndUpdate(assertId(req.params.id), contactAdminUpdateSchema.parse(req.body), { new: true });
  if (!doc) throw notFound("Message");
  res.json(doc);
});

contactRouter.delete("/admin/:id", requireEditor, async (req, res) => {
  const doc = await ContactModel.findByIdAndDelete(assertId(req.params.id));
  if (!doc) throw notFound("Message");
  res.status(204).end();
});

// ---------- Requests (clothes pickup, volunteer, partnership) ----------
export const requestsRouter = Router();

const csvColumns: Record<string, { key: string; label: string }[]> = {
  clothes: [
    { key: "data.name", label: "الاسم" },
    { key: "data.phone", label: "الجوال" },
    { key: "data.email", label: "البريد" },
    { key: "data.city", label: "المدينة" },
    { key: "data.district", label: "الحي" },
    { key: "data.address", label: "العنوان" },
    { key: "data.quantity", label: "الكمية" },
    { key: "data.itemTypes", label: "الأصناف" },
    { key: "data.preferredDate", label: "الموعد المفضل" },
    { key: "data.notes", label: "ملاحظات" },
  ],
  volunteer: [
    { key: "data.name", label: "الاسم" },
    { key: "data.phone", label: "الجوال" },
    { key: "data.email", label: "البريد" },
    { key: "data.city", label: "المدينة" },
    { key: "data.gender", label: "الجنس" },
    { key: "data.age", label: "العمر" },
    { key: "data.areas", label: "مجالات التطوع" },
    { key: "data.availability", label: "الأوقات" },
    { key: "data.experience", label: "الخبرات" },
  ],
  partnership: [
    { key: "data.organization", label: "الجهة" },
    { key: "data.contactName", label: "اسم المسؤول" },
    { key: "data.phone", label: "الجوال" },
    { key: "data.email", label: "البريد" },
    { key: "data.partnerType", label: "نوع الجهة" },
    { key: "data.message", label: "الرسالة" },
  ],
};

requestsRouter.post("/:type", limiter(10, 5), async (req, res) => {
  const type = requestType.parse(req.params.type);
  const data = dropHoneypot(requestSchemas[type].parse(req.body) as { website?: string });
  const doc = await RequestModel.create({ type, data, ip: req.ip });
  res.status(201).json({ ok: true, id: doc._id });
});

const searchFields = ["data.name", "data.phone", "data.email", "data.organization", "data.contactName", "data.city"];

requestsRouter.get("/admin/:type", requireEditor, async (req, res) => {
  const type = requestType.parse(req.params.type);
  const q = requestListQuery.parse(req.query);
  res.json(await paginate(RequestModel, { type, ...searchFilter(q.q, searchFields), ...(q.status && { status: q.status }) }, q));
});

requestsRouter.get("/admin/:type/export.csv", requireEditor, async (req, res) => {
  const type = requestType.parse(req.params.type);
  const rows = await RequestModel.find({ type }).sort({ createdAt: -1 }).limit(10_000).lean();
  const csv = toCsv(rows as Record<string, unknown>[], [
    { key: "createdAt", label: "التاريخ" },
    { key: "status", label: "الحالة" },
    ...csvColumns[type],
    { key: "adminNotes", label: "ملاحظات الإدارة" },
  ]);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${type}-requests.csv"`);
  res.send(csv);
});

requestsRouter.get("/admin/:type/:id", requireEditor, async (req, res) => {
  const type = requestType.parse(req.params.type);
  const doc = await RequestModel.findOne({ _id: assertId(req.params.id), type });
  if (!doc) throw notFound("Request");
  res.json(doc);
});

requestsRouter.patch("/admin/:type/:id", requireEditor, async (req, res) => {
  const type = requestType.parse(req.params.type);
  const update = requestAdminUpdateSchema.parse(req.body);
  const doc = await RequestModel.findOneAndUpdate({ _id: assertId(req.params.id), type }, update, { new: true });
  if (!doc) throw notFound("Request");
  res.json(doc);
});

requestsRouter.delete("/admin/:type/:id", requireEditor, async (req, res) => {
  const type = requestType.parse(req.params.type);
  const doc = await RequestModel.findOneAndDelete({ _id: assertId(req.params.id), type });
  if (!doc) throw notFound("Request");
  res.status(204).end();
});
