import React, { useEffect, useState, useRef } from "react";
import {
  Calendar,
  Hotel,
  User,
  Bed,
  ArrowRight,
  MessageCircle,
  Users,
  CupSoda,
  FileDown,
} from "lucide-react";
import { useRoute } from "wouter";
import { SupportModal } from "../components/SupportModal";
import { ReservationDetails2 } from "../types/index";
import { fetchReservation } from "../services/reservas";
import ROUTES from "../constants/routes";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// ↑ Encima del componente Reserva()
type LogoAsset = { key: string; src: string };

type LogoLoaded = {
  dataUrl: string;
  ar: number; // aspect ratio = width/height
};

// Carga IMG (PNG/JPG) a dataURL + aspect ratio
async function loadImageAsDataURL(src: string): Promise<LogoLoaded> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 512;
        canvas.height = img.naturalHeight || 512;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No 2D context"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        const ar = (img.naturalWidth || 1) / (img.naturalHeight || 1) || 1;
        resolve({ dataUrl, ar });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${src}`));
    img.src = src;
  });
}

// SVG de MIA (ajusta fill/color si lo necesitas)
const MIA_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 493 539">
    <path fill="#0A3A57" d="M205.1,500.5C205.1,500.5,205,500.6,205.1,500.5C140.5,436.1,71.7,369.1,71.7,291.1 c0-86.6,84.2-157.1,187.6-157.1S447,204.4,447,291.1c0,74.8-63.4,139.6-150.8,154.1c0,0,0,0,0,0l-8.8-53.1 c61.3-10.2,105.8-52.6,105.8-100.9c0-56.9-60-103.2-133.7-103.2s-133.7,46.3-133.7,103.2c0,49.8,48,93.6,111.7,101.8c0,0,0,0,0,0 L205.1,500.5L205.1,500.5z"/>
    <path fill="#0A3A57" d="M341,125.5c-2.9,0-5.8-0.7-8.6-2.1c-70.3-37.3-135.9-1.7-138.7-0.2c-8.8,4.9-20,1.8-24.9-7.1 c-4.9-8.8-1.8-20,7-24.9c3.4-1.9,85.4-47.1,173.8-0.2c9,4.8,12.4,15.9,7.6,24.8C353.9,122,347.6,125.5,341,125.5z"/>
    <g>
      <path fill="#0A3A57" d="M248.8,263.8c-38.1-26-73.7-0.8-75.2,0.2c-6.4,4.6-8.7,14-5.3,21.8c1.9,4.5,5.5,7.7,9.8,8.9 c4,1.1,8.2,0.3,11.6-2.1c0.9-0.6,21.4-14.9,43.5,0.2c2.2,1.5,4.6,2.3,7.1,2.4c0.2,0,0.4,0,0.6,0c0,0,0,0,0,0 c5.9,0,11.1-3.7,13.5-9.7C257.8,277.6,255.4,268.3,248.8,263.8z"/>
      <path fill="#0A3A57" d="M348.8,263.8c-38.1-26-73.7-0.8-75.2,0.2c-6.4,4.6-8.7,14-5.3,21.8c1.9,4.5,5.5,7.7,9.8,8.9 c4,1.1,8.2,0.3,11.6-2.1c0.9-0.6,21.4-14.9,43.5,0.2c2.2,1.5,4.6,2.3,7.1,2.4c0.2,0,0.4,0,0.6,0c0,0,0,0,0,0 c5.9,0,11.1-3.7,13.5-9.7C357.8,277.6,355.4,268.3,348.8,263.8z"/>
    </g>
  </svg>
  `;

// Convierte el SVG (string) a PNG dataURL y devuelve ar
async function loadSvgStringAsPngDataURL(svg: string): Promise<LogoLoaded> {
  const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error("No se pudo cargar el SVG"));
    im.src = svgUrl;
  });

  const canvas = document.createElement("canvas");
  const w = img.naturalWidth || 512;
  const h = img.naturalHeight || 512;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2D context");
  ctx.drawImage(img, 0, 0, w, h);

  const dataUrl = canvas.toDataURL("image/png");
  const ar = w / h || 1;
  return { dataUrl, ar };
}

