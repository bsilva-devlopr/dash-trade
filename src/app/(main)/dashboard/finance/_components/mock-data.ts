"use client";

export type AssetSymbol = "PETR4" | "VALE3" | "AAPL" | "BTCUSDT" | "TSLA";

export type OverviewMetric = {
  label: string;
  value: string;
  helper: string;
  change: number;
};

export type OverviewSeriesPoint = {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  ema20: number;
  ema50: number;
  rsi: number;
  macd: number;
  signal: number;
  histogram: number;
};

export type OverviewPayload = {
  asset: AssetSymbol;
  displayName: string;
  metrics: OverviewMetric[];
  candles: OverviewSeriesPoint[];
};

export type MonitoredAsset = {
  symbol: AssetSymbol;
  name: string;
  lastPrice: number;
  changePercent: number;
  trend: "Alta" | "Baixa" | "Neutra";
  aiSignal: "Comprar" | "Vender" | "Aguardar";
  status: "Aberta" | "Encerrada";
};

export type TradeRecord = {
  id: string;
  timestamp: string;
  symbol: AssetSymbol;
  side: "Compra" | "Venda";
  quantity: number;
  price: number;
  resultPct: number;
};

export type PerformancePoint = {
  timestamp: string;
  cumulativeReturn: number;
};

export type TradeHistoryResponse = {
  trades: TradeRecord[];
  performance: PerformancePoint[];
};

export type SettingsPayload = {
  interval: "5min" | "15min" | "1h" | "4h" | "1d";
  maxRisk: number;
  capital: number;
  stopLoss: number;
  takeProfit: number;
};

type AsyncResult<T> = Promise<T>;

const DISPLAY_NAMES: Record<AssetSymbol, string> = {
  PETR4: "PETR4 • Petrobras",
  VALE3: "VALE3 • Vale",
  AAPL: "AAPL • Apple",
  BTCUSDT: "BTC/USDT • Bitcoin",
  TSLA: "TSLA • Tesla",
};

const BASE_PRICES: Record<AssetSymbol, number> = {
  PETR4: 34.72,
  VALE3: 65.84,
  AAPL: 192.55,
  BTCUSDT: 67580,
  TSLA: 238.87,
};

const ASSET_POOL: AssetSymbol[] = ["PETR4", "VALE3", "AAPL", "BTCUSDT", "TSLA"];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const getSeed = (symbol: AssetSymbol) =>
  symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

