import mongoose from "mongoose";
import { User } from "../src/models/User";
import { env } from "../src/config/env";
import "../src/config/loadEnv";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error("Error: ADMIN_EMAIL environment variable is not set.");
    process.exit(1);
  }

  try {
    await mongoose.connect(env.mongoUri);
    console.log("Connected to MongoDB.");

    const user = await User.findOne({ email: adminEmail });
    if (!user) {
      console.error(`Error: User with email ${adminEmail} not found. Please register this user first.`);
      process.exit(1);
    }

    if (user.role === "ADMIN") {
      console.log(`User ${adminEmail} is already an ADMIN.`);
      process.exit(0);
    }

    user.role = "ADMIN";
    await user.save();
    console.log(`Successfully upgraded ${adminEmail} to ADMIN.`);
    process.exit(0);
  } catch (error) {
    console.error("Error upgrading user to ADMIN:", error);
    process.exit(1);
  }
}

main();
