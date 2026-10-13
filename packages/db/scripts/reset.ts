import { db, pool } from "../src/client.js";
import { sql } from "drizzle-orm";

async function main() {
  try {
    if (process.env.NODE_ENV === "production") {
      console.error("Cannot reset database in production environment.");
      process.exit(1);
    }

    const isYes = process.argv.includes("--yes");
    if (!isYes) {
      console.warn("WARNING: This will empty all tables. Run with --yes to confirm.");
      process.exit(1);
    }

    await db.execute(sql`
      TRUNCATE payment, order_details, orders, cart, supplier_order_item, supplier_order, inventory, product, supplier, category, customer, admin, session, account, verification, "user" RESTART IDENTITY CASCADE
    `);

    console.log("All tables emptied. Run admin:create to add an admin.");
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();