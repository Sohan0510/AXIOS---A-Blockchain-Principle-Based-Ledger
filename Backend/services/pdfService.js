import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import { buildHashPayload } from "../utils/buildPayload.js";
import { buildMerkleTree } from "../utils/merkleUtil.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ─────────────────── COLOUR PALETTE ─────────────────── */
const C = {
  navy:       "#0C1A3E",
  darkNavy:   "#081230",
  gold:       "#B8860B",
  lightGold:  "#DAA520",
  saffron:    "#FF9933",
  green:      "#138808",
  white:      "#FFFFFF",
  cream:      "#FFFDF5",
  lightGray:  "#F0EFEB",
  midGray:    "#9CA3AF",
  red:        "#C62828",
  darkGreen:  "#0D5C08",
  tableHead:  "#0F1F4B",
  tableStripe:"#F4F6FB",
  sealGold:   "#C9A84C",
};

/* ─────────────────── HELPER: format date ─────────────── */
const fmtDate = (d) => {
  if (!d) return "N/A";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/* ─────────────────── HELPER: rupee format ─────────────── */
const fmtRupee = (v) => {
  if (v == null || v === "") return "N/A";
  return `\u20B9 ${Number(v).toLocaleString("en-IN")}`;
};

/* ═════════════════════════════════════════════════════════
   MAIN EXPORT
   ═════════════════════════════════════════════════════════ */
export const generateLandPDF = (land, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 30, bottom: 30, left: 36, right: 36 },
    bufferPages: true,
    info: {
      Title: `Land Record Certificate — ${land.landId}`,
      Author: "AXIOS Land Registry Management System",
      Subject: "Official Land Record Certificate",
      Keywords: "land record, government, certificate, merkle, blockchain",
    },
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=CERT_${land.landId}_${Date.now()}.pdf`
  );

  doc.pipe(res);

  const M = 36;                          // margin
  const PW = doc.page.width - M * 2;     // printable width
  const PH = doc.page.height;
  const CX = doc.page.width / 2;         // centre X

  /* =====================================================
     DECORATIVE TRIPLE BORDER
  ===================================================== */
  const drawBorders = () => {
    // outer
    doc.lineWidth(2.5).strokeColor(C.navy)
      .rect(14, 14, doc.page.width - 28, PH - 28).stroke();
    // middle (gold)
    doc.lineWidth(0.8).strokeColor(C.gold)
      .rect(18, 18, doc.page.width - 36, PH - 36).stroke();
    // inner
    doc.lineWidth(1.5).strokeColor(C.navy)
      .rect(22, 22, doc.page.width - 44, PH - 44).stroke();

    // corner ornaments — small double-L brackets at each corner
    const corners = [
      { x: 22,                     y: 22,                      dx: 1,  dy: 1  },
      { x: doc.page.width - 22,    y: 22,                      dx: -1, dy: 1  },
      { x: 22,                     y: PH - 22,                 dx: 1,  dy: -1 },
      { x: doc.page.width - 22,    y: PH - 22,                 dx: -1, dy: -1 },
    ];
    corners.forEach(({ x, y, dx, dy }) => {
      const len = 18;
      doc.lineWidth(2).strokeColor(C.gold)
        .moveTo(x, y + dy * len).lineTo(x, y).lineTo(x + dx * len, y).stroke();
      doc.lineWidth(1).strokeColor(C.gold)
        .moveTo(x + dx * 4, y + dy * (len + 4))
        .lineTo(x + dx * 4, y + dy * 4)
        .lineTo(x + dx * (len + 4), y + dy * 4).stroke();
    });
  };

  /* =====================================================
     WATERMARK
  ===================================================== */
  const drawWatermark = () => {
    doc.save();
    doc.opacity(0.035);
    doc.font("Helvetica-Bold").fontSize(54);
    doc.translate(CX, PH / 2);
    doc.rotate(-40);
    doc.fillColor(C.navy)
      .text("OFFICIAL GOVERNMENT RECORD", -260, -30, { align: "center" });
    doc.restore();
  };

  /* =====================================================
     SAFFRON-WHITE-GREEN TRICOLOUR STRIP
  ===================================================== */
  const drawTricolourStrip = (y, width) => {
    const h = 3;
    const third = width / 3;
    doc.rect(M, y, third, h).fill(C.saffron);
    doc.rect(M + third, y, third, h).fill(C.midGray);
    doc.rect(M + third * 2, y, third, h).fill(C.green);
  };

  /* =====================================================
     SECTION HEADER
  ===================================================== */
  const drawSectionHeader = (title, yPos) => {
    const barH = 22;
    // dark navy bar
    doc.rect(M, yPos, PW, barH).fill(C.navy);
    // gold left accent
    doc.rect(M, yPos, 4, barH).fill(C.gold);
    // title
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(C.white)
      .text(title.toUpperCase(), M + 14, yPos + 6, { width: PW - 28 });
    doc.fillColor(C.navy); // reset
    return yPos + barH;
  };

  /* =====================================================
     TABLE HELPERS
  ===================================================== */
  const drawTableRow = (pairs, yPos, opts = {}) => {
    const rowH = opts.rowH || 28;
    const cols = pairs.length;
    const colW = PW / cols;
    const isHeader = opts.isHeader || false;
    const stripe = opts.stripe || false;

    if (isHeader) {
      doc.rect(M, yPos, PW, rowH).fill(C.tableHead);
    } else if (stripe) {
      doc.rect(M, yPos, PW, rowH).fill(C.tableStripe);
    } else {
      doc.rect(M, yPos, PW, rowH).fill(C.white);
    }
    // bottom border
    doc.lineWidth(0.3).strokeColor(C.midGray)
      .moveTo(M, yPos + rowH).lineTo(M + PW, yPos + rowH).stroke();

    pairs.forEach(([label, value], i) => {
      const xPos = M + colW * i + 8;
      const yText = yPos + (rowH > 28 ? 6 : 8);

      if (isHeader) {
        doc.font("Helvetica-Bold").fontSize(7.5).fillColor(C.white)
          .text(label.toUpperCase(), xPos, yText, { width: colW - 16 });
      } else {
        doc.font("Helvetica-Bold").fontSize(7).fillColor(C.midGray)
          .text(label, xPos, yText, { width: colW - 16 });
        doc.font("Helvetica").fontSize(8.5).fillColor(C.navy)
          .text(value || "N/A", xPos, yText + 9, { width: colW - 16 });
      }
    });

    doc.fillColor(C.navy); // reset
    return yPos + rowH;
  };

  /* ═══════════════════════════════════════════════════════
     PAGE 1  —  CERTIFICATE
  ═══════════════════════════════════════════════════════ */

  drawBorders();
  drawWatermark();

  let y = 32;

  /* ── TRICOLOUR STRIP ── */
  drawTricolourStrip(y, PW);
  y += 10;

  /* ── EMBLEM & TITLES ── */
  const logoPath = path.join(__dirname, "../assets/logo1.png");
  try {
    doc.image(logoPath, CX - 28, y, { fit: [56, 56] });
  } catch { /* logo missing — skip gracefully */ }
  y += 60;

  doc.font("Helvetica-Bold").fontSize(11).fillColor(C.navy)
    .text("GOVERNMENT OF INDIA", M, y, { width: PW, align: "center" });
  y += 14;
  doc.font("Helvetica").fontSize(8).fillColor(C.midGray)
    .text("Department of Land Revenue  •  Digital Land Records Division", M, y, { width: PW, align: "center" });
  y += 18;

  /* ── TRICOLOUR ── */
  drawTricolourStrip(y, PW);
  y += 10;

  /* ── CERTIFICATE TITLE ── */
  doc.font("Helvetica-Bold").fontSize(18).fillColor(C.navy)
    .text("LAND RECORD CERTIFICATE", M, y, { width: PW, align: "center" });
  y += 22;
  doc.font("Helvetica").fontSize(8.5).fillColor(C.gold)
    .text("Digitally Verified  •  Blockchain Secured  •  Merkle-Tree Integrity", M, y, { width: PW, align: "center" });
  y += 18;

  /* ── CERTIFICATE NUMBER BAR ── */
  const certBarH = 24;
  doc.rect(M, y, PW, certBarH).fill(C.cream);
  doc.lineWidth(0.5).strokeColor(C.gold).rect(M, y, PW, certBarH).stroke();
  doc.font("Helvetica-Bold").fontSize(8).fillColor(C.navy)
    .text(`Certificate No: AXIOS/${land.landId}/${land.integrity?.version ?? 1}`, M + 10, y + 7);
  doc.font("Helvetica").fontSize(8).fillColor(C.midGray)
    .text(`Date of Issue: ${fmtDate(new Date())}`, M + 10, y + 7, { width: PW - 20, align: "right" });
  y += certBarH + 12;

  /* ═══════════════════════════
     SECTION 1: LAND IDENTITY
  ═══════════════════════════ */
  y = drawSectionHeader("Section I  —  Land Identification", y);

  y = drawTableRow([
    ["Land ID", land.landId || "N/A"],
    ["Survey Number", land.surveyNumber || "N/A"],
    ["Subdivision", land.subdivisionNumber || "N/A"],
    ["Land Type", land.landType || "N/A"],
  ], y);

  y = drawTableRow([
    ["Village", land.village || "N/A"],
    ["Hobli", land.hobli || "N/A"],
    ["Taluk", land.taluk || "N/A"],
    ["District", land.district || "N/A"],
  ], y, { stripe: true });

  y = drawTableRow([
    ["State", land.state || "N/A"],
    ["Usage Type", land.usageType || "N/A"],
    ["Latitude", land.geoLatitude != null ? String(land.geoLatitude) : "N/A"],
    ["Longitude", land.geoLongitude != null ? String(land.geoLongitude) : "N/A"],
  ], y);

  const areaStr = `${land.area?.acres ?? 0} Acres, ${land.area?.guntas ?? 0} Guntas, ${land.area?.sqFt ?? 0} sq.ft`;
  y = drawTableRow([
    ["Total Area", areaStr],
    ["Version", String(land.integrity?.version ?? 1)],
  ], y, { stripe: true });

  y += 8;

  /* ═══════════════════════════
     SECTION 2: OWNERSHIP
  ═══════════════════════════ */
  y = drawSectionHeader("Section II  —  Ownership Details", y);

  y = drawTableRow([
    ["Owner Name", land.owner?.ownerName || "N/A"],
    ["Owner ID (Aadhaar/PAN)", land.owner?.ownerId || "N/A"],
    ["Father / Spouse", land.owner?.fatherSpouseName || "N/A"],
  ], y);

  y = drawTableRow([
    ["Owner Type", land.owner?.ownerType || "N/A"],
    ["Share Percentage", land.owner?.sharePercentage != null ? `${land.owner.sharePercentage}%` : "N/A"],
    ["Contact", land.owner?.contactNumber || "N/A"],
  ], y, { stripe: true });

  y += 8;

  /* ═══════════════════════════
     SECTION 3: TRANSFER & MUTATION
  ═══════════════════════════ */
  y = drawSectionHeader("Section III  —  Transfer & Mutation", y);

  y = drawTableRow([
    ["Transfer Type", land.transfer?.transferType || "N/A"],
    ["Transfer Date", fmtDate(land.transfer?.transferDate)],
    ["Registration No.", land.transfer?.registrationNumber || "N/A"],
    ["Sub-Registrar Office", land.transfer?.subRegistrarOffice || "N/A"],
  ], y);

  y = drawTableRow([
    ["Sale Value", fmtRupee(land.transfer?.saleValue)],
    ["Mutation Status", land.mutation?.status || "N/A"],
    ["Mutation Request", fmtDate(land.mutation?.requestDate)],
    ["Mutation Approved", fmtDate(land.mutation?.approvalDate)],
  ], y, { stripe: true });

  y += 8;

  /* ═══════════════════════════
     SECTION 4: LEGAL & FINANCIAL
  ═══════════════════════════ */
  y = drawSectionHeader("Section IV  —  Legal & Financial Status", y);

  y = drawTableRow([
    ["Court Case", land.legal?.courtCase ? "YES — Active" : "No"],
    ["Case Number", land.legal?.caseNumber || "N/A"],
    ["Case Status", land.legal?.caseStatus || "N/A"],
    ["Dispute Flag", land.disputeFlag ? "FLAGGED" : "Clear"],
  ], y);

  y = drawTableRow([
    ["Loan Active", land.loan?.loanActive ? "YES" : "No"],
    ["Bank Name", land.loan?.bankName || "N/A"],
    ["Loan Amount", fmtRupee(land.loan?.loanAmount)],
    ["Revenue Due", fmtRupee(land.revenue?.landRevenueDue)],
  ], y, { stripe: true });

  y = drawTableRow([
    ["Fraud Risk Score", String(land.fraudRiskScore ?? 0)],
    ["Verification Status", land.verificationStatus || "Unverified"],
  ], y);

  y += 8;

  /* ═══════════════════════════════════════════════════
     SECTION 5: CRYPTOGRAPHIC INTEGRITY
  ═══════════════════════════════════════════════════ */
  y = drawSectionHeader("Section V  —  Cryptographic Integrity Verification", y);

  const payload = buildHashPayload(land);
  const { merkleRoot: recalculatedRoot } = buildMerkleTree(payload);
  const storedRoot = land.integrity?.merkleRoot;
  const integrityOK = recalculatedRoot === storedRoot;

  const intBoxH = 62;
  doc.rect(M, y, PW, intBoxH).fill(integrityOK ? "#F0FFF4" : "#FFF5F5");
  doc.lineWidth(1).strokeColor(integrityOK ? C.green : C.red)
    .rect(M, y, PW, intBoxH).stroke();

  // status badge
  const badgeW = 120, badgeH = 18, badgeX = M + PW - badgeW - 10, badgeY = y + 6;
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 4)
    .fill(integrityOK ? C.green : C.red);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(C.white)
    .text(integrityOK ? "✓  INTEGRITY VALID" : "✗  INTEGRITY TAMPERED", badgeX, badgeY + 5, { width: badgeW, align: "center" });

  // status tick/cross image
  const statusImg = land.disputeFlag ? "wrong1.png" : "tick1.png";
  const statusImgPath = path.join(__dirname, "../assets", statusImg);
  try {
    doc.image(statusImgPath, M + 8, y + 8, { fit: [38, 38] });
  } catch { /* skip */ }

  // merkle root
  doc.font("Helvetica-Bold").fontSize(7).fillColor(C.navy)
    .text("STORED MERKLE ROOT", M + 54, y + 8);
  doc.font("Courier").fontSize(6.5).fillColor(C.navy)
    .text(storedRoot || "N/A", M + 54, y + 19, { width: PW - badgeW - 80 });

  doc.font("Helvetica-Bold").fontSize(7).fillColor(C.navy)
    .text("RECALCULATED ROOT", M + 54, y + 32);
  doc.font("Courier").fontSize(6.5).fillColor(integrityOK ? C.darkGreen : C.red)
    .text(recalculatedRoot || "N/A", M + 54, y + 43, { width: PW - badgeW - 80 });

  y += intBoxH + 10;

  /* ── WITNESS SIGNATURE SUMMARY ── */
  const sigCount = land.integrity?.witnessSignatures?.length ?? 0;
  if (sigCount > 0) {
    doc.font("Helvetica-Bold").fontSize(7).fillColor(C.navy)
      .text(`Witness Signatures: ${sigCount} of 3 nodes verified`, M, y);
    y += 10;
    land.integrity.witnessSignatures.forEach((sig, i) => {
      doc.font("Courier").fontSize(5.5).fillColor(C.midGray)
        .text(`Node ${i + 1} [${sig.witnessUrl || ""}]:  ${(sig.signature || "").substring(0, 64)}...`, M + 8, y);
      y += 8;
    });
    y += 4;
  }

  /* ═══════════════════════════════════════════════════
     FOOTER — SEAL, SIGNATURES, DISCLAIMER
  ═══════════════════════════════════════════════════ */
  // bottom tricolour
  drawTricolourStrip(PH - 72, PW);

  // signature lines
  const sigLineY = PH - 62;
  const sigLineW = 130;
  // left
  doc.lineWidth(0.5).strokeColor(C.navy)
    .moveTo(M + 20, sigLineY).lineTo(M + 20 + sigLineW, sigLineY).stroke();
  doc.font("Helvetica").fontSize(6.5).fillColor(C.midGray)
    .text("Issuing Authority", M + 20, sigLineY + 3, { width: sigLineW, align: "center" });
  // right
  doc.lineWidth(0.5).strokeColor(C.navy)
    .moveTo(M + PW - 20 - sigLineW, sigLineY).lineTo(M + PW - 20, sigLineY).stroke();
  doc.font("Helvetica").fontSize(6.5).fillColor(C.midGray)
    .text("Digital Seal — AXIOS LRMS", M + PW - 20 - sigLineW, sigLineY + 3, { width: sigLineW, align: "center" });

  // centre seal circle
  const sealR = 22;
  doc.lineWidth(1.5).strokeColor(C.sealGold)
    .circle(CX, sigLineY - 8, sealR).stroke();
  doc.lineWidth(0.5).strokeColor(C.sealGold)
    .circle(CX, sigLineY - 8, sealR - 3).stroke();
  doc.font("Helvetica-Bold").fontSize(5).fillColor(C.sealGold)
    .text("AXIOS", CX - 14, sigLineY - 14, { width: 28, align: "center" });
  doc.font("Helvetica").fontSize(4).fillColor(C.sealGold)
    .text("VERIFIED", CX - 14, sigLineY - 7, { width: 28, align: "center" });

  // final disclaimer
  doc.font("Helvetica").fontSize(5).fillColor(C.midGray)
    .text(
      "This certificate has been digitally generated by the AXIOS Land Registry Management System. " +
      "Integrity is verified through SHA-256 Merkle tree hashing and RSA-2048 witness node consensus. " +
      "This document is not valid without the corresponding blockchain entry. Any unauthorized alteration renders this certificate void.",
      M, PH - 42, { width: PW, align: "center" }
    );

  doc.end();
};
