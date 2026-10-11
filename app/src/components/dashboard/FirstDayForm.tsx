"use client";

/**
 * The first day form: everything the coach needs to build the diet plan.
 * Saved with saveFirstDayForm() (app/(frontend)/dashboard/actions.ts). After saving she can
 * save it as an image and send it on WhatsApp (FormSharePanel).
 */
import { useState, useTransition } from "react";
import { DashCard } from "./DashCard";
import { RadioPills } from "./RadioPills";
import { MeasurementFields } from "./MeasurementFields";
import { FormSharePanel } from "./FormSharePanel";
import { Clipboard } from "@/components/ui/Icons";
import { saveFirstDayForm } from "@/app/(frontend)/dashboard/actions";
import type { FirstDayFormData } from "@/lib/member";

const AGES = Array.from({ length: 63 }, (_, i) => String(18 + i)); // 18-80
// Heights from 4'8" to 6'2", with centimetres (members think in feet, the coach in cm).
const HEIGHTS = Array.from({ length: 19 }, (_, i) => {
  const inches = 56 + i;
  return `${Math.floor(inches / 12)}'${inches % 12}" (${Math.round(inches * 2.54)} cm)`;
});
const MARITAL = ["Single", "Married", "Divorced", "Widowed", "Prefer not to say"];

type Props = {
  initial: FirstDayFormData;
  /** id of the saved form, if she already filled it in */
  savedId: number | null;
  whatsappUrl: string;
};

