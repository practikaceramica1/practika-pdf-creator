type PrintLine = {
  series: string;
  material: string;
  format: string;
  color: string;
  squareMeters: string;
  pricePerM2: string;
  total: string;
  comments: string;
  image: string;
};

export function BulkOfferPrintDocument({
  title,
  createdAt,
  lines,
}: {
  title: string;
  createdAt: string;
  lines: PrintLine[];
}) {
  const grandTotal = lines.reduce((sum, line) => {
    const n = Number(line.total.replace(/\./g, "").replace(",", "."));
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  return (
    <div className="bulk-offer-print mx-auto bg-white text-[#1a1f3d]">
      <header className="mb-6 border-b-2 border-[#1a1f3d] pb-4">
        <p className="text-sm uppercase tracking-[0.25em] text-[#2a3156]">Practika cerámica</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-neutral-600">
          {new Date(createdAt).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-[#1a1f3d] text-white">
            <th className="border border-[#1a1f3d] px-2 py-2 text-left">Imagen</th>
            <th className="border border-[#1a1f3d] px-2 py-2 text-left">Serie</th>
            <th className="border border-[#1a1f3d] px-2 py-2 text-left">Material</th>
            <th className="border border-[#1a1f3d] px-2 py-2 text-left">Formato</th>
            <th className="border border-[#1a1f3d] px-2 py-2 text-left">Color</th>
            <th className="border border-[#1a1f3d] px-2 py-2 text-right">m²</th>
            <th className="border border-[#1a1f3d] px-2 py-2 text-right">€/m²</th>
            <th className="border border-[#1a1f3d] px-2 py-2 text-right">Total</th>
            <th className="border border-[#1a1f3d] px-2 py-2 text-left">Comentarios</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr key={`${line.series}-${index}`} className={index % 2 === 0 ? "bg-[#f8faff]" : "bg-white"}>
              <td className="border border-neutral-200 px-2 py-2 align-middle">
                {line.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={line.image} alt="" className="h-16 w-16 rounded object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed border-neutral-300 text-[10px] text-neutral-400">
                    Sin foto
                  </div>
                )}
              </td>
              <td className="border border-neutral-200 px-2 py-2 align-top font-semibold">{line.series}</td>
              <td className="border border-neutral-200 px-2 py-2 align-top">{line.material}</td>
              <td className="border border-neutral-200 px-2 py-2 align-top">{line.format}</td>
              <td className="border border-neutral-200 px-2 py-2 align-top">{line.color}</td>
              <td className="border border-neutral-200 px-2 py-2 align-top text-right">{line.squareMeters}</td>
              <td className="border border-neutral-200 px-2 py-2 align-top text-right">{line.pricePerM2}</td>
              <td className="border border-neutral-200 px-2 py-2 align-top text-right font-semibold">{line.total}</td>
              <td className="border border-neutral-200 px-2 py-2 align-top">{line.comments}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="rounded-lg bg-[#f59e0b] px-4 py-3 text-sm font-semibold">
          TOTAL: {grandTotal.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
        </div>
      </div>

      <footer className="mt-8 text-xs text-neutral-500">practikaceramica.com</footer>
    </div>
  );
}
