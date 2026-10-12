/**
 * admin > Site photos (/admin/site-photos)
 * Every picture on the website in one place, grouped by where it appears.
 *   "Change photo" opens the photo itself: upload a new file there and it changes everywhere it is used.
 *   Each group also links to the page where you choose WHICH photo goes in each place (and edit captions).
 */
import Link from "next/link";
import type { AdminViewServerProps } from "payload";
import type { Media } from "@/payload-types";
import { AdminPage } from "./AdminPage";

type Slot = { label: string; media: Media | null; fallback?: string };
type Group = { title: string; editHref: string; editLabel: string; slots: Slot[] };

const asMedia = (value: unknown): Media | null => (value && typeof value === "object" && "url" in value ? (value as Media) : null);

function PhotoTile({ slot, editHref, usedTimes }: { slot: Slot; editHref: string; usedTimes: number }) {
  const src = slot.media?.url ?? slot.fallback;
  return (
    <li className="ftf-photo">
      <div className="ftf-photo__img">
        {/* eslint-disable-next-line @next/next/no-img-element -- plain <img> in the admin panel */}
        {src ? <img src={src} alt={slot.media?.alt ?? ""} loading="lazy" /> : <span className="ftf-muted">No photo</span>}
      </div>
      <span className="ftf-photo__label">{slot.label}</span>
      {usedTimes > 1 ? <span className="ftf-sub">Also used in {usedTimes - 1} other place{usedTimes > 2 ? "s" : ""}</span> : null}
      {slot.media ? (
        <Link className="ftf-btn ftf-btn--small" href={`/admin/collections/media/${slot.media.id}`}>Change photo</Link>
      ) : (
        <Link className="ftf-btn ftf-btn--small" href={editHref}>Choose a photo</Link>
      )}
    </li>
  );
}

export async function SitePhotos(view: AdminViewServerProps) {
  const payload = view.initPageResult.req.payload;
  const [home, pagePhotos, ebook, testimonials] = await Promise.all([
    payload.findGlobal({ slug: "homepage", depth: 1 }),
    payload.findGlobal({ slug: "page-photos", depth: 1 }),
    payload.findGlobal({ slug: "ebook", depth: 1 }),
    payload.find({ collection: "testimonials", where: { type: { equals: "photo" } }, sort: "order", limit: 100, depth: 1 }),
  ]);

  const groups: Group[] = [
    {
      title: "Homepage: top banners",
      editHref: "/admin/globals/homepage",
      editLabel: "Edit banners (text and which photo)",
      slots: home.banners.map((b, i) => ({ label: `Banner ${i + 1}: ${b.kicker}`, media: asMedia(b.photo) })),
    },
    {
      title: "Homepage: Zaineb's messages slider",
      editHref: "/admin/globals/homepage",
      editLabel: "Edit slides (messages and which photo)",
      slots: home.founder.slides.map((s, i) => ({ label: `Slide ${i + 1}: ${s.caption}`, media: asMedia(s.photo) })),
    },
    {
      title: "Before / after slider (homepage and testimonials page)",
      editHref: "/admin/globals/page-photos",
      editLabel: "Choose before / after photos",
      slots: [
        { label: "Before", media: asMedia(pagePhotos.beforePhoto), fallback: "/images/results/before-71kg.jpg" },
        { label: "After", media: asMedia(pagePhotos.afterPhoto), fallback: "/images/results/after-61kg.jpg" },
      ],
    },
    {
      title: "About page",
      editHref: "/admin/globals/page-photos",
      editLabel: "Edit About page photos and captions",
      slots: [
        { label: "Main photo", media: asMedia(pagePhotos.aboutPhoto), fallback: "/images/coach/coach-p03.jpg" },
        ...(pagePhotos.aboutEvents ?? []).map((e) => ({ label: e.caption, media: asMedia(e.photo) })),
      ],
    },
    {
      title: "Testimonials page: client results",
      editHref: "/admin/collections/testimonials",
      editLabel: "Add or remove results",
      slots: testimonials.docs.map((t) => ({ label: t.startKg && t.endKg ? `${t.startKg} kg → ${t.endKg} kg` : `Result ${t.order}`, media: asMedia(t.image) })),
    },
    {
      title: "E-book",
      editHref: "/admin/globals/ebook",
      editLabel: "Edit e-book (cover, text, Drive link)",
      slots: [{ label: "Cover", media: asMedia(ebook.cover) }],
    },
  ];

  // How many places use each photo: changing a photo's file changes it in all of them.
  const usage = new Map<number, number>();
  for (const slot of groups.flatMap((g) => g.slots)) if (slot.media) usage.set(slot.media.id, (usage.get(slot.media.id) ?? 0) + 1);

  return (
    <AdminPage
      view={view}
      title="Site photos"
      intro="Every picture on the website. “Change photo” opens the photo: press × next to the file, upload the new picture and Save. It changes everywhere that photo is used. To change only one place, use the “Edit …” link of that group and pick another photo."
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
                <PhotoTile key={`${group.title}-${i}`} slot={slot} editHref={group.editHref} usedTimes={slot.media ? (usage.get(slot.media.id) ?? 1) : 1} />
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