export function FirstDayForm({ initial, savedId, whatsappUrl }: Props) {
  const [data, setData] = useState<FirstDayFormData>(initial);
  const [editing, setEditing] = useState(savedId === null);
  const [shareId, setShareId] = useState<number | null>(null);
  const [version, setVersion] = useState(0); // makes the image reload after an update
  const [error, setError] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();
  const set = <K extends keyof FirstDayFormData>(key: K, value: FirstDayFormData[K]) => setData({ ...data, [key]: value });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveFirstDayForm(data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      setEditing(false);
      setShareId(result.id);
      setVersion((v) => v + 1);
    });
  }

  const imageId = shareId ?? savedId;
  return (
    <DashCard
      id="first-day-form"
      title="First day form"
      icon={<Clipboard className="h-5 w-5" />}
      action={!editing ? <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setEditing(true); setShareId(null); }}>Update my answers</button> : null}
    >
      {!editing && imageId ? (
        <FormSharePanel
          imageUrl={`/api/forms/image?form=first-day&id=${imageId}&v=${version}`}
          fileName="first-day-form.png"
          whatsappUrl={whatsappUrl}
          message={`Hi! I've filled in my first day form. Name: ${data.fullName}`}
        />
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-7">
          <p className="text-[15px] text-muted">Your coach uses these answers to prepare your diet plan, which she sends on WhatsApp.</p>

          <fieldset className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <legend className="mb-3 font-display text-xl text-ink">About you</legend>
            <div>
              <label htmlFor="fd-name" className="field-label">Full name <span className="text-brand">*</span></label>
              <input id="fd-name" required value={data.fullName} onChange={(e) => set("fullName", e.target.value)} className="field-input" autoComplete="name" />
            </div>
            <div>
              <label htmlFor="fd-age" className="field-label">Age <span className="text-brand">*</span></label>
              <select id="fd-age" required value={data.age} onChange={(e) => set("age", e.target.value)} className="field-input">
                <option value="">Select age</option>
                {AGES.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="fd-height" className="field-label">Height <span className="text-brand">*</span></label>
              <select id="fd-height" required value={data.height} onChange={(e) => set("height", e.target.value)} className="field-input">
                <option value="">Select height</option>
                {HEIGHTS.map((h) => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="fd-marital" className="field-label">Marital status <span className="text-brand">*</span></label>
              <select id="fd-marital" required value={data.maritalStatus} onChange={(e) => set("maritalStatus", e.target.value)} className="field-input">
                <option value="">Select status</option>
                {MARITAL.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="fd-weight" className="field-label">Current weight (kg) <span className="text-brand">*</span></label>
              <input id="fd-weight" required type="number" min={30} max={250} step="0.1" inputMode="decimal" value={data.currentWeightKg} onChange={(e) => set("currentWeightKg", e.target.value)} className="field-input" />
            </div>
            <div>
              <label htmlFor="fd-goal" className="field-label">Goal weight (kg)</label>
              <input id="fd-goal" type="number" min={30} max={250} step="0.1" inputMode="decimal" value={data.goalWeightKg} onChange={(e) => set("goalWeightKg", e.target.value)} className="field-input" />
            </div>
            <RadioPills legend="Gender" name="fd-gender" required options={["Female", "Other"]} value={data.gender} onChange={(v) => set("gender", v as FirstDayFormData["gender"])} />
            <RadioPills legend="Student?" name="fd-student" required options={["Yes", "No"]} value={data.student} onChange={(v) => set("student", v as FirstDayFormData["student"])} />
          </fieldset>

          <fieldset className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <legend className="mb-3 font-display text-xl text-ink">Food &amp; health</legend>
            <RadioPills legend="Diet preference" name="fd-diet" required options={["Vegetarian", "Non-Vegetarian"]} value={data.diet} onChange={(v) => set("diet", v as FirstDayFormData["diet"])} />
            <RadioPills legend="Smoking" name="fd-smoking" required options={["Yes", "No"]} value={data.smoking} onChange={(v) => set("smoking", v as FirstDayFormData["smoking"])} />
            <div>
              <RadioPills legend="Any medical conditions?" name="fd-medical" required options={["Yes", "No"]} value={data.medicalConditions} onChange={(v) => set("medicalConditions", v as FirstDayFormData["medicalConditions"])} />
              {data.medicalConditions === "Yes" ? (
                <>
                  <label htmlFor="fd-medical-details" className="sr-only">Medical conditions</label>
                  <input id="fd-medical-details" value={data.medicalDetails} onChange={(e) => set("medicalDetails", e.target.value)} className="field-input mt-2" placeholder="e.g. PCOS, thyroid, diabetes" />
                </>
              ) : null}
            </div>
            <div>
              <RadioPills legend="Allergies" name="fd-allergies" required options={["Yes", "No"]} value={data.allergies} onChange={(v) => set("allergies", v as FirstDayFormData["allergies"])} />
              {data.allergies === "Yes" ? (
                <>
                  <label htmlFor="fd-allergy-details" className="sr-only">Allergy details</label>
                  <input id="fd-allergy-details" value={data.allergyDetails} onChange={(e) => set("allergyDetails", e.target.value)} className="field-input mt-2" placeholder="Please specify" />
                </>
              ) : null}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="fd-likes" className="field-label">Foods you like <span className="text-brand">*</span></label>
              <input id="fd-likes" required value={data.likes} onChange={(e) => set("likes", e.target.value)} className="field-input" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="fd-dislikes" className="field-label">Foods you dislike <span className="text-brand">*</span></label>
              <input id="fd-dislikes" required value={data.dislikes} onChange={(e) => set("dislikes", e.target.value)} className="field-input" />
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1 font-display text-xl text-ink">Measurements</legend>
            <p className="mb-3 text-sm text-muted">Optional. Measure in centimetres; leave a box empty to skip it.</p>
            <MeasurementFields idPrefix="fd" value={data.measurements} onChange={(m) => set("measurements", m)} />
          </fieldset>

          <div>
            <label htmlFor="fd-notes" className="field-label">Anything else your coach should know?</label>
            <textarea id="fd-notes" rows={3} value={data.notes} onChange={(e) => set("notes", e.target.value)} className="field-input" placeholder="Your routine, sleep, medicines, goals..." />
          </div>

          <div>
            <button type="submit" className="btn" disabled={saving}>{saving ? "Saving…" : "Save my first day form"}</button>
            {error ? <p role="alert" className="mt-3 text-sm text-brand">{error}</p> : null}
          </div>
        </form>
      )}
    </DashCard>
  );
}
