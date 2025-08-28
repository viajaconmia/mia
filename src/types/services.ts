export interface Reserva {
  id_credito: string | null;
  id_pago: string | null;
  id_booking: string | null;
  pendiente_por_cobrar: string | null;
  id_servicio: string;
  created_at: string;
  URLImagenHotel: string | null;
  is_credito: boolean | null;
  id_solicitud: string;
  confirmation_code: string | null;
  hotel: string | null;
  check_in: string | null;
  check_out: string | null;
  room: string | null;
  total: string | null;
  status_solicitud: string | null;
  status_reserva: string | null;
  nombre_viajero_reservacion: string | null;
  quien_reservó: string | null;
  codigo_reservacion_hotel: string | null;
  monto_a_credito: number | null;
  id_factura: string | null;
  is_booking: number;
  id_facturama: string | null;
  nombres_viajeros_acompañantes?: string | null; // opcional
}

export interface MovimientoPago {
  tipo: string;
  monto: number;
  id_pago: string | null;
  items_del_pago: string | null;
  id_saldo_a_favor: number | null;
}

export interface Invoice {
  id_factura: string;
  fecha_emision: string; // ISO string
  estado: string;
  usuario_creador: string;
  total: string; // viene como string con decimales
  subtotal: string;
  impuestos: string;
  saldo: string;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  id_facturama: string | null;
  rfc: string;
  id_empresa: string;
  uuid_factura: string;
  rfc_emisor: string;
  url_pdf: string;
  url_xml: string;
  id_agente: string;
  nombre_agente: string;
  items_asociados: string | null;
  reservas_asociadas: string | null;
  pagos_asociados: string | null;
  saldos_a_favor_asociados: string | null;
  monto_pago_directo: string;
  monto_prepago_wallet: string;
  monto_ajuste_devolucion: string;
  monto_total_relacionado: string;
  movimientos_pago: MovimientoPago[];
}
