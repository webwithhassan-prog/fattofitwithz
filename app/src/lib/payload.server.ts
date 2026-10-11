/**
 * The one way server code talks to the database: Payload's Local API.
 *   const payload = await getPayloadClient();
 *   await payload.find({ collection: "programs" });
 * getPayload() keeps a single connection pool, so calling this often is cheap.
 */
import "server-only";
import { getPayload } from "payload";
import config from "@payload-config";

export function getPayloadClient() {
  return getPayload({ config });
}
