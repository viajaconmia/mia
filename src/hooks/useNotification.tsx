import { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";

type NotificationType = "success" | "error" | "info";

interface Notification {
  type: NotificationType;
  message: string;
  show: boolean;
}

type NotificationContextProps = {
  notification: Notification;
  showNotification: (
    type: NotificationType,
    message: string,
    seconds?: number
  ) => void;
  hideNotification: () => void;
};

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined
);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notification, setNotification] = useState<Notification>({
    type: "info",
    message: "",
    show: false,
  });
  const { setear, value } = useLocalStorage<{ fecha: string }>(
    "time_to_repeat_anuncio"
  );

  const showNotification = (
    type: NotificationType,
    message: string,
    seconds: number = 7
  ) => {
    setNotification({ type, message, show: true });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, seconds * 1000);
  };
  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  useEffect(() => {
    if (value?.fecha) {
      const fecha = new Date(value?.fecha);
      fecha.setMinutes(fecha.getMinutes() + 120);
      const current = new Date();
      if (fecha.getTime() - current.getTime() <= 0) {
        setear({ fecha: String(new Date().toISOString()) });
        showNotification(
          "info",
          "¡Ya puedes ver tu nueva pagina de consultas!",
          30
        );
      }
    } else {
      setear({ fecha: String(new Date().toISOString()) });
      showNotification(
        "info",
        "¡Ya puedes ver tu nueva pagina de consultas!",
        15
      );
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notification, showNotification, hideNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    console.log("useNotification must be used within a NotificationProvider");
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }

  return context;
};
