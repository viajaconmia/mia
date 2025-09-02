import { useState, useEffect } from "react";
import TwoColumnDropdown from "../components/molecule/TwoColumnDropdown";
import Donut from "../components/Donut";
import {
  // Users,
  BarChart3,
  Calendar,
  DollarSign,
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
import { Invoice, ModalType, Reserva } from "../types/services";
import { BookingService } from "../services/BookingService";
import NavContainerModal from "../components/organism/detalles";
import { Redirect, Route, Switch, useLocation, useSearchParams } from "wouter";
import ROUTES from "../constants/routes";
import { ColumnsTable, Table } from "../components/atom/table";
import { HEADERS_API, URL } from "../constants/apiConstant";
import { InputText } from "../components/atom/Input";
import { DonutChart } from "@tremor/react";
import { formatNumberWithCommas } from "../utils/format";

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  recentUsers: any[];
  recentBookings: any[];
  recentPayments: any[];
  monthlyRevenue: any[];
}

// interface User {
//   id: string;
//   company_name: string;
//   rfc: string;
//   industry: string;
//   city: string;
//   created_at: string;
// }

type ViewsConsultas =
  | "general"
  // | "usuarios"
  | "reservaciones"
  | "pagos"
  | "facturas";

const typesModal: ModalType[] = ["payment", "invoice", "booking"];

type ModalTypeMap = {
  booking: Reserva;
  payment: Payment;
  invoice: Invoice;
};

// Componente global para contenido expandible
// Reemplaza el componente ExpandedContentRenderer con esta versión corregida:

