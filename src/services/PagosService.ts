import { CartItem } from "../types";
import { ApiResponse, ApiService } from "./ApiService";
import { UserSingleton } from "./UserSingleton";

export class PagosService extends ApiService {
  private static instance: PagosService;
  private user: UserSingleton = UserSingleton.getInstance();
  private ENDPOINTS = {
    GET: {
      SALDO_BY_METODO_PAGO: "/metodos_pago",
      PAGOS_PARA_CONSULTAS: "/get_pagos_prepago_by_ID",
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

  public getPagosConsultas = (): Promise<
    ApiResponse<{ count: number; pagos: Payment[] }>
  > =>
    this.get<{ count: number; pagos: Payment[] }>({
      path: this.formatPath(this.ENDPOINTS.GET.PAGOS_PARA_CONSULTAS),
      params: { id_agente: this.user.getUser()?.info?.id_agente },
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
      protect: true,
    });
}

export interface Payment {
  id_movimiento: number;
  tipo_pago: string;
  raw_id: string;
  id_agente: string;
  fecha_creacion: string; // ISO string
  fecha_pago: string; // ISO string
  monto: string; // viene como string con decimales
  saldo: string; // viene como string con decimales
  currency: string;
  metodo: string;
  tipo: string | null;
  referencia: string | null;
  concepto: string | null;
  link_pago: string | null;
  autorizacion: string | null;
  last_digits: string | null;
  banco: string | null;
  origen_pago: string;
  is_facturado: number; // 0 o 1
}
