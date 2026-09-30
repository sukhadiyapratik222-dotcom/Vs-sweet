import { ensureSeeded } from "@/db/seed";
import { searchSuggestions } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await ensureSeeded();
  const q = new URL(request.url).searchParams.get("q") || "";
  const products = await searchSuggestions(q);
  return Response.json({ products });
}
