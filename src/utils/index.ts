export const exportToCSV = (data: any[], filename = "archivo.csv") => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.map((key) => key.replace(/_/g, " ").toUpperCase()).join(","),
    ...data.map((row) =>
      headers
        .map((field) => {
          const val = row[field];
          return `"${(val ?? "").toString().replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = window.URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export async function copyToClipboard(text: string) {
  try {
    // Usa el método writeText para copiar el texto
    await navigator.clipboard.writeText(text);
    console.log("Texto copiado al portapapeles!");
  } catch (err) {
    throw new Error(
      "Error al copiar el texto. Asegúrate de que tu navegador lo soporte y estés en un entorno seguro (HTTPS)."
    );
  }
}
