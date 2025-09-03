import { createContext, useContext, useState } from "react";

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

  const showNotification = (
    type: NotificationType,
    message: string,
    seconds: number = 7
  ) => {
    setNotification({ type, message, show: true });
    console.log("MOSTRANDO PERR NOTIFICACION");
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, seconds * 1000);
  };
  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

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
