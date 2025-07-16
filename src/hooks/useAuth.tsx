import { useState, useCallback } from "react";
import { supabase } from "../services/supabaseClient";
import { useUser } from "../context/userContext";

const useAuth = () => {
  const { setAuthState, authState } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.log(error);
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Correo electrónico o contraseña incorrectos");
          }
          throw error;
        }

        if (data.user) {
          const isAdmin = email === "mianoktos@gmail.com";
          setAuthState((prevAuthState) => ({
            ...prevAuthState,
            user: {
              id: data.user!.id,
              email: data.user!.email!,
              name:
                data.user!.user_metadata.full_name ||
                data.user!.email!.split("@")[0],
              isAdmin,
            },
            isAuthenticated: true,
            promptCount: prevAuthState?.promptCount ?? 0,
          }));
          // setIsModalOpen(false); // Esto debería ser manejado por el componente que llama al hook
        }
      } catch (err: any) {
        setError(err.message || "Ocurrió un error al iniciar sesión.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setAuthState]
  );

  const handleRegister = useCallback(
    async (email: string, password: string, name: string) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          const isAdmin = email === "mianoktos@gmail.com";
          setAuthState((prevAuthState) => ({
            ...prevAuthState,
            user: {
              id: data.user!.id,
              email: data.user!.email!,
              name: name,
              isAdmin,
            },
            isAuthenticated: true,
            promptCount:
              prevAuthState && typeof prevAuthState.promptCount === "number"
                ? prevAuthState.promptCount
                : 0,
          }));
          // setIsModalOpen(false); // Esto debería ser manejado por el componente que llama al hook
        }
      } catch (err: any) {
        setError(err.message || "Ocurrió un error al registrarse.");
        console.error("Error registering:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setAuthState]
  );

  const handleLogout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await supabase.auth.signOut();
      setAuthState({
        user: null,
        isAuthenticated: false,
        promptCount: 0, // Reset promptCount on logout
      });
      // setMessages([]); // Estas operaciones de limpieza de estado específico de la UI no deberían estar en el hook de autenticación
      // setBookingData(null); // sino en el componente que usa el hook o en otro contexto/hook.
      // setCurrentPage("chat"); // Lo mismo aplica aquí.
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al cerrar sesión.");
      console.error("Error logging out:", err);
    } finally {
      setLoading(false);
    }
  }, [setAuthState]);

  return {
    user: authState?.user,
    isAuthenticated: authState?.isAuthenticated,
    loading,
    error,
    handleLogin,
    handleRegister,
    handleLogout,
  };
};

export default useAuth;
