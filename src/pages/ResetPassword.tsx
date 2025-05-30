import React, { useEffect, useState } from "react";
import { KeyRound, EyeOff, Eye, Check, X, AlertCircle } from "lucide-react";
import { supabase } from "../services/supabaseClient";

function PasswordStrengthIndicator({ password }: { password: string }) {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const strengthText =
    ["Muy Debil", "Debil", "Medio", "Segura", "Muy Segura"][strength - 1] || "";
  const strengthColor =
    [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-green-500",
      "bg-emerald-500",
    ][strength - 1] || "bg-gray-200";

  return (
    <div className="mt-2">
      <div className="flex gap-1 h-1 mb-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-full w-full rounded-full transition-colors ${
              i < strength ? strengthColor : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-sm text-gray-600">{strengthText}</p>
    </div>
  );
}

export const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Extrae los parámetros de la URL (después del #)
    const hashParams = new URLSearchParams(
      window.location.hash.replace("#", "?")
    );
    const error = hashParams.get("error");
    const errorCode = hashParams.get("error_code");
    const errorDescription = hashParams.get("error_description");

    // Si hay un error, actualiza el estado con el mensaje de error
    if (error && errorDescription) {
      setErrorMessage(`Error: ${errorDescription}`);
    }
  }, []);

  const validatePassword = () => {
    const newErrors: string[] = [];

    if (formData.password.length < 8) {
      newErrors.push("La contraseña debe tener por lo menos 8 caracteres");
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.push("Las contraseñas no coinciden");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validatePassword()) {
      try {
        // Actualiza la contraseña utilizando el token de recuperación
        const { data, error } = await supabase.auth.updateUser({
          password: formData.password,
        });
        if (error) {
          console.log(error);
          throw new Error("Ocurrió un error");
        }
        setIsSuccess(true);

        // Redirige después de un corto retraso
        setTimeout(() => {
          window.location.href = "/"; // Redirige al login o página principal
        }, 2000);
      } catch (error) {
        setErrors(["Ocurrio un error, intenta nuevamente"]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Restablece tu contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu nueva contraseña
          </p>
        </div>
        {errorMessage && (
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {errorMessage}
                </h3>
              </div>
            </div>
          </div>
        )}

        {isSuccess ? (
          <div className="bg-green-50 p-4 rounded-md">
            <div className="flex">
              <Check className="h-5 w-5 text-green-400" />
              <p className="ml-3 text-sm font-medium text-green-800">
                Se restablecio la contraseña! Redireccionando...
              </p>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nueva contraseña
                </label>
                <div className="mt-1 relative">
                  <input
                    pattern="^[^<>]*$"
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <PasswordStrengthIndicator password={formData.password} />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirma la Contraseña
                </label>
                <div className="mt-1 relative">
                  <input
                    pattern="^[^<>]*$"
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-50 p-4 rounded-md">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Corrige los siguientes errores:
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Restablecer Contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
