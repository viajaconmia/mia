import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../services/supabaseClient";

export default function Impersonado() {
  const router = useRouter();
  console.log("probando probando");

  useEffect(() => {
    // Leer tokens desde el hash (#access_token=...&refresh_token=...)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token }).then(() => {
        // Bandera opcional para UI de impersonación
        localStorage.setItem("impersonando", "true");

        // Redirige a la app del cliente (dashboard, home, etc.)
        router.push("/");
      });
    } else {
      router.push("/login"); // fallback en caso de error
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-medium">
        Estableciendo sesión como cliente...
      </p>
    </div>
  );
}
