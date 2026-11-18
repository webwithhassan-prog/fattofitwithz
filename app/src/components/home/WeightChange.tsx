/** "71 kg → 61 kg · −10 kg" next to the before/after slider (weights from admin > Site photos > Before / after). */
export function WeightChange({ beforeKg, afterKg, className = "" }: { beforeKg: number | null; afterKg: number | null; className?: string }) {
  if (!beforeKg || !afterKg) return null;
  const lost = Math.round((beforeKg - afterKg) * 10) / 10;
  return (
    <p className={`font-display ${className}`}>
      {beforeKg} kg → {afterKg} kg {lost > 0 ? <span className="text-brand-dark">· −{lost} kg</span> : null}
    </p>
  );
}
