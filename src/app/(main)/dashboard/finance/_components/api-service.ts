import { brapiClient } from "@/lib/api/brapi";
import { fetchMarketstackEOD, fetchMarketstackIntraday } from "@/lib/api/marketstack";
import { fetchAlphaVantageTimeSeries } from "@/lib/api/alphavantage";
import type { AssetSymbol, OverviewPayload, MonitoredAsset, TradeHistoryResponse, SettingsPayload } from "./mock-data";

const USE_REAL_APIS = process.env.NEXT_PUBLIC_USE_REAL_APIS === "true";

export async function fetchOverviewDataReal(asset: AssetSymbol): Promise<OverviewPayload | null> {
  if (!USE_REAL_APIS) return null;

  try {
    // Tentar Brapi primeiro
    const quote = await brapiClient.quote.retrieve(asset);
    if (quote.results && quote.results.length > 0) {
      const stock = quote.results[0];
      // Aqui você pode construir o OverviewPayload a partir dos dados reais
      // Por enquanto, retornamos null para usar mock
      return null;
    }
  } catch (error) {
    console.error("Error fetching from Brapi:", error);
  }

  return null;
}

export async function fetchMonitoredAssetsReal(): Promise<MonitoredAsset[] | null> {
  if (!USE_REAL_APIS) return null;

  try {
    const stocks = await brapiClient.quote.list({ limit: 10 });
    // Transformar dados reais em MonitoredAsset[]
    return null;
  } catch (error) {
    console.error("Error fetching monitored assets:", error);
  }

  return null;
}

// Função helper para decidir se usa API real ou mock
export function shouldUseRealAPI(): boolean {
  return USE_REAL_APIS && !!process.env.BRAPI_API_KEY;
}

