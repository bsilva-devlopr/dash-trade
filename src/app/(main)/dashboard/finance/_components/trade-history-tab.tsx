"use client";

import { useMemo } from "react";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { TradeHistoryResponse } from "./mock-data";

type TradeHistoryTabProps = {
  tradeHistory: TradeHistoryResponse | null;
  isLoading: boolean;
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );

const currencyFor = (symbol: string) =>
  symbol === "AAPL" || symbol === "TSLA" || symbol === "BTCUSDT" ? "USD" : "BRL";

export function TradeHistoryTab({ tradeHistory, isLoading }: TradeHistoryTabProps) {
  const performanceSeries = useMemo(() => tradeHistory?.performance ?? [], [tradeHistory]);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="border-border/80 bg-background/80 backdrop-blur lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Performance acumulada</CardTitle>
          <CardDescription>Lucro acumulado das operações considerando resultado percentual por trade.</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          {isLoading || !tradeHistory ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceSeries}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 4" opacity={0.15} />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) =>
                    new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(value))
                  }
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <Tooltip
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, "Retorno acumulado"]}
                  contentStyle={{
                    background: "hsl(var(--background))",
                    borderRadius: "0.75rem",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Line type="monotone" dataKey="cumulativeReturn" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-background/80 backdrop-blur lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-semibold">Histórico de Trades</CardTitle>
              <CardDescription>Operações executadas pelo robô trader com acompanhamento percentual.</CardDescription>
            </div>
            <div className="bg-emerald-500/10 flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-300">
              <TrendingUp className="size-3" />
              Atualizando em tempo real
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[360px] rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data / Hora</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || !tradeHistory
                  ? Array.from({ length: 8 }).map((_, index) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
                      <TableRow key={index}>
                        <TableCell colSpan={6}>
                          <Skeleton className="h-10 w-full rounded-lg" />
                        </TableCell>
                      </TableRow>
                    ))
                  : tradeHistory.trades.map((trade, index) => {
                      const isPositive = trade.resultPct >= 0;
                      return (
                        <motion.tr
                          key={trade.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.035 * index }}
                          className="border-border/60"
                        >
                          <TableCell className="font-medium">{formatDate(trade.timestamp)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{trade.symbol}</span>
                              <span className="text-muted-foreground text-xs">{currencyFor(trade.symbol)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                                trade.side === "Compra"
                                  ? "bg-sky-500/15 text-sky-300"
                                  : "bg-orange-500/15 text-orange-300",
                              )}
                            >
                              {trade.side}
                            </span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{trade.quantity.toLocaleString("pt-BR")}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {trade.price.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: currencyFor(trade.symbol),
                            })}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right font-semibold tabular-nums",
                              isPositive ? "text-emerald-400" : "text-red-400",
                            )}
                          >
                            {isPositive ? "+" : ""}
                            {trade.resultPct.toFixed(2)}%
                          </TableCell>
                        </motion.tr>
                      );
                    })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

