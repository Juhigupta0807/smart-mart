"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/types/store";
import { Toast } from "@/components/store/Toast";
import { ALL_PRODUCTS } from "@/data/mockStoreData";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface AddToCartResult {
  success: boolean;
  message: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => AddToCartResult;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  isLoaded: boolean;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
  showToast: (msg: string) => void;
}

// Initial 3 items (matching the cart badge count "3" in the reference design)
const INITIAL_CART_ITEMS: CartItem[] = [
  {
    product: ALL_PRODUCTS.find((p) => p.productId === 101) || ALL_PRODUCTS[0],
    quantity: 1,
  },
  {
    product: ALL_PRODUCTS.find((p) => p.productId === 102) || ALL_PRODUCTS[1],
    quantity: 1,
  },
  {
    product: ALL_PRODUCTS.find((p) => p.productId === 107) || ALL_PRODUCTS[6],
    quantity: 1,
  },
];

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "smartmart_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize from localStorage on client mount (safe hydration)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
    } catch {
      // Local storage disabled or error
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist to localStorage on change once loaded
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Persistence error fallback
    }
  }, [items, isLoaded]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const addToCart = (product: Product, quantityToAdd = 1): AddToCartResult => {
    const stock = product.currentStock ?? 999;

    if (stock <= 0) {
      const message = `Sorry, "${product.productName}" is currently out of stock.`;
      showToast(message);
      return { success: false, message };
    }

    const qty = Math.max(1, quantityToAdd);
    let resultMessage = "";

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.product.productId === product.productId
      );

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].quantity;
        const newQty = Math.min(currentQty + qty, stock);

        if (currentQty >= stock) {
          resultMessage = `Maximum available stock (${stock}) of "${product.productName}" is already in your cart.`;
          return prevItems;
        }

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        resultMessage = `Added ${qty} more of "${product.productName}" to your cart!`;
        return updated;
      } else {
        const initialQty = Math.min(qty, stock);
        resultMessage = `Added "${product.productName}" (${initialQty}) to your cart!`;
        return [...prevItems, { product, quantity: initialQty }];
      }
    });

    if (resultMessage) {
      showToast(resultMessage);
    }
    return { success: true, message: resultMessage };
  };

  const removeFromCart = (productId: number) => {
    setItems((prev) => {
      const target = prev.find((i) => i.product.productId === productId);
      if (target) {
        showToast(`Removed "${target.product.productName}" from cart`);
      }
      return prev.filter((i) => i.product.productId !== productId);
    });
  };

  const updateQuantity = (productId: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.product.productId === productId) {
          const maxStock = item.product.currentStock ?? 999;
          return {
            ...item,
            quantity: Math.min(newQty, maxStock),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    showToast("Your cart has been cleared");
  };

  // Live totals
  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        isLoaded,
        toastMessage,
        setToastMessage,
        showToast,
      }}
    >
      {children}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
