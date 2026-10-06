"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DatePicker({ value, today }: { value: string; today: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2">
      <Input type="date" value={value} aria-label="Data do plano" className="w-40" onChange={(e) => e.target.value && router.push(`/tools/daily-plan?date=${e.target.value}`)} />
      {value !== today && <Button variant="outline" size="sm" onClick={() => router.push("/tools/daily-plan")}>Hoje</Button>}
    </div>
  );
}
