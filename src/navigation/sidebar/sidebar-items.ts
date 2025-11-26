import {
  TrendingUp,
  BarChart3,
  Wallet,
  FileText,
  Settings,
  User,
  LineChart,
  ShoppingCart,
  History,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Trading",
    items: [
      {
        title: "Mercado",
        url: "/dashboard/market",
        icon: TrendingUp,
      },
      {
        title: "Análise",
        url: "/dashboard/finance",
        icon: BarChart3,
      },
      {
        title: "Portfólio",
        url: "/dashboard/portfolio",
        icon: Wallet,
      },
      {
        title: "Ordens",
        url: "/dashboard/orders",
        icon: ShoppingCart,
      },
      {
        title: "Histórico",
        url: "/dashboard/finance?tab=history",
        icon: History,
      },
    ],
  },
  {
    id: 2,
    label: "Relatórios",
    items: [
      {
        title: "Performance",
        url: "/dashboard/finance?tab=history",
        icon: LineChart,
      },
      {
        title: "Extratos",
        url: "/dashboard/reports",
        icon: FileText,
      },
    ],
  },
  {
    id: 3,
    label: "Configurações",
    items: [
      {
        title: "Minha Conta",
        url: "/dashboard/account",
        icon: User,
      },
      {
        title: "Configurações",
        url: "/dashboard/finance?tab=settings",
        icon: Settings,
      },
    ],
  },
];
