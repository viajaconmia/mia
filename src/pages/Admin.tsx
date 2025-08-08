import { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import ReservationDetailsModal from "../components/ReservationDetailsModal";
import { PaymentDeatailsModal } from "../components/PaymentDetailsModal";
import { FacturaDetailsModal } from "../components/PaymentDetailsModal";
import CsvDownload from "react-csv-downloader";
import {
  Users,
  CreditCard,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Building2,
  SlidersHorizontal,
  Gift,
  WalletCards,
  Coins,
  Trophy,
  ArrowRight,
  User,
  Eye,
  DownloadCloud,
} from "lucide-react";
import { fetchViajerosCompanies } from "../hooks/useFetch";
import {
  getReservasConsultasAgente,
  getPagosConsultasAgente,
  getFacturasConsultasAgente,
} from "../hooks/useDatabase";
import useApi from "../hooks/useApi";
import useAuth from "../hooks/useAuth";

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
  hotel_name: string;
  check_in: string;
  check_out: string;
  room_type: string;
  total_price: number;
  status: string;
  created_at: string;
  image_url?: string;
  traveler_name?: string;
  traveler_id?: string;
  payment_method?: string;
  booking_stage?: string;
  id_pago: string;
  pendiente_por_cobrar: number;
  is_booking?: boolean;
  factura: string | null;
  solicitud_total: number;
}

