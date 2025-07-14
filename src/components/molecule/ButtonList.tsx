import React from "react";
import Button from "../atom/Button"; // Asegúrate de que la ruta sea correcta
import { Beer, Cog, Info } from "lucide-react";

// Define la interfaz para la estructura de cada botón en el array
interface ButtonConfig {
  id: string; // Es buena práctica tener un ID único para la key de React
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost";
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

// Array de configuración de tus botones
const buttonsConfig: ButtonConfig[] = [
  {
    id: "btn-1",
    label: "Acción Principal",
    onClick: () => alert("Botón Principal clickeado!"),
    variant: "primary",
    icon: <Beer />,
  },
  {
    id: "btn-2",
    label: "Más Información",
    onClick: () => alert("Botón de Información clickeado!"),
    variant: "secondary",
    icon: <Info />,
  },
  {
    id: "btn-3",
    label: "Configuración",
    onClick: () => alert("Botón de Configuración clickeado!"),
    variant: "ghost",
    icon: <Cog />,
  },
  {
    id: "btn-4",
    label: "Botón Deshabilitado",
    onClick: () => console.log("Este no se debería clickear"),
    variant: "primary",
    disabled: true,
  },
  {
    id: "btn-5",
    label: "Botón Ancho",
    onClick: () => alert("Botón ancho clickeado!"),
    variant: "secondary",
    className: "w-full", // Ejemplo de clase adicional
  },
];

/**
 * Componente que renderiza una lista de botones a partir de un array de configuración.
 */
const ButtonList: React.FC = () => {
  return (
    <div className="flex flex-col space-y-4 p-8 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Botones Dinámicos
      </h2>
      {buttonsConfig.map((button) => (
        <Button
          key={button.id} // Siempre usa una key única cuando mapeas listas en React
          variant={button.variant}
          onClick={button.onClick}
          icon={button.icon}
          disabled={button.disabled}
          className={button.className}
        >
          {button.label}
        </Button>
      ))}
    </div>
  );
};

export default ButtonList;
