const ALPHAVANTAGE_BASE_URL = "https://www.alphavantage.co/query";
const ALPHAVANTAGE_API_KEY = process.env.ALPHAVANTAGE_API_KEY || "";

export interface AlphaVantageTimeSeriesResponse {
  "Meta Data"?: {
    "1. Information": string;
    "2. Symbol": string;
    "3. Last Refreshed": string;
    "4. Interval"?: string;
    "5. Output Size": string;
    "6. Time Zone": string;
  };
  "Time Series (Daily)"?: Record<string, {
    "1. open": string;
    "2. high": string;
    "3. low": string;
    "4. close": string;
    "5. volume": string;
  }>;
  "Time Series (5min)"?: Record<string, {
    "1. open": string;
    "2. high": string;
    "3. low": string;
    "4. close": string;
    "5. volume": string;
  }>;
  "Note"?: string;
  "Error Message"?: string;
}

export async function fetchAlphaVantageTimeSeries(
  functionName: "TIME_SERIES_DAILY" | "TIME_SERIES_INTRADAY",
  symbol: string,
  options?: {
    interval?: "1min" | "5min" | "15min" | "30min" | "60min";
    outputsize?: "compact" | "full";
  },
): Promise<AlphaVantageTimeSeriesResponse> {
  const params = new URLSearchParams({
    function: functionName,
    symbol,
    apikey: ALPHAVANTAGE_API_KEY,
    ...(options?.interval && { interval: options.interval }),
    ...(options?.outputsize && { outputsize: options.outputsize }),
  });

  const response = await fetch(`${ALPHAVANTAGE_BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Alpha Vantage API error: ${response.statusText}`);
  }
  const data = await response.json();
  
  if (data["Error Message"] || data["Note"]) {
    throw new Error(data["Error Message"] || data["Note"]);
  }
  
  return data;
}

