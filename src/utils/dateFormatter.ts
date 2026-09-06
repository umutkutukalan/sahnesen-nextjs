export function formatToIstanbul(dateString: string) {
  if (!dateString) return "";

  const isoString = dateString.endsWith("Z") ? dateString : dateString + "Z";
  const date = new Date(isoString);

  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const currentYear = now.getFullYear();
  const targetYear = date.getFullYear();

  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    ...(targetYear !== currentYear && { year: "numeric" }),
  };

  return new Intl.DateTimeFormat("tr-TR", options).format(date);
}
