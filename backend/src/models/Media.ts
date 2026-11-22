import { Schema, model } from "mongoose";
import { localizedField, toJSON } from "./common";

const emptyLocalized = () => ({ ar: "", en: "" });

// ---------- Governance documents ----------
const documentCategorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: localizedField(), required: true },
    description: { type: localizedField(false), default: emptyLocalized },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON },
);
export const DocumentCategoryModel = model("DocumentCategory", documentCategorySchema);

const documentSchema = new Schema(
  {
    category: { type: Schema.Types.ObjectId, ref: "DocumentCategory", required: true, index: true },
    slug: { type: String, required: true, unique: true },
    title: { type: localizedField(), required: true },
    description: { type: localizedField(false), default: emptyLocalized },
    year: Number,
    file: {
      url: { type: String, required: true },
      thumbnailUrl: String,
      pages: Number,
      bytes: Number,
    },
    status: { type: String, enum: ["draft", "published"], default: "published", index: true },
    publishedAt: Date,
    downloads: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON },
);
documentSchema.index({ category: 1, status: 1, order: 1 });
export const DocumentModel = model("Document", documentSchema);

// ---------- Photo albums ----------
const albumSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: localizedField(), required: true },
    description: { type: localizedField(false), default: emptyLocalized },
    coverImage: String,
    eventDate: Date,
    status: { type: String, enum: ["draft", "published"], default: "published", index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON },
);
export const AlbumModel = model("Album", albumSchema);

const imageSchema = new Schema(
  {
    album: { type: Schema.Types.ObjectId, ref: "Album", required: true, index: true },
    url: { type: String, required: true },
    caption: { type: localizedField(false), default: emptyLocalized },
    width: Number,
    height: Number,
    order: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON },
);
imageSchema.index({ album: 1, order: 1 });
export const GalleryImageModel = model("GalleryImage", imageSchema);