const ExpandedContentRenderer = ({
  item,
  itemType,
  openDetails,
}: {
  item: any;
  itemType: ModalType;
  openDetails: (id: string | null, type: ModalType) => void;
}) => {

  // Verifica la estructura real de tus datos
  console.log("Item data:", item);
  console.log("Item type:", itemType);

  // Define las columnas para cada tipo
  const booking_columns: ColumnsTable<Reserva>[] = [
    {
      key: "codigo_reservacion_hotel",
      header: "ID",
      component: "copiar_and_button",
      componentProps: {


        newValue: ["id_hospedaje"],

        variant: "ghost",
        onClick: (booking: Reserva) =>
          openDetails(booking.id_hospedaje || booking.id_reservacion || "", "booking"),
      },
    },
    {
      key: "hotel",
      header: "Hotel",
      component: "text",
    },
    {
      key: "total",
      header: "Total",
      component: "precio",
    },


  ];

  const payment_columns: ColumnsTable<Payment>[] = [
    {
      key: "id_pago",
      header: "ID",
      component: "copiar_and_button",
      componentProps: {
        newValue: ["id_pago"],
        variant: "ghost",
        onClick: (payment: Payment) =>
          openDetails(payment.id_saldo || payment.id_pago || "", "payment"),
      },
    },
    {
      key: "monto",
      header: "Total",
      component: "precio",
    },
  ];

  const invoice_columns: ColumnsTable<Invoice>[] = [
    {
      key: "id_factura",
      header: "ID",
      component: "copiar_and_button",
      componentProps: {
        variant: "ghost",
        onClick: (invoice: Invoice) =>
          openDetails(invoice.id_factura || "", "invoice"),
      },
    },
    {
      key: "total",
      header: "Total",
      component: "precio",
    },
  ];

  // Determina qué datos mostrar basado en el tipo del item principal
  const getRelatedData = () => {
    switch (itemType) {
      case "booking":
        return {
          left: {
            columns: invoice_columns,
            title: "Facturas asociadas",
            data: item.facturas || item.facturas_asociadas || [],
          },
          right: {
            columns: payment_columns,
            title: "Pagos asociados",
            data: item.pagos || item.pagos_asociados || [],
          }
        };
      case "payment":
        return {
          left: {
            columns: invoice_columns,
            title: "Facturas asociadas",
            data: item.facturas || item.facturas_asociadas || [],
          },
          right: {
            columns: booking_columns,
            title: "Reservas asociadas",
            data: item.reservas || item.reservas_asociadas || [],
          }
        };
      case "invoice":
        return {
          left: {
            columns: payment_columns,
            title: "Pagos asociados",
            data: item.pagos || item.pagos_asociados || [],
          },
          right: {
            columns: booking_columns,
            title: "Reservas asociadas",
            data: item.reservas || item.reservas_asociadas || [],
          }
        };
      default:
        return {
          left: { columns: [], title: "", data: [] },
          right: { columns: [], title: "", data: [] }
        };
    }
  };

  const { left, right } = getRelatedData();


  return (
    <TwoColumnDropdown
      leftContent={
        <div className="space-y-2">
          <h1 className="font-semibold">{left.title}</h1>
          {left.data.length > 0 ? (
            <Table
              data={left.data}
              columns={left.columns}
            />
          ) : (
            <p className="text-gray-500">No hay {left.title.toLowerCase()}</p>
          )}
        </div>
      }
      rightContent={
        <div className="space-y-2">
          <h1 className="font-semibold">{right.title}</h1>
          {right.data.length > 0 ? (
            <Table
              data={right.data}
              columns={right.columns}
            />
          ) : (
            <p className="text-gray-500">No hay {right.title.toLowerCase()}</p>
          )}
        </div>
      }
    />
  );
};

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    recentUsers: [],
    recentBookings: [],
    recentPayments: [],
    monthlyRevenue: [],
  });
  const [location, setLocation] = useLocation();
  const [bookings, setBookings] = useState<Reserva[]>([]);
  // const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { user } = useAuth();

  // Nuevo estado para controlar el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<ModalType | null>(
    null
  );
  const [selectedItemData, setSelectedItemData] = useState<
    ModalTypeMap[ModalType] | null
  >(null);
  const { showNotification } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  // Nueva función para abrir el modal
  // Reemplaza la función openDetails existente con esta versión

  // Agrega estas funciones dentro del componente AdminDashboard

  const getBookingById = (id: string): Reserva | undefined => {
    return bookings.find(booking =>
      booking.id_hospedaje === id
    );
  };

  const getPaymentById = (id: string): Payment | undefined => {
    return payments.find(payment =>
      payment.raw_id
    );
  };

  const getInvoiceById = (id: string): Invoice | undefined => {
    return invoices.find(invoice => invoice.id_factura === id);
  };

  const openDetails = (itemId: string | null, itemType: ModalType) => {
    try {
      if (!itemId) throw new Error("No hay id");

      let itemData: ModalTypeMap[ModalType] | null = null;

      // Buscar los datos correspondientes según el tipo
      switch (itemType) {
        case "booking":
          itemData = getBookingById(itemId) || null;
          break;
        case "payment":
          itemData = getPaymentById(itemId) || null;
          break;
        case "invoice":
          itemData = getInvoiceById(itemId) || null;
          break;
      }

      setSelectedItemId(itemId);
      setSelectedItemType(itemType);
      setSelectedItemData(itemData);
      setIsModalOpen(true);

      console.log("Item data encontrado:", itemData); // Para debugging
    } catch (error: any) {
      console.error(error.message);
      showNotification("error", "Error al abrir los detalles");
    }
  };

  // Agrega esta función para transformar los items al formato esperado
  const getItemsByType = (type: ModalType): any[] => {
    switch (type) {
      case "booking":
        return bookings.map(booking => ({
          id: booking.id_hospedaje || "",
          title: booking.hotel || "Reserva sin nombre",
          subtitle: booking.nombre_viajero_reservacion || "",
          amount: booking.total || 0,
          date: booking.check_in || "",
          status: booking.status_reserva || ""
        }));
      case "payment":
        return payments.map(payment => ({
          id: payment.raw_id || "",
          title: `Pago ${payment.metodo || ""}`,
          subtitle: payment.tipo || "",
          amount: payment.monto || 0,
          date: payment.fecha_pago || "",
        }));
      case "invoice":
        return invoices.map(invoice => ({
          id: invoice.id_factura || "",
          title: `Factura ${invoice.id_factura || ""}`,
          subtitle: "",
          amount: invoice.total || 0,
          date: invoice.fecha_emision || "",
          status: invoice.estado || ""
        }));
      default:
        return [];
    }
  };

  useEffect(() => {
    fetchDataPage();
  }, []);

  const fetchDataPage = () => {
    fetchDashboardData();
    fetchBookings();
    fetchUsers();
    fetchPayments();
    fetchInvoices();
  };

  const fetchInvoices = async () => {
    try {
      const { data } = await FacturaService.getInstance().getFacturasByAgente();
      console.log(data);
      setInvoices(data || []);
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      setInvoices([]);
      showNotification("error", error.message || "");
    }
  };

  // Definir la interfaz ListItem localmente si no está importada


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
      // setUsers([]);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setStats({
        totalUsers: 0,
        totalBookings: bookings?.length || 0,
        totalRevenue: 0,
        activeBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        recentUsers: [],
        recentBookings: [],
        recentPayments: [],
        monthlyRevenue: [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const views: Record<ViewsConsultas, React.ReactNode> = {
    general: <OverviewView stats={stats} />,
    facturas: <InvoicesView invoices={invoices} openDetails={openDetails} />,
    // usuarios: <UsersView users={users} />,
    pagos: <PaymentsView payments={payments} openDetails={openDetails} />,
    reservaciones: (
      <BookingsView bookings={bookings} openDetails={openDetails} />
    ),
  };

  // const item: bookings||payments||invoices.find((item));

  return (
    <>
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
            (location.split("/").at(-1) as ViewsConsultas) || "general"
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
      {isModalOpen && selectedItemId && selectedItemType && (
        <NavContainerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          agentId={user?.info?.id_agente || ""}
          initialItemId={selectedItemId}
          // items={getItemsByType(selectedItemType)}
          itemType={selectedItemType}
          itemData={selectedItemData}
        />
      )}
    </>
  );
};

