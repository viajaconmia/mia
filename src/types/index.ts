// Existing types...
//VIEJOS
export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_hotel: string | null;
  frequent_changes: boolean;
  avoid_locations: string | null;
  created_at: string;
  updated_at: string;
}

export type Roles =
  | "administrador"
  | "reservante"
  | "viajero"
  | "consultor"
  | "no-rol";

export interface PaymentHistory {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  payment_intent_id: string;
  created_at: string;
  bookings: {
    confirmation_code: string;
    hotel_name: string;
    check_in: string;
    check_out: string;
  } | null;
}

export interface Invoice {
  id: string;
  user_id: string;
  booking_id: string;
  invoice_type: InvoiceType;
  status: "pending" | "completed" | "cancelled";
  amount: number;
  tax_percentage: number;
  billing_details: {
    business_name: string;
    rfc: string;
    email: string;
    custom_comments?: string;
  };
  created_at: string;
  updated_at: string;
  booking?: {
    confirmation_code: string;
    hotel_name: string;
    check_in: string;
    check_out: string;
  };
}

export type InvoiceType =
  | "purchase"
  | "purchase_with_comments"
  | "partial_purchase"
  | "partial_purchase_with_comments"
  | "reservation"
  | "reservation_with_comments"
  | "partial_nights"
  | "partial_nights_with_comments"
  | "per_traveler"
  | "per_traveler_with_comments"
  | "per_service"
  | "per_service_with_comments"
  | "group_reservations"
  | "group_reservations_with_comments"
  | "advance_payment"
  | "advance_payment_with_comments"
  | "custom_tax"
  | "custom_tax_with_comments"
  | "combined_traveler_service"
  | "combined_traveler_service_with_comments"
  | "combined_provider"
  | "combined_provider_with_comments";

export interface BillingOption {
  id: InvoiceType;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  allowsComments: boolean;
  category: "basic" | "advanced" | "combined";
  disabled: boolean;
}

export interface Reservation {
  id_servicio: string;
  created_at: string; // ISO date string
  is_credito: boolean | null;
  id_solicitud: string;
  confirmation_code: string | null;
  hotel: string | null;
  check_in: string; // ISO date string
  check_out: string; // ISO date string
  room: string | null;
  total: string; // Consider cambiar a number si se usará aritméticamente
  comments: string | null;
  id_hotel: string | null;
  id_usuario_generador: string | null;
  nombre_viajero: string | null;
  id_booking: string | null;
  codigo_reservacion_hotel: string | null;
  id_pago: string | null;
  pendiente_por_cobrar: number | null;
  monto_a_credito: string; // Considerar convertir a number
  direccion: string | null;
  id_factura: string | null;
  nombre_viajero_completo: string;
  nombres_viajeros_adicionales: string; // Array of strings for additional travelers
}
export interface ReservationDetails {
  id_solicitud: string;
  huesped: string;
  codigo_confirmacion: string;
  hotel: string;
  direccion: string;
  acompañantes: string;
  incluye_desayuno: number;
  check_in: string; // ISO date string
  check_out: string; // ISO date string
  room: string;
  comentarios: string;
}

export interface HotelWithTarifas {
  id_hotel: string;
  nombre: string;
  id_cadena: number;
  correo: string;
  telefono: string;
  rfc: string;
  razon_social: string;
  direccion: string;
  latitud: string;
  longitud: string;
  convenio: string;
  descripcion: string;
  calificacion: number | null;
  tipo_hospedaje: string;
  cuenta_de_deposito: string;
  Estado: string;
  Ciudad_Zona: string;
  NoktosQ: number | null;
  NoktosQQ: number | null;
  MenoresEdad: string;
  PaxExtraPersona: string;
  DesayunoIncluido: string;
  DesayunoComentarios: string;
  DesayunoPrecioPorPersona: string;
  tiene_transportacion: string;
  Transportacion: string;
  TransportacionComentarios: string;
  acepta_mascotas: string;
  mascotas: string;
  salones: string;
  URLImagenHotel: string;
  URLImagenHotelQ: string;
  URLImagenHotelQQ: string;
  Activo: number;
  Comentarios: string;
  Id_Sepomex: number | null;
  CodigoPostal: string;
  Id_hotel_excel: number;
  Colonia: string;
  tipo_negociacion: string;
  vigencia_convenio: string; // ISO date string
  hay_convenio: string;
  comentario_vigencia: string;
  tipo_pago: string;
  disponibilidad_precio: string;
  contacto_convenio: string;
  contacto_recepcion: string;
  iva: string;
  ish: string;
  otros_impuestos: string;
  otros_impuestos_porcentaje: string;
  comentario_pago: string;
  precio_sencilla: string;
  costo_sencilla: string;
  desayuno_sencilla: number;
  precio_doble: string;
  costo_doble: string;
  precio_persona_extra: string;
  desayuno_doble: number;
  pais: string;
  score_operaciones: number | null;
}
