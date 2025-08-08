import { Reserva } from "../types/services";
import { ApiService } from "./ApiService";
import { UserSingleton } from "./UserSingleton";

export class BookingService extends ApiService {
  private user: UserSingleton = UserSingleton.getInstance();
  private ENDPOINTS = {
    GET: {
      RESERVAS: "/get_reservasClient_by_id_agente",
    },
  };
  constructor() {
    super("/v1/mia/reservasClient");
    this.user = UserSingleton.getInstance();
    console.log("BOOKING CONSTRUCTOR:", this.user.getUser());
  }

  async getReservas() {
    console.log("iniciando carga");
    const path = this.formatPath(this.ENDPOINTS.GET.RESERVAS);
    return this.get<Reserva[]>({
      path,
      params: { user_id: this.user.getUser()?.info?.id_agente },
    });
  }
}
