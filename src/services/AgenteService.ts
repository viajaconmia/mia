import { ApiResponse, ApiService } from "./ApiService";
import { UserSingleton } from "./UserSingleton";

export class AgenteService extends ApiService {
  private user: UserSingleton = UserSingleton.getInstance();
  private static instance: AgenteService;
  private ENDPOINTS = {
    GET: {
      obtener_restricted: "/restricted",
    },
    PATCH: {
      actualizar_restricted: "/restricted",
    },
  };

  private constructor() {
    super("/v1/mia/agentes");
    this.user = UserSingleton.getInstance();
  }

  public static getInstance(): AgenteService {
    if (!AgenteService.instance) {
      AgenteService.instance = new AgenteService();
    }
    return AgenteService.instance;
  }

  public getRestricted = (): Promise<ApiResponse<boolean>> =>
    this.get<boolean>({
      path: this.formatPath(this.ENDPOINTS.GET.obtener_restricted),
      params: { id: this.user.getUser()?.info?.id_agente },
    });

  public updateRestricted = (value: boolean): Promise<ApiResponse<boolean>> =>
    this.patch<boolean>({
      path: this.formatPath(this.ENDPOINTS.PATCH.actualizar_restricted),
      body: { id: this.user.getUser()?.info?.id_agente, value },
    });
}
