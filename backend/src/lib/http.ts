import type { Model } from "mongoose";
import mongoose from "mongoose";
import { HttpError } from "./errors";

export function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Case-insensitive "contains" across fields. */
export function searchFilter(q: string | undefined, fields: string[]) {
  if (!q) return {};
  const rx = new RegExp(escapeRegex(q), "i");
  return { $or: fields.map((f) => ({ [f]: rx })) };
}

export async function paginate<T>(
  model: Model<T>,
  filter: Record<string, unknown>,
  { page, limit }: { page: number; limit: number },
  opts: { sort?: Record<string, 1 | -1>; select?: string; populate?: { path: string; select: string } } = {},
) {
  let query = model
    .find(filter)
    .sort(opts.sort ?? { createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  if (opts.select) query = query.select(opts.select);
  if (opts.populate) query = query.populate(opts.populate.path, opts.populate.select);
  const [items, total] = await Promise.all([query.lean(), model.countDocuments(filter)]);
  return { items, page, limit, total };
}

/** Sets `order` = index for each id. Unknown ids are ignored. */
export async function reorder(model: Model<any>, ids: string[]) {
  await model.bulkWrite(ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { $set: { order } } } })));
}

export function assertId(id: unknown): string {
  if (typeof id !== "string" || !mongoose.isValidObjectId(id)) throw new HttpError(404, "NOT_FOUND", "Resource not found");
  return id;
}

/** Strips the honeypot field and rejects bots that filled it. */
export function dropHoneypot<T extends { website?: string }>(data: T): Omit<T, "website"> {
  const { website, ...rest } = data;
  if (website) throw new HttpError(400, "VALIDATION_ERROR", "Invalid input");
  return rest;
}

export function toCsv(rows: Record<string, unknown>[], columns: { key: string; label: string }[]) {
  const cell = (v: unknown) => {
    let s = v == null ? "" : v instanceof Date ? v.toISOString() : Array.isArray(v) ? v.join("، ") : String(v);
    // Neutralise spreadsheet formula injection.
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [columns.map((c) => cell(c.label)).join(",")];
  for (const row of rows) lines.push(columns.map((c) => cell(c.key.split(".").reduce<any>((o, k) => o?.[k], row))).join(","));
  return "﻿" + lines.join("\r\n");
}
