import { z } from "zod";

/**
 * Single entry point for Zod. Importing it configures the Portuguese error locale once, so validation messages shown
 * to students and admins (client-side forms and API errors alike) are in Portuguese rather than Zod's English default.
 * Always import from "@/lib/zod", never straight from "zod".
 */
z.config(z.locales.pt());

export * from "zod";
export { z };
