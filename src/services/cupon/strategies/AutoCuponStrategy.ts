import { jsPDF } from "jspdf";
import { ICuponStrategy } from "../ICuponStrategy";
import { ConductorAdicional, SolicitudRentaCarros } from "../../BookingService";
import { API_KEY, URL } from "../../../constants/apiConstant";
type CuponAutoResponse = {
  message: string;
  data: SolicitudRentaCarros;
  tiempo_ms?: number;
};
import { formatDate } from "../../../utils/format";

import { BookingService } from "../../BookingService";

const safe = (value: unknown, fallback = "No disponible"): string => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
};



const formatTime = (value?: string | null): string => {
  if (!value) return "No disponible";

  return value.substring(0, 5);
};

const normalizeDrivers = (
  value: SolicitudRentaCarros["conductores_adicionales"],
): ConductorAdicional[] => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);

      return Array.isArray(parsed) ? (parsed as ConductorAdicional[]) : [];
    } catch {
      return [];
    }
  }

  return [];
};

const sanitizeFileName = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
};

export const AutoCuponStrategy: ICuponStrategy = {
  async generarCupon(id_renta_autos: string): Promise<void> {
    const bookingService = BookingService.getInstance();
    const result = await bookingService.cupon.auto(id_renta_autos);

    const cuponData = result.data;
    console.log("✅ Response from backend:", result);
    console.log("✅ Cupon data:", cuponData);

    await generatePdf(cuponData);
  },
};


  async function generatePdf(cuponData: any): Promise<void> {
    const inicioPdf = performance.now();

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    const COLORS = {
      primary: [30, 64, 175] as [number, number, number],
      primaryDark: [30, 58, 138] as [number, number, number],
      primaryLight: [59, 102, 214] as [number, number, number],
      blueSoft: [239, 246, 255] as [number, number, number],
      green: [5, 150, 105] as [number, number, number],
      greenSoft: [236, 253, 245] as [number, number, number],
      grayBackground: [248, 250, 252] as [number, number, number],
      grayBorder: [226, 232, 240] as [number, number, number],
      text: [15, 23, 42] as [number, number, number],
      textMuted: [100, 116, 139] as [number, number, number],
      white: [255, 255, 255] as [number, number, number],
    };

    const setTextStyle = (
      fontSize: number,
      color: [number, number, number] = COLORS.text,
      bold = false,
    ) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
    };

    const drawWrappedText = (
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      fontSize = 9,
      color: [number, number, number] = COLORS.text,
      bold = false,
    ): number => {
      setTextStyle(fontSize, color, bold);

      const lines = doc.splitTextToSize(text, maxWidth);
      const lineHeight = fontSize * 0.45;

      doc.text(lines, x, y);

      return y + lines.length * lineHeight;
    };

    const drawLabelValue = (
      label: string,
      value: unknown,
      x: number,
      y: number,
      width: number,
    ) => {
      setTextStyle(7, [191, 219, 254]);
      doc.text(label, x, y);

      return drawWrappedText(
        safe(value),
        x,
        y + 5,
        width,
        10,
        COLORS.white,
        true,
      );
    };

    const drawSection = (
      title: string,
      x: number,
      y: number,
      width: number,
      height: number,
    ) => {
      doc.setFillColor(...COLORS.white);
      doc.setDrawColor(...COLORS.grayBorder);
      doc.roundedRect(x, y, width, height, 3, 3, "FD");

      setTextStyle(11, COLORS.text, true);
      doc.text(title, x + 8, y + 11);
    };

    const drawFooter = () => {
      const y = pageHeight - 17;

      doc.setDrawColor(...COLORS.grayBorder);
      doc.line(margin, y - 5, pageWidth - margin, y - 5);

      setTextStyle(7, COLORS.textMuted);

      doc.text(
        "Si tiene alguna duda sobre esta información, póngase en contacto con nosotros.",
        pageWidth / 2,
        y,
        { align: "center" },
      );

      setTextStyle(7, COLORS.primary);

      doc.text(
        "reservaciones@noktos.com · WA 55 31 49 10 62",
        pageWidth / 2,
        y + 5,
        { align: "center" },
      );
    };

    const confirmationCode = safe(
      cuponData.codigo_confirmation,
      idFallback(cuponData),
    );

    const drivers = normalizeDrivers(cuponData.conductores_adicionales).filter(
      (driver) => driver.id_viajero !== cuponData.id_conductor_principal,
    );

    const sameLocation =
      Boolean(cuponData.id_sucursal_recoger_auto) &&
      Boolean(cuponData.id_sucursal_dejar_auto) &&
      String(cuponData.id_sucursal_recoger_auto) ===
        String(cuponData.id_sucursal_dejar_auto);

    /*
     * Encabezado
     */
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(margin, 10, contentWidth, 91, 4, 4, "F");

    doc.setFillColor(...COLORS.primaryLight);
    doc.roundedRect(margin + 8, 18, 12, 12, 3, 3, "F");

    setTextStyle(16, COLORS.white, true);
    doc.text("Renta de Auto", margin + 25, 24);

    setTextStyle(8, [219, 234, 254]);
    doc.text(`Confirmación: ${confirmationCode}`, margin + 25, 30);

    setTextStyle(7, [219, 234, 254]);
    doc.text("Proveedor", pageWidth - margin - 8, 21, {
      align: "right",
    });

    setTextStyle(12, COLORS.white, true);
    doc.text(safe(cuponData.nombre_proveedor), pageWidth - margin - 8, 29, {
      align: "right",
      maxWidth: 55,
    });

    /*
     * Resumen del vehículo
     */
    doc.setFillColor(...COLORS.primaryLight);
    doc.roundedRect(margin + 8, 39, contentWidth - 16, 27, 3, 3, "F");

    drawLabelValue(
      "Tipo de vehículo",
      cuponData.tipo_auto,
      margin + 13,
      48,
      50,
    );

    drawLabelValue(
      "Duración",
      `${safe(cuponData.dias, "0")} ${
        Number(cuponData.dias) === 1 ? "día" : "días"
      }`,
      margin + 72,
      48,
      40,
    );

    drawLabelValue("Seguro", cuponData.seguro_incluido, margin + 130, 48, 38);

    setTextStyle(7, [191, 219, 254]);
    doc.text(`Transmisión: ${safe(cuponData.transmission)}`, margin + 13, 62);

    /*
     * Conductor principal
     */
    doc.setFillColor(...COLORS.primaryLight);
    doc.roundedRect(margin + 8, 72, contentWidth - 16, 21, 3, 3, "F");

    setTextStyle(9, COLORS.white, true);
    doc.text("Conductor principal", margin + 13, 81);

    setTextStyle(12, COLORS.white, true);
    doc.text(
      safe(cuponData.conductor_principal || cuponData.viajero).toUpperCase(),
      margin + 13,
      89,
      {
        maxWidth: contentWidth - 28,
      },
    );

    /*
     * Recogida y devolución
     */
    const pickupY = 110;
    const pickupHeight = 59;

    drawSection(
      "Información de recogida y devolución",
      margin,
      pickupY,
      contentWidth,
      pickupHeight,
    );

    const columnGap = 10;
    const columnWidth = (contentWidth - 26) / 2;
    const pickupX = margin + 8;
    const dropoffX = pickupX + columnWidth + columnGap;

    doc.setFillColor(...COLORS.greenSoft);
    doc.roundedRect(pickupX, pickupY + 16, 12, 12, 3, 3, "F");

    setTextStyle(10, COLORS.text, true);
    doc.text("Recoger auto", pickupX + 16, pickupY + 23);

    let pickupTextY = pickupY + 34;

    pickupTextY = drawWrappedText(
      `${formatDate(cuponData.check_in)} · ${formatTime(
        cuponData.hora_recoger_auto,
      )}`,
      pickupX,
      pickupTextY,
      columnWidth,
      8,
      COLORS.textMuted,
    );

    pickupTextY += 2;

    pickupTextY = drawWrappedText(
      safe(cuponData.nombre_sucursal_recoger || cuponData.lugar_recoger_auto),
      pickupX,
      pickupTextY,
      columnWidth,
      9,
      COLORS.text,
      true,
    );

    pickupTextY += 1;

    drawWrappedText(
      safe(cuponData.direccion_recoger || cuponData.lugar_recoger_auto),
      pickupX,
      pickupTextY,
      columnWidth,
      7,
      COLORS.textMuted,
    );

    doc.setFillColor(...COLORS.blueSoft);
    doc.roundedRect(dropoffX, pickupY + 16, 12, 12, 3, 3, "F");

    setTextStyle(10, COLORS.text, true);
    doc.text("Entregar auto", dropoffX + 16, pickupY + 23);

    let dropoffTextY = pickupY + 34;

    dropoffTextY = drawWrappedText(
      `${formatDate(cuponData.check_out)} · ${formatTime(
        cuponData.hora_dejar_auto,
      )}`,
      dropoffX,
      dropoffTextY,
      columnWidth,
      8,
      COLORS.textMuted,
    );

    dropoffTextY += 2;

    dropoffTextY = drawWrappedText(
      safe(cuponData.nombre_sucursal_dejar || cuponData.lugar_dejar_auto),
      dropoffX,
      dropoffTextY,
      columnWidth,
      9,
      COLORS.text,
      true,
    );

    dropoffTextY += 1;

    if (sameLocation) {
      drawWrappedText(
        "Misma ubicación que la recogida",
        dropoffX,
        dropoffTextY,
        columnWidth,
        7,
        COLORS.green,
        true,
      );
    } else {
      drawWrappedText(
        safe(cuponData.direccion_dejar || cuponData.lugar_dejar_auto),
        dropoffX,
        dropoffTextY,
        columnWidth,
        7,
        COLORS.textMuted,
      );
    }

    /*
     * Cobertura
     */
    const insuranceY = 177;

    drawSection("Cobertura y seguros", margin, insuranceY, contentWidth, 35);

    const coverageWidth = (contentWidth - 26) / 2;

    doc.setFillColor(...COLORS.blueSoft);
    doc.roundedRect(margin + 8, insuranceY + 16, coverageWidth, 12, 2, 2, "F");

    setTextStyle(8, COLORS.text);
    doc.text(
      `Seguro: ${safe(cuponData.seguro_incluido)}`,
      margin + 13,
      insuranceY + 24,
      {
        maxWidth: coverageWidth - 10,
      },
    );

    doc.setFillColor(...COLORS.grayBackground);
    doc.roundedRect(
      margin + 18 + coverageWidth,
      insuranceY + 16,
      coverageWidth,
      12,
      2,
      2,
      "F",
    );

    setTextStyle(8, COLORS.text);
    doc.text(
      `Conductores adicionales: ${
        cuponData.additional_driver || drivers.length > 0
          ? "Incluidos"
          : "No incluidos"
      }`,
      margin + 23 + coverageWidth,
      insuranceY + 24,
      {
        maxWidth: coverageWidth - 10,
      },
    );

    /*
     * Conductores adicionales
     */
    const currentY = 220;

    if (drivers.length > 0) {
      const estimatedHeight = Math.max(32, drivers.length * 24 + 17);

      drawSection(
        "Conductores adicionales",
        margin,
        currentY,
        contentWidth,
        Math.min(estimatedHeight, 55),
      );

      let driverY = currentY + 19;

      drivers.forEach((driver, index) => {
        if (driverY > pageHeight - 35) {
          drawFooter();
          doc.addPage();
          driverY = 22;
        }

        setTextStyle(9, COLORS.text, true);

        doc.text(
          `${index + 1}. ${safe(driver.nombre_completo).toUpperCase()}`,
          margin + 8,
          driverY,
          {
            maxWidth: contentWidth - 16,
          },
        );

        driverY += 5;

        const contact = [
          driver.correo ? `Correo: ${driver.correo}` : null,
          driver.telefono ? `Teléfono: ${driver.telefono}` : null,
          driver.numero_pasaporte
            ? `Pasaporte: ${driver.numero_pasaporte}`
            : null,
        ]
          .filter(Boolean)
          .join(" · ");

        if (contact) {
          driverY = drawWrappedText(
            contact,
            margin + 12,
            driverY,
            contentWidth - 24,
            7,
            COLORS.textMuted,
          );
        }

        driverY += 5;
      });
    }

    drawFooter();

    const fileName = `cupon_auto_${sanitizeFileName(confirmationCode)}.pdf`;

    /*
     * Esta línea provoca la descarga directamente desde el botón.
     */
    doc.save(fileName);
    console.log(
      `[CUPÓN AUTO] PDF generado: ${(performance.now() - inicioPdf).toFixed(
        2,
      )} ms`,
    );
  }


const idFallback = (data: SolicitudRentaCarros): string => {
  return String(
    data.id_sucursal_recoger_auto ||
    data.id_conductor_principal ||
    "sin_codigo",
  );
};