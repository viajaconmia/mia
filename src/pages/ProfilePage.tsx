import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import {
  ArrowLeft,
  User2,
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Receipt,
  Save,
  Edit2,
  X,
  CreditCard,
  Briefcase,
  Globe,
  Shield,
  Settings,
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  Hotel,
  MapPinOff,
  Trash2,
  Plus,
  CreditCard as PaymentIcon,
  BookOpenText,
} from "lucide-react";
import type { UserPreferences, PaymentHistory } from "../types";
import {
  fetchPaymentMethods,
  fetchPagosAgent,
  fetchCreditAgent,
  fetchPendientesAgent,
} from "../hooks/useFetch";
import type { PaymentMethod } from "../types";
import { loadStripe } from "@stripe/stripe-js";
import PendingPaymentsTable from "../components/PendingPaymentsTable";
import { Payment, PaymentFormData } from "../types";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import { URL } from "../constants/apiConstant";

interface ProfilePageProps {
  onBack: () => void;
}

const stripePromise = loadStripe(
  "pk_test_51R1WOrQttaqZirA7uXoQzqBjIsogB3hbIMWzIimqVnmMR0ZdSGhtl9icQpUkqHhIrWDjvRj2vjV71FEHTcbZjMre005S8gHlDD"
);
const API_KEY =
  "nkt-U9TdZU63UENrblg1WI9I1Ln9NcGrOyaCANcpoS2PJT3BlbkFJ1KW2NIGUYF87cuvgUF3Q976fv4fPrnWQroZf0RzXTZTA942H3AMTKFKJHV6cTi8c6dd6tybUD65fybhPJT3BlbkFJ1KW2NIGPrnWQroZf0RzXTZTA942H3AMTKFy15whckAGSSRSTDvsvfHsrtbXhdrT";
const AUTH = {
  "x-api-key": API_KEY,
};

const cardStyle = {
  style: {
    base: {
      color: "#32325d",
      fontSize: "18px",
      fontFamily: "Arial, sans-serif",
      "::placeholder": {
        color: "#aab7c4",
      },
      backgroundColor: "#f8f8f8",
      padding: "30px",
      borderRadius: "5px",
    },
    invalid: {
      color: "#fa755a",
    },
  },
  hidePostalCode: true, // Oculta el campo de código postal
  hideIcon: false, // Oculta el ícono de Stripe (opcional)
  disabled: false, // Si quieres deshabilitar la edición
  disableLink: true,
};

