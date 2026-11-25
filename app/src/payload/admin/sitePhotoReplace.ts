/**
 * The saving part of "Replace photo" (admin > Site photos): saves the new picture and puts it in ONE place.
 * Kept separate from the server action (sitePhotoActions.ts, which checks the admin login) so it is easy to test.
 */
import type { Payload } from "payload";

/** The places that can be changed, e.g. "array:homepage:banners:2:photo" (see sitePhotoActions.ts). */
export const PHOTO_TARGETS = [
  /^global:page-photos:(beforePhoto|afterPhoto|aboutPhoto)$/,
  /^array:homepage:banners:\d{1,2}:photo$/, // (the founder slider was removed 2026-11-24)
  /^doc:testimonials:\d+:image$/,
  /^doc:ebooks:\d+:cover$/,
];

type UploadFile = { data: Buffer; mimetype: string; name: string; size: number };

/** focal: where the photo is anchored in its frame, 0-100 left->right and top->bottom ("Adjust position") */
export async function replacePhotoIn(payload: Payload, target: string, file: UploadFile, alt: string, focal?: { x: number; y: number }) {
  // 1. Save the new photo (it also appears in admin > All photos)
  const media = await payload.create({ collection: "media", data: { alt, ...(focal ? { focalX: focal.x, focalY: focal.y } : {}) }, file });
  await assignPhoto(payload, target, media.id);
  return media;
}

/** Puts photo `mediaId` in the place `target`. */
export async function assignPhoto(payload: Payload, target: string, mediaId: number) {
  if (!PHOTO_TARGETS.some((rule) => rule.test(target))) throw new Error(`[site-photos] Unknown place: ${target}`);
  const [kind, slug, ...rest] = target.split(":");
  if (kind === "global") {
    const [field] = rest;
    await payload.updateGlobal({ slug: "page-photos", data: { [field]: mediaId } });
  } else if (kind === "array") {
    const [, index, field] = rest; // only "banners" (see PHOTO_TARGETS)
    const home = await payload.findGlobal({ slug: "homepage", depth: 0 });
    const banners = home.banners.map((row, i) => (i === Number(index) ? { ...row, [field]: mediaId } : row));
    await payload.updateGlobal({ slug: "homepage", data: { banners } });
  } else if (kind === "doc") {
    const [id, field] = rest;
    if (slug === "testimonials") await payload.update({ collection: "testimonials", id: Number(id), data: { [field]: mediaId } });
    else await payload.update({ collection: "ebooks", id: Number(id), data: { [field]: mediaId } });
  }
}
