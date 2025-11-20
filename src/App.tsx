import { Route, Switch } from "wouter";
import { NavigationBar } from "./components/organism/NavigationBar";
import { RouteSecure } from "./middleware/RouteSecure";
import { Reserva } from "./pages/Reserva";
import { FAQPage } from "./pages/FAQPage";
import { NewRegistrationPage } from "./pages/NewRegistrationPage";
import ROUTES from "./constants/routes";
import Inicio from "./components/page/Inicio";
import { HotelSearchPage } from "./pages/HotelSearchPage";
import BillingPage from "./pages/BillingPage";
import { ManualReservationPage } from "./pages/ManualReservationPage";
import { Configuration } from "./pages/Configuration";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ProfilePage } from "./pages/ProfilePage";
import BookingsReportPage from "./pages/BookingsReportPage";
import { ResetPassword } from "./pages/ResetPassword";
import Loader from "./components/atom/Loader";
import { Impersonado } from "./components/page/Impersonado";
import Chat from "./components/page/Chat";
import { BillingPage2 } from "./components/page/billingepage2";
import { ChatProvider } from "./context/ChatContext"; // Importa el ChatProvider

const App = () => {
  return (
    <>
      <NavigationBar />
      <Switch>
        <RouteSecure component={Impersonado} path={ROUTES.IMPERSONADO} />
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
          component={BillingPage}
          path={ROUTES.FACTURACION.HOME}
        />
        <RouteSecure
          restricted={true}
          component={ManualReservationPage}
          path={ROUTES.HOTELS.ID}
        />
        <RouteSecure
          restricted={true}
          component={Configuration}
          path={ROUTES.SETTINGS}
        />
        <RouteSecure
          restricted={true}
          component={BillingPage2}
          path={ROUTES.FACTURACION.PAGOS}
        />
        <RouteSecure
          restricted={true}
          component={AdminDashboard}
          path={ROUTES.CONSULTAS.REDIRECT}
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

        {/* Aquí se envuelve la ruta de chat con el ChatProvider */}
        <RouteSecure path={ROUTES.MIA.HOME}>
          <ChatProvider>
            <Chat />
          </ChatProvider>
        </RouteSecure>

        <RouteSecure
          component={ResetPassword}
          path={ROUTES.AUTH.RESET_PASSWORD}
        />
        <Route path={"*"}>
          <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-50">
            <Loader />
            <h1 className="text-sky-950 font-semibold text-lg">
              ERROR 404: Página no encontrada
            </h1>
          </div>
        </Route>
      </Switch>
    </>
  );
};

export default App;
