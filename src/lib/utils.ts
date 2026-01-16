// Tremor Raw cx [v0.0.0]

import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { URL, API_KEY } from "../constants/apiConstant";

export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args));
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface UploadResponse {
  publicUrl: string;
  urlComprobante: string;
  url?: string;
  publicUrlComprobante?: string;
}

export async function obtenerPresignedUrl(
  filename: string,
  filetype: string,
  folder: string,
  endpointBase = "/mia/utils/cargar-archivos"
): Promise<UploadResponse> {
  const url = `${URL}/v1${endpointBase}/${folder}?filename=${filename}&filetype=${filetype}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "x-api-key": API_KEY || "",
    },
  });

  if (!res.ok) {
    throw new Error(`Error al obtener presigned URL: ${res.statusText}`);
  }

  return res.json();
}

export async function subirArchivoAS3(
  file: File,
  presignedUrl: string
): Promise<void> {
  try {
    const uploadRes = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!uploadRes.ok) {
      throw new Error("Error al subir archivo a S3");
    }
  } catch (error) {
    console.error("Error al subir archivo a S3:", error);
  }
}

export function formatNumberWithCommas(
  numberStr: string | number | undefined | null
): string {
  // Si el valor es undefined o null, retornar cadena vacía
  if (numberStr == null) return "";

  // Convertir a string si es un número
  const str = typeof numberStr === "number" ? numberStr.toString() : numberStr;

  // Si la cadena está vacía, retornar cadena vacía
  if (str.trim() === "") return "";
  // 1. Separar la parte entera de la parte decimal
  const parts = str.split(".");
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? parts[1] : undefined;

  // 2. Formatear la parte entera
  // Invertimos la parte entera para facilitar la inserción de comas cada tres dígitos desde la derecha
  const reversedInteger = integerPart.split("").reverse().join("");
  let formattedReversedInteger = "";

  for (let i = 0; i < reversedInteger.length; i++) {
    if (i > 0 && i % 3 === 0) {
      formattedReversedInteger += ",";
    }
    formattedReversedInteger += reversedInteger[i];
  }

  // Volvemos a invertir la parte entera formateada para obtener el orden correcto
  const formattedInteger = formattedReversedInteger
    .split("")
    .reverse()
    .join("");

  // 3. Unir la parte entera formateada con la parte decimal (si existe)
  if (decimalPart !== undefined) {
    return `${formattedInteger}.${decimalPart}`;
  } else {
    return formattedInteger;
  }
}

// Tremor Raw focusInput [v0.0.1]

export const focusInput = [
  // base
  "focus:ring-2",
  // ring color
  "focus:ring-blue-200 focus:dark:ring-blue-700/30",
  // border color
  "focus:border-blue-500 focus:dark:border-blue-700",
];

// Tremor Raw focusRing [v0.0.1]

export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-blue-500 dark:outline-blue-500",
];

// Tremor Raw hasErrorInput [v0.0.1]

export const hasErrorInput = [
  // base
  "ring-2",
  // border color
  "border-red-500 dark:border-red-700",
  // ring color
  "ring-red-200 dark:ring-red-700/30",
];
