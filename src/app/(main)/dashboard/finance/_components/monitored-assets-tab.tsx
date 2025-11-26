"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

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

import type { MonitoredAsset } from "./mock-data";

type MonitoredAssetsTabProps = {
  assets: MonitoredAsset[];
  isLoading: boolean;
};

const trendIcon = (trend: MonitoredAsset["trend"]) => {
  if (trend === "Alta") return <ArrowUpRight className="size-3 text-emerald-400" />;
  if (trend === "Baixa") return <ArrowDownRight className="size-3 text-red-400" />;
  return <Minus className="size-3 text-slate-400" />;
};

const signalColor: Record<MonitoredAsset["aiSignal"], string> = {
  Comprar: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  Vender: "bg-red-500/20 text-red-300 border-red-500/40",
  Aguardar: "bg-slate-500/20 text-slate-200 border-slate-500/40",
};

export function MonitoredAssetsTab({ assets, isLoading }: MonitoredAssetsTabProps) {
  return (
    <Card className="border-border/80 bg-background/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Ativos Monitorados</CardTitle>
        <CardDescription>Lista de ativos acompanhados pela IA com o último sinal operacional.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[420px] rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right">Último preço</TableHead>
                <TableHead className="text-right">Variação</TableHead>
                <TableHead>Tendência</TableHead>
                <TableHead>Sinal da IA</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
                    <TableRow key={index}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-10 w-full rounded-lg" />
                      </TableCell>
                    </TableRow>
                  ))
                : assets.map((asset, index) => {
                    const isPositive = asset.changePercent >= 0;
                    return (
                      <motion.tr
                        key={asset.symbol}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-border/60"
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{asset.symbol}</span>
                            <span className="text-muted-foreground text-xs">{asset.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {asset.lastPrice.toLocaleString("pt-BR", {
                            style: "currency",
                            currency:
                              asset.symbol === "AAPL" || asset.symbol === "TSLA" || asset.symbol === "BTCUSDT" ? "USD" : "BRL",
                          })}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-medium tabular-nums",
                            isPositive ? "text-emerald-400" : "text-red-400",
                          )}
                        >
                          {isPositive ? "+" : ""}
                          {asset.changePercent.toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {trendIcon(asset.trend)}
                            <span>{asset.trend}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                              signalColor[asset.aiSignal],
                            )}
                          >
                            <span
                              className={cn(
                                "size-2 rounded-full",
                                asset.aiSignal === "Comprar"
                                  ? "bg-emerald-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.75)]"
                                  : asset.aiSignal === "Vender"
                                    ? "bg-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.75)]"
                                    : "bg-slate-300 drop-shadow-[0_0_8px_rgba(148,163,184,0.75)]",
                              )}
                            />
                            {asset.aiSignal}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                              asset.status === "Aberta"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-slate-600/20 text-slate-200",
                            )}
                          >
                            {asset.status}
                          </span>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

