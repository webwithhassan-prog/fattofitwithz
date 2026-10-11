"use client";

/**
 * The follow-up form: weight, how she feels, optional measurements and notes.
 * Each submission is saved as a new follow-up (saveFollowUpForm). Afterwards she can
 * save it as an image and send it on WhatsApp (FormSharePanel).
 */
import { useState, useTransition } from "react";
import { DashCard } from "./DashCard";
import { MeasurementFields } from "./MeasurementFields";
import { FormSharePanel } from "./FormSharePanel";
import { Clipboard } from "@/components/ui/Icons";
import { saveFollowUpForm } from "@/app/(frontend)/dashboard/actions";
import { EMPTY_FOLLOW_UP_FORM, MOODS, type FollowUpFormData } from "@/lib/member";

export function FollowUpForm({ whatsappUrl, name }: { whatsappUrl: string; name: string }) {
  const [data, setData] = useState<FollowUpFormData>(EMPTY_FOLLOW_UP_FORM);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();
  const set = <K extends keyof FollowUpFormData>(key: K, value: FollowUpFormData[K]) => setData({ ...data, [key]: value });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveFollowUpForm(data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      setSavedId(result.id);
    });
  }

  return (
    <DashCard
      id="follow-up-form"
      title="Follow-up form"
      icon={<Clipboard className="h-5 w-5" />}
      action={savedId ? <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSavedId(null); setData(EMPTY_FOLLOW_UP_FORM); }}>Send another</button> : null}
    >
      {savedId ? (
        <FormSharePanel
          imageUrl={`/api/forms/image?form=follow-up&id=${savedId}`}
          fileName="follow-up-form.png"
          whatsappUrl={whatsappUrl}
          message={`Hi! Here is my follow-up form. Name: ${name}, weight: ${data.weightKg} kg`}
        />
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <p className="text-[15px] text-muted">Send this whenever your coach asks for an update (usually once a week).</p>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="fu-weight" className="field-label">Your weight today (kg) <span className="text-brand">*</span></label>
              <input id="fu-weight" required type="number" min={30} max={250} step="0.1" inputMode="decimal" value={data.weightKg} onChange={(e) => set("weightKg", e.target.value)} className="field-input" />
            </div>
            <fieldset>
              <legend className="field-label">How are you feeling?</legend>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <label key={m.id} className="flex cursor-pointer flex-col items-center gap-1 text-xs">
                    <input type="radio" name="fu-mood" value={m.id} checked={data.mood === m.id} onChange={() => set("mood", m.id)} className="peer sr-only" />
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-line bg-blush text-2xl transition peer-checked:border-brand peer-checked:shadow-[0_0_0_3px_rgba(163,21,79,0.2)] peer-focus-visible:outline-2 peer-focus-visible:outline-brand">
                      {m.emoji}
                    </span>
                    {m.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <details className="rounded-[12px] border border-line p-4">
            <summary className="cursor-pointer font-medium">Measurements (optional)</summary>
            <div className="mt-4">
              <MeasurementFields idPrefix="fu" value={data.measurements} onChange={(m) => set("measurements", m)} />
            </div>
          </details>

          <div>
            <label htmlFor="fu-notes" className="field-label">How did it go? Any questions?</label>
            <textarea id="fu-notes" rows={4} value={data.notes} onChange={(e) => set("notes", e.target.value)} className="field-input" placeholder="Diet, workouts, energy, cravings, anything you want your coach to know" />
          </div>

          <div>
            <button type="submit" className="btn" disabled={saving}>{saving ? "Saving…" : "Send follow-up"}</button>
            {error ? <p role="alert" className="mt-3 text-sm text-brand">{error}</p> : null}
          </div>
        </form>
      )}
    </DashCard>
  );
}