const BookingsView = ({
  bookings,
  openDetails,
}: {
  bookings: Reserva[];
  openDetails: (id: string | null, type: ModalType) => void;
}) => {
  const [searchParams] = useSearchParams();
  const params = searchParams.get("search");

  let search = params ? params : "";
  const filterBookings = bookings.filter(
    (booking) => {
      console.log("chcando booking", booking)
      return booking.id_booking?.includes(search) ||
        booking.id_hospedaje?.includes(search) ||
        booking.nombre_viajero_reservacion?.includes(search)
    }
  );

  const bookingColumns: ColumnsTable<Reserva>[] = [
    {
      key: "hotel",
      header: "Hotel",
      component: "text",
    },
    {
      key: "nombre_viajero_reservacion",
      header: "Viajero",
      component: "text",
    },
    {
      key: "check_in",
      header: "Check-in",
      component: "date",
    },
    {
      key: "check_out",
      header: "Check-out",
      component: "date",
    },
    {
      key: "room",
      header: "Cuarto",
      component: "text",
    },
    {
      key: "total",
      header: "Precio",
      component: "text",
    },
  ];

  return (
    <div className="">
      <Table<Reserva>
        id="bookingsTable"
        data={filterBookings}
        columns={bookingColumns}
        expandableContent={(booking) => (
          <ExpandedContentRenderer
            openDetails={openDetails}
            item={booking}
            itemType="booking"
          />
        )}
      />
    </div>
  );
};

const PaymentsView = ({
  payments,
  openDetails,
}: {
  payments: Payment[];
  openDetails: (id: string | null, type: ModalType) => void;
}) => {
  const paymentColumns: ColumnsTable<Payment>[] = [
    { key: "fecha_pago", header: "Fecha de Pago", component: "date" },
    { key: "monto", header: "Monto", component: "precio" },
    { key: "metodo", header: "Forma de Pago", component: "text" },
    { key: "tipo", header: "Tipo de Tarjeta", component: "text" },
  ];

  return (
    <div className="">
      <Table<Payment>
        id="paymentsTable"
        data={payments}
        columns={paymentColumns}
        expandableContent={(payment) => (
          <ExpandedContentRenderer
            openDetails={openDetails}
            item={payment}
            itemType="payment"
          />
        )}
      />
    </div>
  );
};

