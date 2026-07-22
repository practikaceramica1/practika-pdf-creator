import "server-only";

import ExcelJS from "exceljs";
import type { BulkOfferDetail } from "@/lib/bulk-offers-types";
import { lineTotal, resolveLineImage } from "@/lib/bulk-offers-types";
import { fetchImageBuffer } from "@/lib/export-bulk-offer-shared";
import {
  EXPORT_FONT,
  formatOfferDocumentMeta,
  loadBrandLogoBuffer,
  LOGO_ASPECT,
  PRACTIKA_BRAND,
} from "@/lib/practika-brand-export";

export { formatOfferSummaryForPdf, sanitizeFilename } from "@/lib/export-bulk-offer-shared";

const LAST_COL = 9;
const HEADER_ROW = 9;
const DATA_START = 10;

function fillRange(sheet: ExcelJS.Worksheet, range: string, argb: string) {
  const [start, end] = range.split(":");
  const startCell = sheet.getCell(start);
  const endCell = sheet.getCell(end || start);
  for (let row = Number(startCell.row); row <= Number(endCell.row); row++) {
    for (let col = Number(startCell.col); col <= Number(endCell.col); col++) {
      sheet.getCell(row, col).fill = { type: "pattern", pattern: "solid", fgColor: { argb } };
    }
  }
}

function thinBorder(cell: ExcelJS.Cell, color: string = PRACTIKA_BRAND.border.argb) {
  cell.border = {
    top: { style: "thin", color: { argb: color } },
    left: { style: "thin", color: { argb: color } },
    bottom: { style: "thin", color: { argb: color } },
    right: { style: "thin", color: { argb: color } },
  };
}

