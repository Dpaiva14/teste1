import type { Metadata } from "next";
import { EventsManager } from "@/features/admin/components/events-manager";
import { listEvents } from "@/features/admin/server/events-service";

export const metadata: Metadata = { title: "Eventos económicos" };

export default async function AdminEvents() {
  return <EventsManager events={await listEvents()} />;
}
