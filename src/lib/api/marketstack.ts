const MARKETSTACK_BASE_URL = "https://api.marketstack.com/v2";
const MARKETSTACK_API_KEY = process.env.MARKETSTACK_API_KEY || "";

export interface MarketstackEODResponse {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: Array<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    adj_high: number;
    adj_low: number;
    adj_close: number;
    adj_open: number;
    adj_volume: number;
    split_factor: number;
    dividend: number;
    name: string;
    exchange_code: string;
    asset_type: string;
    price_currency: string;
    symbol: string;
    exchange: string;
    date: string;
  }>;
}

export interface MarketstackIntradayResponse {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: Array<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    mid?: number;
    last_size?: number;
    bid_size?: number;
    bid_price?: number;
    ask_price?: number;
    ask_size?: number;
    last?: number;
    marketstack_last?: number;
    date: string;
    symbol: string;
    exchange: string;
  }>;
}

export async function fetchMarketstackEOD(
  symbols: string,
  options?: {
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  },
): Promise<MarketstackEODResponse> {
  const params = new URLSearchParams({
    access_key: MARKETSTACK_API_KEY,
    symbols,
    ...(options?.date_from && { date_from: options.date_from }),
    ...(options?.date_to && { date_to: options.date_to }),
    ...(options?.limit && { limit: options.limit.toString() }),
    ...(options?.offset && { offset: options.offset.toString() }),
  });

  const response = await fetch(`${MARKETSTACK_BASE_URL}/eod?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Marketstack API error: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchMarketstackIntraday(
  symbols: string,
  options?: {
    interval?: "1min" | "5min" | "15min" | "30min" | "60min" | "1hour" | "3hour" | "6hour" | "12hour" | "24hour";
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  },
): Promise<MarketstackIntradayResponse> {
  const params = new URLSearchParams({
    access_key: MARKETSTACK_API_KEY,
    symbols,
    ...(options?.interval && { interval: options.interval }),
    ...(options?.date_from && { date_from: options.date_from }),
    ...(options?.date_to && { date_to: options.date_to }),
    ...(options?.limit && { limit: options.limit.toString() }),
    ...(options?.offset && { offset: options.offset.toString() }),
  });

  const response = await fetch(`${MARKETSTACK_BASE_URL}/intraday?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Marketstack API error: ${response.statusText}`);
  }
  return response.json();
}

