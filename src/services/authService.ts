import { InfoOldClientToRegister, UserRegistro } from "../types/auth";
import { ApiResponse, ApiService } from "./ApiService";

export class AuthService extends ApiService {
  private ENDPOINTS = {
    GET: {
      verificar_usuario_registro_en_supabase: "/verificar-user",
    },
    POST: {
      registrar_usuario: "/new-create-agent",
      agregar_viajero_con_rol: "/actualizar-viajero-rol",
    },
  };

  constructor() {
    super("/v1/mia/auth");
  }
  public async registrar_usuario(usuario: UserRegistro) {
    const path = this.formatPath(this.ENDPOINTS.POST.registrar_usuario);
    return await this.post<{ id_viajero: string }>({
      path,
      body: usuario,
    });
  }
  public async verificar_registro_usuario(
    email: string
  ): Promise<
    ApiResponse<{ registrar: boolean; usuario?: InfoOldClientToRegister }>
  > {
    return await this.get<{
      registrar: boolean;
      usuario?: InfoOldClientToRegister;
    }>({
      path: this.formatPath(
        this.ENDPOINTS.GET.verificar_usuario_registro_en_supabase
      ),
      params: { email },
    });
  }

  public async viajero_to_usuario_with_rol(body: {
    correo: string;
    password: string;
    id_viajero: string;
    id_agente: string | null;
    rol: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return await this.post({
      path: this.formatPath(this.ENDPOINTS.POST.agregar_viajero_con_rol),
      body,
    });
  }
}
