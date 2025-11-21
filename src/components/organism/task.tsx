import React from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export type TaskStatus = "loading" | "success" | "error" | "queue";

interface TaskProps {
  label: string;
  status: TaskStatus;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
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

/* =========================== 1) Label =========================== */
export const TaskLabel = ({ label }: { label: string }) => (
  <span className="text-xs font-medium text-gray-700 text-ellipsis line-clamp-1">
    {label}
  </span>
);

/* =========================== 2) Texto de estado =========================== */
export const TaskStatusText: React.FC<TaskStatusTextProps> = ({ status }) => {
  const map: Record<TaskStatus, string> = {
    loading: "Procesando tu solicitud...",
    success: "Completado",
    error: "Error",
    queue: "En cola",
  };

  const colorMap: Record<TaskStatus, string> = {
    loading: "text-blue-600",
    success: "text-emerald-600",
    error: "text-red-600",
    queue: "text-gray-600",
  };

  return (
    <span className={`text-xs font-semibold ${colorMap[status]}`}>
      {map[status]}
    </span>
  );
};

/* =========================== 3) Ícono según estado =========================== */
export const TaskIcon: React.FC<TaskIconProps> = ({ status }) => {
  return (
    <div className="flex items-center gap-2">
      {status === "loading" && (
        <>
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 493 539"
            className="w-[30px] h-[30px] text-blue-600 animate-wobble-bounce"
          >
            <path
              fill="currentColor"
              d="M205.1,500.5C205.1,500.5,205,500.6,205.1,500.5C140.5,436.1,71.7,369.1,71.7,291.1 c0-86.6,84.2-157.1,187.6-157.1S447,204.4,447,291.1c0,74.8-63.4,139.6-150.8,154.1c0,0,0,0,0,0l-8.8-53.1 c61.3-10.2,105.8-52.6,105.8-100.9c0-56.9-60-103.2-133.7-103.2s-133.7,46.3-133.7,103.2c0,49.8,48,93.6,111.7,101.8c0,0,0,0,0,0 L205.1,500.5L205.1,500.5z"
            />
            <path
              fill="currentColor"
              d="M341,125.5c-2.9,0-5.8-0.7-8.6-2.1c-70.3-37.3-135.9-1.7-138.7-0.2c-8.8,4.9-20,1.8-24.9-7.1 c-4.9-8.8-1.8-20,7-24.9c3.4-1.9,85.4-47.1,173.8-0.2c9,4.8,12.4,15.9,7.6,24.8C353.9,122,347.6,125.5,341,125.5z"
            />
          </svg>
          <span className="text-blue-600 text-xs">MIA</span>
        </>
      )}
      {status === "success" && (
        <CheckCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
      )}
      {status === "error" && (
        <XCircle className="w-4 h-4 text-red-600" aria-hidden="true" />
      )}
      {status === "queue" && (
        <Clock
          className="w-4 h-4 text-gray-600 animate-spin"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

/* =========================== 4) Mensaje / respuesta =========================== */
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
    queue: "La tarea está en cola y se ejecutará pronto.",
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
    queue: "text-gray-600",
  };

  return <p className={`text-xs mt-1 ${colorMap[status]}`}>{message}</p>;
};

/* =========================== 5) Barra / animación =========================== */
export const TaskProgressBar: React.FC<TaskProgressBarProps> = ({ status }) => {
  const baseClasses =
    "h-1 w-full rounded-full overflow-hidden bg-gray-200 mt-2";

  if (status === "loading") {
    return (
      <div className={baseClasses}>
        <div className="h-full w-1/3 bg-blue-500 animate-[taskSlide_1s_linear_infinite]" />
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

  if (status === "queue") {
    return (
      <div className={baseClasses}>
        <div className="h-full w-full bg-gray-500 opacity-70" />
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      <div className="h-full w-full bg-red-500 opacity-70" />
    </div>
  );
};

/* =========================== 6) Componente principal =========================== */
export const Task: React.FC<TaskProps> = ({
  label,
  status,
  loadingMessage,
  successMessage,
  errorMessage,
}) => {
  return (
    <div className="w-full flex flex-col gap-1 border border-gray-200 rounded-lg px-3 py-2 bg-gray-200/50 shadow-sm animate-fade-in-left">
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
