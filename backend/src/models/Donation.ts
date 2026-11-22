import { Schema, model } from "mongoose";
import { channelTypes, donationNotifyStatuses } from "@mbaqaa/shared";
import { localizedField, toJSON } from "./common";

const channelSchema = new Schema(
  {
    type: { type: String, enum: channelTypes, required: true },
    title: { type: localizedField(), required: true },
    description: { type: localizedField(false), default: () => ({ ar: "", en: "" }) },
    bankName: String,
    accountName: String,
    iban: String,
    qrImageUrl: String,
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON },
);
export const DonationChannelModel = model("DonationChannel", channelSchema);

const notificationSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    /** Halalas, to avoid float rounding. */
    amount: { type: Number, required: true },
    channel: { type: Schema.Types.ObjectId, ref: "DonationChannel" },
    transferDate: { type: String, required: true },
    reference: String,
    recurring: { type: Boolean, default: false },
    notes: String,
    status: { type: String, enum: donationNotifyStatuses, default: "pending", index: true },
    adminNotes: { type: String, default: "" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
  },
  { timestamps: true, toJSON },
);
export const DonationNotificationModel = model("DonationNotification", notificationSchema);
