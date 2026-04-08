import "@/app/print/ofertas/print.css";
import { logoSrcForVariant, type OfferItem, type OffersCatalog } from "@/lib/offers-types";

const palette = {
  stone: "#c6c1b1",
  paper: "#f6f4ef",
  ink: "#151515",
  line: "#dfd8c8",
  accent: "#7c5a3a",
};

function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}

function Logo({ item, dark = false }: { item: OfferItem; dark?: boolean }) {
  const src = item.logoVariant
    ? logoSrcForVariant(item.logoVariant)
    : dark
      ? "/brand/logo-anthracite.png"
      : "/brand/logo-white.png";
  return <Img src={src} alt="Practika Ceramica" className="h-auto w-[42mm]" />;
}

function OfferMeta({ item, dark = false }: { item: OfferItem; dark?: boolean }) {
  const tone = dark ? "text-[#151515]" : "text-white";
  return (
    <div className={`leading-tight ${tone}`}>
      <p className="text-[17pt] font-semibold uppercase tracking-[0.04em]">
        {item.format ? `${item.format} ` : ""}
        {item.series}
        {item.color ? ` ${item.color}` : ""}
      </p>
      <p className="mt-2 text-[11pt]">{item.pricePerM2}</p>
      {item.material ? <p className="mt-1 text-[9pt] opacity-85">{item.material}</p> : null}
    </div>
  );
}

function SpecialBadge({ text = "Special offer" }: { text?: string }) {
  return (
    <div className="rounded border border-black/10 bg-[#f3efe6] px-4 py-2 text-[10pt] font-semibold uppercase tracking-[0.08em] text-[#5f4a35]">
      {text}
    </div>
  );
}

function SplitRightTemplate({ item }: { item: OfferItem }) {
  return (
    <div className="offer-page" style={{ background: palette.stone }}>
      <div className="absolute left-[10mm] top-[10mm] h-[160mm] w-[240mm] overflow-hidden border-[2mm] border-[#f2eee6] bg-[#ded8cb]">
        <Img src={item.heroImage} alt={`${item.series} ambiente`} className="h-full w-full object-cover" />
      </div>
      <div className="absolute right-[10mm] top-[10mm] h-[160mm] w-[60mm] rounded bg-white/92 p-[5mm]">
        <div className="flex justify-center">
          <SpecialBadge text={item.specialOfferText} />
        </div>
        {item.tileImage ? (
          <div className="mx-auto mt-[7mm] h-[100mm] w-[44mm] overflow-hidden border border-black/10">
            <Img src={item.tileImage} alt={`${item.series} pieza`} className="h-full w-full object-cover" />
          </div>
        ) : null}
        <div className="mt-auto pt-[5mm]">
          <OfferMeta item={item} dark />
        </div>
      </div>
      <div className="absolute left-[16mm] top-[14mm]">
        <Logo item={item} />
      </div>
      <div className="absolute bottom-[12mm] left-[20mm] rounded bg-white/85 px-5 py-3">
        <p className="text-[8pt] uppercase tracking-[0.18em] text-[#5f4a35]">Practika · Oferta</p>
        <p className="mt-1 text-[16pt] font-semibold text-[#161616]">{item.pricePerM2}</p>
      </div>
    </div>
  );
}

function PriceOverlayTemplate({ item }: { item: OfferItem }) {
  return (
    <div className="offer-page" style={{ background: palette.paper }}>
      <div className="absolute inset-[10mm] grid grid-cols-[1fr_95mm] gap-[8mm]">
        <div className="overflow-hidden border border-black/8 bg-white">
          <Img src={item.heroImage} alt={`${item.series} ambiente`} className="h-full w-full object-cover" />
        </div>
        <div className="relative border border-black/8 bg-white p-[6mm]">
          <Logo item={item} dark />
          <div className="mt-[6mm]">
            <SpecialBadge text={item.specialOfferText} />
          </div>
          {item.tileImage ? (
            <div className="mt-[6mm] h-[86mm] w-[50mm] overflow-hidden border border-black/10">
              <Img src={item.tileImage} alt={`${item.series} pieza`} className="h-full w-full object-cover" />
            </div>
          ) : null}
          <div className="mt-[6mm] border-t border-[#e8e2d6] pt-[4mm]">
            <OfferMeta item={item} dark />
          </div>
          <div className="absolute bottom-[5mm] right-[6mm] rounded bg-[#111] px-3 py-1 text-[10pt] font-semibold text-white">
            {item.pricePerM2}
          </div>
        </div>
      </div>
    </div>
  );
}

