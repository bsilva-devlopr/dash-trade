# IA Trader Dashboard

Dashboard profissional para análise financeira em tempo real com integração de APIs de mercado (Brapi, Marketstack, Alpha Vantage).

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Shadcn/UI**
- **Recharts** (gráficos)
- **Framer Motion** (animações)
- **Prisma** (ORM)
- **PostgreSQL**
- **Docker** (opcional)

## 📋 Pré-requisitos

- Node.js 20+
- pnpm
- PostgreSQL 16+ (ou Docker)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <repo-url>
cd dash-trade
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o `.env` com suas chaves de API:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dash_trade"
BRAPI_API_KEY=95QzvCEZ5dj4KTYBmZz8By
MARKETSTACK_API_KEY=95a7ecd33672c44a416af668af886df4
ALPHAVANTAGE_API_KEY=your_key_here
```

4. Configure o banco de dados:
```bash
# Gerar Prisma Client
pnpm prisma generate

# Executar migrações
pnpm prisma migrate dev
```

5. Inicie o servidor de desenvolvimento:
```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000)

**Nota**: Se estiver usando Docker, a aplicação estará disponível em [http://localhost:3001](http://localhost:3001) e o PostgreSQL na porta 5433 (caso as portas padrão estejam em uso).

## 🐳 Docker

Para usar Docker:

1. Configure o `.env` com as variáveis necessárias

2. Inicie os containers:
```bash
docker-compose up -d
```

3. Execute as migrações:
```bash
docker-compose exec nextjs pnpm prisma migrate deploy
```

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── (main)/
│   │   ├── auth/v2/          # Páginas de autenticação
│   │   └── dashboard/
│   │       └── finance/      # Dashboard principal
│   ├── api/
│   │   └── auth/             # Rotas de autenticação
│   └── (external)/           # Página inicial
├── lib/
│   ├── api/                  # Clientes de API (Brapi, Marketstack, Alpha Vantage)
│   ├── auth.ts               # Funções de autenticação
│   └── db.ts                 # Prisma Client
└── components/               # Componentes UI (Shadcn)
```

## 🔐 Autenticação

O sistema usa autenticação baseada em sessões com cookies HTTP-only:

- **Registro**: `/auth/v2/register`
- **Login**: `/auth/v2/login`
- **Logout**: Via menu do usuário na sidebar

## 📊 Funcionalidades

### Visão Geral
- Gráficos de candles (TradingView Widget)
- Indicadores técnicos (RSI, MACD, EMA 20/50)
- Métricas resumidas por ativo
- Seleção de ativos via dropdown

### Ativos Monitorados
- Lista de ativos com sinais de IA
- Tendências (Alta/Baixa/Neutra)
- Status de operações

### Histórico de Trades
- Tabela de operações executadas
- Gráfico de performance acumulada
- Resultados percentuais

### Configurações
- Intervalo de análise
- Risco máximo por trade
- Capital disponível
- Stop loss e Take profit

## 🔌 Integração com APIs

O dashboard está preparado para integrar com:

- **Brapi**: Dados de ações brasileiras
- **Marketstack**: Dados EOD e intraday
- **Alpha Vantage**: Séries temporais

Por padrão, o sistema usa dados mockados. Para usar APIs reais, defina:

```env
NEXT_PUBLIC_USE_REAL_APIS=true
```

## 🗄️ Banco de Dados

O schema Prisma inclui:

- **User**: Usuários do sistema
- **Session**: Sessões ativas
- **UserSettings**: Configurações do usuário
- **MonitoredAsset**: Ativos monitorados
- **Trade**: Operações executadas
- **TradeHistory**: Histórico de performance

## 📝 Scripts Disponíveis

```bash
pnpm dev          # Desenvolvimento
pnpm build        # Build de produção
pnpm start        # Servidor de produção
pnpm lint         # Linter
pnpm format       # Formatação de código
```

## 🛠️ Desenvolvimento

Para adicionar novas funcionalidades:

1. Crie componentes em `src/app/(main)/dashboard/finance/_components/`
2. Adicione rotas de API em `src/app/api/`
3. Atualize o schema Prisma se necessário
4. Execute migrações: `pnpm prisma migrate dev`

## 📄 Licença

MIT
