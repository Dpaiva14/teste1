"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageSquarePlus, Send, ShieldAlert, Trash2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Markdown } from "@/components/markdown";
import { api, errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { AI_TUTOR_NOTICE } from "@/modules/legal";
import type { TutorConversationDTO, TutorMessageDTO, TutorReplyDTO } from "../types";

const STARTERS = [
  "Explica market structure (HH/HL/LH/LL) com um exemplo.",
  "Qual é a diferença entre stop loss e invalidação da ideia?",
  "Como calculo o tamanho de posição em MYM a partir do risco?",
  "Revê o meu raciocínio: vejo uma tendência de alta, o preço recuou a um suporte e quero esperar confirmação. O que me falta verificar?",
];

interface Shown extends TutorMessageDTO {
  blocked?: TutorReplyDTO["blocked"];
}

export function TutorChat({ initialConversations, lesson }: { initialConversations: TutorConversationDTO[]; lesson: { id: string; title: string } | null }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Shown[]>([]);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const tmpSeq = useRef(0);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, pending]);

  async function open(id: string) {
    setActiveId(id);
    setLoading(true);
    try {
      const res = await api<{ messages: TutorMessageDTO[] }>(`/api/tutor/${id}`);
      setMessages(res.messages);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  function fresh() {
    setActiveId(null);
    setMessages([]);
    setText("");
  }

  async function remove(id: string) {
    if (!confirm("Apagar esta conversa?")) return;
    try {
      await api(`/api/tutor/${id}`, { method: "DELETE" });
      setConversations((c) => c.filter((x) => x.id !== id));
      if (activeId === id) fresh();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function send(message: string) {
    const content = message.trim();
    if (content.length < 2 || pending) return;
    setPending(true);
    setText("");
    const optimistic: Shown = { id: `tmp-${++tmpSeq.current}`, role: "USER", content, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, optimistic]);
    try {
      const res = await api<TutorReplyDTO>("/api/tutor", { method: "POST", body: { message: content, ...(activeId ? { conversationId: activeId } : {}), ...(lesson ? { lessonId: lesson.id } : {}) } });
      setMessages((m) => [...m.filter((x) => x.id !== optimistic.id), res.user, { ...res.assistant, blocked: res.blocked }]);
      if (!activeId) {
        setActiveId(res.conversationId);
        setConversations((c) => [{ id: res.conversationId, title: content.slice(0, 60), updatedAt: res.assistant.createdAt }, ...c]);
      }
    } catch (e) {
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
      setText(content);
      toast.error(errorMessage(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="grid content-start gap-2">
        <Button variant="outline" onClick={fresh}>
          <MessageSquarePlus /> Nova conversa
        </Button>
        <ul className="grid gap-1" aria-label="Conversas">
          {conversations.map((c) => (
            <li key={c.id} className={cn("group flex items-center gap-1 rounded-md border px-2 py-1.5 text-sm", c.id === activeId && "border-primary bg-primary/10")}>
              <button type="button" className="min-w-0 flex-1 truncate text-left" onClick={() => open(c.id)} title={c.title}>
                {c.title}
              </button>
              <button type="button" aria-label={`Apagar conversa: ${c.title}`} className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100" onClick={() => remove(c.id)}>
                <Trash2 className="size-3.5 text-muted-foreground" />
              </button>
            </li>
          ))}
          {conversations.length === 0 && <li className="text-xs text-muted-foreground">Ainda sem conversas.</li>}
        </ul>
      </aside>

      <section className="flex min-h-[32rem] min-w-0 flex-col rounded-xl border bg-card">
        {lesson && (
          <div className="border-b px-4 py-2 text-xs text-muted-foreground">
            Contexto: lição <strong className="text-foreground">{lesson.title}</strong>
          </div>
        )}
        <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite" aria-busy={pending}>
          {loading && <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" aria-label="A carregar" />}
          {!loading && messages.length === 0 && (
            <div className="grid gap-3">
              <p className="text-sm text-muted-foreground">Pergunta sobre conceitos, lições ou o teu raciocínio. Não dou sinais nem digo quando comprar ou vender — ajudo-te a construir o teu processo.</p>
              <div className="flex flex-wrap gap-2">
                {STARTERS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)} disabled={pending} className="rounded-full border px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={cn("flex gap-3", m.role === "USER" && "flex-row-reverse")}>
              <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", m.role === "USER" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")} aria-hidden>
                {m.role === "USER" ? <UserIcon className="size-4" /> : <Bot className="size-4" />}
              </div>
              <div className={cn("max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm", m.role === "USER" ? "bg-primary/15" : "border bg-background")}>
                {m.blocked && (
                  <Badge variant="warning" className="mb-2">
                    <ShieldAlert /> {m.blocked === "signal" ? "Pedido de sinal — recusado" : "Resposta retida pelo filtro de segurança"}
                  </Badge>
                )}
                {m.role === "USER" ? <p className="whitespace-pre-wrap">{m.content}</p> : <Markdown>{m.content}</Markdown>}
              </div>
            </div>
          ))}
          {pending && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> O tutor está a pensar…
            </p>
          )}
          <div ref={endRef} />
        </div>
        <form
          className="grid gap-2 border-t p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send(text);
          }}
        >
          <label htmlFor="tutor-input" className="sr-only">
            A tua pergunta
          </label>
          <Textarea
            id="tutor-input"
            rows={2}
            value={text}
            maxLength={2000}
            placeholder="Escreve a tua pergunta… (Enter envia, Shift+Enter muda de linha)"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(text);
              }
            }}
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">{text.length}/2000</p>
            <Button type="submit" size="sm" disabled={pending || text.trim().length < 2}>
              {pending ? <Loader2 className="animate-spin" /> : <Send />} Enviar
            </Button>
          </div>
        </form>
      </section>

      <Alert variant="warning" className="lg:col-span-2">
        <ShieldAlert />
        <AlertDescription>{AI_TUTOR_NOTICE}</AlertDescription>
      </Alert>
    </div>
  );
}
