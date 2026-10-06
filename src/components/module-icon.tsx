import {
  Activity, BookOpen, Boxes, Brain, Building2, CalendarDays, ChartCandlestick, Clock, Coins, Compass, Crosshair, Gauge, GraduationCap,
  History, Landmark, Layers, NotebookPen, Percent, Ruler, Shapes, ShieldCheck, SlidersHorizontal, TrendingUp, Trophy, Waves, Waypoints, Wrench, Zap,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Compass, Landmark, ChartCandlestick, TrendingUp, Ruler, Boxes, Waypoints, Percent, Activity, Waves, Layers, Building2, Coins, Clock,
  CalendarDays, Crosshair, ShieldCheck, SlidersHorizontal, Brain, Gauge, History, Shapes, NotebookPen, Wrench, Zap, Trophy, GraduationCap,
};

export function ModuleIcon({ name, className }: { name: string | null | undefined; className?: string }) {
  const Icon = (name && ICONS[name]) || BookOpen;
  return <Icon className={className} aria-hidden="true" />;
}
