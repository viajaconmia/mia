import { CartItem } from "../types";
import { ApiResponse, ApiService } from "./ApiService";
import { UserSingleton } from "./UserSingleton";

export class CartService extends ApiService {
  private user: UserSingleton = UserSingleton.getInstance();
  private static instance: CartService;
  private ENDPOINTS = {
    GET: {
      obtener_items: "/",
    },
    POST: {
      crear_item: "/",
    },
    DELETE: {
      eliminar_item: "/",
    },
    PATCH: {
      actualizar_selected: "/",
    },
  };
  private constructor() {
    super("/v1/mia/cart");
    this.user = UserSingleton.getInstance();
  }

  public static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  public getCartItems = async (): Promise<ApiResponse<CartItem[]>> =>
    this.get<CartItem[]>({
      path: this.formatPath(this.ENDPOINTS.GET.obtener_items),
      params: {
        id_agente: this.user.getUser()?.info?.id_agente,
        ...(this.user.getUser()?.info?.rol == "reservante"
          ? { usuario_creador: this.user.getUser()?.info?.id_viajero }
          : {}),
      },
    });

  public createCartItem = async (body: {
    id_solicitud: string;
    total: string;
    type: "hotel" | "car_rental" | "flight";
    selected: boolean;
  }) =>
    this.post({
      path: this.formatPath(this.ENDPOINTS.POST.crear_item),
      body: {
        ...body,
        id_agente: this.user.getUser()?.info?.id_agente,
        usuario_generador: this.user.getUser()?.info?.id_viajero,
      },
    });

  public updateSelected = async (id: string, selected: boolean) =>
    this.patch({
      path: this.formatPath(this.ENDPOINTS.PATCH.actualizar_selected),
      body: { id, selected },
    });

  public deleteCartItem = async (id: string) =>
    this.delete({
      path: this.formatPath(this.ENDPOINTS.DELETE.eliminar_item),
      params: { id },
    });
}
