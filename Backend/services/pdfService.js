import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import buildHashPayload from "../utils/buildPayload.js";
import { buildMerkleTree } from "../utils/merkleUtil.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateLandPDF = (land, res) => {
  const doc = new PDFDocument({
    margin: 40,
    layout: "landscape"
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Land_${land.landId}.pdf`
  );

  doc.pipe(res);

  const margin = 40;
  const pageWidth = doc.page.width - margin * 2;
  const startX = margin;

  /* =====================================================
     HEADER SECTION
  ===================================================== */

  const headerHeight = 120;
  const headerY = 40;

  doc.rect(startX, headerY, pageWidth, headerHeight).stroke();

  // LOGO
  const logoPath = path.join(__dirname, "../assets/logo1.png");
  doc.image(logoPath, startX + 15, headerY + 15, {
    fit: [180, 90]
  });

  // STATUS IMAGE (Based on disputeFlag)
  const statusImage = land.disputeFlag
    ? "wrong1.png"
    : "tick1.png";

  const statusImagePath = path.join(__dirname, "../assets", statusImage);

  doc.image(
    statusImagePath,
    startX + pageWidth - 140,
    headerY + 15,
    {
      fit: [120, 90]
    }
  );

  // TITLE
  doc
    .font("Helvetica-Bold")
    .fontSize(26)
    .text(
      "Government Land Record Certificate",
      startX + 220,
      headerY + 45,
      {
        width: pageWidth - 440,
        align: "center"
      }
    );

  /* =====================================================
     TABLE SECTION
  ===================================================== */

  let y = headerY + headerHeight + 30;

  const drawRow = (cols) => {
    const rowHeight = 30;

    doc.rect(startX, y, pageWidth, rowHeight).stroke();

    const colWidth = pageWidth / cols.length;

    cols.forEach((item, i) => {
      if (!item) return;

      const xPos = startX + colWidth * i + 10;
      const yPos = y + 9;

      const [label, value] = item.split(": ");

      // Bold label
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(label + ": ", xPos, yPos, { continued: true });

      // Normal value
      doc
        .font("Helvetica")
        .fontSize(10)
        .text(value || "", { continued: false });
    });

    y += rowHeight;
  };

  const areaFormatted = `${land.area?.acres ?? 0}A ${land.area?.guntas ?? 0}G ${land.area?.sqFt ?? 0}sqft`;

  drawRow([
    `Land ID: ${land.landId || "N/A"}`,
    `Survey No: ${land.surveyNumber || "N/A"}`,
    `Land Type: ${land.landType || "N/A"}`,
    `Village: ${land.village || "N/A"}`
  ]);

  drawRow([
    `Taluk: ${land.taluk || "N/A"}`,
    `District: ${land.district || "N/A"}`,
    `State: ${land.state || "N/A"}`,
    `Subdivision: ${land.subdivisionNumber || "N/A"}`
  ]);

  drawRow([
    `Area: ${areaFormatted}`,
    `Latitude: ${land.geoLatitude ?? "N/A"}`,
    `Longitude: ${land.geoLongitude ?? "N/A"}`,
    ""
  ]);

  drawRow([
    `Owner: ${land.owner?.ownerName || "N/A"}`,
    `Owner Type: ${land.owner?.ownerType || "N/A"}`,
    `Share %: ${land.owner?.sharePercentage ?? "N/A"}%`,
    `Owner ID: ${land.owner?.ownerId || "N/A"}`
  ]);

  drawRow([
    `Transfer Type: ${land.transfer?.transferType || "N/A"}`,
    `Transfer Date: ${
      land.transfer?.transferDate
        ? new Date(land.transfer.transferDate).toLocaleDateString()
        : "N/A"
    }`,
    `Reg No: ${land.transfer?.registrationNumber || "N/A"}`,
    `Sub Registrar: ${land.transfer?.subRegistrarOffice || "N/A"}`
  ]);

  drawRow([
    `Mutation Status: ${land.mutation?.status || "N/A"}`,
    `Loan Active: ${land.loan?.loanActive ? "Yes" : "No"}`,
    `Bank: ${land.loan?.bankName || "N/A"}`,
    `Loan Amount: ${land.loan?.loanAmount ?? "N/A"}`
  ]);

  drawRow([
    `Court Case: ${land.legal?.courtCase ? "Yes" : "No"}`,
    `Case No: ${land.legal?.caseNumber || "N/A"}`,
    `Case Status: ${land.legal?.caseStatus || "N/A"}`,
    `Revenue Due: ${land.revenue?.landRevenueDue ?? 0}`
  ]);

  drawRow([
    `Verification Status: ${land.verificationStatus || "Unverified"}`,
    `Fraud Score: ${land.fraudRiskScore ?? 0}`,
    `Dispute Flag: ${land.disputeFlag ? "Yes" : "No"}`,
    ""
  ]);

  /* =====================================================
     INTEGRITY SECTION
  ===================================================== */

  y += 25;

  doc.font("Helvetica-Bold").fontSize(14).text("Integrity Verification", startX, y);
  y += 20;

  const integrityBoxHeight = 60;

  doc.rect(startX, y, pageWidth, integrityBoxHeight).stroke();

  const payload = buildHashPayload(land);
  const { merkleRoot: recalculatedRoot } = buildMerkleTree(payload);

  const storedRoot = land.integrity?.merkleRoot;
  const integrityVerified = recalculatedRoot === storedRoot;

  doc.font("Helvetica-Bold").fontSize(9).text("Merkle Root:", startX + 10, y + 10);

  doc.font("Helvetica").text(storedRoot || "N/A", startX + 10, y + 25, {
    width: pageWidth - 20
  });

  doc.font("Helvetica-Bold").fontSize(11).text(
    `Integrity Status: ${integrityVerified ? "VALID" : "TAMPERED"}`,
    startX + 10,
    y + 45
  );

  y += integrityBoxHeight + 20;

  doc.end();
};