import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">US30 Trading Academy</h1>
      <Button asChild>
        <Link href="/register">Começar</Link>
      </Button>
    </main>
  );
}
