import { userCreateSchema } from "@mbaqaa/shared";
import { connectDB, disconnectDB } from "../db";
import { UserModel, hashPassword } from "../models/User";
import { args } from "./args";

async function main() {
  const a = args();
  const { password, ...data } = userCreateSchema.parse({ email: a.email, password: a.password, name: a.name, role: "admin" });
  await connectDB();
  const user = await UserModel.findOneAndUpdate(
    { email: data.email },
    { ...data, passwordHash: await hashPassword(password), active: true },
    { upsert: true, new: true },
  );
  console.log(`Admin ready: ${user.email}`);
  await disconnectDB();
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
