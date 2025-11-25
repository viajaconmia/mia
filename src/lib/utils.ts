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

class Node {
  padre: Node | null;
  hijos: Node[];
  key: string = "";
  value: string = "";

  constructor(padre: Node | null = null) {
    this.hijos = [];
    this.padre = padre;
  }

  static openTag(padre: Node | null = null) {
    const hijo = new Node(padre);
    if (padre) padre.addHijo(hijo);
    return hijo;
  }

  addHijo(hijo: Node) {
    this.hijos.push(hijo);
  }

  closeTag() {
    return this.padre;
  }

  toObject(): any {
    if (this.hijos.length === 0) {
      return this.value;
    }

    const obj: any = {};

    this.hijos.forEach((hijo) => {
      const childKey = hijo.key;
      const childValue = hijo.toObject();

      if (obj.hasOwnProperty(childKey)) {
        if (Array.isArray(obj[childKey])) {
          obj[childKey].push(childValue);
        } else {
          obj[childKey] = [obj[childKey], childValue];
        }
      } else {
        obj[childKey] = childValue;
      }
    });

    return obj;
  }
}

export function parseToJson(message: string) {
  if (!message.split("").slice(0, 10).includes("<")) return undefined;

  const estados = {
    inicial: 0,
    abriendo_tag: 1,
    guardando_key: 2,
    guardando_value: 3,
    cerrando_objeto: 4,
  };

  let estado = estados.inicial;

  const root = new Node(null);
  let current: Node | null = root;

  const caracteres = message.split("");

  caracteres.forEach((c) => {
    switch (estado) {
      case estados.inicial:
        if (c === "<") estado = estados.abriendo_tag;
        break;

      case estados.abriendo_tag:
        if (c === "/") {
          estado = estados.cerrando_objeto;
        } else {
          current = Node.openTag(current);
          if (current) current.key += c;
          estado = estados.guardando_key;
        }
        break;

      case estados.guardando_key:
        if (c === ">") {
          estado = estados.guardando_value;
        } else {
          if (current) current.key += c;
        }
        break;

      case estados.guardando_value:
        if (c === "<") {
          estado = estados.abriendo_tag;
        } else {
          if (current) current.value += c;
        }
        break;

      case estados.cerrando_objeto:
        if (c === ">") {
          if (current) current = current.closeTag();
          estado = estados.guardando_value;
        }
        break;
    }
  });

  return root.toObject().root;
}