const generateSeries = (symbol: AssetSymbol, points = 24): OverviewSeriesPoint[] => {
  const random = mulberry32(getSeed(symbol));
  const base = BASE_PRICES[symbol];

  let previousClose = base;
  let ema20 = base;
  let ema50 = base;

  const data: OverviewSeriesPoint[] = [];

  for (let index = 0; index < points; index += 1) {
    const noise = (random() - 0.5) * (symbol === "BTCUSDT" ? 3000 : symbol === "AAPL" || symbol === "TSLA" ? 6 : 2.5);
    const drift = (index - points / 2) * (symbol === "BTCUSDT" ? 8 : symbol === "TSLA" ? 0.35 : 0.18);

    const open = previousClose;
    const close = Math.max(0.01, open + noise + drift * 0.01);
    const high = Math.max(open, close) + Math.abs(noise) * 0.4;
    const low = Math.min(open, close) - Math.abs(noise) * 0.4;
    const volumeBase = symbol === "BTCUSDT" ? 1800 : symbol === "AAPL" ? 620000 : 450000;
    const volumeNoise = random() * (symbol === "BTCUSDT" ? 900 : 160000);
    const volume = Math.round(volumeBase + volumeNoise);

    ema20 = index === 0 ? close : ema20 + (2 / (20 + 1)) * (close - ema20);
    ema50 = index === 0 ? close : ema50 + (2 / (50 + 1)) * (close - ema50);

    const change = close - previousClose;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    const prevRSI = data[data.length - 1]?.rsi ?? 50;
    const avgGain = prevRSI / 100;
    const avgLoss = (100 - prevRSI) / 100;
    const rsiRaw = avgLoss === 0 ? 100 : 100 - 100 / (1 + (avgGain + gain) / (avgLoss + loss));

    const macdShort = 12;
    const macdLong = 26;
    const macdSignal = 9;
    const prevMacd = data[data.length - 1];

    const emaShort = prevMacd ? prevMacd.macd + (2 / (macdShort + 1)) * (close - prevMacd.macd) : close;
    const emaLong = prevMacd ? prevMacd.signal + (2 / (macdLong + 1)) * (close - prevMacd.signal) : close;
    const macd = emaShort - emaLong;
    const signal = prevMacd ? prevMacd.signal + (2 / (macdSignal + 1)) * (macd - prevMacd.signal) : macd;

    data.push({
      time: `${index + 1}h`,
      open: Number(open.toFixed(2)),
      close: Number(close.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      volume,
      ema20: Number(ema20.toFixed(2)),
      ema50: Number(ema50.toFixed(2)),
      rsi: Math.min(80, Math.max(20, Number(rsiRaw.toFixed(2)))),
      macd: Number(macd.toFixed(4)),
      signal: Number(signal.toFixed(4)),
      histogram: Number((macd - signal).toFixed(4)),
    });

    previousClose = close;
  }

  return data;
};

const toMetric = (label: string, value: string, helper: string, change: number): OverviewMetric => ({
  label,
  value,
  helper,
  change,
});

const buildMetrics = (symbol: AssetSymbol, series: OverviewSeriesPoint[]): OverviewMetric[] => {
  const lastPoint = series.at(-1)!;
  const previousPoint = series.at(-2) ?? lastPoint;
  const change = ((lastPoint.close - previousPoint.close) / previousPoint.close) * 100;

  const metrics: OverviewMetric[] = [
    toMetric("Preço atual", lastPoint.close.toLocaleString("pt-BR", { style: "currency", currency: symbol === "BTCUSDT" ? "USD" : symbol === "AAPL" || symbol === "TSLA" ? "USD" : "BRL" }), "Atualizado nos últimos 5 minutos", change),
    toMetric("Variação diária", `${change.toFixed(2)}%`, "Comparado ao candle anterior", change),
    toMetric(
      "Volume diário",
      symbol === "BTCUSDT"
        ? `${(lastPoint.volume / 1000).toFixed(1)} mil BTC`
        : `${(lastPoint.volume / 1_000_000).toFixed(2)}M`,
      "Volume consolidado da sessão",
      change * 0.55,
    ),
    toMetric("RSI (14)", `${lastPoint.rsi.toFixed(2)}`, "Indicador de força relativa", lastPoint.rsi - 50),
  ];

  return metrics;
};

export const fetchOverviewData = async (asset: AssetSymbol): AsyncResult<OverviewPayload> => {
  await wait(420);
  const series = generateSeries(asset);

  return {
    asset,
    displayName: DISPLAY_NAMES[asset],
    metrics: buildMetrics(asset, series),
    candles: series,
  };
};

const TREND_LABELS: Array<MonitoredAsset["trend"]> = ["Alta", "Baixa", "Neutra"];
const SIGNAL_LABELS: Array<MonitoredAsset["aiSignal"]> = ["Comprar", "Vender", "Aguardar"];
const STATUS_LABELS: Array<MonitoredAsset["status"]> = ["Aberta", "Encerrada"];

export const fetchMonitoredAssets = async (): AsyncResult<MonitoredAsset[]> => {
  await wait(360);

  return ASSET_POOL.map((symbol, index) => {
    const base = BASE_PRICES[symbol];
    const change = (index % 2 === 0 ? 1 : -1) * (5 + index * 1.4);

    return {
      symbol,
      name: DISPLAY_NAMES[symbol],
      lastPrice: Number((base + change).toFixed(2)),
      changePercent: Number((change / base * 100).toFixed(2)),
      trend: TREND_LABELS[index % TREND_LABELS.length],
      aiSignal: SIGNAL_LABELS[(index + 1) % SIGNAL_LABELS.length],
      status: STATUS_LABELS[index % STATUS_LABELS.length],
    };
  });
};

export const fetchTradeHistory = async (): AsyncResult<TradeHistoryResponse> => {
  await wait(500);

  const trades: TradeRecord[] = Array.from({ length: 14 }).map((_, index) => {
    const asset = ASSET_POOL[index % ASSET_POOL.length];
    const isBuy = index % 2 === 0;
    const price = BASE_PRICES[asset] + (index - 7) * (asset === "BTCUSDT" ? 500 : 2.5);
    const result = Number(((isBuy ? 1 : -1) * (Math.sin(index / 2) * 2.8)).toFixed(2));
    const quantity = asset === "BTCUSDT" ? Number((0.2 + index * 0.05).toFixed(2)) : 100 + index * 10;

    return {
      id: `${asset}-${index}`,
      timestamp: new Date(Date.now() - index * 36_000_00).toISOString(),
      symbol: asset,
      side: isBuy ? "Compra" : "Venda",
      quantity,
      price: Number(price.toFixed(2)),
      resultPct: result,
    };
  });

  const performance: PerformancePoint[] = [];
  let cumulativeReturn = 0;

  trades
    .slice()
    .reverse()
    .forEach((trade) => {
      cumulativeReturn += trade.resultPct;
      performance.push({
        timestamp: trade.timestamp,
        cumulativeReturn: Number(cumulativeReturn.toFixed(2)),
      });
    });

  return {
    trades,
    performance,
  };
};

export const fetchSettings = async (): AsyncResult<SettingsPayload> => {
  await wait(280);
  return {
    interval: "15min",
    maxRisk: 2.5,
    capital: 150000,
    stopLoss: 1.8,
    takeProfit: 4.5,
  };
};

export const saveSettings = async (payload: SettingsPayload): AsyncResult<SettingsPayload> => {
  await wait(350);
  return payload;
};

export const getAssetOptions = (): Array<{ label: string; value: AssetSymbol }> =>
  ASSET_POOL.map((symbol) => ({
    label: DISPLAY_NAMES[symbol],
    value: symbol,
  }));

