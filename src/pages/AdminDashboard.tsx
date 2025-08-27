import { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import CsvDownload from "react-csv-downloader";
import { URL, API_KEY } from "../constants/apiConstant";
import {
  Users,
  Hotel,
  CreditCard,
  BarChart3,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Download,
  RefreshCw,
  Building2,
  Tag,
  FilePenLine,
  Factory,
  FileSignature,
  MapPinned,
  SlidersHorizontal,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { Table } from "../components/atom/table"; // Import the new Table component

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
  const [activeView, setActiveView] = useState<
    "overview" | "users" | "bookings" | "payments" | "invoices"
  >("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermUser, setSearchTermUser] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activateFilters, setActivateFilters] = useState(false);
  const [activateFiltersUsers, setActivateFiltersUsers] = useState(false);
  const [exportUsers, setExportUsers] = useState(false);
  const [exportBookings, setExportBookings] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeView === "bookings") {
      fetchBookings();
    }
  }, [activeView]);

  useEffect(() => {
    if (activeView === "users") {
      fetchUsers();
    }
  }, [activeView]);

  useEffect(() => {
    if (activeView === "payments") {
      fetchPayments();
    }
  }, [activeView]);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, statusFilter, bookings, dateEnd, dateStart]);

  useEffect(() => {
    filterUsers();
  }, [searchTermUser]);

  useEffect(() => {
    if (activeView === "invoices") {
      fetchInvoices();
    }
  }, [activeView]);

  const fetchInvoices = async () => {
    try {
      const apiData = await getfacturasByAgente(user?.info?.id_agente || "");

      // Asegúrate de que apiData y apiData.data existen y que apiData.data es un array
      if (apiData && Array.isArray(apiData.data)) {
        setInvoices(apiData.data);
        setFilteredInvoices(apiData.data);
      } else {
        console.error("No se encontraron facturas o el formato es incorrecto.");
        setInvoices([]);
        setFilteredInvoices([]);
      }
    } catch (error) {
      console.error("Error al obtener facturas:", error);
      setInvoices([]);
      setFilteredInvoices([]);
    }
  };

  const fetchPayments = async () => {
    try {
      if (!user?.info?.id_agente) {
        throw new Error("No hay ID de agente disponible");
      }
      const apiData = await get_pagos_prepago_by_ID(user.info.id_agente);
      if (apiData && Array.isArray(apiData.data)) {
        const transformedPayments: Payment[] = apiData.data.map((item: any) => ({
          id: item.id_movimiento || "",
          amount: parseFloat(item.monto) || 0,
          currency: item.moneda || "MXN",
          status: item.estatus || "pending",
          forma_pago: item.metodo,
          tipo_tarjeta: item.tipo || "",
          created_at: item.fecha_emision || new Date().toISOString().split('T')[0],
          updated_at: item.fecha_vencimiento || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          bookings: {
            hotel_name: item.nombre_hotel || "Hotel no especificado",
          },
        }));
        setFilteredPayments(transformedPayments);
      } else {
        setFilteredPayments([]);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      setFilteredPayments([]);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.hotel_name.toLowerCase().includes(searchLower) ||
          booking.confirmation_code.toLowerCase().includes(searchLower)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }
    if (dateEnd != "" && dateStart != "") {
      filtered = filtered.filter(
        (booking) =>
          Date.parse(booking.check_in) >= Date.parse(dateStart) &&
          Date.parse(booking.check_out) <= Date.parse(dateEnd)
      );
    }
    setFilteredBookings(filtered);
  };

  const filterUsers = () => {
    let filtered = [...users];
    if (searchTermUser) {
      const searchLower = searchTermUser.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.company_name.toLowerCase().includes(searchLower) ||
          user.industry?.toLowerCase().includes(searchLower) ||
          user.city?.toLowerCase().includes(searchLower) ||
          user.rfc?.toLowerCase().includes(searchLower)
      );
    }
    setFilteredUsers(filtered);
  };

  const fetchBookings = async () => {
    try {
      if (!user?.id) {
        throw new Error("No user authenticated or user ID is missing.");
      }
      const apiData = await getReservasByAgente(user.info.id_agente || "");
      if (apiData && Array.isArray(apiData.data)) {
        const transformedBookings: Booking[] = apiData.data.map((item: any) => ({
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
        }));

        // Store all bookings and apply the filter afterward
        setBookings(transformedBookings);
        setFilteredBookings(transformedBookings);
      } else {
        setBookings([]);
        setFilteredBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
      setFilteredBookings([]);
    }
  };

  const fetchUsers = async () => {
    try {
      if (!user) {
        throw new Error("No hay usuario autenticado");
      }
      setUsers([]);
      setFilteredUsers([]);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
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
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const exportPDF = async (tableId: string, filename: string) => {
    const element = document.querySelector(`#${tableId}`);
    if (element) {
      html2pdf(element).set({
        filename: filename,
        html2canvas: { scale: 2 },
      }).save();
    }
  };

  const procesarDatos = async (data: any) => {
    return Promise.resolve(data);
  };

  // Column definitions for each view
  const userColumns = [
    {
      key: "company_name", header: "Compañia", renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2"><Building2 className="w-4 h-4 text-gray-400" /><span>{value}</span></div>
      )
    },
    {
      key: "created_at", header: "Fecha Registro", renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-gray-400" /><span>{formatDate(value)}</span></div>
      )
    },
    {
      key: "industry", header: "Industria", renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2"><Factory className="w-4 h-4 text-gray-400" /><span>{value}</span></div>
      )
    },
    {
      key: "rfc", header: "RFC", renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2"><FileSignature className="w-4 h-4 text-gray-400" /><span>{value}</span></div>
      )
    },
    {
      key: "city", header: "Ciudad", renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2"><MapPinned className="w-4 h-4 text-gray-400" /><span>{value}</span></div>
      )
    },
  ];

  const bookingColumns = [
    {
      key: "created_at", header: "Fecha Creación", renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-gray-400" /><span>{formatDate(value)}</span></div>
      )
    },
    {
      key: "hotel_name", header: "Hotel", renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2"><Hotel className="w-4 h-4 text-gray-400" /><span>{value}</span></div>
      )
    },
    {
      key: "viajero", header: "Viajero", renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2"><Users className="w-4 h-4 text-gray-400" /><span>{value}</span></div>
      )
    },
    {
      key: "check_in", header: "Check-in", renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-gray-400" /><span>{formatDate(value)}</span></div>
      )
    },
    {
      key: "check_out", header: "Check-out", renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-gray-400" /><span>{formatDate(value)}</span></div>
      )
    },
    {
      key: "room_type", header: "Cuarto", renderer: ({ value }: { value: string }) => (
        <div className="flex items-center space-x-2"><Tag className="w-4 h-4 text-gray-400" /><span>{value}</span></div>
      )
    },
    {
      key: "total_price", header: "Precio", renderer: ({ value }: { value: number }) => (
        <div className="flex items-center space-x-2"><DollarSign className="w-4 h-4 text-gray-400" /><span>{formatCurrency(value)}</span></div>
      )
    },
    {
      key: "actions", header: "Acciones", renderer: ({ item }: { item: Payment }) => (
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors" title="Ver detalle">
            <FilePenLine className="w-5 h-5" />
          </button>
        </div>
      )
    },
  ];

  const paymentColumns = [
    { key: "created_at", header: "Fecha de Pago", renderer: ({ value }: { value: string }) => <span>{formatDate(value)}</span> },
    {
      key: "amount", header: "Monto", renderer: ({ value }: { value: number }) => (
        <div className="flex items-center space-x-2"><DollarSign className="w-4 h-4 text-gray-400" /><span>{formatCurrency(value)}</span></div>
      )
    },
    { key: "forma_pago", header: "Forma de Pago" }, // Asume que existe una propiedad "forma_pago" en tu data
    { key: "tipo_tarjeta", header: "Tipo de Tarjeta" }, // Asume que existe una propiedad "tipo_tarjeta" en tu data
    {
      key: "actions", header: "Acciones", renderer: ({ item }: { item: Payment }) => (
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors" title="Ver detalle">
            <FilePenLine className="w-5 h-5" />
          </button>
        </div>
      )
    },
  ];

  const invoiceColumns = [
    {
      key: "fecha_emision", header: "Fecha Facturación", renderer: ({ value }) => (
        <span>{formatDate(value)}</span>
      ),
    },
    {
      key: "subtotal", header: "Subtotal", renderer: ({ value }) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>{formatCurrency(parseFloat(value))}</span>
        </div>
      ),
    },
    {
      key: "impuestos", header: "IVA", renderer: ({ value }) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>{formatCurrency(parseFloat(value))}</span>
        </div>
      ),
    },
    {
      key: "total", header: "Total", renderer: ({ value }) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span>{formatCurrency(parseFloat(value))}</span>
        </div>
      ),
    },
    {
      key: "actions", header: "Acciones", renderer: ({ item }) => (
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors" title="Ver detalle">
            <FilePenLine className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-lg text-gray-700">Cargando panel de administración...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Panel de Administración</h1>
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveView("overview")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${activeView === "overview"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Vista General</span>
          </button>
          <button
            onClick={() => setActiveView("users")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${activeView === "users"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
          >
            <Users className="w-5 h-5" />
            <span>Usuarios</span>
          </button>
          <button onClick={() => setActiveView("bookings")} className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${activeView === "bookings" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
            <Hotel className="w-5 h-5" />
            <span>Reservaciones</span>
          </button>
          <button onClick={() => setActiveView("payments")} className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${activeView === "payments" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
            <CreditCard className="w-5 h-5" />
            <span>Pagos</span>
          </button>
          <button onClick={() => setActiveView("invoices")} className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${activeView === "invoices" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
            <FileSignature className="w-5 h-5" />
            <span>Facturas</span>
          </button>
        </div>

        {/* Overview */}
        {activeView === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stats Grid */}
            </div>
            {/* Recent Activity */}
          </div>
        )}

        {/* Overview */}
        {activeView === "overview" && (
          <div className="space-y-8">
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
                          <p className="text-sm text-gray-500">
                            {user.industry}
                          </p>
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
        )}

        {/* Users View */}
        {activeView === "users" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" onClick={() => setActivateFiltersUsers(!activateFiltersUsers)}>
                    <SlidersHorizontal className="w-5 h-5" />
                    <span>Filtrar</span>
                  </button>
                </div>
                <div className="relative flex items-center space-x-4">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={() => setExportUsers(!exportUsers)}>
                    <Download className="w-5 h-5" />
                    <span>Exportar</span>
                  </button>
                  {exportUsers && (
                    <div className="absolute font-semibold top-full mt-2 z-20 bg-slate-100 shadow-lg rounded-lg w-24 flex flex-col p-2">
                      <button className="w-full text-left px-2 py-1 border-b-2 hover:bg-gray-200" onClick={() => exportPDF("usersTable", "datosUsuarios.pdf")}>
                        PDF
                      </button>
                      <CsvDownload datas={filteredUsers} filename="datosUsuarios">
                        <button className="w-full text-left px-2 py-1 hover:bg-gray-200">CSV</button>
                      </CsvDownload>
                    </div>
                  )}
                </div>
              </div>
              {activateFiltersUsers && (
                <>
                  <div className="relative mb-4">
                    <input pattern="^[^<>]*$" type="text" placeholder="Buscar compañias, ciudades, industria, RFC..." value={searchTermUser} onChange={(e) => setSearchTermUser(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full" />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </>
              )}
              <Table id="usersTable" data={filteredUsers} columns={userColumns} />
            </div>
          </div>
        )}

        {/* Bookings View */}
        {activeView === "bookings" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap space-y-2">
                <div className="flex items">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" onClick={() => setActivateFilters(!activateFilters)}>
                    <SlidersHorizontal className="w-5 h-5" />
                    <span>Filtrar</span>
                  </button>
                </div>
                <div className="relative flex items-center space-x-4">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={() => setExportBookings(!exportBookings)}>
                    <Download className="w-5 h-5" />
                    <span>Exportar</span>
                  </button>
                  {exportBookings && (
                    <div className="absolute font-semibold top-full mt-2 z-20 bg-slate-100 shadow-lg rounded-lg w-24 flex flex-col p-2">
                      <button className="w-full text-left px-2 py-1 border-b-2 hover:bg-gray-200" onClick={() => exportPDF("bookingsTable", "datosReservas.pdf")}>
                        PDF
                      </button>
                      <CsvDownload datas={filteredBookings} filename="datosReservas">
                        <button className="w-full text-left px-2 py-1 hover:bg-gray-200">CSV</button>
                      </CsvDownload>
                    </div>
                  )}
                </div>
              </div>
              {activateFilters && (
                <div className="duration-500 transition-all ease-in-out">
                  <div className="flex items-center gap-x-4 gap-y-3 flex-wrap mb-4">
                    <div className="relative">
                      <input pattern="^[^<>]*$" type="text" placeholder="Buscar por hotel, código o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <div className="flex-row flex justify-center items-center relative gap-x-3">
                      <p>Fecha de inicio</p>
                      <input pattern="^[^<>]*$" type="date" placeholder="Ingresa fecha de fin" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="pl-5 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div className="flex-row flex justify-center items-center relative gap-x-3">
                      <p>Fecha de fin</p>
                      <input pattern="^[^<>]*$" type="date" placeholder="Ingresa fecha de fin" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="pl-5 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="all">Todos los estados</option>
                      <option value="pending">Pendientes</option>
                      <option value="completed">Completadas</option>
                      <option value="cancelled">Canceladas</option>
                    </select>
                  </div>
                </div>
              )}
              <Table id="bookingsTable" data={filteredBookings} columns={bookingColumns} />
            </div>
          </div>
        )}

        {/* Payments View */}
        {activeView === "payments" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Gestión de Pagos</h3>
            </div>
            <Table id="paymentsTable" data={filteredPayments} columns={paymentColumns} />
          </div>
        )}

        {/* Invoices View */}
        {activeView === "invoices" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Gestión de Facturas</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input pattern="^[^<>]*$" type="text" placeholder="Buscar facturas..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
              </div>
            </div>
            <Table id="invoicesTable" data={filteredInvoices} columns={invoiceColumns} />
          </div>
        )}
      </div>
    </div>
  );
};