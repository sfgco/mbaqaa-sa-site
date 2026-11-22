import { Schema } from "mongoose";

export const localizedField = (required = true) =>
  new Schema({ ar: { type: String, required, default: required ? undefined : "" }, en: { type: String, default: "" } }, { _id: false });

/** Removes __v and password hashes from JSON output. */
export const toJSON = {
  versionKey: false,
  transform: (_doc: unknown, ret: Record<string, unknown>) => {
    delete ret.passwordHash;
    return ret;
  },
};
