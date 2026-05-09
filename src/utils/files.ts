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
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    window.open(url, "_blank");
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
  const link = document.createElement("a");
  link.href = `data:text/xml;base64,${base64Data}`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// =====================
//   XML URL
// =====================

// 📥 Descargar XML desde URL (solo descarga)
export async function downloadXMLUrl(url: string, fileName = "archivo.xml") {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    // Si CORS bloquea el fetch, abre en nueva pestaña para que el usuario guarde manualmente
    window.open(url, "_blank");
  }
}
