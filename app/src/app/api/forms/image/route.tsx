/**
 * GET /api/forms/image?form=first-day|follow-up&id=123[&download=1]
 *
 * Draws a submitted form as a PNG image the member can save and send to her coach on WhatsApp.
 * Only the member who filled in the form can open it (it contains health information).
 * Drawn with next/og (JSX -> image). Note: every <div> with more than one child needs display:flex.
 */
import { ImageResponse } from "next/og";
import { getCurrentMember } from "@/lib/auth/session.server";
import { LIMITS, rateLimit, tooManyRequests } from "@/lib/rate-limit.server";
import { getPayloadClient } from "@/lib/payload.server";
import { getSettings } from "@/lib/content";
import { MEASUREMENT_FIELDS, MOODS } from "@/lib/member";
import { formatDate } from "@/lib/dates";

const BRAND = "#d6339f"; // deep brand pink (readable as text)
const INK = "#2b1a1f";
const MUTED = "#6b585d";
const WIDTH = 1080;

type Row = { label: string; value: string };

const show = (value: unknown, unit = "") => (value === null || value === undefined || value === "" ? "" : `${value}${unit}`);
const date = (iso: string) => formatDate(iso, "long");

export async function GET(request: Request) {
  const member = await getCurrentMember();
  if (!member) return new Response("Please log in", { status: 401 });
  // Drawing an image is heavy work: limit how often one member can ask for it.
  const limited = await rateLimit(LIMITS.formImage, `member:${member.id}`);
  if (!limited.ok) return tooManyRequests(limited);

  const url = new URL(request.url);
  const kind = url.searchParams.get("form");
  const id = Number(url.searchParams.get("id"));
  if ((kind !== "first-day" && kind !== "follow-up") || !Number.isInteger(id)) return new Response("Unknown form", { status: 400 });

  const payload = await getPayloadClient();
  const collection = kind === "first-day" ? "first-day-forms" : "follow-up-forms";
  const doc = await payload.findByID({ collection, id, depth: 0, disableErrors: true });
  const ownerId = doc && (typeof doc.member === "object" ? doc.member.id : doc.member);
  if (!doc || ownerId !== member.id) return new Response("Not found", { status: 404 });

  // ---- what goes on the image ----
  let title: string;
  let rows: Row[];
  if (kind === "first-day" && "fullName" in doc) {
    title = "Personal Wellness Profile";
    rows = [
      { label: "Age", value: show(doc.age) },
      { label: "Height", value: show(doc.height) },
      { label: "Current weight", value: show(doc.currentWeightKg, " kg") },
      { label: "Goal weight", value: show(doc.goalWeightKg, " kg") },
      { label: "Gender", value: show(doc.gender) },
      { label: "Marital status", value: show(doc.maritalStatus) },
      { label: "Student", value: show(doc.student) },
      { label: "Diet", value: show(doc.diet) },
      { label: "Smoking", value: show(doc.smoking) },
      { label: "Water a day", value: show(doc.waterIntake) },
      { label: "Sleep a night", value: show(doc.sleepHours) },
      { label: "Medical conditions", value: [doc.medicalConditions, doc.medicalDetails].filter(Boolean).join(": ") },
      { label: "Allergies", value: [doc.allergies, doc.allergyDetails].filter(Boolean).join(": ") },
      { label: "Likes", value: show(doc.likes) },
      { label: "Dislikes", value: show(doc.dislikes) },
    ];
  } else {
    title = "Follow-up form";
    const mood = MOODS.find((m) => m.id === ("mood" in doc ? doc.mood : ""))?.label ?? "";
    rows = [
      { label: "Weight", value: show("weightKg" in doc ? doc.weightKg : "", " kg") },
      { label: "How I feel", value: mood },
      { label: "Water a day", value: show("waterIntake" in doc ? doc.waterIntake : "") },
      { label: "Sleep a night", value: show("sleepHours" in doc ? doc.sleepHours : "") },
    ];
  }
  const measurements = MEASUREMENT_FIELDS.map(({ key, label }) => ({ label, value: show(doc[key], " cm") })).filter((r) => r.value);
  const filled = rows.filter((r) => r.value);
  const notes = doc.notes ?? "";
  const name = member.fullName || member.displayName || member.email;
  const { whatsappE164 } = (await getSettings()).contact;

  // ---- size: grows with the number of answers ----
  const answerRows = Math.ceil(filled.length / 2) + Math.ceil(measurements.length / 3);
  const height = 330 + answerRows * 96 + (measurements.length ? 70 : 0) + (notes ? 200 : 0);

  const cell = (r: Row, width: string) => (
    <div key={r.label} style={{ display: "flex", flexDirection: "column", width, padding: "14px 18px", marginBottom: 14, background: "#fff", borderRadius: 14, border: "1px solid #ebdcde" }}>
      <span style={{ fontSize: 20, color: MUTED }}>{r.label}</span>
      <span style={{ fontSize: 28, color: INK, marginTop: 4 }}>{r.value.length > 60 ? `${r.value.slice(0, 57)}…` : r.value}</span>
    </div>
  );

  const image = (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#fff0f8", padding: "48px 56px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 30, color: BRAND, fontWeight: 700 }}>Fat To Fit With Z</span>
        <span style={{ fontSize: 22, color: MUTED }}>{date(doc.updatedAt)}</span>
      </div>
      <span style={{ fontSize: 52, color: INK, marginTop: 28, fontWeight: 700 }}>{title}</span>
      <span style={{ fontSize: 30, color: BRAND, marginTop: 6, marginBottom: 26 }}>{name}</span>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between" }}>{filled.map((r) => cell(r, "48.8%"))}</div>

      {measurements.length ? <span style={{ fontSize: 24, color: MUTED, margin: "10px 0 14px" }}>Measurements</span> : null}
      {measurements.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0 14px" }}>{measurements.map((r) => cell(r, "31.9%"))}</div>
      ) : null}

      {notes ? (
        <div style={{ display: "flex", flexDirection: "column", padding: "16px 20px", marginTop: 6, background: "#fff", borderRadius: 14, border: "1px solid #ebdcde" }}>
          <span style={{ fontSize: 20, color: MUTED }}>Notes</span>
          <span style={{ fontSize: 24, color: INK, marginTop: 6 }}>{notes.length > 260 ? `${notes.slice(0, 257)}…` : notes}</span>
        </div>
      ) : null}

      <span style={{ fontSize: 22, color: MUTED, marginTop: "auto" }}>Send this to your coach on WhatsApp: {whatsappE164}</span>
    </div>
  );

  const fileName = `${kind}-form-${new Date(doc.updatedAt).toISOString().slice(0, 10)}.png`;
  return new ImageResponse(image, {
    width: WIDTH,
    height,
    headers: {
      "Cache-Control": "private, no-store", // personal health information: never cache in shared caches
      ...(url.searchParams.get("download") ? { "Content-Disposition": `attachment; filename="${fileName}"` } : {}),
    },
  });
}
