"use client";

/** Accessible radio group shown as round options (Female / Other, Yes / No ...). */
type Props = {
  legend: string;
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

export function RadioPills({ legend, name, options, value, onChange, required }: Props) {
  return (
    <fieldset>
      <legend className="field-label">
        {legend}
        {required ? <span className="text-brand"> *</span> : null}
      </legend>
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option} className="flex cursor-pointer items-center gap-2 text-[15px]">
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="h-4.5 w-4.5 accent-brand"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
