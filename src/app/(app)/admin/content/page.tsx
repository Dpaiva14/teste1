import type { Metadata } from "next";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listModules } from "@/features/admin/server/content-service";

export const metadata: Metadata = { title: "Conteúdo" };

export default async function AdminContent() {
  const modules = await listModules();
  return (
    <div className="grid gap-4">
      <p className="max-w-3xl text-sm text-muted-foreground">
        O currículo base vem do código (<code>src/modules</code>) e é carregado pelo seed. Tudo o que editares aqui passa a ser gerido pelo admin e não é sobrescrito por um novo seed.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Módulo</TableHead>
            <TableHead>Nível</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Aulas</TableHead>
            <TableHead className="text-right">Perguntas</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="tabular text-muted-foreground">{m.number}</TableCell>
              <TableCell className="font-medium">{m.title}</TableCell>
              <TableCell className="tabular">{m.level}</TableCell>
              <TableCell className="space-x-1">
                <Badge variant={m.published ? "success" : "warning"}>{m.published ? "publicado" : "rascunho"}</Badge>
                <Badge variant="outline">{m.managedBySeed ? "código" : "admin"}</Badge>
              </TableCell>
              <TableCell className="text-right tabular">{m.lessons}</TableCell>
              <TableCell className="text-right tabular">{m.questions}</TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/content/${m.id}`}><Pencil /> Editar</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
