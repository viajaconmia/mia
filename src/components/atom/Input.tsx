type GeneralInputProps = {
  onChange: (value: string) => void;
  value: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ElementType;
  type?: "text" | "email" | "password" | "tel";
};

interface InputDateProps extends GeneralInputProps {
  min?: string; // Fecha mínima permitida (YYYY-MM-DD)
  max?: string; // Fecha máxima permitida (YYYY-MM-DD)
}

export const InputText: React.FC<GeneralInputProps> = ({
  value,
  onChange,
  label,
  placeholder,
  disabled,
  required,
  icon: Icon,
  type = "text",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label
          className={`block text-sm font-medium text-gray-700 mb-1 ${
            required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""
          }`}
        >
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 ml-3 flex items-center pointer-events-none">
              <Icon className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <input
            pattern="^[^<>]*$"
            type={type}
            disabled={disabled}
            value={value}
            required={required}
            placeholder={placeholder}
            onChange={handleChange}
            className={`${
              Icon ? "pl-10" : "pl-4"
            } block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors`}
          />
        </div>
      </div>
    </div>
  );
};

export const InputDate: React.FC<InputDateProps> = ({
  value,
  onChange,
  label,
  placeholder,
  disabled,
  required,
  icon: Icon,
  min,
  max,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <label
        className={`block text-sm font-medium text-gray-700 mb-1 ${
          required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""
        }`}
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 ml-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <input
          type="date"
          disabled={disabled}
          value={value}
          required={required}
          placeholder={placeholder} // El placeholder puede no ser visible en todos los navegadores para type="date"
          onChange={handleChange}
          min={min}
          max={max}
          // Clases de Tailwind, ajustando el padding si hay icono
          className={`${
            Icon ? "pl-10" : "pl-4"
          } block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors`}
        />
      </div>
    </div>
  );
};

import { CheckCircle } from "lucide-react";
import React from "react";

// Define la estructura para cada opción del select
export interface SelectOption {
  value: string | number;
  label: string;
}

type SelectProps = {
  onChange: (value: string) => void;
  value: string;
  options: SelectOption[]; // Array de opciones para el select
  label?: string;
  placeholder?: string; // Para la primera opción deshabilitada (ej. "Selecciona una opción")
  disabled?: boolean;
  required?: boolean;
  icon?: React.ElementType; // Icono opcional
};

export const SelectInput: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  label,
  placeholder,
  disabled,
  required,
  icon: Icon,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <label
        className={`block text-sm font-medium text-gray-700 mb-1 ${
          required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""
        }`}
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 ml-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        {/* El icono de flecha del select nativo está a la derecha, por eso el padding a la derecha también */}
        <select
          disabled={disabled}
          value={value}
          required={required}
          onChange={handleChange}
          // Clases de Tailwind, ajustando el padding si hay icono
          className={`${
            Icon ? "pl-10 pr-10" : "pl-4 pr-10"
          } block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none transition-colors`}
          // El 'appearance-none' es clave para personalizar el select si no quieres la flecha nativa
          // y quieres usar un icono personalizado, aunque aquí no lo hemos añadido
        >
          {placeholder && (
            <option value="" disabled={true}>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Puedes añadir un icono de flecha personalizado aquí si usas appearance-none */}
        {/* <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.096 6.924 4.682 8.338z" />
          </svg>
        </div> */}
      </div>
    </div>
  );
};

export const InputRadio = <T,>({
  name,
  item,
  selectedItem,
  onChange,
  disabled = false,
}: {
  name: string;
  item: {
    id: T;
    label: string;
    icon: React.ElementType;
    color?: string;
    description: string;
  };
  disabled?: boolean;
  selectedItem: string;
  onChange: React.Dispatch<React.SetStateAction<T>>;
}) => {
  const IconComponent = item.icon;
  return (
    <label
      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
        disabled === true
          ? "border-gray-50 bg-gray-50"
          : selectedItem === item.id
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={item.id as string}
        checked={selectedItem === item.id}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
        className="sr-only"
      />
      <div
        className={`w-8 h-8 ${item.color || "bg-gray"}${
          disabled ? "-300" : "-600"
        } rounded-full flex items-center justify-center mr-3`}
      >
        <IconComponent className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <div
          className={`font-medium ${
            disabled ? "text-gray-500" : "text-gray-800"
          }`}
        >
          {item.label}
        </div>
        <div className="text-xs text-gray-500">{item.description}</div>
      </div>
      {selectedItem === item.id && (
        <CheckCircle className="w-5 h-5 text-blue-500" />
      )}
    </label>
  );
};
