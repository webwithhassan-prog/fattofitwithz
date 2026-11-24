/**
 * admin > Site photos (/admin/site-photos)
 * Every picture on the website in one place, grouped by where it appears.
 *   "Replace photo": pick a new picture and it goes straight into THAT place (PhotoReplaceButton ->
 *   sitePhotoActions.ts). Other places keep their photo.
 *   Each group also links to the page where texts/captions are edited and photos can be picked from the library.
 */
import Link from "next/link";
import type { AdminViewServerProps } from "payload";
import type { Media } from "@/payload-types";
import { AdminPage } from "./AdminPage";
import { PhotoReplaceButton, type PhotoFrame } from "./PhotoReplaceButton";

/** target: which place "Replace photo" changes (see sitePhotoActions.ts); where: shown under the label */
type Slot = {
  label: string;
  media: Media | null;
  fallback?: string;
  target?: string;
  alt?: string;
  /** how the place looks on the website (for the preview) */
  frame?: PhotoFrame;
  /** before/after: the other photo, shown next to this one in the preview; also enables "Adjust position" */
  pair?: { src: string; position?: string; side: "before" | "after" } | null;
};
type Group = { title: string; editHref: string; editLabel: string; slots: Slot[] };

const asMedia = (value: unknown): Media | null => (value && typeof value === "object" && "url" in value ? (value as Media) : null);

/** Same rule as the website (src/lib/content.ts photoPosition): 50/50 = never set -> centred near the top. */
const positionOf = (m: Media | null) => {
  const x = m?.focalX ?? 50;
  const y = m?.focalY ?? 50;
  return x === 50 && y === 50 ? "50% 18%" : `${x}% ${y}%`;
};

function PhotoTile({ slot, editHref }: { slot: Slot; editHref: string }) {
  const src = slot.media?.url ?? slot.fallback;
  return (
    <li className="ftf-photo">
      <div className="ftf-photo__img">
        {/* eslint-disable-next-line @next/next/no-img-element -- plain <img> in the admin panel */}
        {src ? <img src={src} alt={slot.media?.alt ?? ""} loading="lazy" style={slot.pair && slot.media ? { objectPosition: positionOf(slot.media) } : undefined} /> : <span className="ftf-muted">No photo</span>}
      </div>
      <span className="ftf-photo__label">{slot.label}</span>
      {slot.target ? (
        <PhotoReplaceButton
          target={slot.target}
          alt={slot.alt ?? slot.media?.alt ?? slot.label}
          label={slot.media ? "Replace photo" : "Add photo"}
          frame={slot.frame ?? "portrait"}
          pair={slot.pair}
          current={slot.pair && slot.media?.url ? { id: slot.media.id, src: slot.media.url, focalX: slot.media.focalX ?? 50, focalY: slot.media.focalY ?? 50 } : null}
        />
      ) : (
        <Link className="ftf-btn ftf-btn--small" href={editHref}>Change</Link>
      )}
    </li>
  );
}

export async function SitePhotos(view: AdminViewServerProps) {
  const payload = view.initPageResult.req.payload;
  const [home, pagePhotos, ebooks, testimonials] = await Promise.all([
    payload.findGlobal({ slug: "homepage", depth: 1 }),
    payload.findGlobal({ slug: "page-photos", depth: 1 }),
    payload.find({ collection: "ebooks", sort: "order", limit: 20, depth: 1 }),
    payload.find({ collection: "testimonials", where: { type: { equals: "photo" } }, sort: "order", limit: 100, depth: 1 }),
  ]);

  const before = asMedia(pagePhotos.beforePhoto);
  const after = asMedia(pagePhotos.afterPhoto);

  const groups: Group[] = [
    {
      title: "Homepage: top banners",
      editHref: "/admin/globals/homepage",
      editLabel: "Edit banners (text and which photo)",
      slots: home.banners.map((b, i) => ({ label: `Banner ${i + 1}: ${b.kicker}`, media: asMedia(b.photo), target: `array:homepage:banners:${i}:photo` })),
    },
    // (The "Zaineb's messages" photo slider was removed from the homepage on 2026-11-24, so it's not listed here.)
    {
      title: "Before / after slider (homepage and testimonials page)",
      editHref: "/admin/globals/page-photos",
      editLabel: "Change the weights (e.g. 71 kg → 61 kg)",
      slots: [
        {
          label: "Before",
          media: before,
          fallback: "/images/results/before-71kg.jpg",
          target: "global:page-photos:beforePhoto",
          alt: "Client before the program",
          frame: "arch",
          pair: { src: after?.url ?? "/images/results/after-61kg.jpg", position: positionOf(after), side: "before" },
        },
        {
          label: "After",
          media: after,
          fallback: "/images/results/after-61kg.jpg",
          target: "global:page-photos:afterPhoto",
          alt: "The same client after the program",
          frame: "arch",
          pair: { src: before?.url ?? "/images/results/before-71kg.jpg", position: positionOf(before), side: "after" },
        },
      ],
    },
    {
      title: "About page",
      editHref: "/admin/globals/page-photos",
      editLabel: "Choose the About page photo",
      slots: [
        { label: "Main photo", media: asMedia(pagePhotos.aboutPhoto), fallback: "/images/coach/coach-p03.jpg", target: "global:page-photos:aboutPhoto", alt: "Portrait of Zaineb Danish" },
      ],
    },
    {
      title: "Testimonials page: client results",
      editHref: "/admin/collections/testimonials",
      editLabel: "Add or remove results",
      slots: testimonials.docs.map((t) => ({
        label: t.startKg && t.endKg ? `${t.startKg} kg → ${t.endKg} kg` : `Result ${t.order}`,
        media: asMedia(t.image),
        target: `doc:testimonials:${t.id}:image`,
        alt: t.startKg && t.endKg ? `Client before and after the program, ${t.startKg} kg to ${t.endKg} kg` : "Client before and after the program",
      })),
    },
    {
      title: "E-books",
      editHref: "/admin/collections/ebooks",
      editLabel: "Edit e-books (cover, text, Drive link)",
      slots: ebooks.docs.map((e) => ({ label: `Cover: ${e.title}`, media: asMedia(e.cover), target: `doc:ebooks:${e.id}:cover`, alt: `Cover of the e-book ${e.title}` })),
    },
  ];

  return (
    <AdminPage
      view={view}
      title="Site photos"
      intro="Every picture on the website, grouped by where it appears. To change one: press “Replace photo” under it and choose a picture from your phone or computer. That's all: it shows on the website straight away, only in that place."
    >
      {groups.map((group) => (
        <section key={group.title} className="ftf-panel">
          <div className="ftf-panel__head">
            <h3>{group.title}</h3>
            <Link className="ftf-link" href={group.editHref}>{group.editLabel} →</Link>
          </div>
          {group.slots.length ? (
            <ul className="ftf-photos">
              {group.slots.map((slot, i) => (
                <PhotoTile key={`${group.title}-${i}`} slot={slot} editHref={group.editHref} />
              ))}
            </ul>
          ) : (
            <p className="ftf-muted">No photos here yet.</p>
          )}
        </section>
      ))}

      <section className="ftf-panel">
        <h3>Workout recordings</h3>
        <p className="ftf-muted">
          The recorded workout videos are YouTube links. Change them in <Link className="ftf-link" href="/admin/collections/workout-sessions">Workout recordings</Link>.
        </p>
      </section>
    </AdminPage>
  );
}
