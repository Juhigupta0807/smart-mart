"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Navbar } from "@/components/store/Navbar";

export default function Home() {
  const [health, setHealth] = useState({ db: "pending" });

  useEffect(() => {
    fetchApi<{ status: string; db: string }>("/api/health")
      .then(setHealth)
      .catch(() => setHealth({ db: "down" }));
  }, []);

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-col items-center justify-center flex-grow">
        <h1 className="text-4xl font-bold mb-4">SmartMart</h1>
        <p className="text-xl">
          API: {health.db === "up" ? (
            <span className="text-green-600 font-semibold">ok</span>
          ) : health.db === "pending" ? (
            <span className="text-gray-500">checking...</span>
          ) : (
            <span className="text-red-600 font-semibold">down</span>
          )}
        </p>
      </div>
    </main>
  );
}