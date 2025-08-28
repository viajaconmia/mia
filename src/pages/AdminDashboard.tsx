import { useState, useEffect } from "react";
import { URL, API_KEY } from "../constants/apiConstant";
import NavContainerModal from "../components/organism/detalles";
import TwoColumnDropdown from "../components/molecule/TwoColumnDropdown";
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
  Search,
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
import { Table } from "../components/organism/Table"; // Import the new Table component
import { TabsList } from "../components/molecule/TabsList";
import { formatCurrency, formatDate } from "../utils/format";
import { TabSelected } from "../components/molecule/TabSelected";

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

interface Booking {
  id: string;
  confirmation_code: string;
  user_id: string;
  hotel_name: string;
  check_in: string;
  check_out: string;
  room_type: string;
  total_price: number;
  status: string;
  image_url?: string;
  created_at: string;
  company_profiles?: {
    company_name: string;
  };
}

interface User {
  id: string;
  company_name: string;
  rfc: string;
  industry: string;
  city: string;
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  bookings?: {
    hotel_name: string;
  };
}



interface Invoice {
  id: string;
  invoice_number: string;
  booking_id: string;
  company_name: string;
  rfc: string;
  amount: number;
  currency: string;
  status: string;
  issue_date: string;
  due_date: string;
  bookings?: {
    hotel_name: string;
    confirmation_code: string;
  };
}

