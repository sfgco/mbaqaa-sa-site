import { Schema, model } from "mongoose";
import { requestStatuses, requestTypes } from "@mbaqaa/shared";
import { toJSON } from "./common";

/** One collection for all public forms (clothes pickup, volunteer, partnership); `data` holds the validated form. */
const schema = new Schema(
  {
    type: { type: String, enum: requestTypes, required: true, index: true },
    status: { type: String, enum: requestStatuses, default: "new", index: true },
    data: { type: Schema.Types.Mixed, required: true },
    adminNotes: { type: String, default: "" },
    ip: { type: String, select: false },
  },
  { timestamps: true, toJSON, minimize: false },
);
schema.index({ type: 1, createdAt: -1 });

export const RequestModel = model("Request", schema);
