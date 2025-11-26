"use client";

import { useEffect, useMemo, useRef } from "react";

import type { AssetSymbol } from "./mock-data";

const TV_SYMBOLS: Record<AssetSymbol, string> = {
  PETR4: "BMFBOVESPA:PETR4",
  VALE3: "BMFBOVESPA:VALE3",
  AAPL: "NASDAQ:AAPL",
  BTCUSDT: "BINANCE:BTCUSDT",
  TSLA: "NASDAQ:TSLA",
};

type TradingViewWidgetProps = {
  symbol: AssetSymbol;
};

type TradingViewNamespace = {
  widget: (options: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    TradingView?: TradingViewNamespace;
  }
}

export function TradingViewWidget({ symbol }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetContainerId = useMemo(
    () => `tradingview_${Math.random().toString(36).slice(2, 10)}`,
    [],
  );

  useEffect(() => {
    const initializeWidget = () => {
      if (!window.TradingView || !containerRef.current) return;

      containerRef.current.innerHTML = "";
      window.TradingView.widget({
        autosize: true,
        symbol: TV_SYMBOLS[symbol],
        interval: "15",
        timezone: "America/Sao_Paulo",
        theme: "dark",
        style: "1",
        locale: "br",
        toolbar_bg: "#0f172a",
        enable_publishing: false,
        hide_legend: false,
        hide_side_toolbar: false,
        allow_symbol_change: false,
        studies: ["MACD@tv-basicstudies", "RSI@tv-basicstudies"],
        container_id: widgetContainerId,
      });
    };

    if (typeof window === "undefined") {
      return undefined;
    }

    const scriptId = "tradingview-widget-script";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      if (window.TradingView) {
        initializeWidget();
      } else {
        existingScript.addEventListener("load", initializeWidget, { once: true });
      }
    } else {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = initializeWidget;
      document.head.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = `<div id="${widgetContainerId}" class="h-full w-full"></div>`;
      }
    };
  }, [symbol, widgetContainerId]);

  return (
    <div ref={containerRef} className="h-full w-full">
      <div id={widgetContainerId} className="h-full w-full rounded-xl border border-border bg-muted/20" />
    </div>
  );
}

