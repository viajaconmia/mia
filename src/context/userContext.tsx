// src/context/UserContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase, SupabaseClient } from "../services/supabaseClient";
import { UserAuth } from "../types/auth"; // Asegúrate de que UserAuth es robusto
import { Session } from "@supabase/supabase-js";
import { UserSingleton } from "../services/UserSingleton";

export type Auth = {
  user: UserAuth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const UserContext = createContext<{
  authState: Auth;
  setAuthState: React.Dispatch<React.SetStateAction<Auth>>;
}>({
  authState: { user: null, isAuthenticated: false, isLoading: true },
  setAuthState: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<Auth>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    console.log(authState);
  }, []);

  useEffect(() => {
    const fetchInfo = async (session: Session) => {
      const info = await SupabaseClient.getInstance().getInfo(session.user.id); // aquí pasas solo el user.id
      const userAuth: UserAuth = {
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.user_metadata.full_name ?? "", // o como lo guardes
        user: session.user,
        info,
      };
      // console.log(userAuth);
      UserSingleton.getInstance().setUser(userAuth);
      setAuthState({
        user: userAuth,
        isAuthenticated: true,
        isLoading: false,
      });
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        fetchInfo(session);
      } else {
        UserSingleton.getInstance().setUser(null);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    // Carga inicial de sesión
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await fetchInfo(data.session);
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ authState, setAuthState }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
