import { Schema, model } from "mongoose";
import { contactStatuses } from "@mbaqaa/shared";
import { toJSON } from "./common";

const schema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: contactStatuses, default: "new", index: true },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true, toJSON },
);

export const ContactModel = model("Contact", schema);
