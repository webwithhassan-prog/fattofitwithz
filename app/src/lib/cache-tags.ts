/**
 * Cache tag shared by every content query in src/lib/content.ts.
 * Saving anything in /admin expires this tag (src/payload/hooks/revalidateSite.ts),
 * so website visitors never wake the database just to read content.
 */
export const CONTENT_CACHE_TAG = "site-content";
