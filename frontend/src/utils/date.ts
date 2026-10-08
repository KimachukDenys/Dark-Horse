export function formatDate(fullDate: string) {
  const date = new Date(fullDate);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    time: date.toLocaleTimeString('en-GB', {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),

    date: date.toLocaleDateString('en-GB', {
      timeZone,
      day: "2-digit",
      month: "short",
      year: "numeric"
    }),

    day: date.toLocaleDateString('en-GB', {
      timeZone,
      day: "2-digit"
    }),
    
    month: date.toLocaleDateString('en-GB', {
      timeZone,
      month: "short"
    }),

    year: date.toLocaleDateString('en-GB', {
      timeZone,
      year: "numeric"
    })
  };
}