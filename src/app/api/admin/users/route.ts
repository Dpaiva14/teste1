import { adminRoute, parseQuery } from "@/lib/http";
import { userListQuery } from "@/features/admin/schemas";
import { listUsers } from "@/features/admin/server/users-service";

export const GET = adminRoute(async ({ req }) => {
  const { q, page } = parseQuery(req, userListQuery);
  return listUsers(q, page);
});
