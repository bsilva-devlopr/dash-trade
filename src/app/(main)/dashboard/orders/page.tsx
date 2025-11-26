"use client";

import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Order {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  status: "pending" | "executed" | "cancelled";
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      symbol: "PETR4",
      type: "buy",
      quantity: 100,
      price: 32.10,
      status: "executed",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      symbol: "VALE3",
      type: "sell",
      quantity: 50,
      price: 68.90,
      status: "pending",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    type: "buy" as "buy" | "sell",
    quantity: "",
    price: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: Order = {
      id: Date.now().toString(),
      symbol: formData.symbol.toUpperCase(),
      type: formData.type,
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setOrders([newOrder, ...orders]);
    setIsDialogOpen(false);
    setFormData({ symbol: "", type: "buy", quantity: "", price: "" });
    toast.success("Ordem criada com sucesso!");
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "executed":
        return <CheckCircle2 className="text-emerald-500 size-4" />;
      case "cancelled":
        return <XCircle className="text-red-500 size-4" />;
      default:
        return <Clock className="text-yellow-500 size-4" />;
    }
  };

  const getStatusLabel = (status: Order["status"]) => {
    switch (status) {
      case "executed":
        return "Executada";
      case "cancelled":
        return "Cancelada";
      default:
        return "Pendente";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ordens</h1>
          <p className="text-muted-foreground text-sm">Gerencie suas ordens de compra e venda</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Nova Ordem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Ordem</DialogTitle>
              <DialogDescription>Crie uma nova ordem de compra ou venda</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Código do Ativo</Label>
                <Input
                  id="symbol"
                  placeholder="Ex: PETR4, VALE3"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as "buy" | "sell" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Compra</SelectItem>
                    <SelectItem value="sell">Venda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="32.10"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0.01"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Ordem</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ordens Ativas</CardTitle>
          <CardDescription>Lista de todas as suas ordens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhuma ordem encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const isBuy = order.type === "buy";
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(order.createdAt).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className="font-semibold">{order.symbol}</TableCell>
                        <TableCell>
                          <Badge
                            variant={isBuy ? "default" : "secondary"}
                            className={cn(
                              isBuy
                                ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
                                : "bg-orange-500/15 text-orange-300 border-orange-500/30",
                            )}
                          >
                            {isBuy ? (
                              <TrendingUp className="mr-1 size-3" />
                            ) : (
                              <TrendingDown className="mr-1 size-3" />
                            )}
                            {isBuy ? "Compra" : "Venda"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{order.quantity}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          R$ {order.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          R$ {(order.quantity * order.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <span className="text-sm">{getStatusLabel(order.status)}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

