import { useState, useEffect } from "react";
import {
  Users,
  Hotel,
  BarChart3,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  Tag,
  FilePenLine,
  Factory,
  FileSignature,
  MapPinned,
  CreditCardIcon,
  File,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { ColumnsTable, Table } from "../components/atom/table"; // Import the new Table component
import { TabsList } from "../components/molecule/TabsList";
import { formatCurrency, formatDate } from "../utils/format";
import { TabSelected } from "../components/molecule/TabSelected";
import { PagosService, Payment } from "../services/PagosService";
import { useNotification } from "../hooks/useNotification";
import { FacturaService } from "../services/FacturaService";
import { Invoice, Reserva } from "../types/services";
import { BookingService } from "../services/BookingService";

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
  const { showNotification } = useNotification();
  const { user } = useAuth();

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
    Facturas: <InvoicesView invoices={invoices} />,
    "Vista general": <OverviewView stats={stats} />,
    Usuarios: <UsersView users={users} />,
    Pagos: <PaymentsView payments={payments} />,
    Reservaciones: <BookingsView bookings={bookings} />,
  };

  return (
    <>
      <div className="max-w-7xl w-[90vw] mx-auto mt-4 bg-gray-50 rounded-md space-y-4">
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
    </>
  );
};

const BookingsView = ({ bookings }: { bookings: Reserva[] }) => {
  const bookingColumns: ColumnsTable<Reserva>[] = [
    {
      key: "created_at",
      header: "Fecha Creación",
      renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{formatDate(value)}</span>
        </div>
      ),
    },
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
            onClick={() => console.log(item)}
          >
            <FilePenLine className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="">
      <Table<Reserva>
        id="bookingsTable"
        data={bookings}
        columns={bookingColumns}
      />
    </div>
  );
};
const PaymentsView = ({ payments }: { payments: Payment[] }) => {
  const paymentColumns: ColumnsTable<Payment>[] = [
    {
      key: "fecha_creacion",
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
    { key: "metodo", header: "Forma de Pago" }, // Asume que existe una propiedad "forma_pago" en tu data
    { key: "tipo", header: "Tipo de Tarjeta" }, // Asume que existe una propiedad "tipo_tarjeta" en tu data
    {
      key: null,
      header: "Acciones",
      renderer: ({ item }: { item: Payment }) => (
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
            title="Ver detalle"
            onClick={() => console.log(item)}
          >
            <FilePenLine className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="">
      <Table id="paymentsTable" data={payments} columns={paymentColumns} />
    </div>
  );
};
const InvoicesView = ({ invoices }: { invoices: Invoice[] }) => {
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
            onClick={() => console.log(item)}
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
    <div className="">
      <Table id="usersTable" data={users} columns={userColumns} />
    </div>
  );
};
const OverviewView = ({ stats }: { stats: DashboardStats }) => {
  return (
    <div>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stats Grid */}
        </div>
        {/* Recent Activity */}
      </div>

      <div className="space-y-8 p-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Usuarios</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalUsers}
                </h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>12% más que el mes pasado</span>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Reservas</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalBookings}
                </h3>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>8% más que el mes pasado</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ingresos Totales</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.totalRevenue)}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-red-600">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              <span>3% menos que el mes pasado</span>
            </div>
          </div>

          {/* Active Bookings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Reservas Activas</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.activeBookings}
                </h3>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>5% más que el mes pasado</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Usuarios Recientes
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {stats.recentUsers.map((user: any) => (
                <div key={user.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.company_name}
                      </p>
                      <p className="text-sm text-gray-500">{user.industry}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Reservas Recientes
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {stats.recentBookings.map((booking: any) => (
                <div key={booking.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.hotel_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.confirmation_code}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {booking.status === "completed" ? (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        ) : booking.status === "pending" ? (
                          <Clock className="w-4 h-4 mr-1" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-1" />
                        )}
                        {booking.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatCurrency(booking.total_price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Pagos Recientes
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentPayments.map((payment: any) => (
              <div key={payment.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {payment.bookings?.hotel_name || "Hotel"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {payment.bookings?.confirmation_code || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : payment.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {payment.status}
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
