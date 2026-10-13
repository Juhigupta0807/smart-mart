"use client";
import { authClient } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AdminLoginContent() {
  const next = useSearchParams().get("next") || "/admin";
  
  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Admin Portal</h1>
      <button 
        onClick={() => authClient.signIn.social({ provider: "google", callbackURL: next })}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Sign in with Google (Admin)
      </button>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}
