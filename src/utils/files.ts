// =====================
//   PDF BASE64
// =====================

// 📄 Ver PDF desde base64
export function viewPDFBase64(base64Data: string) {
  const fileURL = `data:application/pdf;base64,${base64Data}`;
  window.open(fileURL, "_blank"); // abre en nueva pestaña
}

// 📥 Descargar PDF desde base64
export function downloadPDFBase64(
  base64Data: string,
  fileName = "archivo.pdf"
) {
  const link = document.createElement("a");
  link.href = `data:application/pdf;base64,${base64Data}`;
  link.download = fileName;
  link.click();
}

// =====================
//   PDF URL
// =====================

// 📄 Ver PDF desde URL
export function viewPDFUrl(url: string) {
  window.open(url, "_blank"); // abre en nueva pestaña
}

// 📥 Descargar PDF desde URL
export async function downloadPDFUrl(url: string, fileName = "archivo.pdf") {
  const res = await fetch(url);
  const blob = await res.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}

// =====================
//   XML BASE64
// =====================

// 📥 Descargar XML desde base64 (solo descarga)
export function downloadXMLBase64(
  base64Data: string,
  fileName = "archivo.xml"
) {
  const link = document.createElement("a");
  link.href = `data:text/xml;base64,${base64Data}`;
  link.download = fileName;
  link.click();
}

// =====================
//   XML URL
// =====================

// 📥 Descargar XML desde URL (solo descarga)
export async function downloadXMLUrl(url: string, fileName = "archivo.xml") {
  const res = await fetch(url);
  const blob = await res.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}
