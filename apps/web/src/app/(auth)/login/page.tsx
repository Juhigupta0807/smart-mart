"use client";
import { authClient } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const next = useSearchParams().get("next") || "/";
  
  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-2xl font-bold mb-4">Customer Login</h1>
      <button 
        onClick={() => authClient.signIn.social({ provider: "google", callbackURL: next })}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Continue with Google
      </button>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
