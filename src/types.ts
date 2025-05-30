export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  isLoading?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  promptCount: number;
}

export interface BookingData {
  confirmationCode: string | null;
  hotel: {
    name: string | null;
    location: string | null;
    image: string | null;
    additionalImages?: string[];
  };
  dates: {
    checkIn: string | null;
    checkOut: string | null;
  };
  room: {
    type: string | null;
    pricePerNight: number | null;
    totalPrice: number | null;
  };
  guests: string[];
  totalNights: number | null;
}

export interface WebhookResponse {
  output: string | null;
  type: string | null;
  data: {
    bookingData: BookingData;
  };
}

export interface Company {
  id_empresa: string;
  razon_social: string;
  nombre_comercial: string;
  tipo_persona: string;
  empresa_direccion: string | null;
  empresa_colonia: string | null;
  empresa_estado: string | null;
  empresa_municipio: string | null;
  empresa_cp: string | null;
}

export interface TaxInfo {
  id_datos_fiscales: string;
  id_empresa: string;
  rfc: string;
  calle: string;
  municipio: string;
  estado: string;
  colonia: string;
  codigo_postal_fiscal: string;
  regimen_fiscal: string;
  razon_social: string;
}

export interface Employee {
  id_viajero: string;
  id_agente: string;
  primer_nombre: string;
  segundo_nombre?: string | null;
  apellido_paterno: string;
  apellido_materno?: string | null;
  correo: string;
  genero: string;
  telefono: string;
  fecha_nacimiento?: string | null;
  nacionalidad: string;
  numero_pasaporte: string;
  numero_empleado: string;
  empresas: {
    id_empresa: string;
    razon_social: string;
  }[];
}

export interface Assignment {
  id: string;
  companyId: string;
  employeeId: string;
  startDate: string;
  role: "admin" | "user" | "manager";
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  employeeIds: string[];
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  type: PolicyType;
  value?: number;
  startDate: string;
  endDate: string;
  departments: string[];
  employeeIds: string[];
  empresasIds: string[];
  status: PolicyStatus;
}

export interface CompanyWithTaxInfo {
  id_empresa: string;
  razon_social: string;
  nombre_comercial: string;
  empresa_direccion: string; // Asegurar que haya dirección
  empresa_municipio: string;
  empresa_estado: string;
  empresa_cp: string;
  empresa_colonia: string;
  tipo_persona: string;
  taxInfo?: TaxInfo | null;
}

export interface PaymentMethod {
  id: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export type PolicyType = "budget" | "schedule" | "benefits" | "other";
export type PolicyStatus = "active" | "inactive" | "draft" | "expired";
export type FormMode = "create" | "edit";
export type PaymentStatus = "pending" | "complete" | "canceled";

export type PaymentMethodd =
  | "Credit Card"
  | "Bank Transfer"
  | "PayPal"
  | "Crypto";

export interface Payment {
  id_credito: string;
  id_servicio: string;
  monto_a_credito: number;
  responsable_pago_agente: string;
  fecha_credito: Date | string;
  pago_por_credito: number;
  pendiente_por_cobrar: number;
  total_credito: number;
  subtotal_credito: number;
  impuestos_credito: number;
  concepto: string;
  currency: string;
  tipo_de_pago: string;

  // Campos de servicios
  total_servicio: number;
  subtotal_servicio: number;
  impuestos_servicio?: number | null;
  fecha_limite_pago?: Date | string | null;
  is_credito?: boolean;

  // Campos de solicitudes
  id_solicitud: string;
  confirmation_code: string;
  id_viajero: string;
  hotel?: string | null;
  check_in: Date | string;
  check_out: Date | string;
  room?: string | null;
  estado_solicitud: "pending" | "complete" | "canceled";
  id_usuario_generador: string;

  // Campos calculados (opcionales si los incluyes en la vista)
  saldo_pendiente?: number;
  dias_para_limite_pago?: number;
  noches_reservadas?: number;
}

export interface PaymentFormData {
  amount: string;
  paymentMethod: PaymentMethodd;
}

export interface Invoice {
  id: string;
  facturamaId: string;
  issueDate: string;
  amount: number;
  currency: string;
  url?: string;
}
