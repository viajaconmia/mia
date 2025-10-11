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

  useEffect(() => {
    fetchDataPage();
  }, []);

  const fetchDataPage = () => {
    // fetchDashboardData();
    fetchBookings();
    fetchUsers();
    fetchPayments();
    fetchInvoices();
  };

  const fetchInvoices = async () => {
    try {
      const { data } = await FacturaService.getInstance().getFacturasByAgente();
      // console.log("invoices", data);
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
      // console.log("payments", data?.pagos);
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
      // console.log("bookings", data);
      setBookings(data || []);
      console.log(bookings)
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
      showNotification("error", error.message || "");
    }
  };

  const fetchUsers = async () => {
    try {
      if (!user) {
        throw new Error("No hay usuario autenticado");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const views: Record<ViewsConsultas, React.ReactNode> = {
    general: <OverviewView bookings={bookings} />,
    facturas: <InvoicesView invoices={invoices} />,
    pagos: <PaymentsView payments={payments} />,
    reservaciones: <BookingsView bookings={bookings} />,
  };

  console.log(bookings, "cambios de bookings")

  return (
    <div className="max-w-7xl w-[90vw] mx-auto mt-4 bg-white rounded-md space-y-4">
      <TabsList
        tabs={[
          { icon: BarChart3, tab: "general" },
          // { icon: Users, tab: "usuarios" },
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
      <div className="px-4">
        {location != ROUTES.CONSULTAS.SUBPATH("general") && (
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
        )}
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
