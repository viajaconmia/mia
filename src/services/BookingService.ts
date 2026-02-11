import { Reserva } from "../types/services";
import { ApiResponse, ApiService } from "./ApiService";
import { UserSingleton } from "./UserSingleton";

export class BookingService extends ApiService {
  private user: UserSingleton = UserSingleton.getInstance();
  private static instance: BookingService;
  private ENDPOINTS = {
    GET: {
      RESERVAS: "/reservasClient/get_reservasClient_by_id_agente",
      SERVICES: "/reservas/services",
      CUPON: "/reservas/v2/cupon",
    },
  };
  private constructor() {
    super("/v1/mia");
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

  getCupon = async (id: string) =>
    this.get({
      path: this.formatPath(this.ENDPOINTS.GET.CUPON),
      params: { id },
    });

  async getByService(body: any): Promise<ApiResponse<Booking[]>> {
    const path = this.formatPath(this.ENDPOINTS.GET.SERVICES);
    return this.get({
      path,
      params: {
        id_agente: this.user.getUser()?.info?.id_agente,
        ...(this.user.getUser()?.info?.rol == "reservante"
          ? { usuario_creador: this.user.getUser()?.info?.id_viajero }
          : {}),
        ...body,
      },
    });
  }
}

export type Booking = {
  id_viajero: string;
  viajero: string;

  id_solicitud: string;

  id_hospedaje: string | null;
  id_viaje_aereo: string | null;
  id_renta_autos: string | null;

  id_booking: string;
  id_servicio: string;
  id_agente: string;

  costo_total: string; // viene como string numérico
  total: string; // viene como string numérico

  metodo_pago: "contado" | "credito" | string;
  estado: "Confirmada" | "Cancelada" | "En proceso";
  etapa_reservacion: "In house" | "check-out" | string;

  type: "hotel" | "flyght" | string;
  tipo_cuarto_vuelo: string;

  correo_cliente: string;
  telefono_cliente: string | null;

  check_in: string; // ISO date
  check_out: string; // ISO date

  horario_salida: string | null;
  horario_llegada: string | null;

  origen: string | null;
  destino: string | null;

  proveedor: string;
  agente: string;
  reservante: "Cliente" | "Operaciones" | string;

  comments: string | null;
  nuevo_incluye_desayuno: boolean | null;

  codigo_confirmacion: string;

  created_at: string; // ISO date
};

type BaseSolicitud = {
  type: string;
};

export type SolicitudHotel = BaseSolicitud & {
  type: "hotel";

  check_in: string; // ISO date
  check_out: string; // ISO date
  codigo_confirmacion: string;
  comentarios: string;
  id_hotel_resuelto: string;
  direccion: string;
  hotel: string;
  acompañantes: string;
  huesped: string;
  id_solicitud: string;
  room: "SENCILLO" | "DOBLE" | "TRIPLE" | string;
  incluye_desayuno: 0 | 1;
  total_solicitud: string;
  created_at_solicitud: string; // ISO date
};

export type Solicitud = SolicitudHotel | SolicitudVuelo | SolicitudRentaCarros;

export type VueloDetalle = {
  id_vuelo: number;
  flight_number: string;
  airline: string;

  eq_mano: string | null;
  eq_personal: string | null;
  eq_documentado: string | null;

  departure_airport: string;
  departure_city: string;
  departure_date: string; // ISO date
  departure_time: string; // HH:mm:ss

  arrival_airport: string;
  arrival_city: string;
  arrival_date: string; // ISO date
  arrival_time: string; // HH:mm:ss

  parada: number;
  seat_number: string;
  fly_type: "ida" | "ida escala" | "vuelta" | "vuelta escala" | string;

  comentarios: string | null;
  rate_type: string;
  viajero: string;
};

export type SolicitudVuelo = {
  type: "vuelo";

  id_viaje_aereo: string;
  origen: string;
  viajero: string;
  destino: string;
  tipo:
    | "SENCILLO"
    | "REDONDO"
    | "REDONDO CON ESCALA"
    | "SENCILLO CON ESCALA"
    | string;
  codigo_confirmacion: string;

  vuelos: VueloDetalle[];
};

export type ConductorAdicional = {
  activo: number; // 0 | 1
  correo: string | null;
  genero: string | null;
  is_user: number; // 0 | 1
  telefono: string | null;

  id_agente: string;
  id_viajero: string;

  created_at: string; // ISO
  updated_at: string; // ISO

  nacionalidad: string | null;
  primer_nombre: string;
  segundo_nombre: string | null;
  nombre_completo: string;

  apellido_paterno: string | null;
  apellido_materno: string | null;

  numero_empleado: string | null;
  fecha_nacimiento: string | null;
  numero_pasaporte: string | null;
};

export type SolicitudRentaCarros = {
  type: "renta_carros";

  nombre_proveedor: string;
  codigo_confirmation: string;

  id_conductor_principal: string;
  conductor_principal: string;
  viajero: string;

  check_in: string; // ISO date
  check_out: string; // ISO date

  conductores_adicionales: ConductorAdicional[];

  tipo_auto: string;
  transmission: "AUTOMATICO" | "MANUAL" | string;

  lugar_recoger_auto: string;
  hora_recoger_auto: string; // HH:mm
  id_sucursal_recoger_auto: string;

  lugar_dejar_auto: string;
  hora_dejar_auto: string; // HH:mm
  id_sucursal_dejar_auto: string;

  dias: number;

  seguro_incluido: string | null;
  additional_driver: number; // 0 | 1
};
