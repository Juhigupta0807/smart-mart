"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, Menu, X, ChevronDown, User as UserIcon } from "lucide-react";

import { useCart } from "@/context/CartContext";

interface NavbarProps {
  cartCount?: number;
  onCartClick?: () => void;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  user?: { name: string; avatarUrl?: string } | null;
}

export function Navbar({
  cartCount,
  onCartClick,
  searchQuery: controlledSearchQuery,
  onSearch,
  user = { name: "Juhi", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
}: NavbarProps) {
  const { totalCount } = useCart();
  const effectiveCartCount = cartCount !== undefined ? cartCount : totalCount;
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  const activeSearchQuery = controlledSearchQuery !== undefined ? controlledSearchQuery : localSearchQuery;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(activeSearchQuery);
    } else if (activeSearchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(activeSearchQuery.trim())}`);
    }
  };

  const handleSearchChange = (val: string) => {
    setLocalSearchQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const isHome = pathname === "/";
  const isProducts = pathname.startsWith("/products");

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EDE6DC]/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-[#E7F2E4] flex items-center justify-center text-[#1E4D38] transition-transform group-hover:scale-105 shadow-xs">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#1E4D38]"
              >
                {/* Cart Body */}
                <path
                  d="M3 3H5.2L7.3 14.5C7.4 15.1 7.9 15.5 8.5 15.5H18.5C19.1 15.5 19.6 15.1 19.7 14.5L21 7.5H6"
                  stroke="#1E4D38"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="19.5" r="1.5" fill="#1E4D38" />
                <circle cx="18" cy="19.5" r="1.5" fill="#1E4D38" />
                {/* Fresh Sprout Leaf / Carrot Accent */}
                <path
                  d="M14 4.5C14 4.5 16 3 18 4C18.5 6 16.5 8 16.5 8"
                  stroke="#2E7D32"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.5 6L13.5 8"
                  stroke="#F97316"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#1A4731]">
              Smart<span className="text-[#2B6E48]">Mart</span>
            </span>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <Link
              href="/"
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                isHome
                  ? "bg-[#E5EFE2] text-[#1E4D38]"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/70"
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                isProducts
                  ? "bg-[#E5EFE2] text-[#1E4D38]"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/70"
              }`}
            >
              Products
            </Link>
            <Link
              href="/#about"
              className="px-4 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-full hover:bg-stone-100/70 transition-colors"
            >
              About
            </Link>
            <Link
              href="/#contact"
              className="px-4 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-full hover:bg-stone-100/70 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center flex-1 max-w-md relative mx-2"
          >
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={activeSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search for groceries, beverages, household items..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#FCFAF7] border border-stone-200/90 rounded-full placeholder:text-stone-400 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#286345]/20 focus:border-[#286345] transition-all shadow-2xs"
            />
          </form>

          {/* Right Actions: Cart, Login, Register or Customer Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart Button */}
            <Link
              href="/cart"
              onClick={onCartClick}
              aria-label={`Shopping Cart with ${effectiveCartCount} items`}
              className="relative p-2.5 rounded-full hover:bg-stone-100 text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-stone-700" />
              {effectiveCartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#1E4D38] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {effectiveCartCount}
                </span>
              )}
            </Link>

            {/* Auth Buttons or Account Dropdown */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200/90 shadow-2xs cursor-pointer hover:border-stone-300 transition-colors">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-stone-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#E5EFE2] text-[#1E4D38] flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs sm:text-sm font-semibold text-stone-800">
                  Hi, {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/admin/login"
                  className="px-4 py-2 text-sm font-medium text-stone-700 bg-[#F1ECE3] hover:bg-[#E8E1D5] rounded-full transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/admin/login"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#1E4D38] hover:bg-[#163C2B] rounded-full shadow-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Row (visible on small mobile screens) */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={activeSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search groceries..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#FCFAF7] border border-stone-200/90 rounded-full text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#286345]/20 focus:border-[#286345]"
            />
          </form>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-stone-200/60 flex flex-col gap-2 bg-[#FAF7F2]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                isHome ? "bg-[#E5EFE2] text-[#1E4D38]" : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                isProducts ? "bg-[#E5EFE2] text-[#1E4D38]" : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              Products
            </Link>
            <Link
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              About
            </Link>
            <Link
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Contact
            </Link>
            <div className="pt-2 flex items-center gap-2 sm:hidden border-t border-stone-200/50 mt-2">
              <Link
                href="/admin/login"
                className="flex-1 text-center py-2 text-sm font-medium text-stone-700 bg-[#F1ECE3] rounded-full"
              >
                Login
              </Link>
              <Link
                href="/admin/login"
                className="flex-1 text-center py-2 text-sm font-semibold text-white bg-[#1E4D38] rounded-full shadow-xs"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
