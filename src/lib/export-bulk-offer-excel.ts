import "server-only";

import ExcelJS from "exceljs";
import type { BulkOfferDetail } from "@/lib/bulk-offers-types";
import { lineTotal, resolveLineImage } from "@/lib/bulk-offers-types";

const NAVY = "FF1A1F3D";
const ACCENT = "FFF59E0B";
const LIGHT = "FFE5ECFA";

async function fetchImageBuffer(url: string): Promise<{ buffer: Buffer; extension: "jpeg" | "png" | "gif" } | null> {
  if (!url) return null;
  try {
    if (url.startsWith("data:")) {
      const match = url.match(/^data:image\/(jpeg|jpg|png|gif);base64,(.+)$/i);
      if (!match) return null;
      const ext = match[1].toLowerCase() === "jpg" ? "jpeg" : (match[1].toLowerCase() as "jpeg" | "png" | "gif");
      return { buffer: Buffer.from(match[2], "base64"), extension: ext };
    }
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    const extension = contentType.includes("png") ? "png" : contentType.includes("gif") ? "gif" : "jpeg";
    const arrayBuffer = await res.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), extension };
  } catch {
    return null;
  }
}

function formatMoney(value: number | null): string {
  if (value == null) return "";
  return value.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatNumber(value: number | null): string {
  if (value == null) return "";
  return value.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export async function buildBulkOfferExcel(offer: BulkOfferDetail): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Practika PDF Creator";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Oferta", {
    views: [{ state: "frozen", ySplit: 5 }],
  });

  sheet.mergeCells("A1:I1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "PRACTIKA cerámica.";
  titleCell.font = { name: "Arial", size: 20, bold: true, color: { argb: NAVY } };
  titleCell.alignment = { vertical: "middle" };

  sheet.mergeCells("A2:I2");
  const subtitleCell = sheet.getCell("A2");
  subtitleCell.value = offer.name;
  subtitleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: NAVY } };

  sheet.mergeCells("A3:I3");
  const metaCell = sheet.getCell("A3");
  metaCell.value = `Creada el ${new Date(offer.createdAt).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })} · ${offer.lineCount} líneas`;
  metaCell.font = { name: "Arial", size: 10, color: { argb: "FF666666" } };

  sheet.getRow(4).height = 6;

  const headerRow = sheet.getRow(5);
  headerRow.values = ["Imagen", "Serie", "Material", "Formato", "Color", "m²", "€/m²", "Total €", "Comentarios"];
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: NAVY } },
      left: { style: "thin", color: { argb: NAVY } },
      bottom: { style: "thin", color: { argb: NAVY } },
      right: { style: "thin", color: { argb: NAVY } },
    };
  });

  sheet.columns = [
    { key: "image", width: 14 },
    { key: "series", width: 18 },
    { key: "material", width: 20 },
    { key: "format", width: 16 },
    { key: "color", width: 16 },
    { key: "m2", width: 10 },
    { key: "price", width: 10 },
    { key: "total", width: 12 },
    { key: "comments", width: 34 },
  ];

  let rowIndex = 6;
  for (const line of offer.lines) {
    const row = sheet.getRow(rowIndex);
    row.height = 72;
    row.getCell(2).value = line.seriesName;
    row.getCell(3).value = line.material;
    row.getCell(4).value = line.formatDisplay || line.formatLabel;
    row.getCell(5).value = line.colorName;
    row.getCell(6).value = line.squareMeters ?? "";
    row.getCell(7).value = line.pricePerM2 ?? "";
    row.getCell(8).value = lineTotal(line) ?? "";
    row.getCell(9).value = line.comments;

    for (let col = 2; col <= 9; col++) {
      const cell = row.getCell(col);
      cell.font = { name: "Arial", size: 10, color: { argb: "FF222222" } };
      cell.alignment = { vertical: "middle", horizontal: col >= 6 && col <= 8 ? "right" : "left", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
      if (rowIndex % 2 === 0) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } };
      }
    }

    row.getCell(6).numFmt = "#,##0.00";
    row.getCell(7).numFmt = '#,##0.00" €"';
    row.getCell(8).numFmt = '#,##0.00" €"';

    const imageUrl = resolveLineImage(line);
    const image = await fetchImageBuffer(imageUrl);
    if (image) {
      const imageId = workbook.addImage({ buffer: image.buffer as unknown as ExcelJS.Buffer, extension: image.extension });
      sheet.addImage(imageId, {
        tl: { col: 0.15, row: rowIndex - 1 + 0.1 },
        ext: { width: 72, height: 72 },
      });
    }

    rowIndex++;
  }

  const totalRow = sheet.getRow(rowIndex + 1);
  const grandTotal = offer.lines.reduce((sum, line) => sum + (lineTotal(line) ?? 0), 0);
  totalRow.getCell(7).value = "TOTAL";
  totalRow.getCell(7).font = { name: "Arial", size: 11, bold: true, color: { argb: NAVY } };
  totalRow.getCell(8).value = grandTotal;
  totalRow.getCell(8).numFmt = '#,##0.00" €"';
  totalRow.getCell(8).font = { name: "Arial", size: 11, bold: true, color: { argb: NAVY } };
  totalRow.getCell(8).fill = { type: "pattern", pattern: "solid", fgColor: { argb: ACCENT } };

  sheet.getCell(`A${rowIndex + 3}`).value = "practikaceramica.com";
  sheet.getCell(`A${rowIndex + 3}`).font = { name: "Arial", size: 9, italic: true, color: { argb: "FF888888" } };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/[^\w\s-áéíóúñÁÉÍÓÚÑ]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80) || "oferta-practika";
}

export function formatOfferSummaryForPdf(offer: BulkOfferDetail) {
  return offer.lines.map((line) => ({
    series: line.seriesName,
    material: line.material,
    format: line.formatDisplay || line.formatLabel,
    color: line.colorName,
    squareMeters: formatNumber(line.squareMeters),
    pricePerM2: formatMoney(line.pricePerM2),
    total: formatMoney(lineTotal(line)),
    comments: line.comments,
    image: resolveLineImage(line),
  }));
}