interface User {
  id_viajero: string;
  primer_nombre: string;
  segundo_nombre?: string | null;
  apellido_paterno: string;
  apellido_materno?: string | null;
  empresas: {
    id_empresa: string;
    razon_social: string;
  }[];
  fecha_nacimiento?: string | null;
  correo: string;
  genero: string;
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

interface Factura {
  id: string;
  invoice_type: string;
  status: string;
  amount: number;
  tax_percentage: number;
  created_at: string;
}

export const Admin = () => {
  const { user } = useAuth();
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
    "overview" | "users" | "bookings" | "payments" | "facturas" | "rewards"
  >("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermUser, setSearchTermUser] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [filteredFactura, setFilteredFactura] = useState<Factura[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredPaymets, setFilteredPayments] = useState<Payment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { descargarFactura } = useApi();
  const [activateFilters, setActivateFilters] = useState(false);
  const [activateFiltersUsers, setActivateFiltersUsers] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenPay, setIsModalOpenPay] = useState(false);
  const [isModalOpenFac, setIsModalOpenFac] = useState(false);

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
    if (activeView === "facturas") {
      fetchFacturas();
    }
  }, [activeView]);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, statusFilter, bookings, dateEnd, dateStart]);

  useEffect(() => {
    filterUsers();
  }, [searchTermUser]);

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.hotel_name.toLowerCase().includes(searchLower) ||
          booking.confirmation_code.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
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

    // Filter by search term
    if (searchTermUser) {
      const searchLower = searchTermUser.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.primer_nombre?.toLowerCase().includes(searchLower) ||
          //user.empresas?.toLowerCase().includes(searchLower) ||
          user.correo?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredUsers(filtered);
  };

  const fetchBookings = async () => {
    try {
      if (!user) {
        throw new Error("No hay usuario autenticado.");
      }
      const data = await getReservasConsultasAgente(user.id);
      setBookings(data || []);
      setFilteredBookings(data || []);
      // obtenerSolicitudesWithViajero((json) => {
      //   setBookings([...json]);
      //   setFilteredBookings([...json]);
      // }, user.id);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchFacturas = async () => {
    try {
      if (!user) {
        throw new Error("No hay usuario autenticado");
      }
      const invoiceData = await getFacturasConsultasAgente(user.id);
      console.log(invoiceData);
      setFilteredFactura(invoiceData || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await fetchViajerosCompanies();
      setUsers(data || []);
      setFilteredUsers(data || []);
      console.log(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchPayments = async () => {
    try {
      if (!user) {
        throw new Error("No hay usuario autenticado");
      }
      const paymentsData = await getPagosConsultasAgente(user.id);
      setFilteredPayments(paymentsData || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      if (!user) {
        throw new Error("No hay usuario autenticado.");
      }
      console.log(user.id);

      // Fetch total travelers

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
  const handleDownloadPDF = (obj: any) => {
    if (!obj) return;

    const linkSource = `data:application/pdf;base64,${obj.Content}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = "factura.pdf";
    downloadLink.click();
  };

  const handleDescargarFactura = async (id: string) => {
    try {
      const obj = await descargarFactura(id);
      handleDownloadPDF(obj);
    } catch (error) {
      alert("Ha ocurrido un error al descargar la factura");
    }
  };

  const exportPDF = async () => {
    const element = document.querySelector("#bookings");
    html2pdf(element);
  };

  const exportPDFUsers = async () => {
    const element = document.querySelector("#users");
    html2pdf(element);
  };

  const procesarDatos = async (data) => {
    return Promise.resolve(data);
  };

  const handleViewDetails = (reservation: any) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleViewDetailsFactura = (reservation: any) => {
    setSelectedReservation(reservation);
    setIsModalOpenFac(true);
  };

  const handleViewDetailsPayment = (reservation: any) => {
    setSelectedReservation(reservation);
    setIsModalOpenPay(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-lg text-gray-700">
            Cargando panel de administración...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-14">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                Panel de Administración
              </h1>
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <RefreshCw
                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 mb-8">
          {/* <button
            onClick={() => setActiveView('overview')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${activeView === 'overview'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Vista General</span>
          </button> */}
          <button
            onClick={() => setActiveView("users")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeView === "users"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Viajeros</span>
          </button>
          {/* <button
            onClick={() => setActiveView('bookings')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${activeView === 'bookings'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
          >
            <Hotel className="w-5 h-5" />
            <span>Reservaciones</span>
          </button> */}
          <button
            onClick={() => setActiveView("payments")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeView === "payments"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Pagos</span>
          </button>
          <button
            onClick={() => setActiveView("facturas")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeView === "facturas"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <WalletCards className="w-5 h-5" />
            <span>Facturas</span>
          </button>
          {/* <button
            onClick={() => setActiveView('rewards')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${activeView === 'rewards'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
          >
            <Gift className="w-5 h-5" />
            <span>Mia Rewards</span>
          </button> */}
        </div>

        {/* Overview */}
        {activeView === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total de Viajeros</p>
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
                  <span>{13} mas que el mes pasado</span>
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
                    <p className="text-sm text-gray-500">Gastos Totales</p>
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
        )}

        {/* Users View */}
        {activeView === "users" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items">
                  <button
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    onClick={() =>
                      setActivateFiltersUsers(!activateFiltersUsers)
                    }
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    <span>Filtrar</span>
                  </button>
                </div>
                <div className="relative flex items-center space-x-4">
                  {/* <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={() => setExportUsers(!exportUsers)}>
                    <Download className="w-5 h-5" />
                    <span>Exportar</span>
                  </button> */}
                  {/* {exportUsers && ( */}
                  {false && (
                    <div className="absolute font-semibold top-full  mt-2 z-20 bg-slate-100 shadow-lg rounded-lg w-24 flex flex-col p-2">
                      <button
                        className="w-full text-left px-2 py-1 border-b-2 hover:bg-gray-200"
                        onClick={exportPDFUsers}
                      >
                        PDF
                      </button>
                      <CsvDownload
                        datas={procesarDatos(filteredUsers)}
                        filename="datosUsuarios"
                      >
                        <button className="w-full text-left px-2 py-1 hover:bg-gray-200">
                          CSV
                        </button>
                      </CsvDownload>
                    </div>
                  )}
                </div>
              </div>
              {/* Filtering columns */}
              {activateFiltersUsers && (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar compañias, ciudades, industria, RFC..."
                      value={searchTermUser}
                      onChange={(e) => setSearchTermUser(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  {/* <p className='text-xl leading-relaxed mb-4'>Filtra por columnas</p>
                  <div className='flex items-center justify-start gap-x-6 gap-y-3 mb-6 flex-wrap'>
                    <button
                      onClick={() => setActiveColCompUsers(!activeColCompUsers)}
                      // className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${activeColCompUsers
                      {false &&(
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <User className="w-5 h-5" />
                      <span>Nombres</span>
                    </button>
                    <button
                      onClick={() => setActiveColDateUsers(!activeColDateUsers)}
                      // className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${activeColDateUsers
                      {false &&(
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <Building2 className="w-5 h-5" />
                      <span>Compañia</span>
                    </button>
                    <button
                      onClick={() => setActiveColIndustryUsers(!activeColIndustryUsers)}
                      // className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${activeColIndustryUsers
                      {false &&(
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Fecha de Nacimiento</span>
                    </button>
                    <button
                      onClick={() => setActiveColRFCUsers(!activeColRFCUsers)}
                      // className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${activeColRFCUsers
                      {false &&(
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <Mail className="w-5 h-5" />
                      <span>Correo</span>
                    </button>
                    <button
                      onClick={() => setActiveColCityUsers(!activeColCityUsers)}
                      // className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${activeColCityUsers
                      {false &&(
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <UserCircle className="w-5 h-5" />
                      <span>Genero</span>
                    </button>
                  </div> */}
                </>
              )}

              {/* User list would go here */}
              <div className="overflow-x-auto">
                <table className="w-full" id="users">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      {/* {activeColCompUsers && ( */}
                      {false && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Nombre
                        </th>
                      )}
                      {/* {activeColDateUsers && ( */}
                      {false && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Compañia
                        </th>
                      )}
                      {/* {activeColIndustryUsers && ( */}
                      {false && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Fecha de nacimiento
                        </th>
                      )}
                      {/* {activeColRFCUsers && ( */}
                      {false && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Correo
                        </th>
                      )}
                      {/* {activeColCityUsers && ( */}
                      {false && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Genero
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.id_viajero} className="hover:bg-gray-50">
                        {/* {activeColCompUsers && ( */}
                        {false && (
                          <td className="py-4 px-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {user.primer_nombre} {user.segundo_nombre}{" "}
                                {user.apellido_paterno} {user.apellido_materno}
                              </span>
                            </div>
                          </td>
                        )}
                        {/* {activeColDateUsers && ( */}
                        {false && (
                          <td className="py-4 px-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {user.empresas
                                  ?.map((emp) => emp.razon_social)
                                  .join(", ")}
                              </span>
                            </div>
                          </td>
                        )}
                        {/* {activeColIndustryUsers && ( */}
                        {false && (
                          <td className="py-4 px-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {user.fecha_nacimiento
                                  ? new Date(
                                      user.fecha_nacimiento
                                    ).toLocaleDateString()
                                  : ""}
                              </span>
                            </div>
                          </td>
                        )}
                        {/* {activeColRFCUsers && ( */}
                        {false && (
                          <td className="py-4 px-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{user.correo}</span>
                            </div>
                          </td>
                        )}
                        {/* {activeColCityUsers && ( */}
                        {false && (
                          <td className="py-4 px-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{user.genero}</span>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bookings View */}
        {activeView === "bookings" && (
          <div className="space-y-6">
            {/* Filters and Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap space-y-2">
                <div className="flex items">
                  <button
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    onClick={() => setActivateFilters(!activateFilters)}
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    <span>Filtrar</span>
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative flex items-center space-x-4">
                    {/* <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={() => setExportBookings(!exportBookings)}>
                      <Download className="w-5 h-5" />
                      <span>Exportar</span>
                    </button> */}
                    {/* {exportBookings && ( */}
                    {false && (
                      <div className="absolute font-semibold top-full  mt-2 z-20 bg-slate-100 shadow-lg rounded-lg w-24 flex flex-col p-2">
                        <button
                          className="w-full text-left px-2 py-1 border-b-2 hover:bg-gray-200"
                          onClick={exportPDF}
                        >
                          PDF
                        </button>
                        <CsvDownload
                          datas={procesarDatos(filteredBookings)}
                          filename="datosReservas"
                        >
                          <button className="w-full text-left px-2 py-1 hover:bg-gray-200">
                            CSV
                          </button>
                        </CsvDownload>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Filtering columns */}
              {activateFilters && (
                <div className="duration-500 transition-all ease-in-out">
                  <div className="flex items-center gap-x-4 gap-y-3 flex-wrap">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar por hotel, código o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <div className="flex-row flex justify-center items-center relative gap-x-3">
                      <p>Fecha de inicio</p>
                      <input
                        type="date"
                        placeholder="Ingresa fecha de fin"
                        value={dateStart}
                        onChange={(e) => setDateStart(e.target.value)}
                        className="pl-5 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex-row flex justify-center items-center relative gap-x-3">
                      <p>Fecha de fin</p>
                      <input
                        type="date"
                        placeholder="Ingresa fecha de fin"
                        value={dateEnd}
                        onChange={(e) => setDateEnd(e.target.value)}
                        className="pl-5 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="completed">Completadas</option>
                      <option value="canceled">Canceladas</option>
                    </select>
                  </div>
                  <p className="text-xl leading-relaxed mb-4">
                    Filtra por columnas
                  </p>
                  {/* <div className='flex items-center justify-start gap-x-6 gap-y-3 mb-6 flex-wrap'>
                    <button
                      onClick={() => setActiveColCodeBookings(!activeColCodeBookings)}
                      // className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${activeColCodeBookings
                      {false &&(
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <Tag className="w-5 h-5" />
                      <span>Código</span>
                    </button>
                    <button
                      onClick={() => setActiveColHotelsBookings(!activeColHotelBookings)}
                      // className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${activeColHotelBookings
                      {false &&(
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <Hotel className="w-5 h-5" />
                      <span>Hotel</span>
                    </button>
                    <button
                      onClick={() => setActiveColUsersBookings(!activeColUsersBookings)}
                      // className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${activeColUsersBookings
                      {false &&(
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <Users className="w-5 h-5" />
                      <span>Usuario</span>
                    </button>
                    <button
                      onClick={() => setActiveColDateBookings(!activeColDateBookings)}
                      // className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${activeColDateBookings
                      {false &&(
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Fechas</span>
                    </button>
                    <button
                      onClick={() => setActiveColPriceBookings(!activeColPriceBookings)}
                      // className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${activeColPriceBookings
                      {false &&(
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <DollarSign className="w-5 h-5" />
                      <span>Precio</span>
                    </button>
                    <button
                      onClick={() => setActiveColStatusBookings(!activeColStatusBookings)}
                      // className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${activeColStatusBookings
                      {false &&(
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <Clock className="w-5 h-5" />
                      <span>Estado</span>
                    </button>
                  </div> */}
                </div>
              )}

              {/* Bookings Table */}
              <div className="overflow-x-auto">
                <table className="w-full" id="bookings">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      {/* {activeColCodeBookings && ( */}
                      {false && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Código
                        </th>
                      )}
                      {/* {activeColHotelBookings && ( */}
                      {false && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Hotel
                        </th>
                      )}
                      {/* {activeColUsersBookings && ( */}
                      {false && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Usuario
                        </th>
                      )}
                      {/* {activeColDateBookings && ( */}
                      {false && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Fechas
                        </th>
                      )}
                      {/* {activeColPriceBookings && ( */}
                      {false && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Precio
                        </th>
                      )}
                      {/* {activeColStatusBookings && ( */}
                      {false && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Estado
                        </th>
                      )}
                      <th className="pb-3 font-semibold text-gray-600">
                        Detalles
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBookings.map(
                      (booking) =>
                        booking.pagos && (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            {/* {activeColCodeBookings && ( */}
                            {false && (
                              <td className="py-4">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">
                                    {booking.codigo_reservacion_hotel}
                                  </span>
                                </div>
                              </td>
                            )}
                            {/* {activeColHotelBookings && ( */}
                            {false && (
                              <td className="py-4">
                                <div className="flex items-center space-x-2">
                                  <span>{booking.hotel}</span>
                                </div>
                              </td>
                            )}
                            {/* {activeColUsersBookings && ( */}
                            {false && (
                              <td className="py-4">
                                <div className="flex items-center space-x-2">
                                  <span>
                                    {booking.nombre_viajero
                                      ? booking.nombre_viajero
                                      : booking.primer_nombre +
                                        " " +
                                        booking.apellido_paterno}
                                  </span>
                                </div>
                              </td>
                            )}
                            {/* {activeColDateBookings && ( */}
                            {false && (
                              <td className="py-4">
                                <div className="flex items-center space-x-2">
                                  <span>
                                    {new Date(
                                      booking.check_in
                                    ).toLocaleDateString()}{" "}
                                    -
                                    {new Date(
                                      booking.check_out
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </td>
                            )}
                            {/* {activeColPriceBookings && ( */}
                            {false && (
                              <td className="py-4">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">
                                    ${booking.solicitud_total}
                                  </span>
                                </div>
                              </td>
                            )}
                            {/* {activeColStatusBookings && ( */}
                            {false && (
                              <td className="py-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    booking.status === "complete"
                                      ? "bg-green-100 text-green-800"
                                      : booking.status === "pending"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {booking.status === "complete" ? (
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                  ) : booking.status === "pending" ? (
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                  ) : (
                                    <XCircle className="w-4 h-4 mr-1" />
                                  )}
                                  {booking.status === "complete"
                                    ? "Completado"
                                    : booking.status === "pending"
                                    ? "Completado"
                                    : "Cancelado"}
                                </span>
                              </td>
                            )}
                            <td className="py-4">
                              <button
                                onClick={() => handleViewDetails(booking)}
                                className="text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 rounded-md p-1"
                                aria-label="View Details"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Payments View */}
        {activeView === "payments" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Gestión de Pagos
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar pagos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {/* Payments Table */}
              <div className="overflow-x-auto">
                <table className="w-full" id="bookings">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="pb-3 font-semibold text-gray-600">
                        Monto
                      </th>
                      <th className="pb-3 font-semibold text-gray-600">
                        Fecha de creación
                      </th>
                      <th className="pb-3 font-semibold text-gray-600">
                        Metodo
                      </th>
                      <th className="pb-3 font-semibold text-gray-600">
                        Detalles Pago
                      </th>
                      <th className="pb-3 font-semibold text-gray-600">
                        Referencia
                      </th>
                      <th className="pb-3 font-semibold text-gray-600">
                        Detalles
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPaymets.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              ${payment.total}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {payment.fecha_creacion}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="mr-2 h-4 w-4 text-gray-400" />
                            <span className="capitalize">
                              {payment.tipo_de_pago}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {payment.banco ? (
                                <>
                                  {payment.banco}{" "}
                                  {payment.last_digits &&
                                    `(${payment.last_digits})`}
                                </>
                              ) : (
                                "-"
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {payment.concepto}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => handleViewDetailsPayment(payment)}
                            className="text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 rounded-md p-1"
                            aria-label="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Facturas View */}
        {activeView === "facturas" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Gestión de Facturas
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar pagos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {/* Payments Table */}
              <div className="overflow-x-auto">
                <table className="w-full" id="bookings">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="pb-3 font-semibold text-gray-600">
                        Folio
                      </th>
                      {/* <th className="pb-3 font-semibold text-gray-600">RFC</th>
                      <th className="pb-3 font-semibold text-gray-600">Razón social</th> */}
                      <th className="pb-3 font-semibold text-gray-600">
                        Fecha Generado
                      </th>
                      <th className="pb-3 font-semibold text-gray-600">
                        Monto
                      </th>
                      <th className="pb-3 font-semibold text-gray-600">
                        Acciones
                      </th>
                      <th className="pb-3 font-semibold text-gray-600">
                        Detalles
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredFactura.map((factura) => (
                      <tr
                        key={factura.id_facturama}
                        className="hover:bg-gray-50"
                      >
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {factura.id_facturama}
                            </span>
                          </div>
                        </td>
                        {/* <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <Notebook className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{factura.rfc}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{factura.razon_social}</span>
                          </div>
                        </td> */}
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {factura.fecha_emision}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {factura.total_factura}
                            </span>
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              handleDescargarFactura(
                                factura.id_facturama || ""
                              );
                            }}
                            className="flex border p-2 rounded-lg border-sky-200 items-center gap-1 bg-sky-600 text-blue-50 font-semibold hover:text-blue-700"
                          >
                            <DownloadCloud className="w-4 h-4" /> Descargar
                            factura
                          </button>
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => handleViewDetailsFactura(factura)}
                            className="text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 rounded-md p-1"
                            aria-label="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {/* Mia rewards View */}
        {activeView === "rewards" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="container mx-auto w-full">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="flex items-center justify-center mb-8">
                  <Gift className="w-12 h-12 text-purple-600" />
                  <h1 className="text-3xl font-bold text-gray-800 ml-3">
                    Mia Rewards
                  </h1>
                </div>

                {/* Points Card */}
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 font-medium">
                        Puntos Actuales
                      </p>
                      <div className="flex items-center mt-1">
                        <Coins className="w-6 h-6 text-purple-600 mr-2" />
                        <span className="text-4xl font-bold text-gray-800">
                          puntos
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 font-medium">
                        Nivel de Membresía
                      </p>
                      <div className="flex items-center justify-end mt-1">
                        <Trophy className="w-6 h-6 text-yellow-600 mr-2" />
                        <span className="text-xl font-bold text-yellow-600">
                          Gold
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Points Conversion */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    Equivalencia en Pesos
                  </h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-purple-600">
                        100 pts
                      </span>
                      <ArrowRight className="mx-4 text-gray-400" />
                      <span className="text-2xl font-bold text-green-600">
                        $equivalente
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    1,000 puntos = $1 MXN
                  </p>
                </div>

                {/* Benefits Section */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    Beneficios Disponibles
                  </h2>
                  <div className="space-y-3">
                    {/* {benefits.map((benefit) => (
                      <div key={benefit.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <benefit.icon className="w-6 h-6 text-purple-600 mr-3" />
                          <span className="font-medium">{benefit.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-2">{benefit.points} pts</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))} */}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    Transacciones Recientes
                  </h2>
                  <div className="space-y-3">
                    {/*transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 text-green-600 mr-1" />
                          <span className="font-medium text-green-600">+{transaction.points} pts</span>
                        </div>
                      </div>
                    ))*/}
                  </div>
                </div>

                {/* Simulation Button */}
                <div className="mt-6 text-center">
                  <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    + Simular Puntos
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ReservationDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reservation={selectedReservation}
      />

      <PaymentDeatailsModal
        isOpen={isModalOpenPay}
        onClose={() => setIsModalOpenPay(false)}
        reservation={selectedReservation}
      />

      <FacturaDetailsModal
        isOpen={isModalOpenFac}
        onClose={() => setIsModalOpenFac(false)}
        reservation={selectedReservation}
      />
    </div>
  );
};
