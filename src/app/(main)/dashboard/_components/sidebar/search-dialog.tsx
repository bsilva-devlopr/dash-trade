"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface StockSearchResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    fetch(`/api/stocks/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.data || []);
        setIsLoading(false);
      })
      .catch(() => {
        setResults([]);
        setIsLoading(false);
      });
  }, [debouncedQuery]);

  const handleSelect = (symbol: string) => {
    setOpen(false);
    router.push(`/dashboard/finance?symbol=${symbol}`);
  };

  return (
    <>
      <Button
        variant="link"
        className="text-muted-foreground !px-0 font-normal hover:no-underline"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Pesquisar ações</span>
        <kbd className="bg-muted ml-2 inline-flex h-5 items-center gap-1 rounded border px-1.5 text-[10px] font-medium select-none">
          <span className="text-xs">⌘</span>J
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Pesquisar ações (ex: PETR4, VALE3, AAPL)..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading && <CommandEmpty>Buscando...</CommandEmpty>}
          {!isLoading && results.length === 0 && query.length >= 2 && (
            <CommandEmpty>Nenhuma ação encontrada.</CommandEmpty>
          )}
          {!isLoading && query.length < 2 && (
            <CommandEmpty>Digite pelo menos 2 caracteres para buscar.</CommandEmpty>
          )}
          {results.length > 0 && (
            <CommandGroup heading="Ações">
              {results.map((stock) => {
                const isPositive = stock.changePercent >= 0;
                return (
                  <CommandItem
                    key={stock.symbol}
                    className="!py-2"
                    onSelect={() => handleSelect(stock.symbol)}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{stock.symbol}</span>
                          <span className="text-muted-foreground text-xs">{stock.name}</span>
                        </div>
                        <div className="text-muted-foreground mt-1 text-xs">
                          R$ {stock.price.toFixed(2)}
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                        {isPositive ? (
                          <TrendingUp className="size-4" />
                        ) : (
                          <TrendingDown className="size-4" />
                        )}
                        <span className="text-sm font-medium">
                          {isPositive ? "+" : ""}
                          {stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
