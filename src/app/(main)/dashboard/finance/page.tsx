/*
  IA Trader Dashboard – página principal do módulo financeiro.
  Responsável por orquestrar as abas, estados de carregamento e integração mockada.
*/

"use client";

import { useCallback, useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, RefreshCcw, User } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  type AssetSymbol,
  type MonitoredAsset,
  type OverviewPayload,
  type SettingsPayload,
  type TradeHistoryResponse,
  fetchMonitoredAssets,
  fetchOverviewData,
  fetchSettings,
  fetchTradeHistory,
  saveSettings,
} from "./_components/mock-data";
import { MonitoredAssetsTab } from "./_components/monitored-assets-tab";
import { OverviewTab } from "./_components/overview-tab";
import { SettingsPanel } from "./_components/settings-panel";
import { TradeHistoryTab } from "./_components/trade-history-tab";

type LoadingMap = {
  overview: boolean;
  assets: boolean;
  history: boolean;
  settings: boolean;
};

const DEFAULT_ASSET: AssetSymbol = "PETR4";

const tabs = [
  { value: "overview", label: "Visão Geral" },
  { value: "assets", label: "Ativos Monitorados" },
  { value: "history", label: "Histórico de Trades" },
  { value: "settings", label: "Configurações" },
];

export default function Page() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["value"]>("overview");
  const [selectedAsset, setSelectedAsset] = useState<AssetSymbol>(DEFAULT_ASSET);
  const [loading, setLoading] = useState<LoadingMap>({
    overview: true,
    assets: true,
    history: true,
    settings: true,
  });
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [overviewData, setOverviewData] = useState<OverviewPayload | null>(null);
  const [monitoredAssets, setMonitoredAssets] = useState<MonitoredAsset[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryResponse | null>(null);
  const [settings, setSettings] = useState<SettingsPayload | null>(null);

  const loadOverview = useCallback(async (asset: AssetSymbol) => {
    setLoading((previous) => ({ ...previous, overview: true }));
    const data = await fetchOverviewData(asset);
    setOverviewData(data);
    setLoading((previous) => ({ ...previous, overview: false }));
  }, []);

  const loadAncillaryData = useCallback(async () => {
    setLoading((previous) => ({ ...previous, assets: true, history: true, settings: true }));
    const [assets, history, prefs] = await Promise.all([fetchMonitoredAssets(), fetchTradeHistory(), fetchSettings()]);
    setMonitoredAssets(assets);
    setTradeHistory(history);
    setSettings(prefs);
    setLoading((previous) => ({ ...previous, assets: false, history: false, settings: false }));
  }, []);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      await Promise.all([loadOverview(DEFAULT_ASSET), loadAncillaryData()]);
      if (isMounted) {
        setIsRefreshing(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [loadAncillaryData, loadOverview]);

  const handleAssetChange = useCallback(
    async (asset: AssetSymbol) => {
      setSelectedAsset(asset);
      await loadOverview(asset);
    },
    [loadOverview],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([loadOverview(selectedAsset), loadAncillaryData()]);
    toast.success("Dados atualizados com sucesso.");
    setIsRefreshing(false);
  }, [loadAncillaryData, loadOverview, selectedAsset]);

  const handleSaveSettings = useCallback(
    async (payload: SettingsPayload) => {
      setIsSavingSettings(true);
      const response = await saveSettings(payload);
      setSettings(response);
      setIsSavingSettings(false);
      toast.success("Configurações salvas para a próxima sincronização.");
    },
    [],
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
        <div className="border-border/80 bg-background/90 sticky top-[4.5rem] z-20 rounded-xl sm:rounded-2xl border p-4 sm:p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">IA Trader Dashboard</h1>
                <Badge variant="outline" className="border-emerald-500/60 bg-emerald-500/10 text-emerald-300 text-xs">
                  Beta
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Painel responsivo e pronto para integrações via API REST, ideal para monitorar estratégias de trading algorítmico.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
                {isRefreshing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}
                <span className="hidden sm:inline">Atualizar Dados</span>
                <span className="sm:hidden">Atualizar</span>
              </Button>
              <Avatar className="border border-border/60 size-8 sm:size-10">
                <AvatarImage src="/avatars/arhamkhnz.png" alt="Trader profile" />
                <AvatarFallback>
                  <User className="size-4" />
                </AvatarFallback>
              </Avatar>
            </div>
      </div>

          <TabsList className="mt-6 w-full justify-start gap-1 sm:gap-2 bg-transparent p-0 overflow-x-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-full border border-transparent px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold capitalize transition hover:border-primary/40 hover:bg-primary/10 data-[state=active]:border-primary/60 data-[state=active]:bg-primary/15 data-[state=active]:text-primary whitespace-nowrap"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <TabsContent value="overview" className="focus-visible:outline-none">
            {activeTab === "overview" ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <OverviewTab
                  selectedAsset={selectedAsset}
                  data={overviewData}
                  isLoading={loading.overview}
                  onAssetChange={handleAssetChange}
                />
              </motion.div>
            ) : null}
          </TabsContent>

          <TabsContent value="assets" className="focus-visible:outline-none">
            {activeTab === "assets" ? (
              <motion.div
                key="assets"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <MonitoredAssetsTab assets={monitoredAssets} isLoading={loading.assets} />
              </motion.div>
            ) : null}
          </TabsContent>

          <TabsContent value="history" className="focus-visible:outline-none">
            {activeTab === "history" ? (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <TradeHistoryTab tradeHistory={tradeHistory} isLoading={loading.history} />
              </motion.div>
            ) : null}
          </TabsContent>

          <TabsContent value="settings" className="focus-visible:outline-none">
            {activeTab === "settings" ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <SettingsPanel
                  settings={settings}
                  isLoading={loading.settings}
                  isSaving={isSavingSettings}
                  onSave={handleSaveSettings}
                />
              </motion.div>
            ) : null}
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      <Separator className="bg-border/60" />
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          🧠 Dados simulados via <strong>fetchMockData()</strong>. Substitua pelas requisições reais ao integrar com FastAPI ou outro backend.
        </span>
        <span>
          Última atualização:{" "}
          {new Intl.DateTimeFormat("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }).format(new Date())}
        </span>
      </div>
    </div>
  );
}
