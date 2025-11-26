"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios e Extratos</h1>
        <p className="text-muted-foreground text-sm">Acompanhe seus extratos e relatórios de operações</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>Esta funcionalidade estará disponível em breve</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Os relatórios e extratos detalhados das suas operações estarão disponíveis em uma próxima atualização.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

