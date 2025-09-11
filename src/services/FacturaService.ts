import { Invoice } from "../types/services";
import { ApiResponse, ApiService } from "./ApiService";
import { UserSingleton } from "./UserSingleton";

export class FacturaService extends ApiService {
  private static instance: FacturaService;
  private user: UserSingleton = UserSingleton.getInstance();
  private ENDPOINTS = { 
    GET: {
      FACTURAS_BY_AGENTE: "/get_agente_facturas",
    },
  };
  private constructor() {
    super("/v1/mia/factura");
    this.user = UserSingleton.getInstance();
  }
  static getInstance = () => {
    if (!this.instance) {
      this.instance = new FacturaService();
    }
    return this.instance;
  };

  public getFacturasByAgente = (): Promise<ApiResponse<Invoice[]>> =>
    this.get<Invoice[]>({
      path: this.formatPath(this.ENDPOINTS.GET.FACTURAS_BY_AGENTE),
      params: { id_agente: this.user.getUser()?.info?.id_agente },
    });
}
