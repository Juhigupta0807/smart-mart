import { db, user, admin, pool, eq } from "@smartmart/db";
import { randomUUID } from "crypto";

async function main() {
  const email = process.argv[2]; 
  const name = process.argv[3] || "Admin";

  if (!email) {
    console.error("Provide an email: npm run admin:create admin@example.com");
    process.exit(1);
  }

  try {
    await db.transaction(async (tx) => {
      // Check if user already exists
      const existingUsers = await tx.select().from(user).where(eq(user.email, email)).limit(1);
      
      let targetUserId: string;

      if (existingUsers.length > 0) {
        targetUserId = existingUsers[0].id;
        // Promote existing user to admin
        await tx.update(user).set({ role: "admin" }).where(eq(user.id, targetUserId));
        // Ensure admin entry exists
        await tx.insert(admin).values({ userId: targetUserId }).onConflictDoNothing();
        console.log(`Existing user ${email} promoted to admin!`);
      } else {
        targetUserId = randomUUID();
        // 1. Create the Better Auth user row directly
        await tx.insert(user).values({
          id: targetUserId,
          name,
          email,
          emailVerified: true,
          role: "admin",
        });

        // 2. Create the SmartMart admin profile row
        await tx.insert(admin).values({
          userId: targetUserId,
        });

        console.log(`Admin created. Log in with Google using ${email}`);
      }
    });
  } catch (error) {
    console.error("Failed to create admin:", error);
  } finally {
    // Explicitly close the pool so script exits
    await pool.end();
  }
  process.exit(0);
}
main();
