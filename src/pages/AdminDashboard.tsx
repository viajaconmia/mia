import { useState, useEffect } from "react";
import TwoColumnDropdown from "../components/molecule/TwoColumnDropdown";
import { StatCard } from "../components/atom/StatCard";
import Donut from "../components/Donut";
import {
  Users,
  Hotel,
  BarChart3,
  Calendar,
  DollarSign,
  Clock,
  XCircle,
  Building2,
  Tag,
  FilePenLine,
  Factory,
  FileSignature,
  MapPinned,
  CreditCardIcon,
  File,
  CheckCircle,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { ColumnsTable, Table } from "../components/organism/Table";
import { TabsList } from "../components/molecule/TabsList";
import { formatCurrency, formatDate } from "../utils/format";
import { TabSelected } from "../components/molecule/TabSelected";
import { PagosService, Payment } from "../services/PagosService";
import { useNotification } from "../hooks/useNotification";
import { FacturaService } from "../services/FacturaService";
import { Invoice, Reserva } from "../types/services";
import { BookingService } from "../services/BookingService";
import NavContainerModal from "../components/organism/detalles";
import { HEADERS_API, URL } from "../constants/apiConstant";

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

interface User {
  id: string;
  company_name: string;
  rfc: string;
  industry: string;
  city: string;
  created_at: string;
}

type ViewsConsultas =
  | "Vista general"
  | "Usuarios"
  | "Reservaciones"
  | "Pagos"
  | "Facturas";

type ModalType = "payment" | "invoice";

// Componente global para contenido expandible
const ExpandedContentRenderer = ({ item, itemType }: { item: any; itemType: string }) => {
  // Función para renderizar múltiples elementos de un arreglo
  const renderArrayItems = (array: any[], title: string, renderFunction: (item: any, index: number) => JSX.Element) => {
    if (!array || array.length === 0) {
      return (
        <div>
          <h4 className="font-semibold mb-2">{title}</h4>
          <p className="text-gray-500">No hay información disponible</p>
        </div>
      );
    }

    return (
      <div>
        <h4 className="font-semibold mb-2">{title}</h4>
        {array.map((arrayItem, index) => (
          <div key={index} className={index > 0 ? "mt-3 pt-3 border-t border-gray-100" : ""}>
            {renderFunction(arrayItem, index)}
          </div>
        ))}
      </div>
    );
  };

  switch (itemType) {
    case "booking":
      return (
        <TwoColumnDropdown
          leftContent={
            <div>
              <h4 className="font-semibold mb-2">Información del Hotel</h4>
              <p><strong>Hotel:</strong> {item.hotel_name}</p>
              <p><strong>Tipo de habitación:</strong> {item.room_type}</p>
              <p><strong>Código de confirmación:</strong> {item.confirmation_code}</p>
            </div>
          }
          rightContent={
            <div>
              <h4 className="font-semibold mb-2">Detalles de la Reserva</h4>
              <p><strong>Check-in:</strong> {formatDate(item.check_in)}</p>
              <p><strong>Check-out:</strong> {formatDate(item.check_out)}</p>
              <p><strong>Precio total:</strong> {formatCurrency(item.total_price)}</p>
              <p><strong>Estado:</strong> {item.status}</p>
            </div>
          }
        />
      );

    case "payment":
      // Obtener información relacionada (puede ser arreglos)
      const relatedBookings = item.booking_info || [];
      const relatedInvoices = item.invoice_info || [];

      return (
        <TwoColumnDropdown
          leftContent={renderArrayItems(
            relatedBookings,
            "Información de Reserva",
            (booking) => (
              <>
                <p><strong>Hotel:</strong> {booking.hotel_name}</p>
                <p><strong>Check-in:</strong> {formatDate(booking.check_in)}</p>
                <p><strong>Check-out:</strong> {formatDate(booking.check_out)}</p>
                <p><strong>Viajero:</strong> {booking.nombre_viajero_reservacion}</p>
                {booking.confirmation_code && (
                  <p><strong>Código confirmación:</strong> {booking.confirmation_code}</p>
                )}
              </>
            )
          )}
          rightContent={renderArrayItems(
            relatedInvoices,
            "Información de Factura",
            (invoice) => (
              <>
                <p><strong>Fecha factura:</strong> {formatDate(invoice.fecha_emision)}</p>
                <p><strong>Subtotal:</strong> {formatCurrency(parseFloat(invoice.subtotal || 0))}</p>
                <p><strong>IVA:</strong> {formatCurrency(parseFloat(invoice.impuestos || 0))}</p>
                <p><strong>Total:</strong> {formatCurrency(parseFloat(invoice.total || 0))}</p>
                {invoice.folio && <p><strong>Folio:</strong> {invoice.folio}</p>}
              </>
            )
          )}
        />
      );

    case "invoice":
      // Obtener información relacionada (puede ser arreglos)
      const invoiceBookings = item.reservas_asociadas || [];
      const invoicePayments = item.movimientos_pago || [];

      return (
        <TwoColumnDropdown
          leftContent={renderArrayItems(
            invoiceBookings,
            "Información de Reservas",
            (booking) => (
              <>
                <p><strong>Hotel:</strong> {booking.hotel_name}</p>
                <p><strong>Check-in:</strong> {formatDate(booking.check_in)}</p>
                <p><strong>Check-out:</strong> {formatDate(booking.check_out)}</p>
                <p><strong>Habitación:</strong> {booking.room_type}</p>
                {booking.confirmation_code && (
                  <p><strong>Código confirmación:</strong> {booking.confirmation_code}</p>
                )}
              </>
            )
          )}
          rightContent={renderArrayItems(
            invoicePayments,
            "Información de Pagos",
            (payment) => (
              <>
                <p><strong>Fecha pago:</strong> {formatDate(payment.fecha_pago)}</p>
                <p><strong>Monto:</strong> {formatCurrency(payment.monto || 0)}</p>
                <p><strong>Método:</strong> {payment.tipo}</p>
                <p><strong>Tipo tarjeta:</strong> {payment.metodo}</p>
                {payment.referencia && <p><strong>Referencia:</strong> {payment.referencia}</p>}
              </>
            )
          )}
        />
      );

    default:
      return <div>Información no disponible</div>;
  }
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
  const [activeView, setActiveView] = useState<ViewsConsultas>("Vista general");
  const [bookings, setBookings] = useState<Reserva[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { user } = useAuth();

  // Nuevo estado para controlar el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<ModalType | null>(
    null
  );
  const { showNotification } = useNotification();

  // Nueva función para abrir el modal
  const openDetails = (itemId: string, itemType: ModalType) => {
    setSelectedItemId(itemId);
    setSelectedItemType(itemType);
    setIsModalOpen(true);
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

  const fetchPayments = async () => {
    try {
      const { data } = await PagosService.getInstance().getPagosConsultas();
      setPayments(data?.pagos || []);
      console.log(data);
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
      console.log(data);
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
      setUsers([]);
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
    Facturas: <InvoicesView invoices={invoices} openDetails={openDetails} />,
    "Vista general": <OverviewView stats={stats} />,
    Usuarios: <UsersView users={users} />,
    Pagos: <PaymentsView payments={payments} openDetails={openDetails} />,
    Reservaciones: (
      <BookingsView bookings={bookings} openDetails={openDetails} />
    ),
  };

  return (
    <>
      <div className="max-w-7xl mx-auto mt-4 bg-gray-100 rounded-md space-y-4">
        <TabsList
          tabs={[
            { icon: BarChart3, tab: "Vista general" },
            { icon: Users, tab: "Usuarios" },
            { icon: Building2, tab: "Reservaciones" },
            { icon: CreditCardIcon, tab: "Pagos" },
            { icon: File, tab: "Facturas" },
          ]}
          onChange={(tab) => {
            setActiveView(tab as ViewsConsultas);
          }}
          activeTab={activeView}
        />
        <div>
          <TabSelected tabs={views} selected={activeView}></TabSelected>
        </div>
      </div>
      {isModalOpen && selectedItemId && selectedItemType && (
        <NavContainerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          agentId={user?.info?.id_agente || ""}
          initialItemId={selectedItemId}
          items={[]}
          itemType={selectedItemType}
        />
      )}
    </>
  );
};

const BookingsView = ({ bookings, openDetails }: { bookings: Reserva[], openDetails: (id: string, type: ModalType) => void }) => {
  const bookingColumns: ColumnsTable<Reserva>[] = [
    {
      key: "hotel",
      header: "Hotel",
      renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2">
          <Hotel className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "nombre_viajero_reservacion",
      header: "Viajero",
      renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "check_in",
      header: "Check-in",
      renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{formatDate(value)}</span>
        </div>
      ),
    },
    {
      key: "check_out",
      header: "Check-out",
      renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{formatDate(value)}</span>
        </div>
      ),
    },
    {
      key: "room",
      header: "Cuarto",
      renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "total",
      header: "Precio",
      renderer: ({ value }: { value: number }) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>{formatCurrency(value)}</span>
        </div>
      ),
    },
    {
      key: null,
      header: "Acciones",
      renderer: ({ item }: { item: Reserva }) => (
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
            title="Ver detalle"
            onClick={() => openDetails(item.id_booking || "", "payment")}
          >
            <FilePenLine className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <Table<Reserva>
          id="bookingsTable"
          data={bookings}
          columns={bookingColumns}
          expandableContent={(booking) => (
            <ExpandedContentRenderer item={booking} itemType="booking" />
          )}
        />
      </div>
    </div>
  );
};

const PaymentsView = ({
  payments,
  openDetails
}: {
  payments: Payment[];
  openDetails: (id: string, type: ModalType) => void;
}) => {
  const paymentColumns: ColumnsTable<Payment>[] = [
    {
      key: "fecha_pago",
      header: "Fecha de Pago",
      renderer: ({ value }: { value: string }) => (
        <span>{formatDate(value)}</span>
      ),
    },
    {
      key: "monto",
      header: "Monto",
      renderer: ({ value }: { value: number }) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>{formatCurrency(value)}</span>
        </div>
      ),
    },
    { key: "metodo", header: "Forma de Pago" },
    { key: "tipo", header: "Tipo de Tarjeta" },
    {
      key: null,
      header: "Acciones",
      renderer: ({ item }: { item: Payment }) => (
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
            title="Ver detalle"
            onClick={() => openDetails(item.raw_id || "", "payment")}
          >
            <FilePenLine className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">
          Gestión de Pagos
        </h3>
      </div>
      <Table
        id="paymentsTable"
        data={payments}
        columns={paymentColumns}
        expandableContent={(payment) => (
          <ExpandedContentRenderer item={payment} itemType="payment" />
        )}
      />
    </div>
  );
};

const InvoicesView = ({ invoices, openDetails }: { invoices: Invoice[], openDetails: (id: string, type: ModalType) => void }) => {
  const invoiceColumns: ColumnsTable<Invoice>[] = [
    {
      key: "fecha_emision",
      header: "Fecha Facturación",
      renderer: ({ value }: { value: string }) => (
        <span>{formatDate(value)}</span>
      ),
    },
    {
      key: "subtotal",
      header: "Subtotal",
      renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>{formatCurrency(parseFloat(value))}</span>
        </div>
      ),
    },
    {
      key: "impuestos",
      header: "IVA",
      renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>{formatCurrency(parseFloat(value))}</span>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>{formatCurrency(parseFloat(value))}</span>
        </div>
      ),
    },
    {
      key: null,
      header: "Acciones",
      renderer: ({ item }: { item: Invoice }) => (
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
            title="Ver detalle"
            onClick={() => openDetails(item.id_factura || "", "invoice")}
          >
            <FilePenLine className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="">
      <Table<Invoice>
        id="invoicesTable"
        data={invoices}
        columns={invoiceColumns}
        expandableContent={(invoice) => (
          <ExpandedContentRenderer item={invoice} itemType="invoice" />
        )}
      />
    </div>
  );
};

const UsersView = ({ users }: { users: User[] }) => {
  const userColumns: ColumnsTable<User>[] = [
    {
      key: "company_name",
      header: "Compañia",
      renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Fecha Registro",
      renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{formatDate(value)}</span>
        </div>
      ),
    },
    {
      key: "industry",
      header: "Industria",
      renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2">
          <Factory className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "rfc",
      header: "RFC",
      renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2">
          <FileSignature className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "city",
      header: "Ciudad",
      renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2">
          <MapPinned className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <Table id="usersTable" data={users} columns={userColumns} />
      </div>
    </div>
  );
};

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
      purple: "bg-purple-50 text-purple-600"
    };

    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 ${colorClasses[color as keyof typeof colorClasses]} rounded-full flex items-center justify-center`}>
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
    const [data, setData] = useState([]);

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
          .map((obj, index) => ({
            name: obj.hotel,
            amount: Number(obj.total_gastado),
            color: `bg-cyan-${index + 1}00`,
          })),
      },
    ];

    const summary1 = [
      {
        name: "Noches",
        data: data
          .filter((obj) => obj.mes.includes(`${selectedMonth}`))
          .map((obj, index) => ({
            name: obj.hotel,
            amount: obj.visitas,
            color: `bg-cyan-${index + 1}00`,
          })),
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <Donut
            summary={summary}
            titulo="Gráfica por gasto"
            subtitulo="Aquí verás cuanto es tu gasto por mes"
            simbol="$"
          />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <Donut
            summary={summary1}
            titulo="Gráfica por noches"
            subtitulo="Aquí verás cuántas noches por mes reservaron"
          />
        </div>
      </div>
    );
  };

  // Calcular estadísticas para las tarjetas
  const fechaHoy = new Date();
  fechaHoy.setHours(0, 0, 0, 0);

  const activeBookings = monthlyStats.filter((obj: any) =>
    new Date(obj.check_in) <= fechaHoy && new Date(obj.check_out) > fechaHoy
  ).length || "0";
  const upcomingBookings = monthlyStats.filter((obj: any) => new Date(obj.check_in) > fechaHoy).length || "0";
  const monthlySpending = monthlyStats.reduce(
    (accumulator: number, currentValue: any) => accumulator + Number(currentValue.total),
    0
  ) || 0;

  const cards = [
    {
      title: "Reservas Activas",
      value: activeBookings,
      icon: Calendar,
      subtitle: "Este mes",
      color: "indigo"
    },
    {
      title: "Próximas Reservas",
      value: upcomingBookings,
      icon: Building2,
      subtitle: "Este mes",
      color: "yellow"
    },
    {
      title: "Total de Reservas",
      value: stats.totalBookings || "0",
      icon: Calendar,
      subtitle: "Historial completo",
      color: "indigo"
    },
    {
      title: "Gasto Mensual",
      value: `$${monthlySpending.toLocaleString("es-MX")}`,
      icon: DollarSign,
      subtitle: "Este mes",
      color: "green"
    },
  ];

  return (
    <div className="space-y-8 p-4">
      {/* Grid de estadísticas con colores originales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Panel de Control</h2>
          <div className="flex gap-3">
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
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Anual</h3>
          <GraphContainer />
        </div>
      </div>
    </div >
  );
};