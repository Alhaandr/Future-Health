const fs = require('fs');
const path = require('path');

// Colors
const TEAL = '1A6B5F';
const TEAL_LIGHT = 'E6F4F1';
const TEAL_DARK = '0F4C42';
const TEAL_BORDER = '80C2B6';
const DARK = '2D2421';
const MUTED = '6B5E57';
const WHITE = 'FFFFFF';
const CREAM = 'F7F4EE';
const ACCENT_AMBER = 'D97706';
const ACCENT_RED = 'C25953';
const BORDER_COLOR = 'D6CEC5';
const GREEN = '2E7D32';

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function makeParagraph(runs, options = {}) {
  const { align = 'l', bullet = false, spaceBefore = 0, spaceAfter = 40000, lineSpacing = null } = options;
  let pPr = `<a:pPr algn="${align}">`;
  if (spaceBefore > 0) pPr += `<a:spcBef><a:spcPts val="${spaceBefore}"/></a:spcBef>`;
  if (spaceAfter > 0) pPr += `<a:spcAft><a:spcPts val="${spaceAfter}"/></a:spcAft>`;
  if (lineSpacing) pPr += `<a:lnSpc><a:spcPts val="${lineSpacing}"/></a:lnSpc>`;
  if (!bullet) {
    pPr += `<a:buNone/>`;
  } else {
    pPr += `<a:buFont typeface="Arial"/><a:buChar char="•"/>`;
  }
  pPr += `</a:pPr>`;

  let runsXml = '';
  for (const r of runs) {
    const text = escapeXml(r.text);
    const sz = r.sz || 1100;
    const b = r.b ? ' b="1"' : '';
    const i = r.i ? ' i="1"' : '';
    const color = r.color || DARK;
    runsXml += `<a:r><a:rPr lang="en-GB" sz="${sz}"${b}${i}><a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:latin typeface="Outfit"/><a:cs typeface="Outfit"/></a:rPr><a:t>${text}</a:t></a:r>`;
  }
  return `<a:p>${pPr}${runsXml}</a:p>`;
}

function makeCard(id, x, y, cx, cy, paragraphs, options = {}) {
  const {
    bgColor = CREAM,
    borderColor = BORDER_COLOR,
    borderWidth = 12700,
    round = true,
    padding = { t: 100000, b: 100000, l: 140000, r: 140000 }
  } = options;

  const prst = round ? 'roundRect' : 'rect';
  const geomAdj = round ? '<a:avLst><a:gd name="adj" fmla="val 2000"/></a:avLst>' : '<a:avLst/>';
  const bodyXml = paragraphs.join('');

  return `
<p:sp>
  <p:nvSpPr>
    <p:cNvPr id="${id}" name="Card_${id}"/>
    <p:cNvSpPr/>
    <p:nvPr/>
  </p:nvSpPr>
  <p:spPr>
    <a:xfrm>
      <a:off x="${x}" y="${y}"/>
      <a:ext cx="${cx}" cy="${cy}"/>
    </a:xfrm>
    <a:prstGeom prst="${prst}">${geomAdj}</a:prstGeom>
    <a:solidFill><a:srgbClr val="${bgColor}"/></a:solidFill>
    <a:ln w="${borderWidth}"><a:solidFill><a:srgbClr val="${borderColor}"/></a:solidFill></a:ln>
  </p:spPr>
  <p:txBody>
    <a:bodyPr anchor="t" bIns="${padding.b}" lIns="${padding.l}" rIns="${padding.r}" tIns="${padding.t}" wrap="square"><a:noAutofit/></a:bodyPr>
    <a:lstStyle/>
    ${bodyXml}
  </p:txBody>
</p:sp>`;
}

function makeTableCell(textRuns, options = {}) {
  const {
    bgColor = WHITE,
    isHeader = false,
    align = 'l',
    marT = 80000,
    marB = 80000,
    marL = 100000,
    marR = 100000,
    borderColor = BORDER_COLOR
  } = options;

  let paras = '';
  if (Array.isArray(textRuns[0])) {
    for (const para of textRuns) {
      paras += makeParagraph(para, { align, spaceAfter: 20000 });
    }
  } else {
    paras = makeParagraph(textRuns, { align, spaceAfter: 0 });
  }

  const fillXml = `<a:solidFill><a:srgbClr val="${bgColor}"/></a:solidFill>`;
  const borderXml = `
    <a:lnL w="9525"><a:solidFill><a:srgbClr val="${borderColor}"/></a:solidFill></a:lnL>
    <a:lnR w="9525"><a:solidFill><a:srgbClr val="${borderColor}"/></a:solidFill></a:lnR>
    <a:lnT w="9525"><a:solidFill><a:srgbClr val="${borderColor}"/></a:solidFill></a:lnT>
    <a:lnB w="9525"><a:solidFill><a:srgbClr val="${borderColor}"/></a:solidFill></a:lnB>`;

  return `<a:tc>
    <a:txBody>
      <a:bodyPr anchor="ctr"/>
      <a:lstStyle/>
      ${paras}
    </a:txBody>
    <a:tcPr marT="${marT}" marB="${marB}" marL="${marL}" marR="${marR}">
      ${fillXml}
      ${borderXml}
    </a:tcPr>
  </a:tc>`;
}

function makeTable(id, x, y, cx, cy, colWidths, rowData) {
  const colGridXml = colWidths.map(w => `<a:gridCol w="${w}"/>`).join('');
  let rowsXml = '';

  for (let rIdx = 0; rIdx < rowData.length; rIdx++) {
    const row = rowData[rIdx];
    const isHeader = rIdx === 0;
    const rowH = row.height || (isHeader ? 380000 : 420000);
    let cellsXml = '';

    for (let cIdx = 0; cIdx < row.cells.length; cIdx++) {
      const cellData = row.cells[cIdx];
      const cellOpts = {
        bgColor: isHeader ? TEAL_DARK : (rIdx % 2 === 1 ? WHITE : CREAM),
        isHeader,
        align: cellData.align || 'l',
        borderColor: isHeader ? TEAL_DARK : BORDER_COLOR
      };
      cellsXml += makeTableCell(cellData.runs, cellOpts);
    }
    rowsXml += `<a:tr h="${rowH}">${cellsXml}</a:tr>`;
  }

  return `
<p:graphicFrame>
  <p:nvGraphicFramePr>
    <p:cNvPr id="${id}" name="Table_${id}"/>
    <p:cNvGraphicFramePr><a:graphicFrameLocks noGrp="1"/></p:cNvGraphicFramePr>
    <p:nvPr/>
  </p:nvGraphicFramePr>
  <p:xfrm>
    <a:off x="${x}" y="${y}"/>
    <a:ext cx="${cx}" cy="${cy}"/>
  </p:xfrm>
  <a:graphic>
    <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table">
      <a:tbl>
        <a:tblPr><a:noFill/></a:tblPr>
        <a:tblGrid>${colGridXml}</a:tblGrid>
        ${rowsXml}
      </a:tbl>
    </a:graphicData>
  </a:graphic>
</p:graphicFrame>`;
}

module.exports = {
  TEAL, TEAL_LIGHT, TEAL_DARK, TEAL_BORDER, DARK, MUTED, WHITE, CREAM, ACCENT_AMBER, ACCENT_RED, BORDER_COLOR, GREEN,
  makeParagraph, makeCard, makeTable, makeTableCell
};
