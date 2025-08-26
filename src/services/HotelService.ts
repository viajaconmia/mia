import { HotelWithTarifas } from "../types/index";
import { ApiResponse, ApiService } from "./ApiService";
// import { UserSingleton } from "./UserSingleton";

export class HotelService extends ApiService {
  private static instance: HotelService;
  // private user: UserSingleton = UserSingleton.getInstance();
  private ENDPOINTS = {
    GET: {
      HOTEL_BY_ID: "/tarifas_by_id",
    },
  };
  private constructor() {
    super("/v1/mia/hoteles");
    // this.user = UserSingleton.getInstance();
  }
  static getInstance = () => {
    if (!this.instance) {
      this.instance = new HotelService();
    }
    return this.instance;
  };

  public getHotelById = (
    id: string | undefined
  ): Promise<ApiResponse<HotelWithTarifas>> =>
    this.get<HotelWithTarifas>({
      path: this.formatPath(this.ENDPOINTS.GET.HOTEL_BY_ID),
      params: { id },
    });
}
