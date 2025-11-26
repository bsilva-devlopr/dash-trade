"use client";

import { useMemo } from "react";

import { TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  type AssetSymbol,
  type OverviewMetric,
  type OverviewPayload,
  getAssetOptions,
} from "./mock-data";
import { TradingViewWidget } from "./tradingview-widget";

type OverviewTabProps = {
  selectedAsset: AssetSymbol;
  data: OverviewPayload | null;
  isLoading: boolean;
  onAssetChange: (asset: AssetSymbol) => void;
};

const formatChange = (value: number) => {
  const formatted = `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  return formatted;
};

const MetricCard = ({ metric }: { metric: OverviewMetric }) => {
  const isPositive = metric.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-muted/30 group relative overflow-hidden rounded-xl border border-border p-4"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs uppercase tracking-wide">{metric.label}</span>
          <Badge variant={isPositive ? "secondary" : "destructive"} className="flex items-center gap-1">
            {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {formatChange(metric.change)}
          </Badge>
        </div>
        <p className="text-2xl font-semibold tabular-nums">{metric.value}</p>
        <span className="text-muted-foreground text-xs">{metric.helper}</span>
      </div>
      <div className="bg-primary/5 absolute inset-x-0 bottom-0 h-1" />
    </motion.div>
  );
};

const assetOptions = getAssetOptions();

export function OverviewTab({ selectedAsset, data, isLoading, onAssetChange }: OverviewTabProps) {
  const emaSeries = useMemo(() => data?.candles ?? [], [data]);

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/80 bg-background/80 backdrop-blur">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Visão Geral</CardTitle>
            <CardDescription>Monitoramento em tempo real com dados mockados prontos para integração via API.</CardDescription>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Ativo monitorado</span>
            <Select value={selectedAsset} onValueChange={(value) => onAssetChange(value as AssetSymbol)}>
              <SelectTrigger className="sm:w-52">
                <SelectValue placeholder="Selecione um ativo" />
              </SelectTrigger>
              <SelectContent>
                {assetOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {isLoading && !data
            ? Array.from({ length: 4 }).map((_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeletons load-only
                <Skeleton key={index} className="h-32 w-full rounded-xl" />
              ))
            : data?.metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-border/80 bg-background/80 backdrop-blur xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Gráfico de Candles</CardTitle>
            <CardDescription>
              Widget do TradingView com estudos configurados e pronto para receber dados de mercado em tempo real.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[420px]">
            {isLoading && !data ? <Skeleton className="h-full w-full" /> : <TradingViewWidget symbol={selectedAsset} />}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-background/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Médias móveis</CardTitle>
            <CardDescription>
              EMA 20 e EMA 50 comparadas com o preço de fechamento, úteis para identificar tendências.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[420px]">
            {isLoading && !data ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={emaSeries}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 4" opacity={0.2} />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={(value) => value.toFixed(0)} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      borderRadius: "0.75rem",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="close" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" name="Fechamento" />
                  <Line type="monotone" dataKey="ema20" stroke="#38bdf8" dot={false} strokeWidth={2} name="EMA 20" />
                  <Line type="monotone" dataKey="ema50" stroke="#f97316" dot={false} strokeWidth={2} name="EMA 50" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 bg-background/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Indicadores técnicos</CardTitle>
          <CardDescription>MACD, sinal, histograma e RSI com linha de equilíbrio em 50 pontos.</CardDescription>
        </CardHeader>
        <CardContent className="h-[360px]">
          {isLoading && !data ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={emaSeries}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 4" opacity={0.15} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="left"
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => `${value}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => Number(value).toFixed(2)}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    borderRadius: "0.75rem",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <ReferenceLine yAxisId="left" y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rsi"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={false}
                  name="RSI"
                />
                <Bar yAxisId="right" dataKey="histogram" barSize={14} fill="hsl(152 76% 40% / 0.35)" name="Histograma" />
                <Line yAxisId="right" type="monotone" dataKey="macd" stroke="#a855f7" strokeWidth={2} dot={false} name="MACD" />
                <Line yAxisId="right" type="monotone" dataKey="signal" stroke="#f97316" strokeWidth={2} dot={false} name="Linha de sinal" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Separator className="bg-border/60" />

      <div className="grid gap-4 sm:grid-cols-3">
        {(data?.candles ?? []).slice(-3).map((candle) => {
          const isBullish = candle.close >= candle.open;
          return (
            <div
              key={candle.time}
              className={cn(
                "rounded-xl border border-border/80 bg-muted/20 p-4 transition hover:border-primary/80",
                isBullish ? "shadow-[0_0_0_1px_rgba(34,197,94,0.15)]" : "shadow-[0_0_0_1px_rgba(239,68,68,0.12)]",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs uppercase">{candle.time}</span>
                <Badge variant={isBullish ? "secondary" : "destructive"}>{isBullish ? "Alta" : "Baixa"}</Badge>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Abertura</span>
                  <span className="font-semibold text-foreground">{candle.open.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fechamento</span>
                  <span className="font-semibold text-foreground">{candle.close.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Máxima</span>
                  <span className="font-semibold text-foreground">{candle.high.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mínima</span>
                  <span className="font-semibold text-foreground">{candle.low.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

