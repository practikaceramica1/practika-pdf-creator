import "server-only";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { BulkOfferDetail } from "@/lib/bulk-offers-types";
import { lineTotal } from "@/lib/bulk-offers-types";
import {
  formatOfferSummaryForPdf,
  loadLineImages,
} from "@/lib/export-bulk-offer-shared";
import {
  brandLogoDataUrl,
  formatOfferDocumentDate,
  formatOfferDocumentMeta,
  LOGO_ASPECT,
  PRACTIKA_BRAND,
} from "@/lib/practika-brand-export";

const rgb = (color: (typeof PRACTIKA_BRAND)[keyof typeof PRACTIKA_BRAND]["rgb"]) =>
  [...color] as [number, number, number];

const MARGIN = 14;

function drawBrandHeader(doc: jsPDF, offer: BulkOfferDetail) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const bannerH = 24;

  doc.setFillColor(...rgb(PRACTIKA_BRAND.navy.rgb));
  doc.rect(0, 0, pageWidth, bannerH, "F");

  const logo = brandLogoDataUrl("white");
  if (logo) {
    const logoH = 12;
    const logoW = logoH * LOGO_ASPECT;
    doc.addImage(logo, "PNG", MARGIN, 6, logoW, logoH);
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

function drawBrandFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(...rgb(PRACTIKA_BRAND.navy.rgb));
  doc.rect(0, pageHeight - 10, pageWidth, 10, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(184, 192, 220);
  doc.text("practikaceramica.com  ·  Practika Cerámica", pageWidth / 2, pageHeight - 4.5, { align: "center" });
}

export async function buildBulkOfferPdf(offer: BulkOfferDetail): Promise<Buffer> {
  const lines = formatOfferSummaryForPdf(offer);
  const images = await loadLineImages(offer);
  const grandTotal = offer.lines.reduce((sum, line) => sum + (lineTotal(line) ?? 0), 0);

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const tableStartY = drawBrandHeader(doc, offer);

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: MARGIN, right: MARGIN, bottom: 18 },
    head: [["", "Serie", "Material", "Formato", "Color", "m²", "€/m²", "Total €", "Comentarios"]],
    body: lines.map((line) => [
      "",
      line.series,
      line.material,
      line.format,
      line.color,
      line.squareMeters,
      line.pricePerM2,
      line.total,
      line.comments,
    ]),
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      overflow: "linebreak",
      valign: "middle",
      textColor: rgb(PRACTIKA_BRAND.text.rgb),
      lineColor: rgb(PRACTIKA_BRAND.border.rgb),
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: rgb(PRACTIKA_BRAND.navyBanner.rgb),
      textColor: rgb(PRACTIKA_BRAND.white.rgb),
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: rgb(PRACTIKA_BRAND.rowAlt.rgb),
    },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 28, fontStyle: "bold" },
      5: { halign: "right" },
      6: { halign: "right" },
      7: { halign: "right", fontStyle: "bold", textColor: rgb(PRACTIKA_BRAND.navy.rgb) },
      8: { cellWidth: 42 },
    },
    didDrawCell: (data) => {
      if (data.section !== "body" || data.column.index !== 0) return;
      const image = images[data.row.index];
      if (!image) return;
      const format = image.includes("image/png") ? "PNG" : "JPEG";
      doc.addImage(image, format, data.cell.x + 1.5, data.cell.y + 1.5, 14, 14);
    },
    didDrawPage: () => {
      drawBrandFooter(doc);
    },
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? tableStartY + 40;
  const summaryY = Math.min(finalY + 8, pageHeight - 24);
  const summaryW = 78;
  const summaryX = pageWidth - MARGIN - summaryW;

  doc.setFillColor(...rgb(PRACTIKA_BRAND.highlight.rgb));
  doc.roundedRect(summaryX, summaryY, summaryW, 18, 2, 2, "F");
  doc.setDrawColor(...rgb(PRACTIKA_BRAND.border.rgb));
  doc.setLineWidth(0.2);
  doc.roundedRect(summaryX, summaryY, summaryW, 18, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...rgb(PRACTIKA_BRAND.navy.rgb));
  doc.text("TOTAL OFERTA", summaryX + 5, summaryY + 7);

  doc.setFillColor(...rgb(PRACTIKA_BRAND.accent.rgb));
  doc.roundedRect(summaryX + summaryW - 38, summaryY + 9, 33, 7, 1.5, 1.5, "F");
  doc.setFontSize(10);
  doc.text(
    `${grandTotal.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
    summaryX + summaryW - 5,
    summaryY + 14,
    { align: "right" },
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...rgb(PRACTIKA_BRAND.muted.rgb));
  doc.text(`Generado el ${formatOfferDocumentDate(new Date().toISOString())}`, summaryX + 5, summaryY + 14);

  return Buffer.from(doc.output("arraybuffer"));
}
