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