export async function buildBulkOfferExcel(offer: BulkOfferDetail): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Practika Cerámica";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Oferta", {
    views: [{ state: "frozen", ySplit: HEADER_ROW, showGridLines: false }],
    properties: { defaultRowHeight: 16 },
  });

  sheet.columns = [
    { width: 14 },
    { width: 18 },
    { width: 20 },
    { width: 16 },
    { width: 22 },
    { width: 11 },
    { width: 11 },
    { width: 13 },
    { width: 34 },
  ];

  sheet.properties.defaultColWidth = 12;

  // Banner navy
  sheet.mergeCells(`A1:I4`);
  fillRange(sheet, "A1:I4", PRACTIKA_BRAND.navy.argb);
  sheet.getRow(1).height = 18;
  sheet.getRow(2).height = 18;
  sheet.getRow(3).height = 18;
  sheet.getRow(4).height = 10;

  const logo = loadBrandLogoBuffer("white");
  if (logo) {
    const logoId = workbook.addImage({ buffer: logo as unknown as ExcelJS.Buffer, extension: "png" });
    const logoHeightPx = 54;
    const logoWidthPx = Math.round(logoHeightPx * LOGO_ASPECT);
    sheet.addImage(logoId, {
      tl: { col: 0.2, row: 0.15 },
      ext: { width: logoWidthPx, height: logoHeightPx },
    });
  } else {
    const brandCell = sheet.getCell("A2");
    brandCell.value = "PRACTIKA";
    brandCell.font = { name: EXPORT_FONT, size: 22, bold: true, color: { argb: PRACTIKA_BRAND.white.argb } };
    sheet.getCell("A3").value = "cerámica.";
    sheet.getCell("A3").font = { name: EXPORT_FONT, size: 11, color: { argb: "FFB8C0DC" } };
  }

  sheet.mergeCells("F1:I3");
  const docTypeCell = sheet.getCell("F2");
  docTypeCell.value = "LISTA DE OFERTA";
  docTypeCell.font = { name: EXPORT_FONT, size: 16, bold: true, color: { argb: PRACTIKA_BRAND.white.argb } };
  docTypeCell.alignment = { horizontal: "right", vertical: "middle" };

  // Accent bar
  sheet.mergeCells("A5:I5");
  fillRange(sheet, "A5:I5", PRACTIKA_BRAND.accent.argb);
  sheet.getRow(5).height = 5;

  // Title block
  sheet.mergeCells("A6:I6");
  const titleCell = sheet.getCell("A6");
  titleCell.value = offer.name;
  titleCell.font = { name: EXPORT_FONT, size: 18, bold: true, color: { argb: PRACTIKA_BRAND.navy.argb } };
  titleCell.alignment = { vertical: "middle" };
  sheet.getRow(6).height = 28;

  sheet.mergeCells("A7:I7");
  const metaCell = sheet.getCell("A7");
  metaCell.value = formatOfferDocumentMeta(offer.createdAt, offer.lineCount);
  metaCell.font = { name: EXPORT_FONT, size: 10, color: { argb: PRACTIKA_BRAND.muted.argb } };
  sheet.getRow(7).height = 18;
  sheet.getRow(8).height = 8;

  const headerRow = sheet.getRow(HEADER_ROW);
  headerRow.values = ["Imagen", "Serie", "Material", "Formato", "Color", "m²", "€/m²", "Total €", "Comentarios"];
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRACTIKA_BRAND.navyBanner.argb } };
    cell.font = { name: EXPORT_FONT, size: 10, bold: true, color: { argb: PRACTIKA_BRAND.white.argb } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    thinBorder(cell, PRACTIKA_BRAND.navy.argb);
  });

  let rowIndex = DATA_START;
  for (const line of offer.lines) {
    const row = sheet.getRow(rowIndex);
    row.height = 74;
    row.getCell(2).value = line.seriesName;
    row.getCell(3).value = line.material;
    row.getCell(4).value = line.formatDisplay || line.formatLabel;
    row.getCell(5).value = line.colorName;
    row.getCell(6).value = line.squareMeters ?? "";
    row.getCell(7).value = line.pricePerM2 ?? "";
    row.getCell(8).value = lineTotal(line) ?? "";
    row.getCell(9).value = line.comments;

    const alt = rowIndex % 2 === 0;
    for (let col = 1; col <= LAST_COL; col++) {
      const cell = row.getCell(col);
      if (col === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRACTIKA_BRAND.white.argb } };
      } else {
        cell.font = {
          name: EXPORT_FONT,
          size: 10,
          bold: col === 2 || col === 8,
          color: { argb: col === 8 ? PRACTIKA_BRAND.navy.argb : PRACTIKA_BRAND.text.argb },
        };
        cell.alignment = {
          vertical: "middle",
          horizontal: col >= 6 && col <= 8 ? "right" : "left",
          wrapText: true,
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: alt ? PRACTIKA_BRAND.rowAlt.argb : PRACTIKA_BRAND.white.argb },
        };
        thinBorder(cell);
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
        tl: { col: 0.12, row: rowIndex - 1 + 0.12 },
        ext: { width: 68, height: 68 },
      });
    }

    rowIndex++;
  }

  const grandTotal = offer.lines.reduce((sum, line) => sum + (lineTotal(line) ?? 0), 0);
  const summaryStart = rowIndex + 1;
  sheet.getRow(summaryStart).height = 10;

  sheet.mergeCells(`F${summaryStart + 1}:G${summaryStart + 1}`);
  sheet.mergeCells(`H${summaryStart + 1}:I${summaryStart + 1}`);

  const totalLabelCell = sheet.getCell(`F${summaryStart + 1}`);
  totalLabelCell.value = "TOTAL OFERTA";
  totalLabelCell.font = { name: EXPORT_FONT, size: 11, bold: true, color: { argb: PRACTIKA_BRAND.navy.argb } };
  totalLabelCell.alignment = { horizontal: "right", vertical: "middle" };
  totalLabelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRACTIKA_BRAND.highlight.argb } };
  thinBorder(totalLabelCell);

  const totalValueCell = sheet.getCell(`H${summaryStart + 1}`);
  totalValueCell.value = grandTotal;
  totalValueCell.numFmt = '#,##0.00" €"';
  totalValueCell.font = { name: EXPORT_FONT, size: 12, bold: true, color: { argb: PRACTIKA_BRAND.navy.argb } };
  totalValueCell.alignment = { horizontal: "right", vertical: "middle" };
  totalValueCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRACTIKA_BRAND.accent.argb } };
  thinBorder(totalValueCell);
  sheet.getRow(summaryStart + 1).height = 24;

  const footerRow = summaryStart + 3;
  sheet.mergeCells(`A${footerRow}:I${footerRow}`);
  fillRange(sheet, `A${footerRow}:I${footerRow}`, PRACTIKA_BRAND.navy.argb);
  sheet.getRow(footerRow).height = 22;
  const footerCell = sheet.getCell(`A${footerRow}`);
  footerCell.value = "practikaceramica.com  ·  Practika Cerámica";
  footerCell.font = { name: EXPORT_FONT, size: 9, color: { argb: "FFB8C0DC" } };
  footerCell.alignment = { horizontal: "center", vertical: "middle" };

  sheet.pageSetup = {
    paperSize: 9,
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
