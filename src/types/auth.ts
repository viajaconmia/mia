import { User } from "@supabase/supabase-js";
import { Roles } from ".";

export interface UserRegistro {
  id_agente: string;
  primer_nombre: string;
  segundo_nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo: string;
  telefono: string;
  password: string;
  confirmPassword: string;
  genero: string;
  fecha_nacimiento: string;
  nombre_completo: string;
}

export type UserAuth = {
  id: string;
  email: string;
  name: string;
  user: User;
  info: InfoUser | null;
};

export type InfoUser = {
  id_agente: string;
  id_viajero: string;
  id_user: string;
  rol: Roles;
};

//Este tipado se utiliza para cuando hay un usuario que ya esta registrado en la base de datos pero no en supabase, porque estamos haciendo una migración de base de datos
export type InfoOldClientToRegister = {
  id_agente: string;
  monto_credito: number | null;
  saldo: string;
  wallet: string;
  tiene_credito_consolidado: number; // 0 o 1
  nombre: string;
  notas: string | null;
  por_confirmar: string;
  vendedor: string | null;
  created_agente: string; // ISO date
  id_viajero: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  apellido_paterno: string;
  apellido_materno: string | null;
  correo: string;
  fecha_nacimiento: string | null;
  genero: string | null;
  telefono: string | null;
  created_at: string;
  updated_at: string;
  nacionalidad: string | null;
  numero_pasaporte: string | null;
  numero_empleado: string | null;
  nombre_agente_completo: string;
  razon_social: string;
  rfc: string | null;
  tipo_persona: "fisica" | "moral"; // o string si puede variar más
  rn: number; // parece ser 1 o 0
};
