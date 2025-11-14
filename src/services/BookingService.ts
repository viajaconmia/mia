import { Reserva } from "../types/services";
import { ApiService } from "./ApiService";
import { UserSingleton } from "./UserSingleton";

export class BookingService extends ApiService {
  private user: UserSingleton = UserSingleton.getInstance();
  private static instance: BookingService;
  private ENDPOINTS = {
    GET: {
      RESERVAS: "/get_reservasClient_by_id_agente",
    },
  };
  private constructor() {
    super("/v1/mia/reservasClient");
    this.user = UserSingleton.getInstance();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new BookingService();
    }
    return this.instance;
  }

  async getReservas() {
    const path = this.formatPath(this.ENDPOINTS.GET.RESERVAS);
    return this.get<Reserva[]>({
      path,
      params: {
        user_id: this.user.getUser()?.info?.id_agente,
        ...(this.user.getUser()?.info?.rol == "reservante"
          ? { usuario_creador: this.user.getUser()?.info?.id_viajero }
          : {}),
      },
    });
  }
}
