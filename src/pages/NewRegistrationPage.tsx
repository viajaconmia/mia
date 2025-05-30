import React, { useState } from "react";
import {
  Phone,
  Mail,
  User,
  Lock,
  CheckCircle2,
  Calendar,
  PersonStanding,
  RotateCcw,
} from "lucide-react";
import {
  newRegisterUser,
  registerUserAfterVerification,
} from "../services/authService";
import { sendAndCreateOTP } from "../hooks/useEmailVerification";

interface RegistrationFormData {
  primer_nombre: string;
  segundo_nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo: string;
  telefono: string;
  password: string;
  confirmPassword: string;
  genero: string;
  fecha_nacimiento: string;
}

interface RegistrationPageProps {
  onComplete: () => void;
}

export const NewRegistrationPage: React.FC<RegistrationPageProps> = ({
  onComplete,
}) => {
  const [step, setStep] = useState<"personal" | "completed">("personal");
  const [formData, setFormData] = useState<RegistrationFormData>({
    primer_nombre: "",
    segundo_nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    correo: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    genero: "",
    fecha_nacimiento: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailVerificationPage, setEmailVerificationPage] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const handleEmailVerification = async () => {
    try {
      if (isRegistering) return;
      setIsRegistering(true);
      setRegistrationError("");

      const result = await newRegisterUser(formData);
      if (result.success) {
        //Aqui se deberia verificar el correo pero por mientras se queda que se logea y ya
        // console.log("revisa correo");
        // setStep('completed');
        //onComplete();
        setEmailVerificationPage(true);
      }
    } catch (error: any) {
      console.error("Error during registration:", error);
      setRegistrationError(
        error.message || "Error al registrar. Por favor intenta de nuevo."
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRegistrationComplete = async () => {
    if (verificationCode.length < 1) {
      setRegistrationError("Ingresa el codigo de verificación");
      return;
    }
    try {
      if (isRegistering) return;
      setIsRegistering(true);
      setRegistrationError("");

      const result = await registerUserAfterVerification(
        formData,
        verificationCode
      );
      console.log(result);
      if (result.success) {
        console.log("successssss");
        setRegistrationError("");
        onComplete();
      } else {
        throw new Error("Codigo incorrecto");
      }
    } catch (error: any) {
      console.error("Error during registration:", error);
      setRegistrationError(
        error.message || "Error al registrar. Por favor intenta de nuevo."
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const sendOTP = async () => {
    try {
      if (isRegistering) return;
      setIsRegistering(true);
      setRegistrationError("");

      const result = await sendAndCreateOTP(formData.correo);
      console.log(result);
      if (result.success) {
        console.log("se volvio a enviar codigo");
        setRegistrationError("");
      } else {
        throw new Error("Codigo incorrecto");
      }
    } catch (error: any) {
      console.error("Error during registration:", error);
      setRegistrationError(
        error.message || "No se pudo volver a enviar el codigo."
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }
    if (
      !formData.password ||
      !formData.confirmPassword ||
      !formData.primer_nombre ||
      !formData.apellido_paterno ||
      !formData.correo
    ) {
      setPasswordError("No se pueden dejar vacios los campos obligatorios");
      return;
    }

    handleEmailVerification();
    setPasswordError("");
  };

  const renderCodeVerification = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        {/* Codigo de verificacion */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Codigo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              pattern="^[^<>]*$"
              type="text"
              required
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>
      <div className="flex space-x-4 w-full">
        <button
          onClick={handleRegistrationComplete}
          disabled={isRegistering}
          className={`flex items-center space-x-2 w-full justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
            isRegistering ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isRegistering ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verificando</span>
            </>
          ) : (
            <>
              <span>Verificar</span>
              <CheckCircle2 className="w-5 h-5" />
            </>
          )}
        </button>

        <button
          onClick={sendOTP}
          disabled={isRegistering}
          className={`flex items-center space-x-2 w-full justify-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors ${
            isRegistering ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isRegistering ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </>
          ) : (
            <>
              <span>Volver a enviar</span>
              <RotateCcw className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
      {registrationError && (
        <div className="mt-4 text-red-300 bg-red-900/50 p-4 rounded-lg">
          {registrationError}
        </div>
      )}
    </div>
  );

  const renderPersonalForm = () => (
    <form onSubmit={handlePersonalSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre Completo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              pattern="^[^<>]*$"
              type="text"
              required
              value={formData.primer_nombre}
              onChange={(e) =>
                setFormData({ ...formData, primer_nombre: e.target.value })
              }
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Segundo Nombre
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              pattern="^[^<>]*$"
              type="text"
              value={formData.segundo_nombre}
              onChange={(e) =>
                setFormData({ ...formData, segundo_nombre: e.target.value })
              }
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellido paterno <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              pattern="^[^<>]*$"
              type="text"
              required
              value={formData.apellido_paterno}
              onChange={(e) =>
                setFormData({ ...formData, apellido_paterno: e.target.value })
              }
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellido materno
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              pattern="^[^<>]*$"
              type="text"
              value={formData.apellido_materno}
              onChange={(e) =>
                setFormData({ ...formData, apellido_materno: e.target.value })
              }
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Correo Electrónico */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              pattern="^[^<>]*$"
              type="email"
              required
              value={formData.correo}
              onChange={(e) =>
                setFormData({ ...formData, correo: e.target.value })
              }
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Teléfono */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              pattern="^[^<>]*$"
              type="tel"
              required
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Genero */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sexo (Género)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PersonStanding className="h-5 w-5 text-gray-400" />
            </div>
            <select
              name="genero"
              required
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
              onChange={(e) =>
                setFormData({ ...formData, genero: e.target.value })
              }
            >
              <option value="">Selecciona genero</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </div>
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha de nacimiento
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              pattern="^[^<>]*$"
              type="date"
              required
              value={formData.fecha_nacimiento}
              onChange={(e) =>
                setFormData({ ...formData, fecha_nacimiento: e.target.value })
              }
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              pattern="^[^<>]*$"
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
        </div>

        {/* Confirmar Contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmar Contraseña <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              pattern="^[^<>]*$"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {passwordError && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
          {passwordError}
        </div>
      )}

      <div className="flex space-x-4 w-full">
        <button
          onClick={handlePersonalSubmit}
          disabled={isRegistering}
          className={`flex items-center space-x-2 w-full justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
            isRegistering ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isRegistering ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Registrando...</span>
            </>
          ) : (
            <>
              <span>Registrarse</span>
              <CheckCircle2 className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
      {registrationError && (
        <div className="mt-4 text-red-300 bg-red-900/50 p-4 rounded-lg">
          {registrationError}
        </div>
      )}
    </form>
  );

  const renderContent = () => {
    switch (step) {
      case "personal":
        return (
          <>
            {emailVerificationPage == true ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Verifica tu correo electronico
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Ingresa el codigo de verificacion enviado a{" "}
                    {formData.correo}
                  </p>
                </div>
                {renderCodeVerification()}
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Información Personal
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Datos de acceso a tu cuenta
                  </p>
                </div>
                {renderPersonalForm()}
              </>
            )}
          </>
        );
      case "completed":
        return (
          <>
            <div className="flex flex-col justify-center items-center">
              <h1>Registro realizado correctamente</h1>
              <p>Verifica tu direccion de correo electronico</p>
              <CheckCircle2 />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 pt-20">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="md:grid md:grid-cols-5">
            {/* Left Panel - Decorative */}
            <div className="hidden md:block md:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 relative">
              <div className="absolute inset-0 opacity-10 bg-pattern"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-6">
                  Únete a la Experiencia de Viaje
                </h2>
                <p className="text-blue-100 mb-8 leading-relaxed">
                  Descubre un mundo de posibilidades con nuestro asistente
                  inteligente de viajes.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 text-white">
                    <CheckCircle2 className="w-6 h-6 text-blue-300" />
                    <span>Reservas personalizadas</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <CheckCircle2 className="w-6 h-6 text-blue-300" />
                    <span>Asistencia 24/7</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <CheckCircle2 className="w-6 h-6 text-blue-300" />
                    <span>Ofertas exclusivas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Form */}
            <div className="md:col-span-3 p-8 lg:p-12">
              <div className="max-w-2xl mx-auto">{renderContent()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
