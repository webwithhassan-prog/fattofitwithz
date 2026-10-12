/**
 * One-time helper: copies photo files from the old media folder (fattofitwithz/media) into the
 * database table media_files, for every photo listed in admin > Photos.
 * Safe to run again (existing rows are replaced).
 *
 *   npx payload run src/payload/seed/copy-media-to-db.ts
 */
import fs from "fs/promises";
import path from "path";
import { getPayload } from "payload";
import { sql } from "@payloadcms/db-postgres";
import config from "@payload-config";

const MEDIA_DIR = path.resolve(process.cwd(), "..", "media");

const payload = await getPayload({ config });
const db = (payload.db as unknown as { drizzle: { execute: (q: ReturnType<typeof sql>) => Promise<unknown> } }).drizzle;
const { docs } = await payload.find({ collection: "media", limit: 1000, depth: 0 });

let copied = 0;
for (const doc of docs) {
  if (!doc.filename) continue;
  try {
    const data = await fs.readFile(path.join(MEDIA_DIR, doc.filename));
    await db.execute(sql`
      INSERT INTO media_files (filename, mime_type, data)
      VALUES (${doc.filename}, ${doc.mimeType ?? "image/jpeg"}, ${data})
      ON CONFLICT (filename) DO UPDATE SET mime_type = EXCLUDED.mime_type, data = EXCLUDED.data`);
    copied++;
  } catch (error) {
    console.error(`[copy-media] Could not copy ${doc.filename}:`, error instanceof Error ? error.message : error);
  }
}
console.log(`[copy-media] Copied ${copied} of ${docs.length} photos into media_files.`);
process.exit(0);
