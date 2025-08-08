// src/components/notifications/Notification.tsx
import React from "react";

export interface NotificationProps {
  id: string; // ID único para poder eliminarla
  message: string;
  type: "success" | "error" | "info" | "warning"; // Tipo de notificación
  onClose: (id: string) => void; // Función para cerrar la notificación
  duration?: number; // Duración opcional en ms para que se cierre automáticamente
}

const Notification: React.FC<NotificationProps> = ({
  id,
  message,
  type,
  onClose,
  duration,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const [isExiting, setIsExiting] = React.useState(false); // Para controlar la animación de salida

  React.useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setIsExiting(true); // Inicia la animación de salida
        // Espera a que la animación termine antes de eliminarla del DOM
        setTimeout(() => onClose(id), 500); // 500ms es la duración de la animación 'duration-500' en Tailwind
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  // Determina las clases de estilo según el tipo de notificación
  const typeClasses = {
    success: "bg-green-100 border-green-500 text-green-700",
    error: "bg-red-100 border-red-500 text-red-700",
    info: "bg-blue-100 border-blue-500 text-blue-700",
    warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
  }[type];

  // Clases para animaciones de entrada/salida
  const animationClasses = isExiting
    ? "animate-slide-out-right opacity-0" // Clases para salir
    : "animate-slide-in-right opacity-100"; // Clases para entrar

  if (!isVisible && !isExiting) {
    // Solo oculta completamente si no es visible y ya terminó de salir
    return null;
  }

  return (
    <div
      className={`
        flex items-center justify-between p-4 mb-2
        rounded-lg shadow-lg border-l-4
        min-w-xs max-w-sm
        transition-all duration-500 ease-in-out
        ${typeClasses} ${animationClasses}
      `}
    >
      <p className="flex-grow pr-4 text-sm font-medium">{message}</p>
      <button
        className="text-lg leading-none p-1 rounded-full hover:bg-opacity-20 transition-colors"
        onClick={() => {
          setIsExiting(true); // Inicia la animación de salida
          setTimeout(() => onClose(id), 500); // Espera la duración de la animación
        }}
      >
        &times;
      </button>
    </div>
  );
};

export default Notification;
