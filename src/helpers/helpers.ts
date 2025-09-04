// Helpers
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// text-extraction.cjs
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { fromPath } from 'pdf2pic';
import Tesseract from 'tesseract.js';
import { v4 as uuidv4 } from 'uuid';

import {estadosDict} from './../utils/diccionarios';
import {regimenDict} from './../utils/diccionarios';

function standardize(raw: string, dict: string[]): string {
  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')   // quita acentos
      .replace(/[^A-Za-z]/g, '')         // sólo letras
      .toUpperCase();

  const rawNorm = normalize(raw);
  for (const entry of dict) {
    const entryNorm = normalize(entry);
    if (rawNorm.startsWith(entryNorm)) {
      return entry;
    }
  }
  return raw;
}

interface ExtractEmbeddedResult {
  text: string;
  numPages: number;
}

async function extractEmbedded(inputPath: string, maxPages = 3): Promise<ExtractEmbeddedResult> {
  const absPath = path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(__dirname, inputPath);
  const dataBuffer = fs.readFileSync(absPath);
  const { text, info } = await pdf(dataBuffer, { max: maxPages });
  return { text, numPages: info.numpages };
}

async function extractWithOCR(inputPath: string, numPages: number): Promise<string> {
  const absPath = path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(__dirname, inputPath);
  const converter = fromPath(absPath, {
    density: 150,
    format: 'png',
    width: 1200,
    savePath: './_tmp_images',
    saveFilename: 'page'
  });

  let fullText = '';
  for (let i = 1; i <= numPages; i++) {
    const { path: imgPath } = await converter(i);
    console.log(`🖼  Página ${i} → ${imgPath}`);
    const { data: { text } } = await Tesseract.recognize(
      imgPath || '',
      'spa',
      { logger: m => console.log(`   OCR: ${Math.round(m.progress * 100)}%`) }
    );
    fullText += text + '\n\n';
  }
  return fullText;
}

interface Payload {
  rfc: string;
  razon_socialRaw: string;
  nombreComercial: string;
  cp: string;
  tipo: string;
  namVial: string;
  numExt: string;
  colonia: string;
  localidad: string;
  municipio: string;
  estado: string;
  regimen: string;
}

function payloadByText(text: string): Payload {
  const get = (re: RegExp, def = '') => {
    const m = re.exec(text);
    return m ? m[1].trim() : def;
  };

  return {
    rfc:              get(/RFC:\s*([A-Z0-9]+)/),
    razon_socialRaw:  get(/Denominaci[oó]n\/Raz[óo]nSocial:\s*([A-ZÑÁÉÍÓÚ0-9 ]+)/),
    nombreComercial:  get(/NombreComercial:\s*([^\n]+)/),
    cp:               get(/CódigoPostal:\s*(\d{5})/),
    tipo:             get(/TipodeVialidad:\s*([A-Z]+)/),
    namVial:          get(/NombredeVialidad:([\s\S]*?)NúmeroExterior:/).replace(/\s+/g, ' '),
    numExt:           get(/NúmeroExterior:(\d+)/),
    colonia:          get(/Nombredela Colonia:([\s\S]*?)(?:NúmeroInterior|Nombredela Localidad:)/).trim(),
    localidad:        get(/Nombredela Localidad:\s*([A-ZÑÁÉÍÓÚ]+)/),
    municipio:        get(/NombredelMunicipioo DemarcaciónTerritorial:\s*([A-ZÑÁÉÍÓÚ ]+)/),
    estado:           get(/Nombredela EntidadFederativa:\s*([A-ZÑÁÉÍÓÚ]+)/),
    regimen:          get(/Regímenes:[\s\S]*?Régimen.*?\n([^\n]+)/m)
  };
}

export interface EmpresaPayload {
  empresa: {
    id_empresa: string;
    razon_social: string;
    tipo_persona: string;
    nombre_comercial: string;
    tiene_credito: number;
    monto_credito: number | null;
    calle: string;
    colonia: string;
    estado: string;
    municipio: string;
    codigo_postal: string;
    active: number;
  };
  datos_fiscales: {
    id_datos_fiscales: string;
    id_empresa: string;
    rfc: string;
    calle: string;
    colonia: string;
    estado: string;
    municipio: string;
    codigo_postal_fiscal: string;
    regimen_fiscal: string;
    razon_social: string;
    activo: number;
  };
}

/**
 * Generates empresa and datos_fiscales payload from a PDF file path.
 * @param inputPath Path to the PDF file.
 * @returns Promise<EmpresaPayload>
 */
export async function generatePayloadFromPDF(inputPath: string): Promise<EmpresaPayload> {
  const { text: embeddedText, numPages } = await extractEmbedded(inputPath);
  const finalText = embeddedText.trim()
    ? embeddedText
    : (console.log('⚠️ No embebido, usando OCR'), await extractWithOCR(inputPath, numPages));

  const allLines     = finalText.split(/\r?\n/);
  const fallbackName = (allLines[3] || '').trim();

  const basic = payloadByText(finalText);

  const razon_social = basic.razon_socialRaw.includes(' ')
    ? basic.razon_socialRaw
    : fallbackName;

  const calle = [ basic.tipo, basic.namVial, basic.numExt ]
    .filter(Boolean)
    .join(' ')
    .trim();

  const estadoStd  = standardize(basic.estado, estadosDict as string[]);
  const regimenStd = standardize(basic.regimen, regimenDict as string[]);

  const idEmpresa       = uuidv4();
  const idDatosFiscales = uuidv4();

  const empresa = {
    id_empresa:       idEmpresa,
    razon_social:     razon_social,
    tipo_persona:     'moral',
    nombre_comercial: basic.nombreComercial || '',
    tiene_credito:    0,
    monto_credito:    null,
    calle,
    colonia:          basic.colonia,
    estado:           estadoStd,
    municipio:        basic.municipio,
    codigo_postal:    basic.cp,
    active:           1
  };

  const datos_fiscales = {
    id_datos_fiscales:    idDatosFiscales,
    id_empresa:           idEmpresa,
    rfc:                  basic.rfc,
    calle,
    colonia:              basic.colonia,
    estado:               estadoStd,
    municipio:            basic.municipio,
    codigo_postal_fiscal: basic.cp,
    regimen_fiscal:       regimenStd,
    razon_social,
    activo:               1
  };

  return { empresa, datos_fiscales };
}

