import { db, pool } from "../src/client.js";
import { admin } from "../src/schema.js";
import bcrypt from "bcryptjs";
import * as readline from "readline/promises";
import { parseArgs } from "util";

async function main() {
  try {
    const { values } = parseArgs({
      options: {
        name: { type: "string" },
        email: { type: "string" },
        password: { type: "string" },
      },
      strict: false,
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    let name = typeof values.name === "string" ? values.name : undefined;
    let email = typeof values.email === "string" ? values.email : undefined;
    let password = typeof values.password === "string" ? values.password : undefined;

    if (!name) name = await rl.question("Enter Admin Name: ");
    if (!email) email = await rl.question("Enter Admin Email: ");
    // Note: Password input will not be hidden in this simple prompt
    if (!password) password = await rl.question("Enter Admin Password: ");

    rl.close();

    if (!name || name.trim().length === 0) {
      console.error("Admin name cannot be empty.");
      process.exit(1);
    }
    if (!email || !email.includes("@")) {
      console.error("Invalid email format.");
      process.exit(1);
    }
    if (!password || password.length < 8) {
      console.error("Password must be at least 8 characters long.");
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(admin).values({
      name,
      email,
      password: hashedPassword,
    });

    console.log(`Admin account created: ${email}`);
  } catch (error: any) {
    if (error.code === "23505") {
      console.error("Friendly error: An admin with this email already exists.");
      process.exit(1);
    }
    console.error("Error creating admin:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
