import React, { useEffect, useState } from "react";
import {
  Mail,
  Lock,
  X,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  AlertCircle,
  Barcode,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { loginUser } from "../services/authService";
import { sendAndCreateOTP, verifyOTP } from "../hooks/useEmailVerification";
import { supabase } from "../services/supabaseClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string, name: string) => void;
  onNavigateToRegister: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onNavigateToRegister,
}) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState("inicio");
  const [correo, setCorreo] = useState("");
  const [showVerif, setShowVerif] = useState(false);
  const [code, setCode] = useState("");
  const [notif, setNotif] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setPage("inicio");
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLoginMode) {
        const result = await loginUser(email, password);
        if (result.user.isAdmin) {
          // Redirect to admin dashboard
          window.location.href = "/admin";
        } else {
          await onLogin(email, password);
        }
      } else {
        await onRegister(email, password, name);
      }
    } catch (error: any) {
      setError(error.message);
      // Shake animation for the form
      const form = document.getElementById("auth-form");
      if (form) {
        form.classList.add("animate-shake");
        setTimeout(() => form.classList.remove("animate-shake"), 500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async () => {
    setIsLoading(true);
    setError(null);
    setNotif(null);
    const { data, error } = await supabase.auth.resetPasswordForEmail(correo);
    //const response = await sendAndCreateOTP(correo);

    if (error) {
      setError("No se pudo enviar el correo con codigo de confirmacion");
    } else {
      setShowVerif(true);
      //setPage("verify-code")
      setNotif(
        "Se te envio un correo electronico con el cual podras restablecer tu contraseña"
      );
    }
    setIsLoading(false);
  };

  const verificar = async () => {
    setIsLoading(true);
    setError(null);
    setNotif(null);
    const response = await verifyOTP(correo, code);
    if (!response.success) {
      setError("Código de verificación incorrecto");
    } else {
      setNotif("Código verificado. Ahora puedes ingresar tu nueva contraseña.");
      setPage("reset-password");
    }
    setIsLoading(false);
  };

  const handleResetPassword = async () => {
    setIsLoading(true);
    setError(null);

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setIsLoading(false);
      return;
    } else {
      setNotif("Contraseña restablecida con éxito.");
      setPage("inicio");
    }

    setIsLoading(false);
  };

  const handleRegisterClick = () => {
    onClose();
    onNavigateToRegister();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        {page === "inicio" && (
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenido de nuevo
              </h2>
              <p className="text-gray-600">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-fadeIn">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Notif */}
            {notif && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg animate-fadeIn">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <p className="text-sm text-blue-800">{notif}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form id="auth-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    pattern="^[^<>]*$"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 block w-full rounded-lg border ${
                      error
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } shadow-sm transition-all duration-200`}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    pattern="^[^<>]*$"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 block w-full rounded-lg border ${
                      error
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } shadow-sm transition-all duration-200`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <input
                    pattern="^[^<>]*$"
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-gray-700"
                  >
                    Recordarme
                  </label>
                </div>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => setPage("send-code")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <button
                onClick={handleRegisterClick}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                ¿No tienes cuenta? Regístrate
              </button>
            </div>
          </div>
        )}

        {page === "send-code" && (
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Reinicio de contraseña
              </h2>
              <p className="text-gray-600">
                Ingresa tu correo electronico con el que te registraste, te
                llegara un link con el cual podras restablecer tu contraseña
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-fadeIn">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Notif */}
            {notif && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg animate-fadeIn">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <p className="text-sm text-blue-800">{notif}</p>
                </div>
              </div>
            )}

            {/* Form */}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  pattern="^[^<>]*$"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className={`pl-10 block w-full rounded-lg border ${
                    error
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  } shadow-sm transition-all duration-200`}
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            {/* {showVerif &&
            <>
              <div className="space-y-2 mt-5">
                <label className="block text-sm font-medium text-gray-700">
                  Codigo de verificacion
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Barcode className="h-5 w-5 text-gray-400" />
                  </div>
                  <input pattern="^[^<>]*$"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={`pl-10 block w-full rounded-lg border ${error
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } shadow-sm transition-all duration-200`}
                    placeholder="codigo de verificación"
                    required
                  />
                </div>
              </div>
              <button
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed transition-all duration-200 mt-8"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verificar Codigo</span>

                  </>
                )}
              </button>
            </>} */}

            <button
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200 mt-8"
              onClick={sendOTP}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Enviar correo</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed transition-all duration-200 mt-4"
              onClick={() => setPage("inicio")}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </>
              )}
            </button>
          </div>
        )}

        {page === "verify-code" && (
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Ingresa el codigo de verificación
              </h2>
              <p className="text-gray-600">
                Ingresa el codigo de verificación enviado a {correo}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-fadeIn">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Notif */}
            {notif && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg animate-fadeIn">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <p className="text-sm text-blue-800">{notif}</p>
                </div>
              </div>
            )}

            <>
              <div className="space-y-2 mt-5">
                <label className="block text-sm font-medium text-gray-700">
                  Codigo de verificacion
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Barcode className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    pattern="^[^<>]*$"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={`pl-10 block w-full rounded-lg border ${
                      error
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } shadow-sm transition-all duration-200`}
                    placeholder="codigo de verificación"
                    required
                  />
                </div>
              </div>
              <button
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed transition-all duration-200 mt-8"
                onClick={verificar}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verificar Codigo</span>
                  </>
                )}
              </button>
            </>
          </div>
        )}
        {page === "reset-password" && (
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Ingresa tu nueva contraseña
              </h2>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-fadeIn">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Notif */}
            {notif && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg animate-fadeIn">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <p className="text-sm text-blue-800">{notif}</p>
                </div>
              </div>
            )}

            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    pattern="^[^<>]*$"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`pl-10 pr-10 block w-full rounded-lg border ${
                      error
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } shadow-sm transition-all duration-200`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 mt-5">
                <label className="block text-sm font-medium text-gray-700">
                  Confirma tu Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    pattern="^[^<>]*$"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 pr-10 block w-full rounded-lg border ${
                      error
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } shadow-sm transition-all duration-200`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200 mt-8"
                onClick={handleResetPassword}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Cambiar contraseña</span>
                  </>
                )}
              </button>
            </>
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/10 rounded-full" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full" />
        </div>
      </div>
    </div>
  );
};
