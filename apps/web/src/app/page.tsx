import { fetchApi } from "@/lib/api";

async function getHealth() {
  try {
    const res = await fetchApi<{ status: string; db: string }>("/api/health");
    return res;
  } catch (error) {
    return { status: "error", db: "down" };
  }
}

export default async function Home() {
  const health = await getHealth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">SmartMart</h1>
      <p className="text-xl">
        API: {health.db === "up" ? (
          <span className="text-green-600 font-semibold">ok</span>
        ) : (
          <span className="text-red-600 font-semibold">down</span>
        )}
      </p>
    </main>
  );
}