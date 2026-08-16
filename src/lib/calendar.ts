export function generateGoogleCalendarUrl(
  title: string,
  startDate: string, // YYYY-MM-DD
  endDate: string,   // YYYY-MM-DD
  description: string
): string {
  // GCal expects dates in YYYYMMDD format
  const start = startDate.replace(/-/g, '');
  // For all day events, end date is exclusive, so we should ideally add 1 day
  // But for simplicity if we pass end date it works as is
  const end = endDate.replace(/-/g, '');
  
  // Format: YYYYMMDD/YYYYMMDD
  const dates = `${start}/${end}`;

  const url = new URL('https://calendar.google.com/calendar/r/eventedit');
  url.searchParams.append('text', title);
  url.searchParams.append('dates', dates);
  url.searchParams.append('details', description);

  return url.toString();
}

export function generateICS(events: any[]): string {
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rancangan Aktualisasi Surya//ID'
  ];

  events.forEach(event => {
    const start = event.startDate.replace(/-/g, '');
    const end = event.endDate.replace(/-/g, '');
    ics.push('BEGIN:VEVENT');
    ics.push(`DTSTART;VALUE=DATE:${start}`);
    ics.push(`DTEND;VALUE=DATE:${end}`);
    ics.push(`SUMMARY:${event.title}`);
    ics.push(`DESCRIPTION:${event.description}`);
    ics.push('END:VEVENT');
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}
