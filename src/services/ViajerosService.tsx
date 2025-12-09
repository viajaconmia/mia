import { ApiResponse, ApiService } from "./ApiService";
import { UserSingleton } from "./UserSingleton";

export class ViajerosService extends ApiService {
  private user: UserSingleton = UserSingleton.getInstance();
  private static instance: ViajerosService;
  private ENDPOINTS = {
    GET: {
      BY_AGENTE: "/id",
    },
  };

  private constructor() {
    super("/v1/mia/viajeros");
    this.user = UserSingleton.getInstance();
  }

  public static getInstance(): ViajerosService {
    if (!ViajerosService.instance) {
      ViajerosService.instance = new ViajerosService();
    }
    return ViajerosService.instance;
  }

  public getViajeros = (): Promise<ApiResponse<Viajero[]>> =>
    this.get<Viajero[]>({
      path: this.formatPath(this.ENDPOINTS.GET.BY_AGENTE),
      params: { id: this.user.getUser()?.info?.id_agente },
    });
}
export type Viajero = {
  nombre_completo?: string | null;
  id_viajero?: string | null;
  correo?: string | null;
  genero?: string | null;
  fecha_nacimiento?: string | null;
  telefono?: string | null;
  nacionalidad?: string | null;
  numero_pasaporte?: string | null;
  numero_empleado?: string | null;
  is_user?: number | null;
};
