import React, { ButtonHTMLAttributes } from "react";

// Define la interfaz para las propiedades del componente Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Define el estilo visual del botón.
   * 'primary': Botón principal con el color sky-400.
   * 'secondary': Botón secundario con un fondo gris claro.
   * 'ghost': Botón transparente con texto sky-600 y borde transparente.
   */
  variant?: "primary" | "secondary" | "ghost";
  /**
   * Contenido del botón (texto, otros elementos, etc.).
   */
  children: React.ReactNode;
  /**
   * Un elemento React (como un componente de icono SVG) para mostrar junto al texto del botón.
   */
  icon?: React.ReactNode;
  /**
   * Clases adicionales de Tailwind CSS para personalizar el botón.
   */
  className?: string;
}

/**
 * Componente de Botón reutilizable con estilos primario, secundario y ghost.
 * Soporta la adición de íconos y es totalmente responsivo con Tailwind CSS.
 */
const Button: React.FC<ButtonProps> = ({
  variant = "primary", // Valor por defecto para el estilo
  children,
  icon,
  className = "",
  disabled,
  ...rest
}) => {
  // Clases base para todos los botones
  const baseClasses = `
  flex items-center px-4 py-2 text-white rounded-md
    text-sm font-normal
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    whitespace-nowrap
    ${disabled ? "opacity-70 cursor-not-allowed" : ""}
  `;

  // Clases específicas para cada variante
  const variantClasses = {
    primary: `
      bg-blue-600 text-white
      hover:bg-blue-700
      focus:ring-sky-500
    `,
    secondary: `
      bg-gray-200 text-gray-800
      hover:bg-gray-300
      focus:ring-gray-300
    `,
    ghost: `
      bg-transparent text-blue-700
      hover:bg-blue-50 hover:text-sky-700
      focus:ring-sky-100
      border border-transparent
    `,
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className} font- `}
      disabled={disabled}
      {...rest} // Pasa todas las demás propiedades HTML nativas del botón
    >
      {icon && <span className="mr-2">{icon}</span>}{" "}
      {/* Renderiza el ícono si existe */}
      {children} {/* Renderiza el contenido del botón */}
    </button>
  );
};

export default Button;
