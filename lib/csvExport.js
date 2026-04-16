import { MATERIALS, edgingDesc } from './constants';

export function sanitise(s) {
  return String(s).replace(/[^a-zA-Z0-9_\-\s]/g,'').replace(/\s+/g,'_').substring(0, 40);
}

export function getCsvFilename(matId, customer, jobRef) {
  return `${sanitise(jobRef)}_${sanitise(customer)}_${sanitise(MATERIALS[matId].name)}.csv`;
}

export function generateCSV(matId, pieces, customer, jobRef) {
  const headers = ['Customer','Material/thickness','Length(mm)','Width(mm)','Quantity','Grain(Yes/No)','Edging detail','Other information'];
  const mat = MATERIALS[matId];
  const rows = pieces.map(p => [
    customer || 'Customer',
    mat.name,
    p.len, p.wid, p.qty,
    p.grain ? 'Yes' : 'No',
    p.edging,
    p.notes || edgingDesc(p.len, p.wid, p.qty, p.edging),
  ]);
  return [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))
    .join('\r\n');
}

export function downloadBlob(content, filename, type = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadSingleCSV(matId, groups, customer, jobRef) {
  if (!groups || !groups[matId]) return;
  const csv = generateCSV(matId, groups[matId], customer, jobRef);
  downloadBlob(csv, getCsvFilename(matId, customer, jobRef));
}

export async function downloadAllZip(groups, customer, jobRef, openEmail = false) {
  const JSZip  = (await import('jszip')).default;
  const zip    = new JSZip();
  const matIds = Object.keys(groups);

  for (const matId of matIds) {
    const csv = generateCSV(matId, groups[matId], customer, jobRef);
    zip.file(getCsvFilename(matId, customer, jobRef), csv);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipName = `${sanitise(jobRef)}_${sanitise(customer)}_CuttingLists.zip`;
  downloadBlob(zipBlob, zipName, 'application/zip');

  if (openEmail) {
    const pieces  = Object.values(groups).flat().reduce((s, r) => s + r.qty, 0);
    const matList = matIds.map(id => MATERIALS[id].name).join(', ');
    const subject = encodeURIComponent(`Quote Request — ${customer} — ${jobRef}`);
    const body    = encodeURIComponent(
`Hi Lucian,

Please find attached the ZIP file containing ${matIds.length} CSV cutting list${matIds.length!==1?'s':''} for the following job:

Customer:      ${customer}
Job Reference: ${jobRef}
Total Panels:  ${pieces}
Materials:     ${matList}

Please attach the ZIP before sending.

Thank you.`);
    setTimeout(() => {
      window.location.href = `mailto:lucian@dtsolutionsltd.co.uk?subject=${subject}&body=${body}`;
    }, 800);
  }
}
