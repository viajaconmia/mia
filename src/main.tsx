import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import { Dashboard } from "./pages/Dashboard.tsx";
import { UserProvider } from "./context/userContext.tsx";
import Inicio from "./components/page/Inicio.tsx";
import { Configuration } from "./pages/Configuration.tsx";
import { NavigationBar } from "./components/organism/NavigationBar.tsx";
import ROUTES from "./constants/routes.ts";
import { NewRegistrationPage } from "./pages/NewRegistrationPage.tsx";
import BookingsReportPage from "./pages/BookingsReportPage.tsx";
import { ProfilePage } from "./pages/ProfilePage.tsx";
import { AdminDashboard } from "./pages/AdminDashboard.tsx";
import { FAQPage } from "./pages/FAQPage.tsx";
import { HotelSearchPage } from "./pages/HotelSearchPage.tsx";
import ProtectedRoute from "./middleware/ProtectedRoute.tsx";
import { ResetPassword } from "./pages/ResetPassword.tsx";
import Loader from "./components/atom/Loader.tsx";
import { Reserva } from "./pages/Reserva.tsx";
import { Notification } from "./components/molecule/Notification.tsx";
import { NotificationProvider } from "./hooks/useNotification.tsx";
import { CartProvider } from "./context/cartContext.tsx";

const RouteSecure: React.FC<{
  path: string;
  component: React.ComponentType<any>;
  restricted?: boolean;
}> = ({ path, component: Component, restricted = false }) => {
  return (
    <>
      <Route path={path}>
        <ProtectedRoute restricted={restricted}>
          <Component></Component>
        </ProtectedRoute>
      </Route>
    </>
  );
};

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
          <NavigationBar />
          <Switch>
            <RouteSecure component={Reserva} path={ROUTES.BOOKINGS.ID} />
            <RouteSecure component={FAQPage} path={ROUTES.FAQ} />
            <RouteSecure
              component={NewRegistrationPage}
              path={ROUTES.AUTH.REGISTER}
            />
            <RouteSecure component={Inicio} path={ROUTES.HOME} />
            <RouteSecure
              restricted={true}
              component={HotelSearchPage}
              path={ROUTES.HOTELS.SEARCH}
            />
            <RouteSecure
              restricted={true}
              component={Configuration}
              path={ROUTES.SETTINGS}
            />
            <RouteSecure
              restricted={true}
              component={Dashboard}
              path={ROUTES.DASHBOARD}
            />
            <RouteSecure
              restricted={true}
              component={AdminDashboard}
              path={ROUTES.CONSULTAS}
            />
            <RouteSecure
              restricted={true}
              component={ProfilePage}
              path={ROUTES.PROFILE}
            />
            <RouteSecure
              restricted={true}
              component={BookingsReportPage}
              path={ROUTES.BOOKINGS.HOME}
            />

            <RouteSecure
              component={ResetPassword}
              path={ROUTES.AUTH.RESET_PASSWORD}
            />
            <Route path={"*"}>
              <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-50">
                <Loader></Loader>
                <h1 className="text-sky-950 font-semibold text-lg">
                  ERROR 404: Página no encontrada
                </h1>
              </div>
            </Route>
          </Switch>
        </CartProvider>
      </UserProvider>
    </NotificationProvider>
  </StrictMode>
);