export function Reserva() {
  const [, params] = useRoute(`${ROUTES.BOOKINGS.ID}`);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [reservationDetails, setReservationDetails] =
    useState<ReservationDetails2 | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Crear una referencia para el contenedor que queremos capturar
  const pageRef = useRef<HTMLDivElement>(null);
  const [logos, setLogos] = useState<Record<string, LogoLoaded>>({});

  useEffect(() => {
    if (params?.id) {
      fetchReservation(atob(params.id), (data) => {
        setReservationDetails({ ...data } as ReservationDetails2);
        setLoading(false);
      });
    }
  }, [params?.id]);

  const logoAssets: LogoAsset[] = [
    { key: "noktos", src: "https://luiscastaneda-tos.github.io/log/files/nokt.png" },
    // { key: "hotel", src: "https://tudominio.com/assets/hotel_logo.png" },
  ];

  useEffect(() => {
    // Precargar logos al montar: PNG/JPG + MIA desde SVG
    (async () => {
      try {
        const fromAssets = await Promise.all(
          logoAssets.map(async (a) => {
            const data = await loadImageAsDataURL(a.src);
            return [a.key, data] as const;
          })
        );

        // MIA desde SVG
        const miaData = await loadSvgStringAsPngDataURL(MIA_SVG);

        const entries = [...fromAssets, ["mia", miaData] as const];
        setLogos(Object.fromEntries(entries));
      } catch (e) {
        console.warn("Fallo precarga de logos:", e);
      }
    })();
  }, []);

  const getAcompanantesValue = (viajeros: string) => {
    if (viajeros) return viajeros;
    return "No hay acompañantes";
  };

  const cambiarLenguaje = (room: string) => {
    let updateRoom = room;
    if (room?.toUpperCase() === "SINGLE") updateRoom = "SENCILLO";
    else if (room?.toUpperCase() === "DOUBLE") updateRoom = "DOBLE";
    return updateRoom;
  };

  // Dibuja logos LATERALES en el PDF (Noktos izquierda, MIA derecha)
  function drawLogosOnPage(pdf: jsPDF, logosMap: Record<string, LogoLoaded>) {
    const pageW = pdf.internal.pageSize.getWidth();

    // ── Tuning del header lateral ───────────────────────────────────────
    const TOP_Y = 14;      // posición Y (mm) de los logos
    const PADDING_X = 10;  // margen lateral (mm)
    const HEADER_H = 16;   // altura base de cada logo (mm)
    const MAX_W_RATIO = 0.28; // % máx. del ancho de página por logo (evita corte)
    const FOOTER_H = 8;    // altura del logo del pie (si lo usas)
    // ───────────────────────────────────────────────────────────────────

    // NOKTOS → izquierda
    if (logosMap["noktos"]) {
      const { dataUrl, ar } = logosMap["noktos"];
      let w = HEADER_H * ar;
      const maxW = pageW * MAX_W_RATIO;
      if (w > maxW) {
        const scale = maxW / w;
        w *= scale;
      }
      pdf.addImage(dataUrl, "PNG", PADDING_X, TOP_Y, w, HEADER_H);
    }

    // MIA → derecha
    if (logosMap["mia"]) {
      const { dataUrl, ar } = logosMap["mia"];
      let w = HEADER_H * ar;
      const maxW = pageW * MAX_W_RATIO;
      if (w > maxW) {
        const scale = maxW / w;
        w *= scale;
      }
      const x = pageW - PADDING_X - w;
      pdf.addImage(dataUrl, "PNG", x, TOP_Y, w, HEADER_H);
    }

    // Footer (opcional)
    if (logosMap["hotel"]) {
      const pageH = pdf.internal.pageSize.getHeight();
      const { dataUrl, ar } = logosMap["hotel"];
      const w = FOOTER_H * ar;
      const x = (pageW - w) / 2;
      const y = pageH - 8 - FOOTER_H; // padding inferior
      pdf.addImage(dataUrl, "PNG", x, y, w, FOOTER_H);
    }
  }

  function drawContactInfoOnCurrentPage(pdf: jsPDF) {
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    // === Colores Tailwind ===
    const BLUE_50 = { r: 239, g: 246, b: 255 }; // #eff6ff
    const BLUE_200 = { r: 191, g: 219, b: 254 }; // #bfdbfe
    const BLUE_600 = { r: 37, g: 99, b: 235 }; // #2563eb
    const BLUE_900 = { r: 30, g: 58, b: 138 }; // #1e3a8a
    const TEXT_DARK = { r: 30, g: 41, b: 59 }; // gris oscuro legible

    // — Layout —
    const marginX = 12;            // margen lateral
    const bottomMargin = 12;       // margen inferior
    const boxW = pageW - marginX * 2;

    const title = "DATOS DE CONTACTO 24/7";

    // Contenido (con partes linkeables)
    const whatsappLabel = "Whatsapp:";
    const whatsappNumber = "5510445254";
    const mailLabel = "Correo:";
    const mail = "support@noktos.zohodesk.com";
    const phoneLabel = "Teléfono:";
    const phone = "800 666 5867 opción 2";

    // Métricas tipográficas
    const paddingX = 8;
    const paddingY = 8;
    const titleBarH = 11; // barra superior azul
    const lineGap = 4;

    // Medimos altura aproximada de contenido
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    const lineH = 6;

    // 3 líneas de contenido principales
    const contentH = lineH * 3 + lineGap * 2;

    // Alto total de la tarjeta
    const boxH = paddingY + titleBarH + paddingY + contentH + paddingY;

    // Posición de la tarjeta pegada al pie
    const x = marginX;
    const y = pageH - bottomMargin - boxH;

    // — Caja de fondo (blue-50) con borde (blue-200)
    pdf.setDrawColor(BLUE_200.r, BLUE_200.g, BLUE_200.b);
    pdf.setFillColor(BLUE_50.r, BLUE_50.g, BLUE_50.b);
    if ((pdf as any).roundedRect) {
      (pdf as any).roundedRect(x, y, boxW, boxH, 3, 3, "FD");
    } else {
      pdf.rect(x, y, boxW, boxH, "FD");
    }

    // — Barra superior azul-600
    pdf.setFillColor(BLUE_600.r, BLUE_600.g, BLUE_600.b);
    pdf.rect(x, y, boxW, titleBarH, "F");

    // — Título (blanco) dentro de la barra
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12.5);
    pdf.setTextColor(255, 255, 255);
    // centrado vertical dentro de la barra
    pdf.text(title, x + paddingX, y + titleBarH - 3);

    // — Contenido
    let cursorY = y + titleBarH + paddingY + lineH - 2;

    // Label helpers
    const drawLabel = (label: string, baseX: number, baseY: number) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(BLUE_900.r, BLUE_900.g, BLUE_900.b);
      pdf.text(label, baseX, baseY);
    };
    const drawValue = (value: string, baseX: number, baseY: number) => {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(TEXT_DARK.r, TEXT_DARK.g, TEXT_DARK.b);
      pdf.text(value, baseX, baseY);
    };

    // Columna texto
    const textX = x + paddingX;

    // 1) Whatsapp (texto + link a wa.me)
    drawLabel(whatsappLabel, textX, cursorY);
    const wsLabelW = pdf.getTextWidth(whatsappLabel + " ");
    pdf.setTextColor(BLUE_600.r, BLUE_600.g, BLUE_600.b);
    pdf.textWithLink(whatsappNumber, textX + wsLabelW, cursorY, {
      url: "https://wa.me/5215510445254",
    });

    // 2) Correo (texto + mailto)
    cursorY += lineH + lineGap;
    drawLabel(mailLabel, textX, cursorY);
    const mailLabelW = pdf.getTextWidth(mailLabel + " ");
    pdf.setTextColor(BLUE_600.r, BLUE_600.g, BLUE_600.b);
    pdf.textWithLink(mail, textX + mailLabelW, cursorY, {
      url: `mailto:${mail}`,
    });

    // 3) Teléfono (texto + tel:)
    cursorY += lineH + lineGap;
    drawLabel(phoneLabel, textX, cursorY);
    const phoneLabelW = pdf.getTextWidth(phoneLabel + " ");
    pdf.setTextColor(TEXT_DARK.r, TEXT_DARK.g, TEXT_DARK.b);
    drawValue(phone, textX + phoneLabelW, cursorY);
    // Si quieres link "tel:" (algunos viewers lo respetan)
    pdf.setTextColor(BLUE_600.r, BLUE_600.g, BLUE_600.b);
    pdf.textWithLink(" Llamar", textX + phoneLabelW + pdf.getTextWidth(phone) + 1, cursorY, {
      url: "tel:+528006665867",
    });

    // — Reset de estilos
    pdf.setTextColor(0, 0, 0);
    pdf.setDrawColor(0, 0, 0);
  }

  function paintFullBluePage(pdf: jsPDF) {
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();
    pdf.setFillColor(221, 235, 254); // #DDEBFE
    pdf.rect(0, 0, w, h, "F");
  }

  // 2. Función para descargar el PDF
  const handleDownloadPdf = async () => {
    const content = pageRef.current;
    if (!content) return;

    // Guardar estilos
    const original = {
      position: content.style.position,
      margin: content.style.margin,
      width: content.style.width,
    };

    try {
      // Ajuste para captura
      content.style.position = "static";
      content.style.margin = "0 auto";
      content.style.width = "100%";

      // Capturar con fondo blanco y alta resolución
      const canvas = await html2canvas(content, {
        scale: Math.min(2, window.devicePixelRatio || 1) * 2,
        useCORS: true,
        backgroundColor: null,   // ← importante
        scrollY: -window.scrollY,
      });



      const imgData = canvas.toDataURL("image/png");

      // Medidas A4
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();   // 210 mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297 mm

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      paintFullBluePage(pdf);                              // ← pinta fondo azul completo
      // Página 1
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      drawLogosOnPage(pdf, logos);


      heightLeft -= pageHeight;

      // Páginas siguientes
      // Páginas siguientes
      while (heightLeft > 0) {
        paintFullBluePage(pdf);                              // ← pinta fondo azul completo
        pdf.addPage();
        position = heightLeft - imgHeight; // negativo, desplaza hacia arriba
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        drawLogosOnPage(pdf, logos);
        heightLeft -= pageHeight;
      }

      // ➜ Coloca el bloque de soporte en la ÚLTIMA página
      const total = (pdf as any).getNumberOfPages ? (pdf as any).getNumberOfPages() : pdf.getNumberOfPages?.();
      if (total && total > 0) {
        pdf.setPage(total);
        drawContactInfoOnCurrentPage(pdf);
      }

      pdf.save(
        `reservacion-${reservationDetails?.codigo_confirmacion || "sin-codigo"}.pdf`
      );
    } catch (err) {
      console.error("Error generando PDF:", err);
      alert("No se pudo generar el PDF. Revisa la consola para más detalles.");
    } finally {
      // Restaurar estilos
      content.style.position = original.position;
      content.style.margin = original.margin;
      content.style.width = original.width;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50">
      {/* Botón de descarga */}
      <div className="text-right p-4 print:hidden">
        <button
          onClick={handleDownloadPdf}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FileDown className="mr-2" size={20} />
          Descargar PDF
        </button>
      </div>

      <div ref={pageRef} className="max-w-5xl mx-auto px-4 py-12 relative">
        {/* ✅ Quitamos los logos visibles en pantalla (izq/der) */}
        {/* (No hay <img> ni <svg> en el header; solo quedan en el PDF) */}

        <>
          <SupportModal
            isOpen={isSupportModalOpen}
            onClose={() => setIsSupportModalOpen(false)}
          />
          {reservationDetails ? (
            <>
              <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-blue-900">
                  Detalles de la Reservación
                </h1>
                {reservationDetails.codigo_confirmacion && (
                  <p className="text-blue-600 mt-2">
                    Confirmación #{reservationDetails.codigo_confirmacion}
                  </p>
                )}
              </div>

              {/* Main Content */}
              <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-blue-100">
                <div className="grid gap-6">
                  {/* Guest and Hotel Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      icon={User}
                      label="Huésped"
                      value={reservationDetails.huesped || ""}
                    />
                    <InfoCard
                      icon={Hotel}
                      label="Hotel"
                      value={reservationDetails.hotel || ""}
                      subValue={reservationDetails.direccion || ""}
                    />
                  </div>
                  <div className="space-y-4">
                    {reservationDetails.acompañantes &&
                      reservationDetails.acompañantes.length > 0 && (
                        <div className="">
                          <InfoCard
                            icon={Users}
                            label="Acompañantes"
                            value={getAcompanantesValue(
                              reservationDetails.acompañantes
                            )}
                          />
                        </div>
                      )}
                    <div className="">
                      <InfoCard
                        icon={CupSoda}
                        label="Desayuno incluido"
                        value={
                          reservationDetails.incluye_desayuno === 1
                            ? "Desayuno incluido"
                            : "No incluye desayuno"
                        }
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <DateCard
                    check_in={reservationDetails.check_in}
                    check_out={reservationDetails.check_out}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Room Type */}
                    <InfoCard
                      icon={Bed}
                      label="Tipo de Habitación"
                      value={cambiarLenguaje(reservationDetails.room || "")}
                    />
                    <InfoCard
                      icon={MessageCircle}
                      label="Comentarios"
                      value={
                        reservationDetails.comentarios || "No hay comentarios"
                      }
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-8 p-4 bg-blue-50 text-sm rounded-lg border border-blue-100 text-gray-700">
                  <p>
                    ¿Necesitas hacer cambios en tu reserva? <br />
                    <span
                      onClick={() => {
                        setIsSupportModalOpen(true);
                      }}
                      className="hover:underline cursor-pointer text-blue-500"
                    >
                      Contacta al soporte de MIA{" "}
                    </span>{" "}
                    para ayudarte con cualquier modificación
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {loading ? (
                <>
                  <div className="text-center mt-20 animate-pulse">
                    <h1 className="text-3xl font-bold text-blue-900 mb-4">
                      Cargando reservación...
                    </h1>
                    <p className="text-gray-500 text-lg">
                      Por favor espera un momento.
                    </p>

                    <div className="mt-10 flex justify-center">
                      <div className="w-12 h-12 border-4 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mt-20">
                    <h1 className="text-3xl font-bold text-blue-900 mb-4">
                      No se encontró información
                    </h1>
                    <p className="text-gray-600 text-lg">
                      No pudimos encontrar una reservación con los datos
                      proporcionados, por favor contacte con soporte.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </>
      </div>
    </div>
  );
}

// Reusable components (sin cambios)
const InfoCard = ({
  icon: Icon,
  label,
  value,
  subValue = "",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
}) => (
  <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm p-3 rounded-lg">
    <Icon className="w-4 h-4 text-blue-600" />
    <div>
      <p className="text-xs font-medium text-blue-900/60">{label}</p>
      <p className="text-base font-semibold text-blue-900">{value}</p>
      {subValue && (
        <p className="text-[11px] font-normal text-blue-900/50">
          {subValue.toLowerCase()}
        </p>
      )}
    </div>
  </div>
);

const DateCard = ({
  check_in,
  check_out,
}: {
  check_in: string;
  check_out: string;
}) => (
  <div className="bg-white/50 backdrop-blur-sm p-3 rounded-lg">
    <div className="flex items-center space-x-2">
      <Calendar className="w-4 h-4 text-blue-600" />
      <div className="flex-1">
        <p className="text-xs font-medium text-blue-900/60">
          Fechas de Estancia
        </p>
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-xs text-blue-900/60">Check-in</p>
            <p className="text-base font-semibold text-blue-900">
              {check_in.split("T")[0]}
            </p>
          </div>
          <div className="mx-4">
            <ArrowRight className="text-blue-500 w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-blue-900/60">Check-out</p>
            <p className="text-base font-semibold text-blue-900">
              {check_out.split("T")[0]}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
