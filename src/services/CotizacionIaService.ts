import { ApiResponse, ApiService } from "./ApiService";
import type { QuoteSubmissionBody } from "../utils/quoteDraft";

// Rutas de bacl para cotizaciones (módulo nuevo, vive en /v2; ver contrato de cotizaciones).
export const COTIZACIONES_IA_ENDPOINTS = {
  BASE_PATH: "/v2/mia",
  CREATE: "/cotizaciones-ia",
  ARCHIVO_URL: "/cotizaciones-ia/archivos/url",
};

export interface CotizacionIaCreada {
  id_cotizacion: string;
  estado: string;
}

export interface ArchivoUrlFirmada {
  url: string;
  expiresIn: number;
}

export class CotizacionIaService extends ApiService {
  private static instance: CotizacionIaService;

  private constructor() {
    super(COTIZACIONES_IA_ENDPOINTS.BASE_PATH);
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new CotizacionIaService();
    }
    return this.instance;
  }

  public crear = async (
    body: QuoteSubmissionBody
  ): Promise<ApiResponse<CotizacionIaCreada>> =>
    this.post<CotizacionIaCreada>({
      path: this.formatPath(COTIZACIONES_IA_ENDPOINTS.CREATE),
      body,
    });

  // Para un archivo ya subido en el chat (aún sin confirmar la cotización): bacl
  // valida que storage_path empiece con la carpeta del idUsuario antes de firmarlo.
  public abrirArchivoPorRuta = async (
    storagePath: string,
    idUsuario: string
  ): Promise<ApiResponse<ArchivoUrlFirmada>> =>
    this.get<ArchivoUrlFirmada>({
      path: this.formatPath(COTIZACIONES_IA_ENDPOINTS.ARCHIVO_URL),
      params: { storage_path: storagePath, id_usuario: idUsuario },
    });
}
