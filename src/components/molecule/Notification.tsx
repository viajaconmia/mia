import { useNotification } from "../../hooks/useNotification";
import { AlertCircle, CheckCircle, X } from "lucide-react";

export const Notification = () => {
  const notificationContext = useNotification();

  if (!notificationContext) return null;

  const { notification, hideNotification } = notificationContext;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[1000] transform transition-transform duration-300 ${
        notification.show ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div
        className={`px-4 py-5 text-white flex justify-between items-center text-center relative ${
          notification.type === "success"
            ? "bg-emerald-500"
            : notification.type === "error"
            ? "bg-red-500"
            : "bg-blue-500"
        }`}
      >
        <div className="flex items-center justify-center gap-2 w-full">
          <div className="w-5 h-5">
            {notification.type === "success" && (
              <CheckCircle className="w-5 h-5" />
            )}
            {notification.type === "error" && (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>
          <span className="font-medium">{notification.message}</span>
        </div>
        <button
          onClick={hideNotification}
          className="hover:bg-white/20 rounded-full p-1"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
