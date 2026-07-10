import type { CSSProperties } from "react";
import {
  parseFormatAspectRatio,
  resolveTileImageDisplay,
  tileImageDisplayFromItem,
  tileImageObjectFitClass,
  tileImageStyle,
  type TileImageDisplayOverrides,
} from "@/lib/tileImageDisplay";
import type { OfferItem, OfferTemplate } from "@/lib/offers-types";

type TileImageProps = {
  src: string;
  alt: string;
  template: OfferTemplate;
  format?: string;
  /** Si true, el marco interior respeta el aspect ratio del formato (recomendado). */
  useFormatFrame?: boolean;
  item?: Pick<
    OfferItem,
    "tileRotationDegrees" | "tileObjectFit" | "tileObjectPosition" | "tileZoomPercent" | "format"
  >;
  overrides?: TileImageDisplayOverrides;
  className?: string;
  imgClassName?: string;
};

/** Encaja un rectángulo con aspect ratio `ar` dentro de un contenedor 100%×100%. */
export function formatFrameStyle(aspectRatio: number): CSSProperties {
  const ar = aspectRatio;
  return {
    aspectRatio: ar,
    width: `min(100cqw, calc(100cqh * ${ar}))`,
    height: `min(100cqh, calc(100cqw / ${ar}))`,
  };
}

export function TileImage({
  src,
  alt,
  template,
  format,
  useFormatFrame = true,
  item,
  overrides,
  className,
  imgClassName,
}: TileImageProps) {
  const resolved = resolveTileImageDisplay(template, {
    ...tileImageDisplayFromItem(item ?? {}),
    ...overrides,
  });
  const objectFitClass = tileImageObjectFitClass(resolved.objectFit);
  const imgStyle = tileImageStyle(
    resolved.rotationDegrees,
    resolved.zoomPercent,
    resolved.objectPosition,
  );

  const formatStr = format ?? item?.format;
  const aspectRatio = useFormatFrame ? parseFormatAspectRatio(formatStr) : undefined;

  const imgClass = `${objectFitClass} h-full w-full${imgClassName ? ` ${imgClassName}` : ""}`;

  if (aspectRatio) {
    return (
      <div
        className={`@container size-full min-h-0 min-w-0 overflow-hidden ${className ?? ""}`}
        style={{ containerType: "size" }}
      >
        <div className="flex size-full min-h-0 items-center justify-center">
          <div className="relative shrink-0 overflow-hidden" style={formatFrameStyle(aspectRatio)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className={imgClass} style={imgStyle} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`size-full min-h-0 min-w-0 overflow-hidden ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={imgClass} style={imgStyle} />
    </div>
  );
}
