import "server-only";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { BulkOfferDetail } from "@/lib/bulk-offers-types";
import { formatOfferSummaryForPdf, loadLineImages } from "@/lib/export-bulk-offer-shared";
import { brandLogoDataUrl, formatOfferDocumentMeta, EXPORT_HEADER_LOGO_HEIGHT_MM, LOGO_ASPECT, PRACTIKA_BRAND } from "@/lib/practika-brand-export";

const rgb = (color: (typeof PRACTIKA_BRAND)[keyof typeof PRACTIKA_BRAND]["rgb"]) =>
  [...color] as [number, number, number];

const MARGIN = 14;
const IMAGE_COL_WIDTH = 16;

function drawBrandHeader(doc: jsPDF, offer: BulkOfferDetail) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const bannerH = 24;

  doc.setFillColor(...rgb(PRACTIKA_BRAND.navy.rgb));
  doc.rect(0, 0, pageWidth, bannerH, "F");

  const logo = brandLogoDataUrl("white");
  if (logo) {
    const logoH = EXPORT_HEADER_LOGO_HEIGHT_MM;
    const logoW = logoH * LOGO_ASPECT;
    const logoY = (bannerH - logoH) / 2;
    doc.addImage(logo, "PNG", MARGIN, logoY, logoW, logoH);
  } else {
    doc.setTextColor(...rgb(PRACTIKA_BRAND.white.rgb));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("PRACTIKA", MARGIN, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("cerámica.", MARGIN, 17);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...rgb(PRACTIKA_BRAND.white.rgb));
  doc.text("LISTA DE OFERTA", pageWidth - MARGIN, 14, { align: "right" });

  doc.setFillColor(...rgb(PRACTIKA_BRAND.accent.rgb));
  doc.rect(0, bannerH, pageWidth, 1.5, "F");

  doc.setTextColor(...rgb(PRACTIKA_BRAND.navy.rgb));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(offer.name, MARGIN, bannerH + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...rgb(PRACTIKA_BRAND.muted.rgb));
  doc.text(formatOfferDocumentMeta(offer.createdAt, offer.lineCount), MARGIN, bannerH + 18);

  doc.setDrawColor(...rgb(PRACTIKA_BRAND.navy.rgb));
  doc.setLineWidth(0.4);
  doc.line(MARGIN, bannerH + 22, pageWidth - MARGIN, bannerH + 22);

  return bannerH + 26;
}

export async function buildBulkOfferPdf(offer: BulkOfferDetail): Promise<Buffer> {
  const lines = await formatOfferSummaryForPdf(offer);
  const images = await loadLineImages(offer);

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const tableStartY = drawBrandHeader(doc, offer);
  const webLinkColIndex = 7;

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: MARGIN, right: MARGIN, bottom: 12 },
    head: [["", "Serie", "Material", "Formato", "Color", "m²", "€/m²", "Enlace web", "Comentarios"]],
    body: lines.map((line) => [
      "",
      line.series,
      line.material,
      line.format,
      line.color,
      line.squareMeters,
      line.pricePerM2,
      line.webUrl ? "Ver en web" : "",
      line.comments,
    ]),
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: "linebreak",
      valign: "middle",
      minCellHeight: 14,
      textColor: rgb(PRACTIKA_BRAND.text.rgb),
      lineColor: rgb(PRACTIKA_BRAND.border.rgb),
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: rgb(PRACTIKA_BRAND.navyBanner.rgb),
      textColor: rgb(PRACTIKA_BRAND.white.rgb),
      fontStyle: "bold",
      halign: "center",
      minCellHeight: 10,
    },
    bodyStyles: {
      minCellHeight: 14,
    },
    alternateRowStyles: {
      fillColor: rgb(PRACTIKA_BRAND.rowAlt.rgb),
    },
    columnStyles: {
      0: { cellWidth: IMAGE_COL_WIDTH, minCellHeight: 14 },
      1: { cellWidth: 28, fontStyle: "bold" },
      5: { halign: "right" },
      6: { halign: "right" },
      7: { cellWidth: 24, halign: "center", valign: "middle", textColor: rgb(PRACTIKA_BRAND.navy.rgb), fontStyle: "bold" },
      8: { cellWidth: 36 },
    },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === webLinkColIndex) {
        const url = lines[data.row.index]?.webUrl;
        if (url) {
          doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url });
        }
        return;
      }

      if (data.section !== "body" || data.column.index !== 0) return;
      const image = images[data.row.index];
      if (!image) return;

      const pad = 1;
      const maxSize = Math.min(data.cell.width - pad * 2, data.cell.height - pad * 2, 12);
      if (maxSize <= 0) return;

      const format = image.includes("image/png") ? "PNG" : "JPEG";
      const x = data.cell.x + (data.cell.width - maxSize) / 2;
      const y = data.cell.y + (data.cell.height - maxSize) / 2;
      doc.addImage(image, format, x, y, maxSize, maxSize);
    },
  });

  return Buffer.from(doc.output("arraybuffer"));
}
