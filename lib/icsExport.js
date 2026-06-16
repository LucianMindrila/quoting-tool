export function generateICS({ jobRef, customerName, type, isoDate, time }) {
  const [yr, mo, dy] = isoDate.split('-').map(Number);
  const [hr, min]    = time.split(':').map(Number);

  function pad(n) { return String(n).padStart(2, '0'); }
  function fmtLocal(y, m, d, h, mi) {
    return `${y}${pad(m)}${pad(d)}T${pad(h)}${pad(mi)}00`;
  }

  const endHr = hr + 1 >= 24 ? 23 : hr + 1;
  const now   = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth()+1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const label   = type === 'delivery' ? 'Delivery' : 'Collection';
  const summary = `${label} — ${jobRef} — ${customerName}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cutting Edge//Quoting Tool//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${jobRef.replace(/[^a-z0-9]/gi,'-')}-${Date.now()}@cuttingedgebespoke`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Europe/London:${fmtLocal(yr, mo, dy, hr, min)}`,
    `DTEND;TZID=Europe/London:${fmtLocal(yr, mo, dy, endHr, min)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:Customer: ${customerName}\\nJob Ref: ${jobRef}\\nType: ${label}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