const CheckOutForm = ({ setSuccess, setTrigger }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState("");
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    const { data } = await supabase.auth.getUser();
    const id_agente = data.user?.id;
    const cardElement = elements.getElement(CardElement);
    //crear metodo de pago
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });
    console.log("Se creo payment method");
    if (error) {
      setMessage(error.message);
    } else {
      const response = await fetch(`${URL}/v1/stripe/save-payment-method`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...AUTH,
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          id_agente: id_agente,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage(data.message || "Metodo de pago guardado");
        setSuccess(false);
        setTrigger((prev) => prev + 1);
      } else {
        setMessage("Ocurrio un error");
      }
    }
  };

  return (
    <div className="flex flex-col w-full px-4">
      <h2 className="font-semibold text-lg text-[#10244c] mb-5">
        Ingresa los detalles de tu tarjeta de credito
      </h2>
      <form onSubmit={handleSubmit}>
        <CardElement options={cardStyle} />
        <button
          type="submit"
          disabled={!stripe}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full mt-5"
        >
          <PaymentIcon className="w-4 h-4" />
          <span className="font-medium">Agregar tarjeta</span>
        </button>
        <button
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full mt-5"
          onClick={() => setSuccess(false)}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Volver</span>
        </button>
      </form>
      {message && (
        <div className="h-auto p-3 bg-red-300 border-4 mt-5 rounded-xl">
          <p className="text-base text-center">{message}</p>
        </div>
      )}
    </div>
  );
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const [user, setUser] = useState<any>(null);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [paymentsPendientes, setPaymentsPendientes] = useState<
    PaymentHistory[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [editedPreferences, setEditedPreferences] = useState<
    Partial<UserPreferences>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "profile"
    | "preferences"
    | "payments"
    | "payments-history"
    | "payments-pendientes"
  >("profile");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const [message, setMessage] = useState("");
  const [creditoValue, setCreditoValue] = useState([]);

  const fetchCredit = async () => {
    const data = await fetchCreditAgent();
    console.log("Credito del agente", data);
    setCreditoValue(data);
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");
        setUser(user);

        // Get company profile
        const { data: companyData, error: companyError } = await supabase
          .from("company_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (companyError) throw companyError;
        setCompanyProfile(companyData);

        // Get user preferences
        const { data: preferencesData, error: preferencesError } =
          await supabase
            .from("user_preferences")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (preferencesError && preferencesError.code !== "PGRST116") {
          throw preferencesError;
        }
        setPreferences(preferencesData);
        setEditedPreferences(preferencesData || {});

        // Get payment history
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    fetchCredit();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPaymentMethods();
      console.log("Payment methods data:", data);
      setPaymentMethods(data);
      const paymentsData = await fetchPagosAgent();
      setPayments(paymentsData);
      const pendientesData = await fetchPendientesAgent();
      console.log(pendientesData);
      setPaymentsPendientes(pendientesData);
    };
    fetchData();
  }, [trigger]);

  const handleSavePreferences = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const preferenceData = {
        user_id: user.id,
        preferred_hotel: editedPreferences.preferred_hotel,
        frequent_changes: editedPreferences.frequent_changes,
        avoid_locations: editedPreferences.avoid_locations,
      };

      let response;

      if (preferences?.id) {
        // Update existing preferences
        response = await supabase
          .from("user_preferences")
          .update(preferenceData)
          .eq("id", preferences.id);
      } else {
        // Insert new preferences
        response = await supabase
          .from("user_preferences")
          .insert([preferenceData]);
      }

      if (response.error) throw response.error;

      setPreferences({
        ...preferences,
        ...preferenceData,
      } as UserPreferences);
      setIsEditingPreferences(false);
      setSaveSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      setSaveError(error.message || "Error al guardar las preferencias");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedPreferences(preferences || {});
    setIsEditingPreferences(false);
    setSaveError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPaymentStatusColor = (status: number) => {
    if (status == 0) return "text-green-600 bg-green-100";
    else if (status != 0) return "text-yellow-600 bg-yellow-100";
    else return "text-red-600 bg-red-100";
  };

  const getPaymentStatusIcon = (status: number) => {
    if (status == 0) return <CheckCircle2 className="w-4 h-4" />;
    else if (status != 0) return <Clock className="w-4 h-4" />;
    else return <AlertTriangle className="w-4 h-4" />;
  };

  const handleDeleteMethod = async (id: string) => {
    console.log("Delete payment method:", id);
    const { data } = await supabase.auth.getUser();
    const id_agente = data.user?.id;
    const response = await fetch(`${URL}/v1/stripe/delete-payment-method`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AUTH,
      },
      body: JSON.stringify({
        paymentMethodId: id,
        id_agente: id_agente,
      }),
    });

    const datos = await response.json();
    if (datos.success) {
      setMessage(datos.message || "Metodo de pago eliminado");
      setTrigger((prev) => prev + 1);
    } else {
      setMessage("Ocurrio un error");
    }
  };

  const handleMakePayment = (paymentId: string, formData: PaymentFormData) => {
    // Find the payment
    const paymentIndex = payments.findIndex((p) => p.id === paymentId);

    if (paymentIndex === -1) return;

    // Parse amount to number
    const amountPaid = parseFloat(formData.amount);

    // Clone the payments array
    const updatedPayments = [...payments];

    // Update the payment
    updatedPayments[paymentIndex] = {
      ...updatedPayments[paymentIndex],
      remainingBalance: Math.max(
        0,
        updatedPayments[paymentIndex].remainingBalance - amountPaid
      ),
      // If payment is fully paid, you might want to update status
      status:
        amountPaid >= updatedPayments[paymentIndex].remainingBalance
          ? "Processing"
          : updatedPayments[paymentIndex].status,
    };

    // Update state
    setPayments(updatedPayments);

    // In a real app, you would call an API to process the payment
    console.log(
      `Payment of ${amountPaid} made for ${paymentId} using ${formData.paymentMethod}`
    );
  };

  const handleAddMethod = () => {
    setShowAddPaymentForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al chat
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <User2 className="w-16 h-16 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user?.user_metadata?.full_name || "Usuario"}
              </h1>
              <p className="text-gray-500 mb-4">{user?.email}</p>
              {/* <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600">{companyProfile?.company_name}</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600">{companyProfile?.city}</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600">{companyProfile?.industry}</span>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "profile"
                ? "bg-white text-blue-600"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <User2 className="w-5 h-5" />
            <span>Perfil</span>
          </button>
          {/* <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'preferences'
              ? 'bg-white text-blue-600'
              : 'bg-white/10 text-white hover:bg-white/20'
              }`}
          >
            <Settings className="w-5 h-5" />
            <span>Preferencias</span>
          </button> */}
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "payments"
                ? "bg-white text-blue-600"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Metodos de pago</span>
          </button>

          <button
            onClick={() => setActiveTab("payments-history")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "payments-history"
                ? "bg-white text-blue-600"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <BookOpenText className="w-5 h-5" />
            <span>Historial de pagos</span>
          </button>

          {creditoValue[0]?.tiene_credito_consolidado == 1 && (
            <button
              onClick={() => setActiveTab("payments-pendientes")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "payments-pendientes"
                  ? "bg-white text-blue-600"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Cuentas por pagar</span>
            </button>
          )}
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {activeTab === "profile" && (
              <>
                {/* Personal Information */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Información Personal
                    </h2>
                    {/* <button className="text-blue-600 hover:text-blue-700 flex items-center space-x-2">
                      <Edit2 className="w-5 h-5" />
                      <span>Editar</span>
                    </button> */}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-500">
                          Nombre Completo
                        </label>
                        <p className="text-lg font-medium text-gray-900">
                          {user?.user_metadata?.full_name || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          Correo Electrónico
                        </label>
                        <p className="text-lg font-medium text-gray-900">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-500">
                          Teléfono
                        </label>
                        <p className="text-lg font-medium text-gray-900">
                          {user?.user_metadata?.phone || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">RFC</label>
                        <p className="text-lg font-medium text-gray-900">
                          {companyProfile?.rfc || "No especificado"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                {/* <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Información de la Empresa
                    </h2>
                    <button className="text-blue-600 hover:text-blue-700 flex items-center space-x-2">
                      <Edit2 className="w-5 h-5" />
                      <span>Editar</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-500">Nombre de la Empresa</label>
                        <p className="text-lg font-medium text-gray-900">
                          {companyProfile?.company_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Industria</label>
                        <p className="text-lg font-medium text-gray-900 capitalize">
                          {companyProfile?.industry}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-500">Ciudad</label>
                        <p className="text-lg font-medium text-gray-900">
                          {companyProfile?.city}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Fecha de Registro</label>
                        <p className="text-lg font-medium text-gray-900">
                          {formatDate(companyProfile?.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div> */}
              </>
            )}

            {activeTab === "preferences" && (
              <>
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Preferencias de Viaje
                    </h2>
                    {!isEditingPreferences ? (
                      <button
                        onClick={() => setIsEditingPreferences(true)}
                        className="text-blue-600 hover:text-blue-700 flex items-center space-x-2"
                      >
                        <Edit2 className="w-5 h-5" />
                        <span>Editar</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-500 hover:text-gray-700 flex items-center space-x-2"
                        >
                          <X className="w-5 h-5" />
                          <span>Cancelar</span>
                        </button>
                        <button
                          onClick={handleSavePreferences}
                          disabled={isSaving}
                          className="text-blue-600 hover:text-blue-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save className="w-5 h-5" />
                          <span>{isSaving ? "Guardando..." : "Guardar"}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {saveSuccess && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Preferencias guardadas exitosamente</span>
                    </div>
                  )}

                  {saveError && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span>{saveError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Hotel className="w-5 h-5 text-gray-400" />
                          <label className="text-sm font-medium text-gray-700">
                            Hotel Preferido
                          </label>
                        </div>
                        {isEditingPreferences ? (
                          <input
                            pattern="^[^<>]*$"
                            type="text"
                            value={editedPreferences.preferred_hotel || ""}
                            onChange={(e) =>
                              setEditedPreferences((prev) => ({
                                ...prev,
                                preferred_hotel: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Ej: Marriott, Hilton, etc."
                          />
                        ) : (
                          <p className="text-lg text-gray-900">
                            {preferences?.preferred_hotel || "No especificado"}
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <label className="text-sm font-medium text-gray-700">
                            Cambios Frecuentes
                          </label>
                        </div>
                        {isEditingPreferences ? (
                          <select
                            value={
                              editedPreferences.frequent_changes
                                ? "true"
                                : "false"
                            }
                            onChange={(e) =>
                              setEditedPreferences((prev) => ({
                                ...prev,
                                frequent_changes: e.target.value === "true",
                              }))
                            }
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          >
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                          </select>
                        ) : (
                          <p className="text-lg text-gray-900">
                            {preferences?.frequent_changes ? "Sí" : "No"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPinOff className="w-5 h-5 text-gray-400" />
                          <label className="text-sm font-medium text-gray-700">
                            Lugares a Evitar
                          </label>
                        </div>
                        {isEditingPreferences ? (
                          <textarea
                            value={editedPreferences.avoid_locations || ""}
                            onChange={(e) =>
                              setEditedPreferences((prev) => ({
                                ...prev,
                                avoid_locations: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            rows={3}
                            placeholder="Especifica lugares que prefieres evitar"
                          />
                        ) : (
                          <p className="text-lg text-gray-900">
                            {preferences?.avoid_locations || "No especificado"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "payments" && (
              <>
                {/* Metodos de pago */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Metodos de pago
                    </h2>
                  </div>

                  {showAddPaymentForm ? (
                    <Elements stripe={stripePromise}>
                      <CheckOutForm
                        setSuccess={setShowAddPaymentForm}
                        setTrigger={setTrigger}
                        onCancel={() => setShowAddPaymentForm(false)}
                      />
                    </Elements>
                  ) : paymentMethods.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <CreditCard
                        className="mx-auto text-gray-400 mb-3"
                        size={32}
                      />
                      <p className="text-gray-500">
                        No se han guardado metodos de pago
                      </p>
                      <ul className="space-y-3 mb-6">
                        <li
                          onClick={handleAddMethod}
                          className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 mt-5"
                        >
                          <div className="flex items-center gap-3">
                            <Plus className="text-gray-600" size={20} />
                            <p className="font-medium text-gray-800">
                              Agregar nuevo metodo de pago
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <>
                      <ul className="space-y-3 mb-6">
                        {paymentMethods.map((method) => (
                          <li
                            key={method.id}
                            className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${"bg-gray-50 hover:bg-gray-100"}`}
                          >
                            <div className="flex items-center gap-3">
                              <CreditCard
                                className={"text-gray-600"}
                                size={20}
                              />
                              <div>
                                <p className="font-medium text-gray-800">
                                  {method.card.brand.toUpperCase()} ••••{" "}
                                  {method.card.last4}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Vence {method.card.exp_month}/
                                  {method.card.exp_year}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMethod(method.id);
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                                aria-label="Delete payment method"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </li>
                        ))}
                        <li
                          onClick={handleAddMethod}
                          className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300"
                        >
                          <div className="flex items-center gap-3">
                            <Plus className="text-gray-600" size={20} />
                            <p className="font-medium text-gray-800">
                              Agregar nuevo metodo de pago
                            </p>
                          </div>
                        </li>
                      </ul>
                    </>
                  )}
                  {message && (
                    <div className="h-auto p-3 bg-red-300 border-4 mt-5 rounded-xl">
                      <p className="text-base text-center">{message}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "payments-history" && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Historial de Pagos
                  </h2>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Clock className="w-5 h-5" />
                    <span>Últimas transacciones</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {payment.hotel_name || "Hotel"}
                            </h3>
                            <p className="text-gray-500 text-sm">
                              {payment.confirmation_code}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              ${payment.booking_total.toLocaleString("es-MX")}{" "}
                              {payment.currency.toUpperCase()}
                            </p>
                            <div
                              className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm ${getPaymentStatusColor(
                                payment.pendiente_por_cobrar
                              )}`}
                            >
                              {getPaymentStatusIcon(
                                payment.pendiente_por_cobrar
                              )}
                              <span className="capitalize">
                                {payment.pendiente_por_cobrar === 0
                                  ? "Completado"
                                  : payment.pendiente_por_cobrar != 0
                                  ? "Pendiente"
                                  : "Fallido"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {payment && (
                          <div className="flex items-center space-x-4 text-gray-500 text-sm">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(payment.check_in)}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(payment.check_out)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No hay pagos registrados</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === "payments-pendientes" && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Pagos pendientes
                  </h2>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Clock className="w-5 h-5" />
                    <span>Últimas transacciones</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {payments.length > 0 ? (
                    <PendingPaymentsTable
                      payments={paymentsPendientes}
                      onMakePayment={handleMakePayment}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No hay pagos registrados</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Quick Stats */}
            {/* <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen de Actividad
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-600">Pagos Totales</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {payments.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-600">Completados</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {payments.filter(p => p.status === 'completed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <span className="text-gray-600">Pendientes</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {payments.filter(p => p.status === 'pending').length}
                  </span>
                </div>
              </div>
            </div> */}

            {/* Account Security */}
            {/* <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Seguridad de la Cuenta
                </h3>
                <Shield className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-gray-600">Cambiar Contraseña</span>
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-gray-600">Configurar Notificaciones</span>
                  <Bell className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-gray-600">Preferencias de Privacidad</span>
                  <Settings className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};
