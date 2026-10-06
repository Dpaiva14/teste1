import type { Metadata } from "next";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSource, SOURCES, VERIFICATION_LABEL, VOLATILE_FACTS, type SourceCategory } from "@/modules/sources";

export const metadata: Metadata = { title: "Learning Sources" };

const ORDER: SourceCategory[] = ["Bolsa", "Índices", "Regulador", "Banco central", "Estatísticas oficiais", "Educação", "Broker"];

function fmtDate(d: string | null) {
  return d ? new Date(`${d}T00:00:00Z`).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }) : "—";
}

export default function SourcesPage() {
  return (
    <div className="grid gap-8">
      <header className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Learning Sources</h1>
        <p className="max-w-3xl text-muted-foreground">Fontes de referência desta plataforma. Damos prioridade a fontes oficiais — em especial o <strong>CME Group</strong> para especificações de futuros. Sempre que um valor pode mudar, indicamos a <strong>fonte</strong> e a <strong>data de verificação</strong>.</p>
      </header>

      <Alert variant="warning">
        <ShieldAlert />
        <AlertDescription>
          <p className="font-medium">Como ler o estado de verificação</p>
          <p className="mt-1">“Confirmado por excerto oficial” significa que o valor foi confirmado a partir de excertos publicados pela fonte oficial, sem abrir a página completa. “Por verificar” significa que ainda ninguém confirmou o valor diretamente na fonte — <strong>não uses esse valor para decisões reais sem o confirmares</strong>.</p>
        </AlertDescription>
      </Alert>

      <section aria-labelledby="facts-h" className="grid gap-3">
        <h2 id="facts-h" className="text-xl font-semibold">Dados que podem mudar</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Dado</TableHead><TableHead>Valor</TableHead><TableHead>Fonte</TableHead><TableHead>Verificado em</TableHead></TableRow></TableHeader>
              <TableBody>
                {VOLATILE_FACTS.map((f) => {
                  const src = getSource(f.sourceId);
                  return (
                    <TableRow key={f.fact}>
                      <TableCell className="font-medium">{f.fact}</TableCell>
                      <TableCell>{f.value}{f.caveat && <span className="block text-xs text-muted-foreground">{f.caveat}</span>}</TableCell>
                      <TableCell>{src?.org}</TableCell>
                      <TableCell>{f.checked ? fmtDate(f.checked) : <Badge variant="warning">Por verificar</Badge>}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {ORDER.map((cat) => {
        const items = SOURCES.filter((s) => s.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} aria-labelledby={`cat-${cat}`} className="grid gap-3">
            <h2 id={`cat-${cat}`} className="text-xl font-semibold">{cat}</h2>
            <div className="grid gap-3">
              {items.map((s) => (
                <Card key={s.id}>
                  <CardContent className="grid gap-2 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-sm text-muted-foreground">{s.org}</p>
                      </div>
                      <Badge variant={s.verification === "none" ? "warning" : "success"}>{VERIFICATION_LABEL[s.verification]}{s.lastChecked && ` · ${fmtDate(s.lastChecked)}`}</Badge>
                    </div>
                    <p className="text-sm">{s.description}</p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">{s.usedFor.map((u) => <li key={u}>{u}</li>)}</ul>
                    {s.note && <p className="text-sm text-warning">{s.note}</p>}
                    {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1 text-sm text-primary underline underline-offset-4">Abrir fonte <ExternalLink className="size-3.5" /></a>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
