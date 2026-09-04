export function formatToIstanbul(dateString: string) {
  if (!dateString) return "";

  const isoString = dateString.endsWith("Z") ? dateString : dateString + "Z";
  const date = new Date(isoString);

  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
