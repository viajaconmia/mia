import { CartItem } from "../types";
import { ApiResponse, ApiService } from "./ApiService";
import { UserSingleton } from "./UserSingleton";

export class PagosService extends ApiService {
  private static instance: PagosService;
  private user: UserSingleton = UserSingleton.getInstance();
  private ENDPOINTS = {
    GET: {
      SALDO_BY_METODO_PAGO: "/metodos_pago",
    },
    POST: {
      PAGAR_CARRITO_A_CREDITO: "/carrito/credito",
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

  public pagarCarritoCredito = (
    total: string,
    itemsCart: CartItem[]
  ): Promise<ApiResponse<{ current_saldo: string }>> =>
    this.post<{ current_saldo: string }>({
      path: this.formatPath(this.ENDPOINTS.POST.PAGAR_CARRITO_A_CREDITO),
      body: {
        monto: Number(total),
        itemsCart,
        id_agente: this.user.getUser()?.info?.id_agente,
        id_viajero: this.user.getUser()?.info?.id_viajero,
      },
    });
}
