// components/task/Task.tsx
import React from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export type TaskStatus = "loading" | "success" | "error";

interface TaskProps {
  label: string;
  status: TaskStatus;

  // Mensajes opcionales (por si quieres sobreescribir los defaults)
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

interface TaskLabelProps {
  label: string;
}

interface TaskStatusTextProps {
  status: TaskStatus;
}

interface TaskIconProps {
  status: TaskStatus;
}

interface TaskResponseProps {
  status: TaskStatus;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

interface TaskProgressBarProps {
  status: TaskStatus;
}

/* ===========================
 * 1) Label
 * =========================== */
export const TaskLabel: React.FC<TaskLabelProps> = ({ label }) => (
  <span className="text-xs font-medium text-gray-700 text-ellipsis line-clamp-1">{label}</span>
);

/* ===========================
 * 2) Texto de estado
 * =========================== */
export const TaskStatusText: React.FC<TaskStatusTextProps> = ({ status }) => {
  const map: Record<TaskStatus, string> = {
    loading: "Procesando...",
    success: "Completado",
    error: "Error",
  };

  const colorMap: Record<TaskStatus, string> = {
    loading: "text-blue-600",
    success: "text-emerald-600",
    error: "text-red-600",
  };

  return (
    <span className={`text-xs font-semibold ${colorMap[status]}`}>
      {map[status]}
    </span>
  );
};

/* ===========================
 * 3) Ícono según estado
 * =========================== */
export const TaskIcon: React.FC<TaskIconProps> = ({ status }) => {
  if (status === "loading") {
    return (
      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" aria-hidden="true" />
    );
  }

  if (status === "success") {
    return (
      <CheckCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
    );
  }

  return <XCircle className="w-4 h-4 text-red-600" aria-hidden="true" />;
};

/* ===========================
 * 4) Mensaje / respuesta
 * =========================== */
export const TaskResponse: React.FC<TaskResponseProps> = ({
  status,
  loadingMessage,
  successMessage,
  errorMessage,
}) => {
  const defaultMessages: Record<TaskStatus, string> = {
    loading: "Esta tarea se está ejecutando. Por favor espera un momento.",
    success: "La tarea se completó correctamente.",
    error: "Ocurrió un problema al ejecutar la tarea.",
  };

  const message =
    status === "loading"
      ? loadingMessage ?? defaultMessages.loading
      : status === "success"
        ? successMessage ?? defaultMessages.success
        : errorMessage ?? defaultMessages.error;

  const colorMap: Record<TaskStatus, string> = {
    loading: "text-gray-600",
    success: "text-emerald-700",
    error: "text-red-700",
  };

  return (
    <p className={`text-xs mt-1 ${colorMap[status]}`}>
      {message}
    </p>
  );
};

/* ===========================
 * 5) Barra / animación
 * =========================== */
export const TaskProgressBar: React.FC<TaskProgressBarProps> = ({ status }) => {
  // La barra solo tiene animación en loading
  const baseClasses =
    "h-1 w-full rounded-full overflow-hidden bg-gray-200 mt-2";

  if (status === "loading") {
    return (
      <div className={baseClasses}>
        <div className="h-full w-1/3 bg-blue-500 animate-[taskSlide_1s_linear_infinite]" />
        {/* Tailwind keyframes personalizados (p. ej. en globals.css):
        
        @keyframes taskSlide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        */}
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className={baseClasses}>
        <div className="h-full w-full bg-emerald-500" />
      </div>
    );
  }

  // error
  return (
    <div className={baseClasses}>
      <div className="h-full w-full bg-red-500 opacity-70" />
    </div>
  );
};

/* ===========================
 * 6) Componente principal (contiene todo)
 * =========================== */
export const Task: React.FC<TaskProps> = ({
  label,
  status,
  loadingMessage,
  successMessage,
  errorMessage,
}) => {
  return (
    <div className="w-full flex flex-col gap-1 border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm">
      {/* Línea principal: icono + label + estado */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TaskIcon status={status} />
          <TaskLabel label={label} />
        </div>

        <TaskStatusText status={status} />
      </div>

      {/* Mensaje descriptivo */}
      <TaskResponse
        status={status}
        loadingMessage={loadingMessage}
        successMessage={successMessage}
        errorMessage={errorMessage}
      />

      {/* Barra / animación inferior */}
      <TaskProgressBar status={status} />
    </div>
  );
};

export default Task;
