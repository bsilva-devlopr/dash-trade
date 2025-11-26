"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface PortfolioItem {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  profit: number;
  profitPercent: number;
}

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);

  useEffect(() => {
    // Simular dados do portfólio
    const mockPortfolio: PortfolioItem[] = [
      {
        symbol: "PETR4",
        name: "Petrobras PN",
        quantity: 100,
        avgPrice: 28.50,
        currentPrice: 32.10,
        totalValue: 3210,
        profit: 360,
        profitPercent: 12.63,
      },
      {
        symbol: "VALE3",
        name: "Vale ON",
        quantity: 50,
        avgPrice: 65.20,
        currentPrice: 68.90,
        totalValue: 3445,
        profit: 185,
        profitPercent: 5.67,
      },
      {
        symbol: "ITUB4",
        name: "Itaú Unibanco PN",
        quantity: 200,
        avgPrice: 22.30,
        currentPrice: 24.15,
        totalValue: 4830,
        profit: 370,
        profitPercent: 8.30,
      },
    ];

    setTimeout(() => {
      setPortfolio(mockPortfolio);
      setTotalValue(mockPortfolio.reduce((sum, item) => sum + item.totalValue, 0));
      setTotalProfit(mockPortfolio.reduce((sum, item) => sum + item.profit, 0));
      setIsLoading(false);
    }, 500);
  }, []);

  const pieData = portfolio.map((item) => ({
    name: item.symbol,
    value: item.totalValue,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu Portfólio</h1>
        <p className="text-muted-foreground text-sm">Acompanhe seus investimentos e performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                <p className="text-muted-foreground text-xs">Valor atual do portfólio</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro/Prejuízo</CardTitle>
            {totalProfit >= 0 ? (
              <TrendingUp className="text-emerald-500 size-4" />
            ) : (
              <TrendingDown className="text-red-500 size-4" />
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div
                  className={cn(
                    "text-2xl font-bold",
                    totalProfit >= 0 ? "text-emerald-500" : "text-red-500",
                  )}
                >
                  {totalProfit >= 0 ? "+" : ""}R$ {totalProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-muted-foreground text-xs">
                  {totalProfit >= 0 ? "Lucro" : "Prejuízo"} total
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rentabilidade</CardTitle>
            <PieChart className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div
                  className={cn(
                    "text-2xl font-bold",
                    totalProfit >= 0 ? "text-emerald-500" : "text-red-500",
                  )}
                >
                  {totalProfit >= 0 ? "+" : ""}
                  {((totalProfit / (totalValue - totalProfit)) * 100).toFixed(2)}%
                </div>
                <p className="text-muted-foreground text-xs">Rentabilidade total</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Posições</CardTitle>
            <CardDescription>Suas posições atuais no mercado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ativo</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Preço Médio</TableHead>
                    <TableHead className="text-right">Preço Atual</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-right">Lucro/Prejuízo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="ml-auto h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="ml-auto h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="ml-auto h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="ml-auto h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="ml-auto h-4 w-24" />
                          </TableCell>
                        </TableRow>
                      ))
                    : portfolio.map((item) => {
                        const isPositive = item.profit >= 0;
                        return (
                          <TableRow key={item.symbol}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-semibold">{item.symbol}</span>
                                <span className="text-muted-foreground text-xs">{item.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              R$ {item.avgPrice.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              R$ {item.currentPrice.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-medium">
                              R$ {item.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-right font-semibold tabular-nums",
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
                                  {isPositive ? "+" : ""}R$ {item.profit.toFixed(2)}
                                </span>
                                <span className="text-xs">
                                  ({isPositive ? "+" : ""}
                                  {item.profitPercent.toFixed(2)}%)
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição</CardTitle>
            <CardDescription>Composição do portfólio</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

