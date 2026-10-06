import { notFound } from "next/navigation";
import { HttpError } from "@/lib/errors";

/** Awaits a data load and turns a service-level 404 into Next's notFound() — keeps JSX out of try/catch. */
export async function orNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  }
}
