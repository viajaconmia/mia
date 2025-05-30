import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import html2pdf from "html2pdf.js";
import CsvDownload from "react-csv-downloader";
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
  Filter,
  Download,
  RefreshCw,
  Building2,
  Plus,
  MapPin,
  Tag,
  FilePenLine,
  Factory,
  FileSignature,
  MapPinned,
  SlidersHorizontal,
} from "lucide-react";

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
    "overview" | "users" | "bookings" | "payments"
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
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPaymets, setFilteredPayments] = useState<Payment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  //columnas reservaciones
  const [activeColUsersBookings, setActiveColUsersBookings] = useState(true);
  const [activeColCodeBookings, setActiveColCodeBookings] = useState(true);
  const [activeColHotelBookings, setActiveColHotelsBookings] = useState(true);
  const [activeColDateBookings, setActiveColDateBookings] = useState(true);
  const [activeColPriceBookings, setActiveColPriceBookings] = useState(true);
  const [activeColStatusBookings, setActiveColStatusBookings] = useState(true);
  const [activeColActionsBookings, setActiveColActionsBookings] =
    useState(false);
  //columnas Usuarios
  const [activeColCompUsers, setActiveColCompUsers] = useState(true);
  const [activeColDateUsers, setActiveColDateUsers] = useState(true);
  const [activeColIndustryUsers, setActiveColIndustryUsers] = useState(true);
  const [activeColRFCUsers, setActiveColRFCUsers] = useState(true);
  const [activeColCityUsers, setActiveColCityUsers] = useState(true);
  //Estado para mostrar filtros
  const [activateFilters, setActivateFilters] = useState(false);
  const [activateFiltersUsers, setActivateFiltersUsers] = useState(false);
  //mostrar exportaciones
  const [exportUsers, setExportUsers] = useState(false);
  const [exportBookings, setExportBookings] = useState(false);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [newBooking, setNewBooking] = useState({
    hotel_name: "",
    check_in: "",
    check_out: "",
    room_type: "single",
    total_price: 0,
    user_email: "",
    confirmation_code: `RES${Date.now().toString().slice(-6)}`,
  });

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

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.hotel_name.toLowerCase().includes(searchLower) ||
          booking.confirmation_code.toLowerCase().includes(searchLower) ||
          booking.user?.email.toLowerCase().includes(searchLower)
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
      const { data: user, error: userError } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }
      if (!user) {
        throw new Error("No hay usuario autenticado.");
      }
      const { data: bookingsData, error } = await supabase
        .from("bookings")
        .select("*, company_profiles(company_name)");

      if (error) throw error;

      setBookings(bookingsData || []);
      setFilteredBookings(bookingsData || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw userError;
      }
      if (!user) {
        throw new Error("No hay usuario autenticado");
      }
      const { data: userData, error } = await supabase
        .from("company_profiles")
        .select("*");
      if (error) throw error;
      setUsers(userData || []);
      setFilteredUsers(userData || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw userError;
      }
      if (!user) {
        throw new Error("No hay usuario autenticado");
      }
      const { data: payments, error } = await supabase
        .from("payments")
        .select("*, bookings(hotel_name)");
      if (error) throw error;
      setPayments(payments || []);
      setFilteredPayments(payments || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreateBooking = async () => {
    try {
      // First get the user ID from the email
      const { data: userData, error: userError } = await supabase
        .from("auth.users")
        .select("id")
        .eq("email", newBooking.user_email)
        .single();

      if (userError) throw userError;

      const { error: bookingError } = await supabase.from("bookings").insert({
        confirmation_code: newBooking.confirmation_code,
        user_id: userData.id,
        hotel_name: newBooking.hotel_name,
        check_in: newBooking.check_in,
        check_out: newBooking.check_out,
        room_type: newBooking.room_type,
        total_price: newBooking.total_price,
        status: "pending",
      });

      if (bookingError) throw bookingError;

      setShowNewBookingModal(false);
      fetchBookings();
    } catch (error) {
      console.error("Error creating booking:", error);
    }
  };

  const handleUpdateBookingStatus = async (
    bookingId: string,
    newStatus: string
  ) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);

      // Fetch total users
      const { count: userCount } = await supabase
        .from("company_profiles")
        .select("*", { count: "exact" });

      // Fetch bookings statistics
      const { data: bookings } = await supabase.from("bookings").select("*");

      const activeBookings =
        bookings?.filter((b) => b.status === "pending").length || 0;
      const completedBookings =
        bookings?.filter((b) => b.status === "completed").length || 0;
      const cancelledBookings =
        bookings?.filter((b) => b.status === "cancelled").length || 0;

      // Fetch recent payments with booking details
      const { data: payments } = await supabase
        .from("payments")
        .select("*, bookings(hotel_name)")
        .order("created_at", { ascending: false })
        .limit(5);

      // Calculate total revenue
      const totalRevenue =
        payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Fetch recent users with company profiles
      const { data: recentUsers } = await supabase
        .from("company_profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch recent bookings
      const { data: recentBookings } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        totalUsers: userCount || 0,
        totalBookings: bookings?.length || 0,
        totalRevenue,
        activeBookings,
        completedBookings,
        cancelledBookings,
        recentUsers: recentUsers || [],
        recentBookings: recentBookings || [],
        recentPayments: payments || [],
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
    <div className="min-h-screen bg-gray-100">
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
          <button
            onClick={() => setActiveView("overview")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeView === "overview"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Vista General</span>
          </button>
          <button
            onClick={() => setActiveView("users")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeView === "users"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Usuarios</span>
          </button>
          <button
            onClick={() => setActiveView("bookings")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeView === "bookings"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Hotel className="w-5 h-5" />
            <span>Reservaciones</span>
          </button>
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
                  <button
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setExportUsers(!exportUsers)}
                  >
                    <Download className="w-5 h-5" />
                    <span>Exportar</span>
                  </button>
                  {exportUsers && (
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
                      pattern="^[^<>]*$"
                      type="text"
                      placeholder="Buscar compañias, ciudades, industria, RFC..."
                      value={searchTermUser}
                      onChange={(e) => setSearchTermUser(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  <p className="text-xl leading-relaxed mb-4">
                    Filtra por columnas
                  </p>
                  <div className="flex items-center justify-start gap-x-6 gap-y-3 mb-6 flex-wrap">
                    <button
                      onClick={() => setActiveColCompUsers(!activeColCompUsers)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${
                        activeColCompUsers
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                      <span>Compañia</span>
                    </button>
                    <button
                      onClick={() => setActiveColDateUsers(!activeColDateUsers)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${
                        activeColDateUsers
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Fecha Registro</span>
                    </button>
                    <button
                      onClick={() =>
                        setActiveColIndustryUsers(!activeColIndustryUsers)
                      }
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${
                        activeColIndustryUsers
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Factory className="w-5 h-5" />
                      <span>Industria</span>
                    </button>
                    <button
                      onClick={() => setActiveColRFCUsers(!activeColRFCUsers)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${
                        activeColRFCUsers
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <FileSignature className="w-5 h-5" />
                      <span>RFC</span>
                    </button>
                    <button
                      onClick={() => setActiveColCityUsers(!activeColCityUsers)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${
                        activeColCityUsers
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <MapPinned className="w-5 h-5" />
                      <span>Ciudad</span>
                    </button>
                  </div>
                </>
              )}

              {/* User list would go here */}
              <div className="overflow-x-auto">
                <table className="w-full" id="users">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      {activeColCompUsers && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Compañia
                        </th>
                      )}
                      {activeColDateUsers && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Fecha Registro
                        </th>
                      )}
                      {activeColIndustryUsers && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Industria
                        </th>
                      )}
                      {activeColRFCUsers && (
                        <th className="pb-3 font-semibold text-gray-600">
                          RFC
                        </th>
                      )}
                      {activeColCityUsers && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Ciudad
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        {activeColCompUsers && (
                          <td className="py-4 px-1">
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">
                                {user.company_name}
                              </span>
                            </div>
                          </td>
                        )}
                        {activeColDateUsers && (
                          <td className="py-4 px-1">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">
                                {user.created_at}
                              </span>
                            </div>
                          </td>
                        )}
                        {activeColIndustryUsers && (
                          <td className="py-4 px-1">
                            <div className="flex items-center space-x-2">
                              <Factory className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">
                                {user.industry}
                              </span>
                            </div>
                          </td>
                        )}
                        {activeColRFCUsers && (
                          <td className="py-4 px-1">
                            <div className="flex items-center space-x-2">
                              <FileSignature className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{user.rfc}</span>
                            </div>
                          </td>
                        )}
                        {activeColCityUsers && (
                          <td className="py-4 px-1">
                            <div className="flex items-center space-x-2">
                              <MapPinned className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{user.city}</span>
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
                  <button
                    onClick={() => setShowNewBookingModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Nueva Reserva</span>
                  </button>
                  <div className="relative flex items-center space-x-4">
                    <button
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={() => setExportBookings(!exportBookings)}
                    >
                      <Download className="w-5 h-5" />
                      <span>Exportar</span>
                    </button>
                    {exportBookings && (
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
                        pattern="^[^<>]*$"
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
                        pattern="^[^<>]*$"
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
                        pattern="^[^<>]*$"
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
                      <option value="pending">Pendientes</option>
                      <option value="completed">Completadas</option>
                      <option value="cancelled">Canceladas</option>
                    </select>
                  </div>
                  <p className="text-xl leading-relaxed mb-4">
                    Filtra por columnas
                  </p>
                  <div className="flex items-center justify-start gap-x-6 gap-y-3 mb-6 flex-wrap">
                    <button
                      onClick={() =>
                        setActiveColCodeBookings(!activeColCodeBookings)
                      }
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${
                        activeColCodeBookings
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Tag className="w-5 h-5" />
                      <span>Código</span>
                    </button>
                    <button
                      onClick={() =>
                        setActiveColHotelsBookings(!activeColHotelBookings)
                      }
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${
                        activeColHotelBookings
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Hotel className="w-5 h-5" />
                      <span>Hotel</span>
                    </button>
                    <button
                      onClick={() =>
                        setActiveColUsersBookings(!activeColUsersBookings)
                      }
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${
                        activeColUsersBookings
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Users className="w-5 h-5" />
                      <span>Usuario</span>
                    </button>
                    <button
                      onClick={() =>
                        setActiveColDateBookings(!activeColDateBookings)
                      }
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${
                        activeColDateBookings
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Fechas</span>
                    </button>
                    <button
                      onClick={() =>
                        setActiveColPriceBookings(!activeColPriceBookings)
                      }
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${
                        activeColPriceBookings
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <DollarSign className="w-5 h-5" />
                      <span>Precio</span>
                    </button>
                    <button
                      onClick={() =>
                        setActiveColStatusBookings(!activeColStatusBookings)
                      }
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${
                        activeColStatusBookings
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Clock className="w-5 h-5" />
                      <span>Estado</span>
                    </button>
                    <button
                      onClick={() =>
                        setActiveColActionsBookings(!activeColActionsBookings)
                      }
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-slate-200 border-2 ${
                        activeColActionsBookings
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <FilePenLine className="w-5 h-5" />
                      <span>Acciones</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bookings Table */}
              <div className="overflow-x-auto">
                <table className="w-full" id="bookings">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      {activeColCodeBookings && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Código
                        </th>
                      )}
                      {activeColHotelBookings && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Hotel
                        </th>
                      )}
                      {activeColUsersBookings && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Usuario
                        </th>
                      )}
                      {activeColDateBookings && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Fechas
                        </th>
                      )}
                      {activeColPriceBookings && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Precio
                        </th>
                      )}
                      {activeColStatusBookings && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Estado
                        </th>
                      )}
                      {activeColActionsBookings && (
                        <th className="pb-3 font-semibold text-gray-600">
                          Acciones
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        {activeColCodeBookings && (
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <Tag className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">
                                {booking.confirmation_code}
                              </span>
                            </div>
                          </td>
                        )}
                        {activeColHotelBookings && (
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <Hotel className="w-4 h-4 text-gray-400" />
                              <span>{booking.hotel_name}</span>
                            </div>
                          </td>
                        )}
                        {activeColUsersBookings && (
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span>
                                {booking.company_profiles?.company_name}
                              </span>
                            </div>
                          </td>
                        )}
                        {activeColDateBookings && (
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
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
                        {activeColPriceBookings && (
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">
                                ${booking.total_price.toLocaleString()}
                              </span>
                            </div>
                          </td>
                        )}
                        {activeColStatusBookings && (
                          <td className="py-4">
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
                          </td>
                        )}
                        {activeColActionsBookings && (
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <select
                                value={booking.status}
                                onChange={(e) =>
                                  handleUpdateBookingStatus(
                                    booking.id,
                                    e.target.value
                                  )
                                }
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="pending">Pendiente</option>
                                <option value="completed">Completada</option>
                                <option value="cancelled">Cancelada</option>
                              </select>
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
                      pattern="^[^<>]*$"
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
                        Hotel
                      </th>
                      <th className="pb-3 font-semibold text-gray-600">
                        Estatus
                      </th>
                      <th className="pb-3 font-semibold text-gray-600">
                        Moneda
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPaymets.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {payment.amount}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <Hotel className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {payment.bookings?.hotel_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <Hotel className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {payment.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <Hotel className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {payment.currency}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
