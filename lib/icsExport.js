export function generateICS({ jobRef, customerName, type, isoDate, time, address }) {
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
  const summary = `${label} - ${jobRef} - ${customerName}`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cutting Edge//Quoting Tool//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    // VTIMEZONE block required by RFC 5545 when using TZID references
    'BEGIN:VTIMEZONE',
    'TZID:Europe/London',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0000',
    'TZNAME:GMT',
    'DTSTART:19701025T020000',
    'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10',
    'END:STANDARD',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:+0000',
    'TZOFFSETTO:+0100',
    'TZNAME:BST',
    'DTSTART:19700329T010000',
    'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3',
    'END:DAYLIGHT',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${jobRef.replace(/[^a-z0-9]/gi,'-')}-${Date.now()}@cuttingedgebespoke`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Europe/London:${fmtLocal(yr, mo, dy, hr, min)}`,
    `DTEND;TZID=Europe/London:${fmtLocal(yr, mo, dy, endHr, min)}`,
    `SUMMARY:${summary}`,
    ...(address ? [`LOCATION:${[address.name, address.line1, address.line2, address.postcode].filter(Boolean).join('\\, ')}`] : []),
    `DESCRIPTION:Customer: ${customerName}\\nJob Ref: ${jobRef}\\nType: ${label}${address ? `\\nDelivery: ${[address.name, address.line1, address.line2, address.postcode].filter(Boolean).join(', ')}` : ''}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}
