import {
  BULK_OFFER_LINE_SORT_OPTIONS,
  type BulkOfferLineSortMode,
} from "@/lib/bulk-offer-line-sort";

type Props = {
  value: BulkOfferLineSortMode;
  onChange: (value: BulkOfferLineSortMode) => void;
  className?: string;
  compact?: boolean;
};

export function BulkOfferLineSortSelect({ value, onChange, className, compact }: Props) {
  return (
    <label className={`flex items-center gap-2 text-sm text-neutral-600 ${className ?? ""}`}>
      {!compact ? (
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Ordenar por</span>
      ) : null}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BulkOfferLineSortMode)}
        className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-[var(--practika-primary)]"
      >
        {BULK_OFFER_LINE_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
