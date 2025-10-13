import { useState, useEffect } from "react";
import {
  BarChart3,
  Building2,
  CreditCardIcon,
  File,
  Search,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { TabsList } from "../components/molecule/TabsList";
import { PagosService, Payment } from "../services/PagosService";
import { useNotification } from "../hooks/useNotification";
import { FacturaService } from "../services/FacturaService";
import { Invoice, Reserva } from "../types/services";
import { BookingService } from "../services/BookingService";
import { Redirect, Route, Switch, useLocation, useSearchParams } from "wouter";
import ROUTES from "../constants/routes";
import { fetchFullDetalles } from "../services/detalles"; // tu util
import { InputText } from "../components/atom/Input";
import {
  BookingsView,
  InvoicesView,
  OverviewView,
  PaymentsView,
} from "../components/organism/ViewsAdmin";

type ViewsConsultas = "general" | "reservaciones" | "pagos" | "facturas";

export const AdminDashboard = () => {
  const [location, setLocation] = useLocation();
  const [bookings, setBookings] = useState<Reserva[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // estado para el botón de prueba
  const [testingFull, setTestingFull] = useState(false);

  useEffect(() => {
    fetchDataPage();
  }, []);

  const fetchDataPage = () => {
    fetchBookings();
    fetchUsers();
    fetchPayments();
    fetchInvoices();
  };

  const fetchInvoices = async () => {
    try {
      const { data } = await FacturaService.getInstance().getFacturasByAgente();
      setInvoices(data || []);
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      setInvoices([]);
      showNotification("error", error.message || "");
    }
  };

  const fetchPayments = async () => {
    try {
      const { data } = await PagosService.getInstance().getPagosConsultas();
      setPayments(data?.pagos || []);
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      setPayments([]);
      showNotification("error", error.message || "");
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await BookingService.getInstance().getReservas();
      setBookings(data || []);
      console.log(bookings);
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
      showNotification("error", error.message || "");
    }
  };

  const fetchUsers = async () => {
    try {
      if (!user) throw new Error("No hay usuario autenticado");
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // IDs estáticos de prueba
  const DEBUG_ID_AGENTE = "6d86f110-3ea0-41ce-9afa-696738bc8daa";
  const DEBUG_ID_BUSCAR = "fac-198632df-9fd6-4877-9235-d1af19bb734e";

  const views: Record<ViewsConsultas, React.ReactNode> = {
    general: <OverviewView bookings={bookings} />,
    facturas: <InvoicesView invoices={invoices} />,
    pagos: <PaymentsView payments={payments} />,
    reservaciones: <BookingsView bookings={bookings} />,
  };

  console.log(bookings, "cambios de bookings");

  return (
    <div className="max-w-7xl w-[90vw] mx-auto mt-4 bg-white rounded-md space-y-4">
      <TabsList
        tabs={[
          { icon: BarChart3, tab: "general" },
          { icon: Building2, tab: "reservaciones" },
          { icon: CreditCardIcon, tab: "pagos" },
          { icon: File, tab: "facturas" },
        ]}
        onChange={(tab) => {
          setLocation(ROUTES.CONSULTAS.SUBPATH(tab));
        }}
        activeTab={
          (location.split("/").slice(-1)[0] as ViewsConsultas) || "general"
        }
      />

      {/* Barra superior: buscador + botón de prueba */}
      <div className="px-4 flex items-center justify-between gap-3">
        {location != ROUTES.CONSULTAS.SUBPATH("general") ? (
          <InputText
            icon={Search}
            onChange={(value) => {
              setSearchParams((prev) => {
                const params = new URLSearchParams(prev);
                params.set("search", value);
                return params;
              });
            }}
            value={searchParams.get("search") || ""}
          />
        ) : (
          <div /> /* placeholder para mantener el botón a la derecha */
        )}

        <button
          onClick={async () => {
            try {
              setTestingFull(true);
              const resp = await fetchFullDetalles({
                id_agente: DEBUG_ID_AGENTE,
                id_buscar: DEBUG_ID_BUSCAR,
              });
              console.log("getFullDetalles (onClick):", resp);
              showNotification("success", "SP ejecutado (revisa consola)");
            } catch (e: any) {
              console.error(e);
              showNotification("error", e?.message || "Error al ejecutar SP");
            } finally {
              setTestingFull(false);
            }
          }}
          className={`px-3 py-2 rounded text-white ${testingFull ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          disabled={testingFull}
        >
          {testingFull ? "Cargando..." : "Probar getFullDetalles"}
        </button>

      </div>

      <div className="max-h-[calc(100vh-11rem)] overflow-y-auto rounded-b-lg">
        <Switch>
          {Object.entries(views).map(([key, Component]) => (
            <Route key={key} path={ROUTES.CONSULTAS.SUBPATH(key)}>
              {Component}
            </Route>
          ))}
          <Route path="*">
            <Redirect to={ROUTES.CONSULTAS.SUBPATH(Object.keys(views)[0])} />
          </Route>
        </Switch>
      </div>
    </div>
  );
};
