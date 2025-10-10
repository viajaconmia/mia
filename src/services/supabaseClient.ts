import {
  createClient,
  AuthTokenResponsePassword,
  AuthError,
  AuthChangeEvent,
  Session,
  Subscription,
  PostgrestError,
  AuthResponse,
} from "@supabase/supabase-js";
import type { Database } from "../types/supabase";
import { ApiError } from "./ApiService";
import ROUTES from "../constants/routes";
import { InfoUser } from "../types/auth";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export class SupabaseClient {
  private static instance: SupabaseClient;

  private constructor() {}

  public static getInstance(): SupabaseClient {
    if (!SupabaseClient.instance) {
      SupabaseClient.instance = new SupabaseClient();
    }
    return SupabaseClient.instance;
  }

  public handleError(
    error: PostgrestError | AuthError | null,
    customMessage: string
  ) {
    if (error) {
      throw new ApiError(
        error.message,
        error instanceof AuthError ? error.status || 500 : 478,
        {
          message: customMessage || "An error occurred in supabase",
          data: null,
          error: {
            code: error.code,
            message: error.message,
            details: error,
          },
        }
      );
    }
  }

  public logIn = async (
    email: string,
    password: string
  ): Promise<AuthTokenResponsePassword> => {
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    this.handleError(response.error, "Error during login");
    return response;
  };

  public getInfo = async (id_user: string): Promise<InfoUser | null> => {
    try {
      const { data, error } = await supabase
        .from("user_info")
        .select("*")
        .eq("id_user", id_user);

      if (error) throw error;

      return Array.isArray(data) && data.length > 0
        ? (data[0] as InfoUser)
        : null;
    } catch (error: any) {
      console.error(error.response || error.message || "ERROR EN GET INFO");
      return null;
    }
  };
  public logOut = async () => {
    console.log("entrando a logout");
    const { error } = await supabase.auth.signOut();
    this.handleError(error, "Error during logout");
    return true;
  };

  public signUp = async (form: {
    correo: string;
    password: string;
    telefono: string;
    nombre: string;
  }): Promise<Pick<AuthResponse, "data">> => {
    const { data, error } = await supabase.auth.signUp({
      email: form.correo,
      password: form.password,
      options: {
        data: {
          full_name: form.nombre,
          phone: form.telefono,
        },
        emailRedirectTo: undefined,
      },
    });
    this.handleError(error, "Error during sign up");
    return { data };
  };

  public setInfoUser = async ({
    id_user,
    id_viajero,
    id_agente,
    rol = "administrador",
  }: {
    id_user: string;
    id_viajero: string;
    id_agente?: string;
    rol?: string;
  }) => {
    const { data, error } = await supabase.from("user_info").insert([
      {
        id_user,
        id_viajero,
        id_agente: id_agente || id_user,
        rol,
      },
    ]);
    this.handleError(error, "Error during insert data info");
    return data;
  };

  public sendEmailToResetPassword = async (correo: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: `https://viajaconmia.com${ROUTES.AUTH.RESET_PASSWORD}`,
      // redirectTo: `http://localhost:5173${ROUTES.AUTH.HOME}`,
    });
    this.handleError(error, "Error during reset password");
  };

  public updatePassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    console.log({ data, error });
    this.handleError(error, "error during update password");
  };

  public getSession = async () => {
    try {
      console.log("sesion entrando..............");
      const { data, error } = await supabase.auth.getSession();
      console.log("sesion entrando.............. 2");
      this.handleError(error, "Error al obtener sesion");
      console.log("sesion entrando.............. 3");
      return data;
    } catch (error: any) {
      console.log(error.response || error.message || "ERROR EN LA SESION");
    }
  };

  public onAuthStateChange = (
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): Subscription | undefined => {
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(callback);
      return subscription;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };
}

/* AQUI SE VERAN LAS COSAS QUE VAMOS A USAR PARA LO DE LOS CLIENTES */
/*
let viajero = {
  id_user: "NUEVO",
  id_viajero: "OBTENIDO DESDE LA BASE CUANDO LE DAN PERMISOS Y LO CREAN",
  id_agente: "OBTENIDO DESDE EL USUARIO CUANDO LE DAN PERMISOS",
  rol: "EL ADMIN LO DICTA",
};
let superadminnuevo = {
  id_user: "NUEVO",
  id_viajero: "OBTENIDO DESDE LA BASE CUANDO LO AGREGAMOS A LA BASE",
  id_agente: "NUEVO",
  rol: "SUPERADMIN",
};
let usuarioviejo = {
  id_user: "NUEVO",
  id_viajero:
    "OBTENIDO DESDE LA BASE CUANDO LO BUSCAMOS POR SU CORREO EN AGENTE DETAILS",
  id_agente: "EL DE AGENTE DETAILS",
  rol: "SUPERADMIN",
};
*/