const get_pagos_prepago_by_ID = async (id_agente: string) => {
  try {
    const response = await fetch(
      `${URL}/v1/mia/pagos/get_pagos_prepago_by_ID?id_agente=${id_agente}`,
      {
        method: "GET",
        headers: {
          "x-api-key": API_KEY || "",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    console.log("Pagos obtenidos:", data);
    return data;
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    return null;
  }
};

const getReservasByAgente = async (id_agente: string) => {
  try {
    const response = await fetch(
      `${URL}/v1/mia/reservasClient/get_reservasClient_by_id_agente?user_id=${id_agente}`,
      {
        method: "GET",
        headers: {
          "x-api-key": API_KEY || "",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    console.log("Reservas obtenidas:", data);
    return data;
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    return null;
  }
};

const getfacturasByAgente = async (id_agente: string) => {
  try {
    const response = await fetch(
      `${URL}/v1/mia/factura/get_agente_facturas?id_agente=${id_agente}`,
      {
        method: "GET",
        headers: {
          "x-api-key": API_KEY || "",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    console.log("Reservas obtenidas:", data);
    return data;
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    return null;
  }
};

type ViewsConsultas =
  | "Vista general"
  | "Usuarios"
  | "Reservaciones"
  | "Pagos"
  | "Facturas";

type ModalType = "payment" | "invoice";


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
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewsConsultas>("Vista general");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { user } = useAuth();

  // Nuevo estado para controlar el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<ModalType | null>(null);

  // Nueva función para abrir el modal
  const openDetails = (itemId: string, itemType: ModalType) => {
    setSelectedItemId(itemId);
    setSelectedItemType(itemType);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeView === "Reservaciones") {
      fetchBookings();
    }
  }, [activeView]);

  useEffect(() => {
    if (activeView === "Usuarios") {
      fetchUsers();
    }
  }, [activeView]);

  useEffect(() => {
    if (activeView === "Pagos") {
      fetchPayments();
    }
  }, [activeView]);

  useEffect(() => {
    if (activeView === "Facturas") {
      fetchInvoices();
    }
  }, [activeView]);

  const fetchInvoices = async () => {
    try {
      const apiData = await getfacturasByAgente(user?.info?.id_agente || "");

      // Asegúrate de que apiData y apiData.data existen y que apiData.data es un array
      if (apiData && Array.isArray(apiData.data)) {
        setInvoices(apiData.data);
      } else {
        console.error("No se encontraron facturas o el formato es incorrecto.");
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error al obtener facturas:", error);
      setInvoices([]);
    }
  };

  const fetchPayments = async () => {
    try {
      if (!user?.info?.id_agente) {
        throw new Error("No hay ID de agente disponible");
      }
      const apiData = await get_pagos_prepago_by_ID(user.info.id_agente);
      if (apiData && Array.isArray(apiData.data)) {
        const transformedPayments: Payment[] = apiData.data.map(
          (item: any) => ({
            id: item.id_movimiento || "",
            amount: parseFloat(item.monto) || 0,
            currency: item.moneda || "MXN",
            status: item.estatus || "pending",
            forma_pago: item.metodo,
            tipo_tarjeta: item.tipo || "",
            created_at:
              item.fecha_emision || new Date().toISOString().split("T")[0],
            updated_at:
              item.fecha_vencimiento ||
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            bookings: {
              hotel_name: item.nombre_hotel || "Hotel no especificado",
            },
          })
        );
        setFilteredPayments(transformedPayments);
      } else {
        setFilteredPayments([]);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      setFilteredPayments([]);
    }
  };

  const fetchBookings = async () => {
    try {
      if (!user?.info?.id_agente) {
        throw new Error("No user authenticated or user ID is missing.");
      }
      const apiData = await getReservasByAgente(user.info.id_agente || "");
      if (apiData && Array.isArray(apiData.data)) {
        const transformedBookings: Booking[] = apiData.data.map(
          (item: any) => ({
            id: item.id_booking,
            confirmation_code: item.confirmation_code,
            user_id: item.user_id,
            hotel_name: item.hotel,
            check_in: item.check_in,
            check_out: item.check_out,
            room_type: item.room,
            total_price: parseFloat(item.total),
            status: item.status_reserva,
            image_url: item.URLImagenHotel,
            created_at: item.created_at,
            viajero: item.nombre_viajero_reservacion,
            acompañantes: item.nombres_viajeros_acompañantes,
            company_profiles: {
              company_name: item.quien_reservó,
            },
          })
        );

        // Store all bookings and apply the filter afterward
        setBookings(transformedBookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
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
    } finally {
      setIsLoading(false);
    }
  };

  const views: Record<ViewsConsultas, React.ReactNode> = {
    Facturas: <InvoicesView invoices={invoices} />,
    "Vista general": <OverviewView stats={stats} />,
    Usuarios: <UsersView users={users} />,
    Pagos: <PaymentsView filteredPayments={filteredPayments} />,
    Reservaciones: <BookingsView bookings={bookings} openDetails={openDetails} />, // Pasa openDetails aquí
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
          agentId={user?.info?.id_agente || ""} // ID del agente, no del item
          initialItemId={selectedItemId} // ID del item seleccionado
          items={([])} // Función para obtener los items
          itemType={selectedItemType}
        />
      )}
    </>
  );
};

const BookingsView = ({ bookings, openDetails }: { bookings: Booking[], openDetails: (id: string, type: ModalType) => void }) => {

  const renderExpandedContent = (booking: Booking) => (
    <TwoColumnDropdown
      leftContent={
        <div>
          <h4 className="font-semibold mb-2">Información del Hotel</h4>
          <p><strong>Hotel:</strong> {booking.hotel_name}</p>
          <p><strong>Tipo de habitación:</strong> {booking.room_type}</p>
          <p><strong>Código de confirmación:</strong> {booking.confirmation_code}</p>
        </div>
      }
      rightContent={
        <div>
          <h4 className="font-semibold mb-2">Detalles de la Reserva</h4>
          <p><strong>Check-in:</strong> {formatDate(booking.check_in)}</p>
          <p><strong>Check-out:</strong> {formatDate(booking.check_out)}</p>
          <p><strong>Precio total:</strong> {formatCurrency(booking.total_price)}</p>
          <p><strong>Estado:</strong> {booking.status}</p>
        </div>
      }
    />
  );

  const bookingColumns = [

    {
      key: "hotel_name",
      header: "Hotel",
      renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2">
          <Hotel className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "viajero",
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
      key: "room_type",
      header: "Cuarto",
      renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "total_price",
      header: "Precio",
      renderer: ({ value }: { value: number }) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>{formatCurrency(value)}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      renderer: ({ item }: { item: Booking }) => (
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
            title="Ver detalle"
            onClick={() => openDetails(item.id, "payment")} // Usa la función openDetails de las props
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
        <Table<Booking>
          id="bookingsTable"
          data={bookings}
          columns={bookingColumns}
          expandableContent={renderExpandedContent} // Pasa la función de contenido expandible
        />
      </div>
    </div>
  );
};

const PaymentsView = ({
  filteredPayments,
}: {
  filteredPayments: Payment[];
}) => {
  const paymentColumns = [
    {
      key: "created_at",
      header: "Fecha de Pago",
      renderer: ({ value }: { value: string }) => (
        <span>{formatDate(value)}</span>
      ),
    },
    {
      key: "amount",
      header: "Monto",
      renderer: ({ value }: { value: number }) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>{formatCurrency(value)}</span>
        </div>
      ),
    },
    { key: "forma_pago", header: "Forma de Pago" }, // Asume que existe una propiedad "forma_pago" en tu data
    { key: "tipo_tarjeta", header: "Tipo de Tarjeta" }, // Asume que existe una propiedad "tipo_tarjeta" en tu data
    {
      key: "actions",
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
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">
          Gestión de Pagos
        </h3>
      </div>
      <Table
        id="paymentsTable"
        data={filteredPayments}
        columns={paymentColumns}
      />
    </div>
  );
};
const InvoicesView = ({ invoices }: { invoices: Invoice[] }) => {
  const invoiceColumns = [
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
      key: "actions",
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
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Gestión de Facturas
          </h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                pattern="^[^<>]*$"
                type="text"
                placeholder="Buscar facturas..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>
      <Table<Invoice>
        id="invoicesTable"
        data={invoices}
        columns={invoiceColumns}
      />
    </div>
  );
};
const UsersView = ({ users }: { users: User[] }) => {
  const userColumns = [
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
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.status === "completed"
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
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status === "completed"
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
