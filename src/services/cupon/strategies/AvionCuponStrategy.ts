import { jsPDF } from "jspdf";
import { ICuponStrategy } from "../ICuponStrategy";
import { formatDate, formatNumberWithCommas } from "../../../utils/format";
import {
  BookingService,
  SolicitudVuelo,
  VueloDetalle,
} from "../../BookingService";
import { currentDate } from "../../../utils/helpers";

const formatTime = (time: string): string => {
  if (!time) return "N/A";
  return time.substring(0, 5);
};

export const AvionCuponStrategy: ICuponStrategy = {
  async generarCupon(id_viaje_aereo: string): Promise<void> {
    // usar api service de angel
    const bookingService = BookingService.getInstance();
    const result = await bookingService.cupon.vuelo(id_viaje_aereo);

    const cuponData = result.data;
    console.log("✅ Response from backend:", result);
    console.log("✅ Cupon data:", cuponData);

    await generatePdf(cuponData);
  },
};

async function generatePdf(cuponData: any): Promise<void> {
  const STYLES = {
    COLORS: {
      PRIMARY: [0, 115, 185] as [number, number, number],
      TEXT_NORMAL: [0, 0, 0] as [number, number, number],
      TEXT_MUTED: [220, 220, 220] as [number, number, number],
      RECT: [0, 181, 226] as [number, number, number],
      TABLE_HEADER: [47, 84, 150] as [number, number, number],
      WHITE: [255, 255, 255] as [number, number, number],
    },
    FONTS: {
      TITLE: 14,
      SUBTITLE: 11,
      BODY: 9,
      SMALL: 8,
      XS: 6,
    },
    MARGINS: { LEFT: 8, RIGHT: 8, TOP: 20 },
    SPACING: { LINE: 6, SECTION: 10 },
  };

  const solicitud: SolicitudVuelo = {
    type: "vuelo",
    id_viaje_aereo: cuponData.id_viaje_aereo,
    origen: cuponData.ciudad_origen,
    destino: cuponData.ciudad_destino,
    viajero: cuponData.nombre_viajero || "No disponible",
    codigo_confirmacion: cuponData.codigo_confirmacion,
    vuelos: cuponData.vuelos || [],
    tipo: cuponData.trip_type || "REDONDO",
  };

  const drawTextBox = (
    doc: jsPDF,
    options: {
      x: number;
      y: number;
      width: number;
      text: string;
      padding?: number;
      bgColor?: [number, number, number];
      borderColor?: [number, number, number];
      textColor?: [number, number, number];
      fontSize?: number;
      lineHeight?: number;
    },
  ) => {
    const {
      x,
      y,
      width,
      text,
      padding = 0,
      bgColor = [245, 245, 245],
      textColor = [0, 0, 0],
      fontSize = 6,
      lineHeight = 4,
    } = options;

    doc.setFontSize(fontSize);
    const textLines = doc.splitTextToSize(text, width - padding * 2);
    const textHeight = textLines.length * lineHeight;
    const height = textHeight + padding * 2;

    doc.setFillColor(...bgColor);
    doc.setDrawColor(0, 0, 0, 0);
    doc.rect(x, y, width, height, "FD");

    doc.setTextColor(...textColor);
    doc.text(textLines, x + padding + 2, y + padding + lineHeight - 1);

    return y + height;
  };

  const drawHeader = (doc: jsPDF, pageW: number) => {
    doc.setFillColor(...STYLES.COLORS.RECT);
    doc.rect(STYLES.MARGINS.LEFT, 0, pageW - STYLES.MARGINS.LEFT * 2, 8, "F");
  };

  const drawImage = (
    doc: jsPDF,
    image: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => {
    doc.addImage(image, "PNG", x, y, width, height);
  };

  const drawEmitidoPor = (doc: jsPDF, y: number) => {
    const x = STYLES.MARGINS.LEFT;
    const width = 90;
    y = drawTextBox(doc, {
      x,
      y,
      text: "EMITIDO POR:",
      width,
      bgColor: STYLES.COLORS.TABLE_HEADER,
      textColor: STYLES.COLORS.WHITE,
    });
    y = drawTextBox(doc, {
      x,
      y,
      text: "NOKTOS ALIANZA SA DE CV",
      width,
      bgColor: STYLES.COLORS.WHITE,
    });
    y = drawTextBox(doc, {
      x,
      y,
      text: "NAL190807BU2",
      width,
      bgColor: STYLES.COLORS.WHITE,
    });
    drawTextBox(doc, {
      x,
      y,
      text: "Av. Presidente Masaryk 29, Interior E-3, Col.  Polanco V Sección, Alcaldía Miguel Hidalgo, CDMX",
      width,
      bgColor: STYLES.COLORS.WHITE,
    });
  };

  const drawBoletoInfo = (
    doc: jsPDF,
    solicitud: SolicitudVuelo,
    pageW: number,
    y: number,
  ) => {
    const boxW = 80;
    const x = pageW - boxW - STYLES.MARGINS.RIGHT;
    y = drawTextBox(doc, {
      x,
      y,
      width: boxW,
      text: "BOLETO AÉREO",
      bgColor: STYLES.COLORS.WHITE,
    });
    drawTextBox(doc, {
      x,
      y,
      width: boxW / 2,
      text: "FECHA DE EMISIÓN",
      bgColor: STYLES.COLORS.TABLE_HEADER,
      textColor: STYLES.COLORS.WHITE,
    });
    y = drawTextBox(doc, {
      x: x + boxW / 2,
      y,
      width: boxW / 2,
      text: formatDate(currentDate()).toString(),
      bgColor: STYLES.COLORS.TABLE_HEADER,
      textColor: STYLES.COLORS.WHITE,
    });
    drawTextBox(doc, {
      x,
      y,
      width: boxW / 2,
      text: "CODIGO DE LA AEROLINEA",
      bgColor: STYLES.COLORS.TABLE_HEADER,
      textColor: STYLES.COLORS.WHITE,
    });
    y = drawTextBox(doc, {
      x: x + boxW / 2,
      y,
      width: boxW / 2,
      text: solicitud.codigo_confirmacion.toString(),
      bgColor: STYLES.COLORS.TABLE_HEADER,
      textColor: STYLES.COLORS.WHITE,
    });
    drawTextBox(doc, {
      x,
      y,
      width: boxW / 2,
      text: "TOTAL",
      bgColor: STYLES.COLORS.TABLE_HEADER,
      textColor: STYLES.COLORS.WHITE,
    });
    y = drawTextBox(doc, {
      x: x + boxW / 2,
      y,
      width: boxW / 2,
      text: `$${formatNumberWithCommas(0)}`,
      bgColor: STYLES.COLORS.WHITE,
    });
    drawTextBox(doc, {
      x,
      y,
      width: boxW / 2,
      text: "TARIFA",
      bgColor: STYLES.COLORS.TABLE_HEADER,
      textColor: STYLES.COLORS.WHITE,
    });
    y = drawTextBox(doc, {
      x: x + boxW / 2,
      y,
      width: boxW / 2,
      text: "NO REEMBOLSABLE",
      bgColor: STYLES.COLORS.TEXT_MUTED,
    });

    return y + 10;
  };

  const drawTablaVuelos = (
    doc: jsPDF,
    vuelos: VueloDetalle[],
    y: number,
    viajero: string,
  ) => {
    const head = [
      [
        "Aerolínea",
        "Origen",
        "Fecha Salida",
        "Hora",
        "Destino",
        "Fecha Llegada",
        "Hora",
        "Asiento",
        "Pasajero",
        "# Vuelo",
      ],
    ];

    const body: any[] = vuelos.map((v) => [
      v.airline,
      `${v.departure_airport} - ${v.departure_city}`,
      formatDate(v.departure_date),
      formatTime(v.departure_time),
      `${v.arrival_airport} - ${v.arrival_city}`,
      formatDate(v.arrival_date),
      formatTime(v.arrival_time),
      v.seat_number,
      viajero,
      v.flight_number,
    ]);

    // ⚠️ NOTA: autoTable está comentado. Por ahora retorna y como está.
    // TODO: Instalar jspdf-autotable para tablas formateadas
    return y + 40;
  };

  const drawContacto = (doc: jsPDF, y: number, id: string) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(6);
    doc.setTextColor(0, 0, 255);

    doc.textWithLink("Ver reserva en linea", pageWidth / 2, y, {
      url: `https://www.viajaconmia.com/bookings/${btoa(id)}`,
      align: "center",
    });

    y += 3;
    doc.setTextColor(0, 0, 0);
    doc.text(
      "Si tiene alguna duda sobre esta información, póngase en contacto con nosotros",
      pageWidth / 2,
      y,
      { align: "center" },
    );

    y += 3;
    doc.setTextColor(0, 0, 255);
    doc.textWithLink("WA 55 31 49 10 62", pageWidth / 2, y, {
      url: "https://wa.me/525531491062",
      align: "center",
    });

    y += 3;
    doc.textWithLink("reservaciones@noktos.com", pageWidth / 2, y, {
      url: "mailto:reservaciones@noktos.com",
      align: "center",
    });

    y += 3;
    doc.textWithLink("support@noktos.zohodesk.com", pageWidth / 2, y, {
      url: "mailto:support@noktos.zohodesk.com",
      align: "center",
    });

    doc.setTextColor(0, 0, 0);
    return y + 5;
  };

  const drawList = (
    doc: jsPDF,
    items: string[],
    startX: number,
    startY: number,
    maxWidth: number,
    options?: { symbol?: string; lineHeight?: number; fontSize?: number },
  ) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    const lineHeight = options?.lineHeight ?? 6;
    const fontSize = options?.fontSize ?? 9;
    const symbol = options?.symbol;

    let y = startY;
    doc.setFontSize(fontSize);

    items.forEach((item, index) => {
      const bullet = symbol ?? `${index + 1}.`;
      const textLines = doc.splitTextToSize(item, maxWidth - 10);

      if (y + textLines.length * lineHeight > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }

      doc.text(bullet, startX, y);
      doc.text(textLines, startX + 4, y);
      y += textLines.length * lineHeight - textLines.length;
    });

    return y + 2;
  };

  // Generar PDF
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  let y = STYLES.MARGINS.TOP - 4;

  drawHeader(doc, pageW);
  drawEmitidoPor(doc, y);
  drawImage(
    doc,
    "https://luiscastaneda-tos.github.io/log/files/312974093_187206343834287_6123587238863977470_n.jpg",
    pageW / 2 - 5,
    y,
    20,
    20,
  );
  y = drawBoletoInfo(doc, solicitud, pageW, y - 4);
  y += 2;
  y = drawTablaVuelos(doc, solicitud.vuelos, y, solicitud.viajero);
  y += 4;
  y = drawContacto(doc, y, solicitud.id_viaje_aereo);

  doc.text("Politicas:", STYLES.MARGINS.LEFT, y);
  y += 3;

  const condicionesVuelo = [
    "Es necesario presentarse por lo menos 2 horas antes de la salida del vuelo",
    "Presenta tus documentos: identificación oficial vigente o pasaporte",
    "Cualquier cambio o cancelación debe solicitarse con 72 horas de anticipación",
  ];

  y = drawList(
    doc,
    condicionesVuelo,
    STYLES.MARGINS.LEFT,
    y,
    pageW - STYLES.MARGINS.LEFT - STYLES.MARGINS.RIGHT,
    { fontSize: STYLES.FONTS.XS, lineHeight: 4 },
  );

  // ✅ Retornar Buffer en lugar de descargar
  doc;
  const filename = `${cuponData.codigo_confirmacion}-${cuponData.nombre_viajero}`;
  try {
    if (typeof doc?.output === "function") {
      const blob: Blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return;
    }
  } catch (e) {
    // fallback abajo
  }

  // fallback clásico
  doc?.save?.(filename);
}
