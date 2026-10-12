/**
 * Photo storage in the DATABASE (table "media_files"), used by the Media collection.
 *
 * Why: the live site runs on Netlify, which cannot keep uploaded files on disk. Saving the
 * photo bytes in Postgres means uploads work the same on localhost and on the live site,
 * with no extra service or account. Photo URLs stay /api/media/file/<filename>.
 * Responses are cached for 30 days by the browser and the CDN, so each photo is read from
 * the database only rarely.
 *
 * Debugging: SELECT filename, mime_type, length(data) FROM media_files;
 * The table is created by the migration src/migrations/20261012_184719_media_files.ts.
 */
import type { Adapter } from "@payloadcms/plugin-cloud-storage/types";
import { sql } from "@payloadcms/db-postgres";
import type { PayloadRequest } from "payload";

type Row = { mime_type: string; data: Buffer };

/** Runs SQL on Payload's own database connection. */
function db(req: PayloadRequest) {
  return (req.payload.db as unknown as { drizzle: { execute: (query: ReturnType<typeof sql>) => Promise<{ rows: unknown[] }> } }).drizzle;
}

export const databaseFiles: Adapter = () => ({
  name: "database-files",

  // Admin uploads a photo -> save its bytes (replaces a file with the same name).
  handleUpload: async ({ file, req }) => {
    await db(req).execute(sql`
      INSERT INTO media_files (filename, mime_type, data)
      VALUES (${file.filename}, ${file.mimeType}, ${file.buffer})
      ON CONFLICT (filename) DO UPDATE SET mime_type = EXCLUDED.mime_type, data = EXCLUDED.data, created_at = now()`);
  },

  // Admin deletes a photo -> delete its bytes.
  handleDelete: async ({ filename, req }) => {
    await db(req).execute(sql`DELETE FROM media_files WHERE filename = ${filename}`);
  },

  // GET /api/media/file/<filename> -> the photo.
  staticHandler: async (req, { params }) => {
    const result = await db(req).execute(sql`SELECT mime_type, data FROM media_files WHERE filename = ${params.filename} LIMIT 1`);
    const row = result.rows[0] as Row | undefined;
    if (!row) {
      console.warn(`[media] Photo not found in media_files: ${params.filename}`);
      return new Response("Photo not found", { status: 404 });
    }
    return new Response(new Uint8Array(row.data), {
      headers: {
        "Content-Type": row.mime_type,
        "Content-Length": String(row.data.length),
        // Photos rarely change: let browsers and the CDN keep them for 30 days.
        "Cache-Control": "public, max-age=2592000",
      },
    });
  },

  generateURL: ({ filename }) => `/api/media/file/${encodeURIComponent(filename)}`,
});
