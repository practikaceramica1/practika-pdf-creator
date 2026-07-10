import {
  classifyFormatShape,
  formatLabelDisplay,
  formatShapeDimensions,
  formatShapeLabel,
} from "@/lib/format-display";

export function FormatShapeBlock({
  formatLabel,
  widthCm,
  heightCm,
  materialName,
}: {
  formatLabel: string;
  widthCm: number;
  heightCm: number;
  materialName?: string;
}) {
  const { w, h } = formatShapeDimensions(widthCm, heightCm);
  const kind = classifyFormatShape(widthCm, heightCm);
  const boxW = 100;
  const boxH = 100;
  const rectW = w * 88;
  const rectH = h * 88;
  const x = (boxW - rectW) / 2;
  const y = (boxH - rectH) / 2;

  return (
    <div className="flex flex-col items-center rounded border border-[#e8e4dc] bg-white/90 px-3 py-4">
      <svg viewBox={`0 0 ${boxW} ${boxH}`} className="h-20 w-20" aria-hidden>
        <rect x={x} y={y} width={rectW} height={rectH} rx={1} fill="#e5e0d3" stroke="#1a1f3d" strokeWidth={2} />
      </svg>
      <p className="mt-2 text-center text-[9pt] font-bold uppercase tracking-wide text-[#1a1f3d]">
        {formatLabelDisplay(formatLabel)}
      </p>
      <p className="text-center text-[7pt] text-neutral-600">{formatShapeLabel(kind)}</p>
      {materialName ? (
        <p className="mt-1 text-center text-[7pt] text-neutral-500">{materialName}</p>
      ) : null}
    </div>
  );
}
