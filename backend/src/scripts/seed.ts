import { documentCategorySchema, donationChannelSchema, faqSchema, postSchema, settingsSchema } from "@mbaqaa/shared";
import { env } from "../config/env";
import { connectDB, disconnectDB } from "../db";
import { FaqModel, PostModel, SettingsModel } from "../models/Content";
import { DonationChannelModel } from "../models/Donation";
import { DocumentCategoryModel } from "../models/Media";
import { seedChannels, seedDocumentCategories, seedFaqs, seedPosts, seedSettings } from "./seedData";

/** Idempotent: only fills empty collections. Refuses to run in production. */
async function main() {
  if (env.isProd) throw new Error("Refusing to seed with NODE_ENV=production");
  await connectDB();

  if (!(await SettingsModel.exists({ key: "site" }))) {
    await SettingsModel.create({ key: "site", value: settingsSchema.parse(seedSettings) });
    console.log("✓ settings");
  }
  if ((await DonationChannelModel.countDocuments()) === 0) {
    await DonationChannelModel.insertMany(seedChannels.map((c, order) => ({ ...donationChannelSchema.parse(c), order })));
    console.log("✓ donation channels (placeholder IBAN)");
  }
  if ((await FaqModel.countDocuments()) === 0) {
    await FaqModel.insertMany(seedFaqs.map((f, order) => ({ ...faqSchema.parse(f), order })));
    console.log("✓ FAQs");
  }
  if ((await PostModel.countDocuments()) === 0) {
    await PostModel.insertMany(seedPosts.map((p) => ({ ...postSchema.parse(p), publishedAt: new Date() })));
    console.log("✓ posts");
  }
  if ((await DocumentCategoryModel.countDocuments()) === 0) {
    await DocumentCategoryModel.insertMany(seedDocumentCategories.map((c, order) => ({ ...documentCategorySchema.parse(c), order })));
    console.log("✓ governance categories");
  }
  await disconnectDB();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
