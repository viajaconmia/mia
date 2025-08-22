import { PaymentMethod } from "@stripe/stripe-js";
import { ApiResponse, ApiService } from "./ApiService";
import { UserSingleton } from "./UserSingleton";

export class StripeService extends ApiService {
  private user: UserSingleton = UserSingleton.getInstance();
  private static instance: StripeService;
  private ENDPOINTS = {
    GET: {
      get_tarjetas_cliente: "/get-payment-methods",
    },
    POST: {
      guardar_metodo_pago: "/save-payment-method",
      crear_pago: "/make-payment",
    },
  };
  private constructor() {
    super("/v1/stripe");
    this.user = UserSingleton.getInstance();
  }

  public static getInstance(): StripeService {
    if (!this.instance) {
      this.instance = new StripeService();
    }
    return this.instance;
  }

  public guardarTarjetaStripe = async (
    paymentMethodId: string
  ): Promise<ApiResponse<{}>> =>
    this.post({
      path: this.formatPath(this.ENDPOINTS.POST.guardar_metodo_pago),
      body: {
        paymentMethodId,
        id_agente: this.user.getUser()?.info?.id_agente,
      },
    });

  public getTarjetasCliente = async (): Promise<ApiResponse<PaymentMethod[]>> =>
    this.get<PaymentMethod[]>({
      path: this.formatPath(this.ENDPOINTS.GET.get_tarjetas_cliente),
      params: {
        id_agente: this.user.getUser()?.info?.id_agente,
      },
    });

  public crearPago = async (
    amount: string,
    paymentMethodId: string
  ): Promise<ApiResponse<{}>> =>
    this.post({
      path: this.formatPath(this.ENDPOINTS.POST.crear_pago),
      body: {
        amount: Number(amount) * 100,
        paymentMethodId,
        id_agente: this.user.getUser()?.info?.id_agente,
      },
    });
}
