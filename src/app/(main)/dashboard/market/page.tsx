"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface StockListItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  sector?: string;
}

export default function MarketPage() {
  const router = useRouter();
  const [stocks, setStocks] = useState<StockListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"volume" | "change" | "price">("volume");
  const limit = 20;

  const fetchStocks = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        ...(search && { search }),
      });

      const response = await fetch(`/api/stocks/list?${params}`);
      const data = await response.json();

      setStocks(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [page, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchStocks();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleStockClick = (symbol: string) => {
    router.push(`/dashboard/finance?symbol=${symbol}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mercado de Ações</h1>
          <p className="text-muted-foreground text-sm">
            Acompanhe as ações mais negociadas e as principais movimentações do mercado
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Ações em Destaque</CardTitle>
              <CardDescription>Lista de ações ordenadas por volume de negociação</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Buscar ação (ex: PETR4, VALE3)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="sm:w-64"
              />
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="sm:w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="change">Variação %</SelectItem>
                  <SelectItem value="price">Preço</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Variação</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="text-right">Setor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: limit }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="ml-auto h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="ml-auto h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="ml-auto h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="ml-auto h-4 w-20" />
                        </TableCell>
                      </TableRow>
                    ))
                  : stocks.map((stock) => {
                      const isPositive = stock.changePercent >= 0;
                      return (
                        <TableRow
                          key={stock.symbol}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleStockClick(stock.symbol)}
                        >
                          <TableCell className="font-semibold">{stock.symbol}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{stock.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            R$ {stock.price.toFixed(2)}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right font-medium tabular-nums",
                              isPositive ? "text-emerald-500" : "text-red-500",
                            )}
                          >
                            <div className="flex items-center justify-end gap-1">
                              {isPositive ? (
                                <TrendingUp className="size-4" />
                              ) : (
                                <TrendingDown className="size-4" />
                              )}
                              <span>
                                {isPositive ? "+" : ""}
                                {stock.changePercent.toFixed(2)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {stock.volume.toLocaleString("pt-BR")}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground text-sm">
                            {stock.sector || "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </div>

          {!isLoading && stocks.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Nenhuma ação encontrada.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                Página {page} de {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

