"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";

import type { SettingsPayload } from "./mock-data";

type SettingsPanelProps = {
  settings: SettingsPayload | null;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (payload: SettingsPayload) => Promise<void>;
};

const INTERVAL_OPTIONS: SettingsPayload["interval"][] = ["5min", "15min", "1h", "4h", "1d"];

export function SettingsPanel({ settings, isLoading, isSaving, onSave }: SettingsPanelProps) {
  const [formState, setFormState] = useState<SettingsPayload>({
    interval: "15min",
    maxRisk: 2.5,
    capital: 150000,
    stopLoss: 2,
    takeProfit: 4,
  });

  useEffect(() => {
    if (settings) {
      setFormState(settings);
    }
  }, [settings]);

  const handleSliderChange = (key: keyof SettingsPayload) => (value: number[]) => {
    setFormState((previous) => ({
      ...previous,
      [key]: Number(value[0].toFixed(1)),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSave(formState);
  };

  if (isLoading && !settings) {
    return <Skeleton className="h-[420px] w-full rounded-2xl" />;
  }

  return (
    <Card className="border-border/80 bg-background/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Parâmetros de Configuração</CardTitle>
        <CardDescription>Defina os limites de risco, capital disponível e proteções para o robô trader.</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">Intervalo da análise</Label>
            <Select
              value={formState.interval}
              onValueChange={(value) => setFormState((previous) => ({ ...previous, interval: value as SettingsPayload["interval"] }))}
            >
              <SelectTrigger className="bg-muted/20">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {INTERVAL_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-xs text-muted-foreground">
              Determina o timeframe utilizado pelos cálculos de indicadores. Ajuste conforme a estratégia do robô.
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">Capital total disponível</Label>
            <Input
              type="number"
              min={0}
              value={formState.capital}
              onChange={(event) => setFormState((previous) => ({ ...previous, capital: Number(event.target.value) }))}
              className="bg-muted/20"
            />
            <p className="text-xs text-muted-foreground">Valor máximo que pode ser alocado nas operações automáticas.</p>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Risco máximo por trade (%)
              <span className="text-primary text-xs font-semibold">{formState.maxRisk.toFixed(1)}%</span>
            </Label>
            <Slider
              min={0.5}
              max={10}
              step={0.5}
              value={[formState.maxRisk]}
              onValueChange={handleSliderChange("maxRisk")}
            />
            <p className="text-xs text-muted-foreground">
              Limite percentual de perda por operação para preservar o capital em cenários adversos.
            </p>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Stop loss (%)
              <span className="text-destructive text-xs font-semibold">-{formState.stopLoss.toFixed(1)}%</span>
            </Label>
            <Slider
              min={0.5}
              max={8}
              step={0.5}
              value={[formState.stopLoss]}
              onValueChange={handleSliderChange("stopLoss")}
            />
            <p className="text-xs text-muted-foreground">
              Desarme automático da posição quando a perda atingir o limite configurado.
            </p>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Take profit (%)
              <span className="text-emerald-400 text-xs font-semibold">+{formState.takeProfit.toFixed(1)}%</span>
            </Label>
            <Slider
              min={1}
              max={15}
              step={0.5}
              value={[formState.takeProfit]}
              onValueChange={handleSliderChange("takeProfit")}
            />
            <p className="text-xs text-muted-foreground">
              Realiza o lucro automaticamente quando a meta de ganho for alcançada.
            </p>
          </div>

          <motion.div
            className="bg-muted/20 flex flex-col justify-between rounded-2xl p-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Resumo da estratégia</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Intervalo base de análise: {formState.interval}</li>
                <li>• Risco máximo controlado em {formState.maxRisk.toFixed(1)}%</li>
                <li>• Stop loss configurado em {formState.stopLoss.toFixed(1)}%</li>
                <li>• Take profit de {formState.takeProfit.toFixed(1)}%</li>
              </ul>
            </div>
            <Button type="submit" size="lg" className="mt-6 w-full gap-2" disabled={isSaving}>
              <Save className="size-4" />
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </motion.div>
        </motion.form>
      </CardContent>
    </Card>
  );
}

