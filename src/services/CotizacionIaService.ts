import { ApiResponse, ApiService } from "./ApiService";
import type { QuoteSubmissionBody } from "../utils/quoteDraft";

// Rutas de bacl para cotizaciones (módulo nuevo, vive en /v2; ver contrato de cotizaciones).
export const COTIZACIONES_IA_ENDPOINTS = {
  BASE_PATH: "/v2/mia",
  CREATE: "/cotizaciones-ia",
};

export interface CotizacionIaCreada {
  id_cotizacion: string;
  estado: string;
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
}