function CleanCardTemplate({ item }: { item: OfferItem }) {
  return (
    <div className="offer-page" style={{ background: palette.paper }}>
      <div className="absolute left-[12mm] right-[12mm] top-[12mm] bottom-[12mm] grid grid-cols-[1.2fr_1fr] gap-[10mm]">
        <div className="overflow-hidden border-[2mm]" style={{ borderColor: palette.stone }}>
          <Img src={item.heroImage} alt={`${item.series} ambiente`} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col border border-black/10 bg-white p-[8mm]">
          <Logo item={item} dark />
          <div className="mt-[6mm]">
            <SpecialBadge text={item.specialOfferText} />
          </div>
          <div className="mt-[6mm] border-l-[3px] pl-[4mm]" style={{ borderColor: palette.accent }}>
            <OfferMeta item={item} dark />
          </div>
          {item.tileImage ? (
            <div className="mt-[7mm] h-[58mm] w-[42mm] overflow-hidden border border-black/10">
              <Img src={item.tileImage} alt={`${item.series} pieza`} className="h-full w-full object-cover" />
            </div>
          ) : null}
          <div className="mt-auto border-t border-[#ebe4d8] pt-[5mm]">
            <p className="text-[8pt] uppercase tracking-[0.16em] text-[#7c5a3a]">Precio especial</p>
            <p className="mt-1 text-[20pt] font-semibold text-[#151515]">{item.pricePerM2}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroFocusTemplate({ item }: { item: OfferItem }) {
  return (
    <div className="offer-page" style={{ background: palette.ink }}>
      <Img src={item.heroImage} alt={`${item.series} ambiente`} className="h-full w-full object-cover opacity-85" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
      <div className="absolute left-[12mm] top-[10mm]">
        <Logo item={item} />
      </div>
      <div className="absolute right-[12mm] top-[10mm]">
        <SpecialBadge text={item.specialOfferText} />
      </div>
      <div className="absolute bottom-[12mm] left-[12mm] max-w-[220mm] rounded bg-black/52 px-6 py-5 text-white">
        <p className="text-[24pt] font-semibold uppercase tracking-[0.06em]">
          {item.format ? `${item.format} ` : ""}
          {item.series}
          {item.color ? ` ${item.color}` : ""}
        </p>
        <p className="mt-2 text-[14pt]">{item.pricePerM2}</p>
        {item.material ? <p className="mt-1 text-[10pt] opacity-90">{item.material}</p> : null}
      </div>
      {item.tileImage ? (
        <div className="absolute bottom-[12mm] right-[12mm] h-[56mm] w-[34mm] overflow-hidden border-2 border-white/85 shadow-xl">
          <Img src={item.tileImage} alt={`${item.series} pieza`} className="h-full w-full object-cover" />
        </div>
      ) : null}
    </div>
  );
}

function CatalogStripTemplate({ item }: { item: OfferItem }) {
  return (
    <div className="offer-page" style={{ background: palette.paper }}>
      <div className="absolute inset-x-0 top-0 h-[18mm]" style={{ background: palette.stone }} />
      <div className="absolute left-[12mm] top-[4mm]">
        <Logo item={item} dark />
      </div>
      <div className="absolute right-[12mm] top-[4.5mm]">
        <SpecialBadge text={item.specialOfferText} />
      </div>

      <div className="absolute left-[12mm] top-[24mm] h-[120mm] w-[210mm] overflow-hidden border border-black/10">
        <Img src={item.heroImage} alt={`${item.series} ambiente`} className="h-full w-full object-cover" />
      </div>
      {item.tileImage ? (
        <div className="absolute left-[227mm] top-[24mm] h-[120mm] w-[40mm] overflow-hidden border border-black/10 bg-white">
          <Img src={item.tileImage} alt={`${item.series} pieza`} className="h-full w-full object-cover" />
        </div>
      ) : null}

      <div className="absolute inset-x-[12mm] bottom-[10mm] border-t border-[#ddd5c7] pt-[4mm]">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[17pt] font-semibold uppercase tracking-[0.05em]" style={{ color: palette.ink }}>
              {item.format ? `${item.format} ` : ""}
              {item.series}
              {item.color ? ` ${item.color}` : ""}
            </p>
            {item.material ? <p className="text-[9pt] text-black/60">{item.material}</p> : null}
          </div>
          <p className="text-[20pt] font-semibold" style={{ color: palette.ink }}>
            {item.pricePerM2}
          </p>
        </div>
      </div>
    </div>
  );
}

function MinimalPriceTemplate({ item }: { item: OfferItem }) {
  return (
    <div className="offer-page" style={{ background: "#ffffff" }}>
      <div className="absolute inset-y-0 left-0 w-[205mm] overflow-hidden">
        <Img src={item.heroImage} alt={`${item.series} ambiente`} className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-y-0 right-0 w-[115mm]" style={{ background: palette.stone }}>
        <div className="p-[10mm]">
          <Logo item={item} dark />
          <div className="mt-[8mm] inline-block">
            <SpecialBadge text={item.specialOfferText} />
          </div>
          {item.tileImage ? (
            <div className="mt-[8mm] h-[82mm] w-[50mm] overflow-hidden border border-black/10 bg-white">
              <Img src={item.tileImage} alt={`${item.series} pieza`} className="h-full w-full object-cover" />
            </div>
          ) : null}
          <div className="mt-[8mm]">
            <p className="text-[16pt] font-semibold uppercase leading-tight tracking-[0.04em]" style={{ color: palette.ink }}>
              {item.format ? `${item.format} ` : ""}
              {item.series}
              {item.color ? ` ${item.color}` : ""}
            </p>
            {item.material ? <p className="mt-1 text-[9pt] text-black/65">{item.material}</p> : null}
          </div>
          <div className="mt-[6mm] rounded bg-black px-4 py-2 text-center text-[17pt] font-semibold text-white">
            {item.pricePerM2}
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceBannerTemplate({ item }: { item: OfferItem }) {
  return (
    <div className="offer-page bg-white">
      <div className="absolute inset-0 overflow-hidden">
        <Img src={item.heroImage} alt={`${item.series} ambiente`} className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-x-0 top-0 h-[24mm] bg-black/72" />
      <div className="absolute left-[12mm] top-[6mm]">
        <Logo item={item} />
      </div>
      <div className="absolute right-[12mm] top-[7mm]">
        <SpecialBadge text={item.specialOfferText} />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[44mm] bg-[#111]/84 px-[12mm] py-[6mm] text-white">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[18pt] font-semibold uppercase tracking-[0.05em]">
              {item.format ? `${item.format} ` : ""}
              {item.series}
              {item.color ? ` ${item.color}` : ""}
            </p>
            {item.material ? <p className="text-[10pt] text-white/85">{item.material}</p> : null}
          </div>
          <p className="text-[24pt] font-semibold">{item.pricePerM2}</p>
        </div>
      </div>
    </div>
  );
}

function DuoFrameTemplate({ item }: { item: OfferItem }) {
  return (
    <div className="offer-page" style={{ background: palette.paper }}>
      <div className="absolute left-[10mm] top-[10mm] h-[120mm] w-[190mm] overflow-hidden border-[2mm]" style={{ borderColor: palette.stone }}>
        <Img src={item.heroImage} alt={`${item.series} ambiente`} className="h-full w-full object-cover" />
      </div>
      <div className="absolute left-[170mm] top-[78mm] z-10 h-[82mm] w-[65mm] overflow-hidden border-[2mm] border-white shadow-xl">
        <Img src={item.tileImage ?? item.heroImage} alt={`${item.series} pieza`} className="h-full w-full object-cover" />
      </div>
      <div className="absolute right-[12mm] top-[12mm] w-[84mm] rounded bg-white/95 p-[5mm]">
        <Logo item={item} dark />
        <div className="mt-[5mm]">
          <SpecialBadge text={item.specialOfferText} />
        </div>
        <div className="mt-[5mm] border-l-[3px] pl-[3mm]" style={{ borderColor: palette.accent }}>
          <OfferMeta item={item} dark />
        </div>
        <p className="mt-[4mm] text-[16pt] font-semibold text-[#111]">{item.pricePerM2}</p>
      </div>
    </div>
  );
}

function EditorialLeftTemplate({ item }: { item: OfferItem }) {
  return (
    <div className="offer-page" style={{ background: palette.stone }}>
      <div className="absolute left-[12mm] top-[12mm] w-[86mm] rounded bg-white p-[6mm]">
        <Logo item={item} dark />
        <div className="mt-[6mm] inline-block">
          <SpecialBadge text={item.specialOfferText} />
        </div>
        <p className="mt-[7mm] text-[17pt] font-semibold uppercase leading-tight tracking-[0.04em] text-[#151515]">
          {item.format ? `${item.format} ` : ""}
          {item.series}
          {item.color ? ` ${item.color}` : ""}
        </p>
        {item.material ? <p className="mt-1 text-[10pt] text-black/70">{item.material}</p> : null}
        <div className="mt-[7mm] rounded bg-[#111] px-3 py-2 text-center text-[18pt] font-semibold text-white">
          {item.pricePerM2}
        </div>
      </div>
      <div className="absolute left-[106mm] top-[12mm] h-[156mm] w-[202mm] overflow-hidden border-[2mm] border-[#f0ece2]">
        <Img src={item.heroImage} alt={`${item.series} ambiente`} className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

function TileDominantTemplate({ item }: { item: OfferItem }) {
  return (
    <div className="offer-page bg-white">
      <div className="absolute left-[10mm] top-[10mm] h-[160mm] w-[120mm] overflow-hidden border border-black/10 bg-[#f6f4ef]">
        <Img src={item.tileImage ?? item.heroImage} alt={`${item.series} pieza`} className="h-full w-full object-cover" />
      </div>
      <div className="absolute left-[136mm] top-[10mm] h-[95mm] w-[174mm] overflow-hidden border border-black/10">
        <Img src={item.heroImage} alt={`${item.series} ambiente`} className="h-full w-full object-cover" />
      </div>
      <div className="absolute left-[136mm] top-[112mm] w-[174mm] rounded bg-[#f6f4ef] p-[6mm]">
        <Logo item={item} dark />
        <div className="mt-[4mm] flex items-start justify-between">
          <div>
            <p className="text-[16pt] font-semibold uppercase leading-tight text-[#111]">
              {item.format ? `${item.format} ` : ""}
              {item.series}
              {item.color ? ` ${item.color}` : ""}
            </p>
            {item.material ? <p className="mt-1 text-[9pt] text-black/65">{item.material}</p> : null}
          </div>
          <SpecialBadge text={item.specialOfferText} />
        </div>
        <p className="mt-[5mm] text-[20pt] font-semibold text-[#111]">{item.pricePerM2}</p>
      </div>
    </div>
  );
}

function renderOffer(item: OfferItem, idx: number) {
  const template = item.template ?? "split-right";
  if (template === "price-banner") return <PriceBannerTemplate key={idx} item={item} />;
  if (template === "duo-frame") return <DuoFrameTemplate key={idx} item={item} />;
  if (template === "editorial-left") return <EditorialLeftTemplate key={idx} item={item} />;
  if (template === "tile-dominant") return <TileDominantTemplate key={idx} item={item} />;
  if (template === "hero-focus") return <HeroFocusTemplate key={idx} item={item} />;
  if (template === "catalog-strip") return <CatalogStripTemplate key={idx} item={item} />;
  if (template === "minimal-price") return <MinimalPriceTemplate key={idx} item={item} />;
  if (template === "price-overlay") return <PriceOverlayTemplate key={idx} item={item} />;
  if (template === "clean-card") return <CleanCardTemplate key={idx} item={item} />;
  return <SplitRightTemplate key={idx} item={item} />;
}

export function OffersPrintDocument({
  catalog,
  onlyPageIndex,
}: {
  catalog: OffersCatalog;
  onlyPageIndex?: number;
}) {
  const pages =
    typeof onlyPageIndex === "number" && onlyPageIndex >= 0
      ? catalog.pages.slice(onlyPageIndex, onlyPageIndex + 1)
      : catalog.pages;

  return <div className="offers-root">{pages.map((p, i) => renderOffer(p, i))}</div>;
}
