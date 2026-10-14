export type OrderStatus = "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";

export type PaymentMethod = "Cash" | "Card" | "UPI" | "NetBanking" | "Wallet";

export type PaymentStatus = "Pending" | "Completed" | "Failed" | "Refunded";

export interface OrderSummary {
  orderId: number;
  orderDate: string;
  orderStatus: OrderStatus;
  totalAmount: string;
  shippingAddress: string | null;
  customerId: number;
  customerName: string | null;
  customerEmail: string | null;
}

export interface OrderItem {
  orderDetailId: number;
  productId: number;
  quantity: number;
  unitPrice: string;
  productName: string | null;
}

export interface OrderPayment {
  paymentId: number;
  orderId: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDate: string;
  amount: string;
}

export interface OrderDetail extends OrderSummary {
  items: OrderItem[];
  payment: OrderPayment | null;
}
