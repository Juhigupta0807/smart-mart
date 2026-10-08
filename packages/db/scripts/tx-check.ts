import { db, pool } from "../src/client";
import { category, product, supplier, inventory } from "../src/schema";
import { eq, like } from "drizzle-orm";

async function main() {
  let hasError = false;

  try {
    // 1. Rollback test — use unique suffix to avoid conflict if a previous run crashed mid-tx
    try {
      const rollbackSuffix = Date.now();
      await db.transaction(async (tx) => {
        const [newCat] = await tx.insert(category).values({ categoryName: `TxCat_${rollbackSuffix}` }).returning();
        const [newSup] = await tx.insert(supplier).values({ supplierName: `TxSup_${rollbackSuffix}`, contactNumber: "123" }).returning();
        const [newProd] = await tx.insert(product).values({
          productName: `TxProd_${rollbackSuffix}`,
          price: "10.00",
          categoryId: newCat.categoryId,
          supplierId: newSup.supplierId
        }).returning();
        await tx.insert(inventory).values({
          productId: newProd.productId,
          currentStock: 5,
        });

        throw new Error("Deliberate rollback");
      });
    } catch (e: unknown) {
      if (e instanceof Error && e.message !== "Deliberate rollback") throw e;
    }

    // Verify nothing from the rolled-back tx persists (TxProd prefix)
    const rollbackCheck = await db.query.product.findFirst({ where: like(product.productName, "TxProd_%") });
    if (!rollbackCheck) {
      console.log("PASS: rollback worked (0 rows found)");
    } else {
      console.error("FAIL: rollback did not work");
      hasError = true;
    }

    // Clean up any leftovers from previous failed runs
    await db.delete(category).where(eq(category.categoryName, "CommitCat"));

    // 2. Commit test
    let catId: number | undefined;
    const testCatName = `CommitCat_${Date.now()}`;
    await db.transaction(async (tx) => {
      const [newCat] = await tx.insert(category).values({ categoryName: testCatName }).returning();
      catId = newCat.categoryId;
    });

    if (catId) {
      const commitCheck = await db.query.category.findFirst({ where: eq(category.categoryId, catId) });
      if (commitCheck) {
        console.log("PASS: commit worked");
        await db.delete(category).where(eq(category.categoryId, catId));
      } else {
        console.error("FAIL: commit did not work");
        hasError = true;
      }
    } else {
      console.error("FAIL: commit did not return id");
      hasError = true;
    }

    // 3. Constraint test
    try {
      const uniqueSuffix = Date.now();
      await db.transaction(async (tx) => {
        const [newCat] = await tx.insert(category).values({ categoryName: `ConstrCat_${uniqueSuffix}` }).returning();
        const [newSup] = await tx.insert(supplier).values({ supplierName: `ConstrSup_${uniqueSuffix}`, contactNumber: "123" }).returning();
        const [newProd] = await tx.insert(product).values({
          productName: `ConstrProd_${uniqueSuffix}`,
          price: "10.00",
          categoryId: newCat.categoryId,
          supplierId: newSup.supplierId
        }).returning();

        await tx.insert(inventory).values({
          productId: newProd.productId,
          currentStock: -1,
        });
      });
      console.error("FAIL: CHECK constraint did not block negative stock");
      hasError = true;
    } catch (e: unknown) {
      const err = e as any;
      const fullError = `${err.message} ${err.cause?.message || ""} ${err.cause?.constraint || ""}`;
      if (fullError.includes("inventory_stock_nonneg")) {
        console.log("PASS: CHECK constraint blocked negative stock (inventory_stock_nonneg)");
      } else {
        console.error("FAIL: Expected check constraint error, got: " + (err.cause?.message || err.message));
        hasError = true;
      }
    }

  } catch (err) {
    console.error("Unexpected error during tx-check:", err);
    hasError = true;
  } finally {
    await pool.end();
    if (hasError) process.exit(1);
  }
}

main();
