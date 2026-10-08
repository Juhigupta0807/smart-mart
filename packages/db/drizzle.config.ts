import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: "../../.env" });


if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in environment variables.");
}

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});