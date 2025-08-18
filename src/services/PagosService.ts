import { ApiResponse, ApiService } from "./ApiService";
import { UserSingleton } from "./UserSingleton";

export class PagosService extends ApiService {
  private static instance: PagosService;
  private user: UserSingleton = UserSingleton.getInstance();
  private ENDPOINTS = {
    GET: {
      SALDO_BY_METODO_PAGO: "/metodos_pago",
    },
  };
  private constructor() {
    super("/v1/mia/pagos");
    this.user = UserSingleton.getInstance();
  }
  static getInstance = () => {
    if (!this.instance) {
      this.instance = new PagosService();
    }
    return this.instance;
  };

  public getSaldosByMetodo = (): Promise<
    ApiResponse<{ credito: string; wallet: string }>
  > =>
    this.get<{ credito: string; wallet: string }>({
      path: this.formatPath(this.ENDPOINTS.GET.SALDO_BY_METODO_PAGO),
      params: { id: this.user.getUser()?.info?.id_agente },
    });
}
