"use client";
import { authClient } from "@/lib/auth-client";
import { AuthGuard } from "@/components/AuthGuard";
import { useState } from "react";

export default function AccountPage() {
  const { data } = authClient.useSession();
  const [name, setName] = useState(data?.user.name || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    setSaving(false);
  }

  return (
    <AuthGuard role="customer">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">My Account</h1>
        <div className="mb-4">
          <p>Email: {data?.user.email}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)}
            className="border p-2 rounded w-64"
          />
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </AuthGuard>
  );
}
