import React, { useState } from "react";
import { Building2, AlertTriangle } from "lucide-react";

interface BillingDetailsFormProps {
  onSubmit: (data: BillingFormData) => void;
  onCancel: () => void;
  initialData?: Partial<BillingFormData>;
  isLoading?: boolean;
  error?: string | null;
}

export interface BillingFormData {
  business_name: string;
  rfc: string;
  email: string;
  phone: string;
  address: string;
  use_for_future: boolean;
}

export const BillingDetailsForm: React.FC<BillingDetailsFormProps> = ({
  onSubmit,
  initialData,
  error,
}) => {
  const [formData, setFormData] = useState<BillingFormData>({
    business_name: initialData?.business_name || "",
    rfc: initialData?.rfc || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    use_for_future: initialData?.use_for_future || false,
  });

  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof BillingFormData, string>>
  >({});

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof BillingFormData, string>> = {};

    if (!formData.business_name.trim()) {
      errors.business_name = "La razón social es requerida";
    }

    if (!formData.rfc.trim()) {
      errors.rfc = "El RFC es requerido";
    } else if (!/^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(formData.rfc)) {
      errors.rfc = "El formato del RFC no es válido";
    }

    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "El formato del correo electrónico no es válido";
    }

    if (!formData.phone.trim()) {
      errors.phone = "El teléfono es requerido";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      errors.phone = "El teléfono debe tener 10 dígitos";
    }

    if (!formData.address.trim()) {
      errors.address = "La dirección es requerida";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Razón Social */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Razón Social <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              pattern="^[^<>]*$"
              type="text"
              value={formData.business_name}
              onChange={(e) =>
                setFormData({ ...formData, business_name: e.target.value })
              }
              className={`pl-10 block w-full rounded-lg border ${
                validationErrors.business_name
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              } shadow-sm transition-colors`}
              placeholder="Nombre o razón social"
            />
          </div>
          {validationErrors.business_name && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.business_name}
            </p>
          )}
        </div>

        {/* RFC */}
        <div></div>
      </div>
    </form>
  );
};
