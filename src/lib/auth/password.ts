import "server-only";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";

const COST = 12;

/**
 * bcrypt only looks at the first 72 bytes of its input and mishandles NUL bytes, so long passphrases
 * would be silently truncated. We pre-hash with SHA-256 (base64 → 44 ASCII chars) before bcrypt.
 */
function prehash(password: string): string {
  return createHash("sha256").update(password, "utf8").digest("base64");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(prehash(password), COST);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(prehash(password), hash);
}

/** Valid bcrypt hash of a random value, used to equalise timing when the e-mail is unknown. */
let dummyHash: Promise<string> | undefined;
export function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(`dummy-${Math.random()}-${Date.now()}`);
  return dummyHash;
}
