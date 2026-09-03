// Small helper to open a print window with A4 styling for PP.5 documents
export const openPrintWindow = (
  title: string,
  bodyHtml: string,
  orientation: 'portrait' | 'landscape' = 'portrait',
  extraCss = '',
): boolean => {
  const win = window.open('', '', 'height=900,width=1200');
  if (!win) return false;
  win.document.write(`<!DOCTYPE html>
<html lang="th"><head><meta charset="utf-8" /><title>${title}</title>
<style>
  @page { size: A4 ${orientation}; margin: 10mm; }
  * { box-sizing: border-box; }
  body { font-family: 'TH SarabunPSK','TH Sarabun','Sarabun',sans-serif; font-size: 16pt; margin: 0; padding: 4mm; }
  h1,h2,h3 { margin: 0; }
  .center { text-align: center; }
  .title { font-size: 20pt; font-weight: bold; }
  .subtitle { font-size: 17pt; }
  table { width: 100%; border-collapse: collapse; table-layout: auto; }
  th, td { border: 1px solid #000; padding: 2px 5px; vertical-align: middle; }
  th { text-align: center; background: #f2f2f2; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  .num { text-align: center; }
  .empty td { height: 24px; }
  .sign-block { margin-top: 28px; page-break-inside: avoid; display: flex; justify-content: flex-end; }
  .sign { text-align: center; min-width: 280px; line-height: 1.6; }
  .page-break { page-break-after: always; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  ${extraCss}
</style></head><body>${bodyHtml}</body></html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 600);
  return true;
};

export const signatureBlock = (label = 'ครูผู้สอน', name = '') => `
  <div class="sign-block"><div class="sign">
    ลงชื่อ ..................................................... ${label}<br/>
    ( ${name || '.....................................................'} )
  </div></div>`;

export const emptyRows = (count: number, cols: number, startNo: number) => {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `<tr class="empty"><td class="num">&nbsp;</td>${Array(cols - 1).fill('<td>&nbsp;</td>').join('')}</tr>`;
  }
  return html;
};