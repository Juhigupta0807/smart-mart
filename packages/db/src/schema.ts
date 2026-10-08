import {
  pgTable,
  serial,
  varchar,
  integer,
  decimal,
  date,
  timestamp,
  boolean,
  pgEnum,
  unique,
  index,
  check,
  foreignKey,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// =========================================================
// ENUMS
// =========================================================
export const orderStatusEnum = pgEnum("order_status", [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "Cash",
  "Card",
  "UPI",
  "NetBanking",
  "Wallet",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "Pending",
  "Completed",
  "Failed",
  "Refunded",
]);

export const supplierOrderStatusEnum = pgEnum("supplier_order_status", [
  "Pending",
  "Received",
  "Cancelled",
]);

// =========================================================
// 1. ADMIN
// =========================================================
// Single admin type: every admin has full access (no roles).
export const admin = pgTable("admin", {
  adminId: serial("admin_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // bcrypt hash
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// =========================================================
// 2. CUSTOMER
// =========================================================
export const customer = pgTable("customer", {
  customerId: serial("customer_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // bcrypt hash
  phone: varchar("phone", { length: 15 }),
  address: varchar("address", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// =========================================================
// 3. CATEGORY
// =========================================================
export const category = pgTable("category", {
  categoryId: serial("category_id").primaryKey(),
  categoryName: varchar("category_name", { length: 100 }).notNull().unique(),
  adminId: integer("admin_id").references(() => admin.adminId, {
    onDelete: "set null",
  }),
});

// =========================================================
// 4. SUPPLIER
// =========================================================
export const supplier = pgTable("supplier", {
  supplierId: serial("supplier_id").primaryKey(),
  supplierName: varchar("supplier_name", { length: 100 }).notNull(),
  contactNumber: varchar("contact_number", { length: 15 }).notNull(),
  email: varchar("email", { length: 100 }).unique(),
  address: varchar("address", { length: 255 }),
  adminId: integer("admin_id").references(() => admin.adminId, {
    onDelete: "set null",
  }),
});

// =========================================================
// 5. PRODUCT
// =========================================================
export const product = pgTable(
  "product",
  {
    productId: serial("product_id").primaryKey(),
    productName: varchar("product_name", { length: 150 }).notNull(),
    description: varchar("description", { length: 500 }),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    expiryDate: date("expiry_date"),
    imageUrl: varchar("image_url", { length: 500 }),
    isActive: boolean("is_active").notNull().default(true),
    categoryId: integer("category_id")
      .notNull()
      .references(() => category.categoryId, { onDelete: "restrict" }),
    supplierId: integer("supplier_id")
      .notNull()
      .references(() => supplier.supplierId, { onDelete: "restrict" }),
    adminId: integer("admin_id").references(() => admin.adminId, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    priceNonNeg: check("product_price_nonneg", sql`${t.price} >= 0`),
    categoryIdx: index("product_category_idx").on(t.categoryId),
    supplierIdx: index("product_supplier_idx").on(t.supplierId),
    activeIdx: index("product_active_idx").on(t.isActive),
  })
);

// =========================================================
// 6. INVENTORY (1-to-1 with PRODUCT)
// =========================================================
export const inventory = pgTable(
  "inventory",
  {
    inventoryId: serial("inventory_id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .unique()
      .references(() => product.productId, { onDelete: "cascade" }),
    currentStock: integer("current_stock").notNull().default(0),
    reorderLevel: integer("reorder_level").notNull().default(10),
    lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  },
  (t) => ({
    stockNonNeg: check("inventory_stock_nonneg", sql`${t.currentStock} >= 0`),
    reorderNonNeg: check("inventory_reorder_nonneg", sql`${t.reorderLevel} >= 0`),
  })
);

// =========================================================
// 7. CART (junction: customer <-> product)
// =========================================================
export const cart = pgTable(
  "cart",
  {
    cartId: serial("cart_id").primaryKey(),
    customerId: integer("customer_id")
      .notNull()
      .references(() => customer.customerId, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => product.productId, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    addedDate: timestamp("added_date").notNull().defaultNow(),
  },
  (t) => ({
    uqCustomerProduct: unique().on(t.customerId, t.productId),
    quantityPos: check("cart_quantity_pos", sql`${t.quantity} > 0`),
  })
);

// =========================================================
// 8. ORDERS
// =========================================================
export const orders = pgTable(
  "orders",
  {
    orderId: serial("order_id").primaryKey(),
    customerId: integer("customer_id")
      .notNull()
      .references(() => customer.customerId, { onDelete: "restrict" }),
    orderDate: timestamp("order_date").notNull().defaultNow(),
    orderStatus: orderStatusEnum("order_status").notNull().default("Pending"),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    // Address used at the time of the order (snapshot, like unit_price)
    shippingAddress: varchar("shipping_address", { length: 255 }),
  },
  (t) => ({
    totalNonNeg: check("orders_total_nonneg", sql`${t.totalAmount} >= 0`),
    customerIdx: index("orders_customer_idx").on(t.customerId),
    statusIdx: index("orders_status_idx").on(t.orderStatus),
    dateIdx: index("orders_date_idx").on(t.orderDate),
  })
);

// =========================================================
// 9. ORDER_DETAILS (junction: orders <-> product)
// =========================================================
export const orderDetails = pgTable(
  "order_details",
  {
    orderDetailId: serial("order_detail_id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.orderId, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => product.productId, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(), // price at time of sale
  },
  (t) => ({
    quantityPos: check("order_details_quantity_pos", sql`${t.quantity} > 0`),
    priceNonNeg: check("order_details_price_nonneg", sql`${t.unitPrice} >= 0`),
    orderIdx: index("order_details_order_idx").on(t.orderId),
    productIdx: index("order_details_product_idx").on(t.productId),
  })
);

// =========================================================
// 10. PAYMENT (1-to-1 with ORDERS)
// =========================================================
export const payment = pgTable(
  "payment",
  {
    paymentId: serial("payment_id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .unique()
      .references(() => orders.orderId, { onDelete: "cascade" }),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("Pending"),
    paymentDate: timestamp("payment_date").notNull().defaultNow(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  },
  (t) => ({
    amountNonNeg: check("payment_amount_nonneg", sql`${t.amount} >= 0`),
  })
);

// =========================================================
// 11. SUPPLIER_ORDER (admin orders stock from a supplier)
// =========================================================
export const supplierOrder = pgTable(
  "supplier_order",
  {
    supplierOrderId: serial("supplier_order_id").primaryKey(),
    supplierId: integer("supplier_id")
      .notNull()
      .references(() => supplier.supplierId, { onDelete: "restrict" }),
    adminId: integer("admin_id").references(() => admin.adminId, {
      onDelete: "set null",
    }),
    status: supplierOrderStatusEnum("status").notNull().default("Pending"),
    orderDate: timestamp("order_date").notNull().defaultNow(),
    receivedDate: timestamp("received_date"),
    totalCost: decimal("total_cost", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    notes: varchar("notes", { length: 255 }),
  },
  (t) => ({
    totalNonNeg: check("supplier_order_total_nonneg", sql`${t.totalCost} >= 0`),
    supplierIdx: index("supplier_order_supplier_idx").on(t.supplierId),
    statusIdx: index("supplier_order_status_idx").on(t.status),
  })
);

// =========================================================
// 12. SUPPLIER_ORDER_ITEM (junction: supplier_order <-> product)
// =========================================================
export const supplierOrderItem = pgTable(
  "supplier_order_item",
  {
    supplierOrderItemId: serial("supplier_order_item_id").primaryKey(),
    supplierOrderId: integer("supplier_order_id").notNull(),
    productId: integer("product_id")
      .notNull()
      .references(() => product.productId, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(), // cost price at time of ordering
  },
  (t) => ({
    supplierOrderFk: foreignKey({
      columns: [t.supplierOrderId],
      foreignColumns: [supplierOrder.supplierOrderId],
      name: "supplier_order_item_order_fk",
    }).onDelete("cascade"),
    quantityPos: check("supplier_order_item_qty_pos", sql`${t.quantity} > 0`),
    costNonNeg: check("supplier_order_item_cost_nonneg", sql`${t.unitCost} >= 0`),
    orderIdx: index("supplier_order_item_order_idx").on(t.supplierOrderId),
    productIdx: index("supplier_order_item_product_idx").on(t.productId),
  })
);

// =========================================================
// RELATIONS
// Rule: every many() has a matching one() on the other side.
// For 1-to-1, the one() WITH fields/references goes on the table holding the FK.
// =========================================================
export const adminRelations = relations(admin, ({ many }) => ({
  categories: many(category),
  suppliers: many(supplier),
  products: many(product),
  supplierOrders: many(supplierOrder),
}));

export const categoryRelations = relations(category, ({ one, many }) => ({
  admin: one(admin, {
    fields: [category.adminId],
    references: [admin.adminId],
  }),
  products: many(product),
}));

export const supplierRelations = relations(supplier, ({ one, many }) => ({
  admin: one(admin, {
    fields: [supplier.adminId],
    references: [admin.adminId],
  }),
  products: many(product),
  supplierOrders: many(supplierOrder),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  category: one(category, {
    fields: [product.categoryId],
    references: [category.categoryId],
  }),
  supplier: one(supplier, {
    fields: [product.supplierId],
    references: [supplier.supplierId],
  }),
  admin: one(admin, {
    fields: [product.adminId],
    references: [admin.adminId],
  }),
  inventory: one(inventory), // FK lives on inventory
  orderDetails: many(orderDetails),
  cartItems: many(cart),
  supplierOrderItems: many(supplierOrderItem),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(product, {
    fields: [inventory.productId],
    references: [product.productId],
  }),
}));

export const customerRelations = relations(customer, ({ many }) => ({
  orders: many(orders),
  cartItems: many(cart),
}));

export const cartRelations = relations(cart, ({ one }) => ({
  customer: one(customer, {
    fields: [cart.customerId],
    references: [customer.customerId],
  }),
  product: one(product, {
    fields: [cart.productId],
    references: [product.productId],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customer, {
    fields: [orders.customerId],
    references: [customer.customerId],
  }),
  payment: one(payment), // FK lives on payment
  orderDetails: many(orderDetails),
}));

export const orderDetailsRelations = relations(orderDetails, ({ one }) => ({
  order: one(orders, {
    fields: [orderDetails.orderId],
    references: [orders.orderId],
  }),
  product: one(product, {
    fields: [orderDetails.productId],
    references: [product.productId],
  }),
}));

export const paymentRelations = relations(payment, ({ one }) => ({
  order: one(orders, {
    fields: [payment.orderId],
    references: [orders.orderId],
  }),
}));

export const supplierOrderRelations = relations(supplierOrder, ({ one, many }) => ({
  supplier: one(supplier, {
    fields: [supplierOrder.supplierId],
    references: [supplier.supplierId],
  }),
  admin: one(admin, {
    fields: [supplierOrder.adminId],
    references: [admin.adminId],
  }),
  items: many(supplierOrderItem),
}));

export const supplierOrderItemRelations = relations(supplierOrderItem, ({ one }) => ({
  supplierOrder: one(supplierOrder, {
    fields: [supplierOrderItem.supplierOrderId],
    references: [supplierOrder.supplierOrderId],
  }),
  product: one(product, {
    fields: [supplierOrderItem.productId],
    references: [product.productId],
  }),
}));

// =========================================================
// INFERRED TYPES
// =========================================================
export type Admin = typeof admin.$inferSelect;
export type NewAdmin = typeof admin.$inferInsert;
export type Customer = typeof customer.$inferSelect;
export type NewCustomer = typeof customer.$inferInsert;
export type Category = typeof category.$inferSelect;
export type NewCategory = typeof category.$inferInsert;
export type Supplier = typeof supplier.$inferSelect;
export type NewSupplier = typeof supplier.$inferInsert;
export type Product = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;
export type Inventory = typeof inventory.$inferSelect;
export type NewInventory = typeof inventory.$inferInsert;
export type CartItem = typeof cart.$inferSelect;
export type NewCartItem = typeof cart.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderDetail = typeof orderDetails.$inferSelect;
export type NewOrderDetail = typeof orderDetails.$inferInsert;
export type Payment = typeof payment.$inferSelect;
export type NewPayment = typeof payment.$inferInsert;

export type SupplierOrder = typeof supplierOrder.$inferSelect;
export type NewSupplierOrder = typeof supplierOrder.$inferInsert;
export type SupplierOrderItem = typeof supplierOrderItem.$inferSelect;
export type NewSupplierOrderItem = typeof supplierOrderItem.$inferInsert;

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
export type SupplierOrderStatus = (typeof supplierOrderStatusEnum.enumValues)[number];
