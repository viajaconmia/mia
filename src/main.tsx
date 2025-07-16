import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import App from "./App.tsx";
import "./index.css";
import { Dashboard } from "./pages/Dashboard.tsx";
import { BillingPage } from "./pages/BillingPage.tsx";
import { Reserva } from "./pages/Reserva.tsx";
import { ResetPassword } from "./pages/ResetPassword.tsx";
import { UserProvider } from "./context/userContext.tsx";
import { Facturacion } from "./components/page/Facturacion.tsx";
import Inicio from "./components/page/Inicio.tsx";

const environment = import.meta.env.VITE_ENVIRONMENT;
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {environment == "pruebas" && (
      <div
        className="fixed top-0 w-[20vw] left-0 text-center text-xl font-bold text-white bg-red-700"
        style={{
          zIndex: 9999,
        }}
      >
        PRUEBAS
      </div>
    )}
    <UserProvider>
      <Switch>
        <Route path={"/inicio"}>
          <Inicio />
        </Route>
        <Route path={"/facturacion"}>
          <Facturacion />
        </Route>
        <Route path={"/factura/:id"}>
          <BillingPage onBack={() => {}} invoiceData={undefined} />
        </Route>
        <Route path={"/dashboard"}>
          <Dashboard />
        </Route>
        <Route path={"/reserva/:id"}>
          <Reserva />
        </Route>
        <Route path={"/reset-password"}>
          <ResetPassword />
        </Route>
        <Route component={App} path={"*"} />
      </Switch>
    </UserProvider>
  </StrictMode>
);
