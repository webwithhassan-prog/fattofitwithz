"use client";

/** "Water a day" and "Sleep a night" dropdowns, used by both forms (answers: WATER_INTAKE / SLEEP_HOURS in lib/member.ts). */
import { SLEEP_HOURS, WATER_INTAKE } from "@/lib/member";

type Props = {
  idPrefix: string;
  waterIntake: string;
  sleepHours: string;
  onChange: (field: "waterIntake" | "sleepHours", value: string) => void;
};

export function WaterSleepFields({ idPrefix, waterIntake, sleepHours, onChange }: Props) {
  return (
    <>
      <div>
        <label htmlFor={`${idPrefix}-water`} className="field-label">Water you drink a day <span className="text-brand-dark">*</span></label>
        <select id={`${idPrefix}-water`} required value={waterIntake} onChange={(e) => onChange("waterIntake", e.target.value)} className="field-input">
          <option value="">Select (1 glass = 250 ml)</option>
          {WATER_INTAKE.map((w) => <option key={w}>{w}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-sleep`} className="field-label">Sleep a night <span className="text-brand-dark">*</span></label>
        <select id={`${idPrefix}-sleep`} required value={sleepHours} onChange={(e) => onChange("sleepHours", e.target.value)} className="field-input">
          <option value="">Select hours</option>
          {SLEEP_HOURS.map((h) => <option key={h}>{h}</option>)}
        </select>
      </div>
    </>
  );
}
