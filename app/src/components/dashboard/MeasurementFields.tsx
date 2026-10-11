"use client";

/** The 7 body measurement boxes (cm), used by both forms. Leave a box empty to skip it. */
import { MEASUREMENT_FIELDS, type Measurements } from "@/lib/member";

type Props = { idPrefix: string; value: Measurements; onChange: (next: Measurements) => void };

export function MeasurementFields({ idPrefix, value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {MEASUREMENT_FIELDS.map(({ key, label }) => (
        <div key={key}>
          <label htmlFor={`${idPrefix}-${key}`} className="mb-1.5 block text-sm text-muted">{label} (cm)</label>
          <input
            id={`${idPrefix}-${key}`}
            type="number"
            min={10}
            max={250}
            step="0.5"
            inputMode="decimal"
            value={value[key]}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
            placeholder="--"
            className="field-input py-2"
          />
        </div>
      ))}
    </div>
  );
}
