import React, { useState } from "react";
import {
  Phone,
  Mail,
  User,
  Lock,
  CheckCircle2,
  Calendar,
  RotateCcw,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { UserRegistro } from "../types/auth";
import Button from "../components/atom/Button";
import { InputDate, InputText, SelectInput } from "../components/atom/Input";

export const NewRegistrationPage = () => {
  const [formData, setFormData] = useState<UserRegistro>({
    id_agente: "",
    primer_nombre: "",
    segundo_nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    correo: "",
    telefono: "",
    genero: "",
    fecha_nacimiento: "",
    password: "",
    confirmPassword: "",
    nombre_completo: "",
  });
  const { handleSendValidacion, handleRegister, loading } = useAuth();
  const [registrationError, setRegistrationError] = useState("");
  const [emailVerificationPage, setEmailVerificationPage] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const handleEmailVerification = async () => {
    try {
      setRegistrationError("");
      await handleSendValidacion(formData);
      setEmailVerificationPage(true);
    } catch (error: any) {
      setRegistrationError(
        error.message || "Error al registrar. Por favor intenta de nuevo."
      );
    }
  };

  const handleRegistrationComplete = async () => {
    if (verificationCode.length < 1) {
      setRegistrationError("Ingresa el codigo de verificación");
      return;
    }
    try {
      setRegistrationError("");
      await handleRegister(
        {
          ...formData,
          id_agente: "",
          nombre_completo: [
            formData.primer_nombre,
            formData.segundo_nombre,
            formData.apellido_paterno,
            formData.apellido_materno,
          ]
            .filter((item) => !!item)
            .join(" ")
            .toUpperCase(),
        },
        verificationCode
      );
      window.location.href = "/";
    } catch (error: any) {
      if (
        error.message == "Email not confirmed" ||
        error.code == "email_not_confirmed"
      ) {
        setRegistrationError(
          "Te enviamos otro correo de verificación para que puedas acceder"
        );
      } else {
        console.error("Error during registration:", error);
        setRegistrationError(
          error.message || "Error al registrar. Por favor intenta de nuevo."
        );
      }
    }
  };

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      setRegistrationError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setRegistrationError("Las contraseñas no coinciden");
      return;
    }
    if (
      !formData.password ||
      !formData.confirmPassword ||
      !formData.primer_nombre ||
      !formData.apellido_paterno ||
      !formData.correo
    ) {
      setRegistrationError("No se pueden dejar vacios los campos obligatorios");
      return;
    }

    handleEmailVerification();
    setRegistrationError("");
  };

  const renderCodeVerification = () => (
    <div className="space-y-4">
      <InputText
        onChange={(value) => setVerificationCode(value)}
        value={verificationCode}
        required
        label="Codigo de Verificación"
        placeholder="Ingresa el código"
        icon={Lock}
        type="text"
      />
      {registrationError && (
        <div className="text-red-800 text-sm bg-red-50 p-3 rounded-lg border border-red-300 font-weight-semibold">
          {registrationError}
        </div>
      )}
      <div className="flex space-x-4 w-full">
        <Button
          onClick={handleEmailVerification}
          disabled={loading}
          icon={RotateCcw}
          variant="secondary"
          size="full"
        >
          {loading ? <span>Enviando...</span> : <span>Volver a enviar</span>}
        </Button>
        <Button
          onClick={handleRegistrationComplete}
          disabled={loading}
          icon={CheckCircle2}
          size="full"
        >
          {loading ? <span>Verificando...</span> : <span>Verificar</span>}
        </Button>
      </div>
      <div className="text-xs text-gray-500 mb-4">
        Un código de verificación ha sido enviado a tu correo electrónico. Por
        favor, ingrésalo para completar el registro.
      </div>
    </div>
  );

  const renderPersonalForm = () => (
    <form onSubmit={handlePersonalSubmit} className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputText
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, primer_nombre: value }))
          }
          value={formData.primer_nombre}
          required
          label="Nombre"
          placeholder="Miguel"
          icon={User}
          type="text"
        />
        <InputText
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, segundo_nombre: value }))
          }
          value={formData.segundo_nombre}
          label="Segundo Nombre"
          placeholder="Juan"
          icon={User}
          type="text"
        />
        <InputText
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, apellido_paterno: value }))
          }
          value={formData.apellido_paterno}
          required
          label="Apellido Paterno"
          placeholder="García"
          icon={User}
          type="text"
        />

        <InputText
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, apellido_materno: value }))
          }
          value={formData.apellido_materno}
          label="Apellido Materno"
          placeholder="López"
          icon={User}
          type="text"
        />

        {/* Correo Electrónico */}
        <div className="md:col-span-2">
          <InputText
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, correo: value }))
            }
            value={formData.correo}
            required
            label="Correo Electrónico"
            placeholder="ejemplo@correo.com"
            icon={Mail}
            type="email"
          />
        </div>
        {/* Telefono */}
        <div className="md:col-span-2">
          <InputText
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, telefono: value }))
            }
            value={formData.telefono}
            label="Teléfono"
            placeholder="123456789"
            icon={Phone}
            type="tel"
          />
        </div>

        <SelectInput
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, genero: value }))
          }
          value={formData.genero}
          label="Sexo (Género)"
          options={[
            { value: "", label: "Selecciona género" },
            { value: "masculino", label: "Masculino" },
            { value: "femenino", label: "Femenino" },
          ]}
        />

        <InputDate
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, fecha_nacimiento: value }))
          }
          value={formData.fecha_nacimiento}
          label="Fecha de Nacimiento"
          max={new Date().toISOString().split("T")[0]}
          icon={Calendar}
        />

        {/* Contraseña */}
        <InputText
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, password: value }))
          }
          value={formData.password}
          required
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          icon={Lock}
          type="password"
        />
        {/* Contraseña */}
        <InputText
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, confirmPassword: value }))
          }
          value={formData.confirmPassword}
          required
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          icon={Lock}
          type="password"
        />
      </div>

      {registrationError && (
        <div className="text-red-800 text-sm bg-red-50 p-3 rounded-lg border border-red-300 font-weight-semibold">
          {registrationError}
        </div>
      )}

      <div className="flex space-x-4 w-full">
        <Button
          size="full"
          disabled={loading}
          onClick={handlePersonalSubmit}
          icon={CheckCircle2}
        >
          {loading ? <span>Registrando...</span> : <span>Registrarse</span>}
        </Button>
      </div>
    </form>
  );

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
              <div className="max-w-2xl mx-auto">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
