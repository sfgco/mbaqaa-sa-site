import { Schema, model, type InferSchemaType } from "mongoose";
import { postCategories } from "@mbaqaa/shared";
import { localizedField, toJSON } from "./common";

const faqSchema = new Schema(
  {
    question: { type: localizedField(), required: true },
    answer: { type: localizedField(), required: true },
    category: { type: String, default: "general" },
    status: { type: String, enum: ["draft", "published"], default: "published", index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON },
);
export const FaqModel = model("Faq", faqSchema);

const postSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: localizedField(), required: true },
    excerpt: { type: localizedField(), required: true },
    content: { type: localizedField(), required: true },
    coverImage: String,
    category: { type: String, enum: postCategories, default: "news", index: true },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: Date,
    author: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, toJSON },
);
postSchema.index({ status: 1, publishedAt: -1 });
export const PostModel = model("Post", postSchema);

/** Single document (key = "site"); defaults come from settingsSchema. */
const settingsSchema = new Schema(
  { key: { type: String, unique: true, default: "site" }, value: { type: Schema.Types.Mixed, default: {} } },
  { timestamps: true, toJSON, minimize: false },
);
export type SettingsDoc = InferSchemaType<typeof settingsSchema>;
export const SettingsModel = model("Settings", settingsSchema);
