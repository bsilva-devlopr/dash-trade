import { NextResponse } from "next/server";
import { brapiClient } from "@/lib/api/brapi";

export interface StockListItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  sector?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "volume"; // volume, change, price

    // Buscar lista de ações mais negociadas (top stocks)
    const stocks = await brapiClient.quote.list({
      limit: 100, // Buscar mais para ter dados para paginação
    });

    if (!stocks.stocks || stocks.stocks.length === 0) {
      return NextResponse.json({
        data: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // Transformar dados da Brapi
    let stockList: StockListItem[] = stocks.stocks.map((stock: any) => ({
      symbol: stock.stock,
      name: stock.name || stock.stock,
      price: stock.close || stock.price || 0,
      change: stock.change || 0,
      changePercent: stock.changePercent || 0,
      volume: stock.volume || 0,
      marketCap: stock.marketCap,
      sector: stock.sector,
    }));

    // Filtrar por busca
    if (search) {
      const searchLower = search.toLowerCase();
      stockList = stockList.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(searchLower) ||
          stock.name.toLowerCase().includes(searchLower),
      );
    }

    // Ordenar
    stockList.sort((a, b) => {
      switch (sortBy) {
        case "volume":
          return b.volume - a.volume;
        case "change":
          return b.changePercent - a.changePercent;
        case "price":
          return b.price - a.price;
        default:
          return b.volume - a.volume;
      }
    });

    // Paginação
    const total = stockList.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = stockList.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return NextResponse.json(
      { error: "Erro ao buscar ações" },
      { status: 500 },
    );
  }
}

