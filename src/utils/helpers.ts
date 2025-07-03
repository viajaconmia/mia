export function currentDate() {
  const [dia, mes, año] = new Date()
    .toLocaleDateString("es-MX", {
      timeZone: "America/Mexico_City",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .split("/");
  return `${año}-${mes}-${dia}`;
}
