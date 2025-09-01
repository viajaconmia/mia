import { CartItem } from "../types";
import { ApiResponse, ApiService } from "./ApiService";
import { UserSingleton } from "./UserSingleton";

export class SolicitudService extends ApiService {
  private user: UserSingleton = UserSingleton.getInstance();
  private static instance: SolicitudService;
  private ENDPOINTS = {
    POST: {
      PAGAR_SOLICITUDES_POR_WALLET: "/createFromCart",
    },
  };
  private constructor() {
    super("/v1/mia/solicitud");
    this.user = UserSingleton.getInstance();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SolicitudService();
    }
    return this.instance;
  }

  public PagarSolicitudesConWallet = async ({
    items,
    total,
  }: {
    items: CartItem[];
    total: string;
  }): Promise<ApiResponse<{}>> =>
    this.post<{}>({
      path: this.formatPath(this.ENDPOINTS.POST.PAGAR_SOLICITUDES_POR_WALLET),
      body: { id_agente: this.user.getUser()?.info?.id_agente, items, total },
    });
}
