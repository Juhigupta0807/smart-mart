"use client";
import { authClient } from "@/lib/auth-client";
import { AuthGuard } from "@/components/AuthGuard";

export default function AdminDashboard() {
  const { data } = authClient.useSession();

  return (
    <AuthGuard role="admin">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Admin Dashboard</h1>
        <p>Welcome, {data?.user.name}</p>
        <button 
          onClick={() => authClient.signOut()} 
          className="mt-4 bg-gray-200 px-4 py-2 rounded text-sm"
        >
          Sign Out
        </button>
      </div>
    </AuthGuard>
  );
}
