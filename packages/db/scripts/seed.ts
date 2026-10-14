import { db, pool } from "../src/client.js";
import { category, supplier, product, inventory, admin } from "../src/schema.js";
import { ALL_PRODUCTS, MOCK_CATEGORIES } from "./seedData.js";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Starting seed process using frontend mock data...");

  try {
    // 1. Get an existing admin (if any) to optionally link created categories/suppliers/products
    const existingAdmin = await db.query.admin.findFirst();
    const adminId = existingAdmin ? existingAdmin.adminId : null;
    if (adminId) {
      console.log(`Linking seeded data to adminId: ${adminId}`);
    }

    // 2. Seed Categories
    console.log("Seeding categories...");
    const categoryMap = new Map<string, number>();

    for (const cat of MOCK_CATEGORIES) {
      const existing = await db.query.category.findFirst({
        where: eq(category.categoryName, cat.categoryName),
      });

      if (existing) {
        categoryMap.set(cat.categoryName, existing.categoryId);
      } else {
        const [inserted] = await db
          .insert(category)
          .values({
            categoryName: cat.categoryName,
            adminId: adminId,
          })
          .returning();
        categoryMap.set(cat.categoryName, inserted.categoryId);
        console.log(`  + Category created: ${cat.categoryName} (ID: ${inserted.categoryId})`);
      }
    }

    // 3. Seed Suppliers (collect unique suppliers from ALL_PRODUCTS)
    console.log("Seeding suppliers...");
    const supplierMap = new Map<string, number>();
    const supplierNames = Array.from(
      new Set(ALL_PRODUCTS.map((p) => p.supplier || "Default Supplier"))
    );

    let phoneCounter = 1000;
    for (const supName of supplierNames) {
      const existing = await db.query.supplier.findFirst({
        where: eq(supplier.supplierName, supName),
      });

      if (existing) {
        supplierMap.set(supName, existing.supplierId);
      } else {
        phoneCounter++;
        const [inserted] = await db
          .insert(supplier)
          .values({
            supplierName: supName,
            contactNumber: `98765${phoneCounter}`,
            email: `${supName.toLowerCase().replace(/[^a-z0-9]/g, "")}@supply.com`,
            address: "Main Distribution Center, Sector 12",
            adminId: adminId,
          })
          .returning();
        supplierMap.set(supName, inserted.supplierId);
        console.log(`  + Supplier created: ${supName} (ID: ${inserted.supplierId})`);
      }
    }

    // 4. Seed Products and Inventory
    console.log("Seeding products & inventory...");
    let productCount = 0;

    for (const item of ALL_PRODUCTS) {
      // Find categoryId
      let catId = categoryMap.get(item.categoryName);
      if (!catId) {
        // Fallback: check database directly
        const dbCat = await db.query.category.findFirst({
          where: eq(category.categoryName, item.categoryName),
        });
        if (dbCat) {
          catId = dbCat.categoryId;
          categoryMap.set(item.categoryName, catId);
        } else {
          const [newCat] = await db
            .insert(category)
            .values({ categoryName: item.categoryName, adminId })
            .returning();
          catId = newCat.categoryId;
          categoryMap.set(item.categoryName, catId);
        }
      }

      // Find supplierId
      const supName = item.supplier || "Default Supplier";
      const supId = supplierMap.get(supName) || Array.from(supplierMap.values())[0];

      // Check if product already exists
      const existingProduct = await db.query.product.findFirst({
        where: eq(product.productName, item.productName),
      });

      let currentProdId: number;

      if (!existingProduct) {
        // Parse expiry date if possible or default to null
        let expiry: string | null = null;
        if (item.expiryDate) {
          const parsed = new Date(item.expiryDate);
          if (!isNaN(parsed.getTime())) {
            expiry = parsed.toISOString().split("T")[0];
          }
        }

        const [insertedProd] = await db
          .insert(product)
          .values({
            productName: item.productName,
            description: item.description?.slice(0, 500) || null,
            price: item.price.toString(),
            imageUrl: item.imageUrl || null,
            isActive: item.isActive !== undefined ? item.isActive : true,
            categoryId: catId,
            supplierId: supId,
            adminId: adminId,
            expiryDate: expiry,
          })
          .returning();

        currentProdId = insertedProd.productId;
        productCount++;
        console.log(`  + Product: ${item.productName} (₹${item.price})`);
      } else {
        currentProdId = existingProduct.productId;
      }

      // Ensure inventory record exists
      const existingInv = await db.query.inventory.findFirst({
        where: eq(inventory.productId, currentProdId),
      });

      if (!existingInv) {
        await db.insert(inventory).values({
          productId: currentProdId,
          currentStock: item.currentStock || 50,
          reorderLevel: 10,
        });
      }
    }

    console.log(`\n Successfully seeded ${productCount} products into database!`);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
