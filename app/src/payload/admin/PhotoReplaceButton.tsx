"use client";

/**
 * "Replace photo" and "Adjust position" on admin > Site photos.
 *
 *   Replace photo:   pick a picture -> a PREVIEW opens, showing it the way the website shows it
 *                    (for before/after: the arch with the other photo next to it) -> move it with the
 *                    two sliders until the face sits right -> Save. Nothing changes before Save.
 *   Adjust position: the same preview for the photo that is already there (no new upload).
 *
 * The position is saved on the photo (focal point) and used by the website (src/lib/content.ts photoPosition).
 */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { shrink } from "./ShrinkUploads";
import { replaceSitePhoto, setPhotoPosition } from "./sitePhotoActions";

/** How the place looks on the website: the arch of the before/after slider, or a plain portrait frame. */
export type PhotoFrame = "arch" | "portrait";

type Props = {
  target?: string;
  alt: string;
  frame: PhotoFrame;
  /** the photo that is there now (for "Adjust position") */
  current?: { id: number; src: string; focalX: number; focalY: number } | null;
  /** before/after: the OTHER photo, shown next to this one in the preview */
  pair?: { src: string; position?: string; side: "before" | "after" } | null;
  label?: string;
};

/** Default when a photo was never positioned: centred, near the top (faces). Same as the website. */
const DEFAULT = { x: 50, y: 18 };
const toPosition = (p: { x: number; y: number }) => `${p.x}% ${p.y}%`;

export function PhotoReplaceButton({ target, alt, frame, current, pair, label = "Replace photo" }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [editing, setEditing] = useState<{ src: string; file: File | null } | null>(null);
  const [pos, setPos] = useState(DEFAULT);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    event.target.value = ""; // so picking the same file again still works
    if (!picked) return;
    const file = await shrink(picked);
    setMessage(null);
    setPos(DEFAULT);
    setEditing({ src: URL.createObjectURL(file), file });
  }

  function openAdjust() {
    if (!current) return;
    const neverSet = current.focalX === 50 && current.focalY === 50;
    setMessage(null);
    setPos(neverSet ? DEFAULT : { x: current.focalX, y: current.focalY });
    setEditing({ src: current.src, file: null });
  }

  function close() {
    if (editing?.file) URL.revokeObjectURL(editing.src);
    setEditing(null);
  }

  async function save() {
    if (!editing) return;
    setBusy(true);
    const formData = new FormData();
    // 50/50 means "never positioned" on the website, so nudge it a hair to keep exactly this spot.
    formData.set("focalX", String(pos.x));
    formData.set("focalY", String(pos.x === 50 && pos.y === 50 ? 49.9 : pos.y));
    let result: Awaited<ReturnType<typeof replaceSitePhoto>>;
    try {
      if (editing.file && target) {
        formData.set("target", target);
        formData.set("alt", alt);
        formData.set("file", editing.file);
        result = await replaceSitePhoto(formData);
      } else if (current) {
        formData.set("mediaId", String(current.id));
        result = await setPhotoPosition(formData);
      } else return;
    } catch (error) {
      console.error("[site-photos] Save failed:", error);
      result = { ok: false, error: "Saving failed. Please try again, or try a smaller photo." };
    }
    setBusy(false);
    if (!result.ok) return setMessage({ ok: false, text: result.error });
    close();
    setMessage({ ok: true, text: "Saved! It's on the website now." });
    router.refresh();
  }

  const thisPhoto = { src: editing?.src ?? "", position: toPosition(pos) };
  const left = pair?.side === "after" ? thisPhoto : pair ? { src: pair.src, position: pair.position ?? toPosition(DEFAULT) } : thisPhoto;
  const right = pair?.side === "before" ? thisPhoto : pair ? { src: pair.src, position: pair.position ?? toPosition(DEFAULT) } : null;

  return (
    <div className="ftf-replace">
      {/* Shrinking is done here, so the admin-wide shrinker skips this input (data-ftf-skip) */}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden data-ftf-skip="1" onChange={onPick} />
      <button type="button" className="ftf-btn ftf-btn--small" onClick={() => input.current?.click()}>
        {label}
      </button>
      {current ? (
        <button type="button" className="ftf-link ftf-replace__adjust" onClick={openAdjust}>
          Adjust position
        </button>
      ) : null}
      {message ? <span className={message.ok ? "ftf-replace__ok" : "ftf-replace__error"}>{message.text}</span> : null}

      {editing ? (
        <div className="ftf-editor" role="dialog" aria-modal="true" aria-label="Photo preview">
          <div className="ftf-editor__panel">
            <h3>Preview: how it looks on the website</h3>
            <p className="ftf-muted">Use the sliders to move the photo until it looks right, then press Save.</p>

            <div className={`ftf-editor__frame ftf-editor__frame--${frame}`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
              <img src={left.src} alt="" style={{ objectPosition: left.position }} />
              {right ? (
                // eslint-disable-next-line @next/next/no-img-element -- local preview
                <img src={right.src} alt="" className="ftf-editor__right" style={{ objectPosition: right.position }} />
              ) : null}
              {pair ? (
                <>
                  <span className="ftf-editor__divider" />
                  <span className="ftf-editor__tag ftf-editor__tag--before">Before</span>
                  <span className="ftf-editor__tag ftf-editor__tag--after">After</span>
                </>
              ) : null}
            </div>

            <label className="ftf-editor__slider">
              <span>Left ↔ Right</span>
              <input type="range" min={0} max={100} value={pos.x} onChange={(e) => setPos({ ...pos, x: Number(e.target.value) })} />
            </label>
            <label className="ftf-editor__slider">
              <span>Up ↕ Down</span>
              <input type="range" min={0} max={100} value={pos.y} onChange={(e) => setPos({ ...pos, y: Number(e.target.value) })} />
            </label>

            {message && !message.ok ? <p className="ftf-replace__error">{message.text}</p> : null}
            <div className="ftf-editor__actions">
              <button type="button" className="ftf-btn" onClick={save} disabled={busy}>
                {busy ? "Saving…" : "Save"}
              </button>
              <button type="button" className="ftf-btn ftf-btn--ghost" onClick={close} disabled={busy}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
