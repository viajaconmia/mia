import { useState, useCallback } from "react";
import { SupabaseClient } from "../services/supabaseClient";
import { useUser } from "../context/userContext";
import { validateEmail } from "../helpers/validaciones";
import { OtpService } from "../services/OtpService";
import { AuthService } from "../services/AuthService";
import { InfoOldClientToRegister, UserRegistro } from "../types/auth";
import { useNotification } from "./useNotification";

const otp = new OtpService();
const auth_obj = new AuthService();

const useAuth = () => {
  const { setAuthState, authState } = useUser();
  const [loading, setLoading] = useState(false);
  const notificationContext = useNotification();
  const showNotification = notificationContext?.showNotification ?? (() => {});

  const handleValidateRegistroUsuario = useCallback(
    async (email: string) => {
      setLoading(true);
      try {
        return await auth_obj.verificar_registro_usuario(email);
      } catch (error: any) {
        console.error(
          error.response ||
            error.message ||
            "Error desconocido al enviar validación"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setAuthState]
  );
  const handleSendValidacion = useCallback(
    async (form: any) => {
      setLoading(true);
      try {
        validateEmail(form.correo);
        return await otp.crear(form.correo);
      } catch (error: any) {
        console.error(
          error.response ||
            error.message ||
            "Error desconocido al enviar validación"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setAuthState]
  );

  const validarViajeroToRol = useCallback(
    async (correo: string) => {
      setLoading(true);
      try {
        if (!correo) {
          throw new Error("Parece ser que el viajero no tiene correo");
        }
        return true;
      } catch (error: any) {
        console.error(error.response || error.message || "Error desconocido");
        showNotification("error", error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [authState]
  );

  const viajeroToUsuarioWithRol = useCallback(
    async ({
      correo,
      password,
      id_viajero,
      id_agente,
      rol,
    }: {
      correo: string;
      password: string;
      id_viajero: string;
      id_agente: string | null;
      rol: string;
    }) => {
      try {
        setLoading(true);
        return await auth_obj.viajero_to_usuario_with_rol({
          correo,
          password,
          id_viajero,
          id_agente,
          rol,
        });
      } catch (error: any) {
        console.error(error.response || error.message || "Error desconocido");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [authState]
  );

  const handleRegisterOldUser = useCallback(
    async (
      correo: string,
      password: string,
      usuario: InfoOldClientToRegister
    ) => {
      setLoading(true);
      try {
        //1.- Loggeamos al usuario
        const { data } = await SupabaseClient.getInstance().signUp({
          correo: correo,
          password: password,
          telefono: usuario.telefono || "",
          nombre: usuario.nombre_agente_completo,
        });

        //2.- Registramos al usuario en la base de datos de supabase con su rol
        const user_info = await SupabaseClient.getInstance().setInfoUser({
          id_user: data.user?.id ?? "",
          id_viajero: usuario.id_viajero,
          id_agente: usuario.id_agente,
        });

        //5.- Deslogueamos al usuario
        await SupabaseClient.getInstance().logOut();

        //6.- Volvemos a loggear al usuario
        await SupabaseClient.getInstance().logIn(correo, password);

        return user_info;
      } catch (error: any) {
        console.error(error.response || error.message || "Error desconocido");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleRegister = useCallback(
    async (form: UserRegistro, code: string) => {
      setLoading(true);
      try {
        //1.- Verificamos el codigo del usuario
        await otp.verificarOtp(form.correo, code);

        //2.- Agregamos al usuario
        const { data } = await SupabaseClient.getInstance().signUp({
          correo: form.correo,
          password: form.password,
          telefono: form.telefono,
          nombre: form.nombre_completo,
        });

        //3.- Registramos la información del usuario en la parte de nuestra base de datos
        const response = await auth_obj.registrar_usuario({
          ...form,
          id_agente: data.user?.id ?? "",
        });

        //4.- Registramos al usuario en la base de datos de supabase con su rol
        const user_info = await SupabaseClient.getInstance().setInfoUser({
          id_user: data.user?.id ?? "",
          id_viajero: response.data?.id_viajero ?? "",
        });

        //5.- Deslogueamos al usuario
        await SupabaseClient.getInstance().logOut();

        //6.- Volvemos a loggear al usuario
        await SupabaseClient.getInstance().logIn(form.correo, form.password);

        return user_info;
      } catch (error: any) {
        console.error(error.response || error.message || "Error desconocido");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setAuthState, auth_obj, otp]
  );

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        await SupabaseClient.getInstance().logIn(email, password);
      } catch (err: any) {
        console.error("Error logging in:", err.response || err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setAuthState]
  );

  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      await SupabaseClient.getInstance().logOut();
    } catch (err: any) {
      console.error("Error logging out:", err.response || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setAuthState]);

  const sendEmailToResetPassword = useCallback(
    async (correo: string) => {
      setLoading(true);
      try {
        await SupabaseClient.getInstance().sendEmailToResetPassword(correo);
      } catch (err: any) {
        console.error("Error reset password:", err.response || err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [authState]
  );

  const updatePassword = useCallback(
    async (password: string) => {
      setLoading(true);
      try {
        await SupabaseClient.getInstance().updatePassword(password);
      } catch (error: any) {
        console.error("Error update password", error.response || error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [authState]
  );

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    userLoading: authState.isLoading,
    loading,
    handleLogin,
    handleRegister,
    handleLogout,
    handleSendValidacion,
    sendEmailToResetPassword,
    updatePassword,
    handleValidateRegistroUsuario,
    handleRegisterOldUser,
    validarViajeroToRol,
    viajeroToUsuarioWithRol,
  };
};

export default useAuth;
