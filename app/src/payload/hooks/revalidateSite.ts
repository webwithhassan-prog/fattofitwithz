/**
 * When the coach saves something in /admin, refresh the public website so the change shows
 * straight away (pages are cached between visits).
 *
 * The seed script passes `context: { skipRevalidate: true }` because it runs outside Next.js,
 * where there is no page cache to refresh.
 */
import { revalidatePath, revalidateTag } from "next/cache";
import { CONTENT_CACHE_TAG } from "../../lib/cache-tags";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from "payload";

function refreshWholeSite(req: PayloadRequest) {
  if (req.context?.skipRevalidate) return;
  try {
    // 1) cached content queries (src/lib/content.ts) - expire now, so the next visit gets fresh data
    revalidateTag(CONTENT_CACHE_TAG, { expire: 0 });
    // 2) pages that were built as static HTML
    revalidatePath("/", "layout");
  } catch (error) {
    req.payload.logger.warn({ msg: "[revalidate] Could not refresh the site cache", err: error });
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, req }) => {
  refreshWholeSite(req);
  return doc;
};

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  refreshWholeSite(req);
  return doc;
};

export const revalidateGlobalAfterChange: GlobalAfterChangeHook = ({ doc, req }) => {
  refreshWholeSite(req);
  return doc;
};

/** Spread into a content collection: `hooks: contentHooks` */
export const contentHooks = {
  afterChange: [revalidateAfterChange],
  afterDelete: [revalidateAfterDelete],
};
