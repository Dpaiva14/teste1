import "dotenv/config";
import { createHash } from "node:crypto";
import { hash } from "bcryptjs";
import { prisma } from "../src/database/client";

/**
 * Usage: npm run admin:create -- <email> <password> [name]
 * Creates the user (or promotes an existing one) with the ADMIN role. No default credentials exist.
 */
async function main() {
  const [emailArg, password, ...nameParts] = process.argv.slice(2);
  const email = emailArg?.trim().toLowerCase();
  if (!email || !password) {
    console.error("Usage: npm run admin:create -- <email> <password> [name]");
    process.exit(1);
  }
  if (password.length < 10) {
    console.error("Password must have at least 10 characters.");
    process.exit(1);
  }
  const name = nameParts.join(" ").trim() || "Admin";
  const passwordHash = await hash(createHash("sha256").update(password, "utf8").digest("base64"), 12);
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name, passwordHash, role: "ADMIN", emailVerified: new Date() },
    update: { role: "ADMIN", passwordHash, sessionVersion: { increment: 1 } },
  });
  console.log(`✓ ${user.email} is now ADMIN`);
}

main().finally(() => prisma.$disconnect());
