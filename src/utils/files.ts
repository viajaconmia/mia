// =====================
//   PDF BASE64
// =====================

// 📄 Ver PDF desde base64
export function viewPDFBase64(base64Data: string) {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

// 📥 Descargar PDF desde base64
// export function downloadPDFBase64(
//   base64Data: string,
//   fileName = "archivo.pdf"
// ) {
//   const link = document.createElement("a");
//   link.href = `data:application/pdf;base64,${base64Data}`;
//   link.download = fileName;
//   link.click();
// }

// =====================
//   PDF URL
// =====================

// 📄 Ver PDF desde URL
export function viewPDFUrl(url: string) {
  window.open(url, "_blank"); // abre en nueva pestaña
}

// 📥 Descargar PDF desde URL
export async function downloadPDFUrl(url: string, fileName = "archivo.pdf") {
  const name = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = new Blob([await res.arrayBuffer()], { type: "application/octet-stream" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// =====================
//   XML BASE64
// =====================

// 📥 Descargar XML desde base64 (solo descarga)
export function downloadXMLBase64(
  base64Data: string,
  fileName = "archivo.xml"
) {
  const name = fileName.endsWith(".xml") ? fileName : `${fileName}.xml`;
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const blob = new Blob([byteNumbers], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// =====================
//   XML URL
// =====================

// 📥 Descargar XML desde URL (solo descarga)
export async function downloadXMLUrl(url: string, fileName = "archivo.xml") {
  const name = fileName.endsWith(".xml") ? fileName : `${fileName}.xml`;
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // Forzar octet-stream para que el navegador descargue en vez de mostrar el XML
    const blob = new Blob([await res.arrayBuffer()], { type: "application/octet-stream" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    // Fallback: anchor directo con download (funciona si S3 permite el header)
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
