import { NextResponse } from "next/server";
import { brapiClient } from "@/lib/api/brapi";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ data: [] });
    }

    // Buscar ações que correspondem à query
    const stocks = await brapiClient.quote.list({
      limit: 50,
    });

    const searchLower = query.toLowerCase();
    const results = stocks.stocks
      ?.filter(
        (stock: any) =>
          stock.stock?.toLowerCase().includes(searchLower) ||
          stock.name?.toLowerCase().includes(searchLower),
      )
      .slice(0, 10)
      .map((stock: any) => ({
        symbol: stock.stock,
        name: stock.name || stock.stock,
        price: stock.close || stock.price || 0,
        change: stock.change || 0,
        changePercent: stock.changePercent || 0,
      })) || [];

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("Error searching stocks:", error);
    return NextResponse.json({ data: [] });
  }
}