const InvoicesView = ({
  invoices,
  openDetails,
}: {
  invoices: Invoice[];
  openDetails: (id: string | null, type: ModalType) => void;
}) => {
  const invoiceColumns: ColumnsTable<Invoice>[] = [
    {
      key: "id_factura",
      header: "Fecha Facturación",
      component: "text",
    },
    {
      key: "fecha_emision",
      header: "Fecha Facturación",
      component: "date",
    },
    {
      key: "subtotal",
      header: "Subtotal",
      component: "precio",
    },
    {
      key: "impuestos",
      header: "IVA",
      component: "precio",
    },
    {
      key: "total",
      header: "Total",
      component: "precio",
    },
  ];

  return (
    <div className="">
      <Table<Invoice>
        id="invoicesTable"
        data={invoices}
        columns={invoiceColumns}
        expandableContent={(invoice) => (
          <ExpandedContentRenderer
            openDetails={openDetails}
            item={invoice}
            itemType="invoice"
          />
        )}
      />
    </div>
  );
};

// const UsersView = ({ users }: { users: User[] }) => {
//   const userColumns: ColumnsTable<User>[] = [];

//   return (
//     <div className="">
//       <Table id="usersTable" data={users} columns={userColumns} />
//     </div>
//   );
// };

const OverviewView = ({ stats }: { stats: DashboardStats }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { user } = useAuth();
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);

  // Componente StatCard con colores originales
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    subtitle?: string;
    color?: string;
  }> = ({ title, value, icon: Icon, subtitle, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600",
      indigo: "bg-indigo-50 text-indigo-600",
      green: "bg-green-50 text-green-600",
      yellow: "bg-yellow-50 text-yellow-600",
      red: "bg-red-50 text-red-600",
      purple: "bg-purple-50 text-purple-600",
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div
            className={`w-12 h-12 ${colorClasses[color as keyof typeof colorClasses]
              } rounded-full flex items-center justify-center`}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  // Selector de Mes
  const MonthSelector: React.FC<{
    selectedMonth: number;
    onChange: (month: string) => void;
  }> = ({ selectedMonth, onChange }) => {
    const months = [
      { value: 1, month: "Enero" },
      { value: 2, month: "Febrero" },
      { value: 3, month: "Marzo" },
      { value: 4, month: "Abril" },
      { value: 5, month: "Mayo" },
      { value: 6, month: "Junio" },
      { value: 7, month: "Julio" },
      { value: 8, month: "Agosto" },
      { value: 9, month: "Septiembre" },
      { value: 10, month: "Octubre" },
      { value: 11, month: "Noviembre" },
      { value: 12, month: "Diciembre" },
    ];

    return (
      <div className="relative">
        <select
          value={selectedMonth}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {months.map((month) => (
            <option key={month.month} value={month.value}>
              {month.month}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // Selector de Año
  const YearSelector: React.FC<{
    selectedYear: number;
    onChange: (year: number) => void;
  }> = ({ selectedYear, onChange }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
      <div className="relative">
        <select
          value={selectedYear}
          onChange={(e) => onChange(Number(e.target.value))}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // Obtener estadísticas mensuales
  useEffect(() => {
    const fetchMonthlyStats = async () => {
      try {
        const response = await fetch(
          `${URL}/v1/mia/stats/monthly?month=${selectedMonth}&year=${selectedYear}&id_user=${user?.info?.id_agente}`,
          {
            method: "GET",
            headers: HEADERS_API,
          }
        );
        const json = await response.json();
        setMonthlyStats(
          json.data.filter(
            (obj: any) => obj.id_pago != null || obj.id_credito != null
          )
        );
      } catch (error) {
        console.error("Error al obtener estadísticas mensuales:", error);
      }
    };

    if (user?.info?.id_agente) {
      fetchMonthlyStats();
    }
  }, [selectedMonth, selectedYear, user?.info?.id_agente]);

  // Componente para mostrar las gráficas
  const GraphContainer = () => {
    interface MonthlyStat {
      hotel: string;
      mes: string;
      total_gastado: number;
      visitas: number;
      total: number;
      check_in?: string;
      check_out?: string;
      id_pago?: string | null;
      id_credito?: string | null;
    }
    const [data, setData] = useState<MonthlyStat[]>([]);

    useEffect(() => {
      const fetchMonthlyStats = async () => {
        try {
          const response = await fetch(
            `${URL}/v1/mia/stats/year?year=${selectedYear}&id_user=${user?.info?.id_agente}&mes=${selectedMonth}`,
            {
              method: "GET",
              headers: HEADERS_API,
            }
          );
          const json = await response.json();
          setData(json);
        } catch (error) {
          console.error("Error al obtener estadísticas mensuales:", error);
        }
      };

      if (user?.info?.id_agente) {
        fetchMonthlyStats();
      }
    }, [selectedMonth, selectedYear, user?.info?.id_agente]);

    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0);

    const summary = [
      {
        name: "Gastos",
        data: data
          .filter((obj) => obj.mes.includes(`${selectedMonth}`))
          .map((obj) => ({
            name: obj.hotel,
            amount: Number(obj.total_gastado),
            href: "#",
          })),
      },
    ];

    const summary1 = [
      {
        name: "Noches",
        data: data
          .filter((obj) => obj.mes.includes(`${selectedMonth}`))
          .map((obj) => ({
            name: obj.hotel,
            amount: obj.visitas,
            href: "#",
          })),
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* <div className="bg-white rounded-xl shadow-sm p-6"> */}
        <Donut
          summary={summary}
          titulo="Gráfica por gasto"
          subtitulo="Aquí verás cuanto es tu gasto por mes"
          simbol="$"
        />
        {/* </div> */}
        {/* <div className="bg-white rounded-xl shadow-sm p-6"> */}
        <Donut
          summary={summary1}
          titulo="Gráfica por noches"
          subtitulo="Aquí verás cuántas noches por mes reservaron"
          simbol={""}
        />
        {/* </div> */}
      </div>
    );
  };

  // Calcular estadísticas para las tarjetas
  const fechaHoy = new Date();
  fechaHoy.setHours(0, 0, 0, 0);

  const activeBookings =
    monthlyStats.filter(
      (obj: any) =>
        new Date(obj.check_in) <= fechaHoy && new Date(obj.check_out) > fechaHoy
    ).length || "0";
  const upcomingBookings =
    monthlyStats.filter((obj: any) => new Date(obj.check_in) > fechaHoy)
      .length || "0";
  const monthlySpending =
    monthlyStats.reduce(
      (accumulator: number, currentValue: any) =>
        accumulator + Number(currentValue.total),
      0
    ) || 0;

  const cards = [
    {
      title: "Reservas Activas",
      value: activeBookings,
      icon: Calendar,
      subtitle: "Este mes",
      color: "indigo",
    },
    {
      title: "Próximas Reservas",
      value: upcomingBookings,
      icon: Building2,
      subtitle: "Este mes",
      color: "yellow",
    },
    {
      title: "Total de Reservas",
      value: stats.totalBookings || "0",
      icon: Calendar,
      subtitle: "Historial completo",
      color: "indigo",
    },
    {
      title: "Gasto Mensual",
      value: `$${monthlySpending.toLocaleString("es-MX")}`,
      icon: DollarSign,
      subtitle: "Este mes",
      color: "green",
    },
  ];

  return (
    <div className="px-4 py-4 bg-gray-100">
      {/* Grid de estadísticas con colores originales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-2">
        {cards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            subtitle={card.subtitle}
            color={card.color as any}
          />
        ))}
      </div>
      {/* Selectores de mes y año */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <MonthSelector
              selectedMonth={selectedMonth}
              onChange={(month) => setSelectedMonth(Number(month))}
            />
            <YearSelector
              selectedYear={selectedYear}
              onChange={(year) => setSelectedYear(year)}
            />
          </div>
        </div>
        {/* Gráficas */}
        <div className="">
          <GraphContainer />
        </div>
      </div>
    </div>
  );
};
