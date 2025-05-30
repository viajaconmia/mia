// UserContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
type UserAuth = {
  id: string;
  email: string;
  name: string;
} | null;

type Auth = {
  user?: UserAuth;
  isAuthenticated?: boolean;
  promptCount: number;
} | null;

// Crea el contexto
const UserContext = createContext<{
  authState?: Auth;
  setAuthState: React.Dispatch<React.SetStateAction<Auth>>;
}>({
  authState: null,
  setAuthState: () => {},
});

// Crea un proveedor que envuelva tu aplicación
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<Auth>({
    user: null,
    isAuthenticated: false,
    promptCount: 0,
  });

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthState({
          user: {
            id: session.user.id,
            email: session.user.email!,
            name:
              session.user.user_metadata.full_name ||
              session.user.email!.split("@")[0],
          },
          isAuthenticated: true,
          promptCount: 0,
        });
      }
    });

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setAuthState({
          user: {
            id: session.user.id,
            email: session.user.email!,
            name:
              session.user.user_metadata.full_name ||
              session.user.email!.split("@")[0],
          },
          isAuthenticated: true,
          promptCount: 0,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          promptCount: 0,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log(authState);
  }, [authState]);

  return (
    <UserContext.Provider
      value={{
        authState,
        setAuthState,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => useContext(UserContext);
