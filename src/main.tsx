import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { UserProvider } from "./context/userContext.tsx";
import { Notification } from "./components/molecule/Notification.tsx";
import { NotificationProvider } from "./hooks/useNotification.tsx";
import { CartProvider } from "./context/cartContext.tsx";
import App from "./App.tsx";
import "./index.css";

const environment: string = import.meta.env.VITE_ENVIRONMENT;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {!!environment && (
      <div className="fixed top-0 w-[20vw] left-0 text-center text-xl font-bold text-white bg-red-700 z-[900]">
        {environment.toUpperCase()}
      </div>
    )}
    <NotificationProvider>
      <Notification></Notification>
      <UserProvider>
        <CartProvider>
          <App></App>
        </CartProvider>
      </UserProvider>
    </NotificationProvider>
  </StrictMode>
);
