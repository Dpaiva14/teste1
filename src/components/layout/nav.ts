import {
  BookOpen,
  Bot,
  Calculator,
  CalendarDays,
  ChartCandlestick,
  Clock,
  ClipboardList,
  Gauge,
  GraduationCap,
  History,
  Landmark,
  LayoutDashboard,
  Layers,
  NotebookPen,
  Percent,
  Ruler,
  ScanSearch,
  Shapes,
  ShieldCheck,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Short hint shown in the dashboard shortcuts / command palette. */
  hint?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Aprender",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/academy", label: "Academy", icon: GraduationCap, hint: "Curriculum de 26 módulos" },
      { href: "/glossary", label: "Glossário", icon: BookOpen },
      { href: "/tutor", label: "Tutor IA", icon: Bot },
    ],
  },
  {
    title: "Laboratórios",
    items: [
      { href: "/labs/market-structure", label: "Market Structure Lab", icon: ChartCandlestick },
      { href: "/labs/levels", label: "Draw Your Levels", icon: Ruler },
      { href: "/labs/fibonacci", label: "Fibonacci Lab", icon: Percent },
      { href: "/labs/confluence", label: "Confluence Lab", icon: Layers },
      { href: "/labs/replay", label: "Chart Replay", icon: History },
    ],
  },
  {
    title: "Prática",
    items: [
      { href: "/backtest", label: "Backtesting Lab", icon: Gauge },
      { href: "/simulator", label: "Simulador", icon: Shapes },
      { href: "/journal", label: "Trading Journal", icon: NotebookPen },
      { href: "/tools/daily-plan", label: "Daily Trading Plan", icon: ClipboardList },
    ],
  },
  {
    title: "Ferramentas",
    items: [
      { href: "/tools/risk-calculator", label: "Risk Calculator", icon: Calculator },
      { href: "/tools/position-size", label: "Position Size YM/MYM", icon: Landmark },
      { href: "/tools/sessions", label: "Sessões de mercado", icon: Clock },
      { href: "/tools/economic-calendar", label: "Calendário económico", icon: CalendarDays },
      { href: "/analyzer", label: "AI Chart Analyzer", icon: ScanSearch },
    ],
  },
  {
    title: "Avaliação",
    items: [{ href: "/assessment", label: "Final Assessment", icon: Trophy }],
  },
];

export const ADMIN_ITEM: NavItem = { href: "/admin", label: "Administração", icon: ShieldCheck };
