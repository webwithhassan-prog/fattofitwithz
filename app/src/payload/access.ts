/**
 * Who may read/change data through the admin panel and Payload's REST API (/api/...).
 *
 * Only people logged in to /admin (the "users" collection) count as admins.
 * Website pages don't go through these checks: they use Payload's Local API on the server,
 * and member pages check the member's own login first (see src/lib/auth/session.server.ts).
 */
import type { Access } from "payload";

export const adminsOnly: Access = ({ req }) => req.user?.collection === "users";

export const anyone: Access = () => true;
