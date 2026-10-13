"use client";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function Navbar() {
  const { data } = authClient.useSession();

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-100 border-b">
      <div className="font-bold text-xl"><Link href="/">SmartMart</Link></div>
      <div className="flex items-center gap-4">
        {data ? (
          <>
            <span>Welcome, {data.user.name}</span>
            <Link href="/account" className="text-blue-600 hover:underline">Account</Link>
            {data.user.role === "admin" && (
              <Link href="/admin" className="text-red-600 font-bold hover:underline">Admin</Link>
            )}
            <button onClick={() => authClient.signOut()} className="text-sm bg-gray-200 px-3 py-1 rounded">Sign Out</button>
          </>
        ) : (
          <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded">Log In</Link>
        )}
      </div>
    </nav>
  );
}
