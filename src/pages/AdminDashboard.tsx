import { useState, useEffect } from "react";
import TwoColumnDropdown from "../components/molecule/TwoColumnDropdown";
import {
  Users,
  BarChart3,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  CreditCardIcon,
  File,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { TabsList } from "../components/molecule/TabsList";
import { formatCurrency, formatDate } from "../utils/format";
import { PagosService, Payment } from "../services/PagosService";
import { useNotification } from "../hooks/useNotification";
import { FacturaService } from "../services/FacturaService";
import { Invoice, ModalType, Reserva } from "../types/services";
import { BookingService } from "../services/BookingService";
import NavContainerModal from "../components/organism/detalles";
import { useSearch } from "../hooks/useSearch";
import { Redirect, Route, Switch, useLocation } from "wouter";
import ROUTES from "../constants/routes";
import { ColumnsTable, Table } from "../components/atom/table";

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
  | "general"
  | "usuarios"
  | "reservaciones"
  | "pagos"
  | "facturas";

const typesModal: ModalType[] = ["payment", "invoice", "booking"];

type ModalTypeMap = {
  booking: Reserva;
  payment: Payment & { id_pago: string | null; id_saldo: string | null };
  invoice: Invoice;
};

// Componente global para contenido expandible
const ExpandedContentRenderer = ({
  item,
  itemType,
  openDetails,
}: {
  item: any;
  itemType: ModalType;
  openDetails: (id: string | null, type: ModalType) => void;
}) => {
  const renderTypes = typesModal.filter((type) => type != itemType);

  const booking_columns: ColumnsTable<Reserva>[] = [
    {
      key: "codigo_reservacion_hotel",
      header: "ID",
      component: "button",
      componentProps: {
        onClick: (item: Reserva) => openDetails(item.id_hospedaje, "booking"),
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
  const payment_columns: ColumnsTable<
    Payment & { id_pago: string | null; id_saldo: string | null }
  >[] = [
    {
      key: "id_pago",
      header: "ID",
      component: "button",
      componentProps: {
        newValue: ["id_pago"],
        variant: "ghost",
        onClick: (
          item: Payment & { id_pago: string | null; id_saldo: string | null }
        ) =>
          openDetails(
            item.id_saldo ? item.id_saldo : item.id_pago || "",
            "payment"
          ),
      },
    },
    {
      key: "tipo",
      header: "Tipo",
      component: "text",
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
      component: "text",
    },
    {
      key: "total",
      header: "Total",
      component: "precio",
    },
  ];

  const renderData: {
    [K in ModalType]: {
      columns: ColumnsTable<ModalTypeMap[K]>[];
      title: string;
      data: ModalTypeMap[K][];
    };
  } = {
    booking: {
      columns: booking_columns,
      title: "Reservas asociadas",
      data:
        itemType == "invoice" || itemType == "payment"
          ? item.reservas_asociados || []
          : [],
    },
    payment: {
      columns: payment_columns,
      title: "Pagos asociados",
      data:
        itemType == "invoice" || itemType == "booking"
          ? item.pagos_asociados || []
          : [],
    },
    invoice: {
      columns: invoice_columns,
      title: "Facturas asociadas",
      data:
        itemType == "payment" || itemType == "booking"
          ? item.facturas_asociados || []
          : [],
    },
  };
  const left = renderData[renderTypes[0]];
  const right = renderData[renderTypes[1]];

  return (
    <TwoColumnDropdown
      leftContent={
        <div className="space-y-2">
          <h1>{left.title}</h1>
          <Table<(typeof left.data)[0]>
            data={left.data}
            columns={left.columns as ColumnsTable<(typeof left.data)[0]>[]}
          />
        </div>
      }
      rightContent={
        <div className="space-y-2">
          <h1>{right.title}</h1>
          <Table<(typeof right.data)[0]>
            data={right.data}
            columns={right.columns as ColumnsTable<(typeof right.data)[0]>[]}
          />
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
  const openDetails = (itemId: string | null, itemType: ModalType) => {
    try {
      if (!itemId) throw new Error("No hay id");

      setSelectedItemId(itemId);
      setSelectedItemType(itemType);
      setIsModalOpen(true);
    } catch (error: any) {
      console.error(error.message);
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
    general: <OverviewView stats={stats} />,
    facturas: <InvoicesView invoices={invoices} openDetails={openDetails} />,
    usuarios: <UsersView users={users} />,
    pagos: <PaymentsView payments={payments} openDetails={openDetails} />,
    reservaciones: (
      <BookingsView bookings={bookings} openDetails={openDetails} />
    ),
  };

  return (
    <>
      <div className="max-w-7xl w-[90vw] mx-auto mt-4 bg-white rounded-md space-y-4">
        <TabsList
          tabs={[
            { icon: BarChart3, tab: "general" },
            { icon: Users, tab: "usuarios" },
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
        <div>
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
          items={[]}
          itemType={selectedItemType}
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
  const response = useSearch();
  console.log(response);

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
        data={bookings}
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
    {
      key: null,
      header: "Acciones",
      component: "button",
      componentProps: {
        onClick: (item: Invoice) => console.log(item),
        label: "viendo",
      },
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
const UsersView = ({ users }: { users: User[] }) => {
  const userColumns: ColumnsTable<User>[] = [];

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
