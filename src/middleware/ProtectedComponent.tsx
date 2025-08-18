import useAuth from "../hooks/useAuth";
import { ReactNode } from "react";
import Loader from "../components/atom/Loader";
import { Roles } from "../types/index";

export const ProtectedComponent = ({
  children,
  admit,
}: {
  children: ReactNode;
  admit: Record<Roles, boolean>;
}) => {
  const { userLoading, user } = useAuth();

  if (userLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
        <Loader></Loader>
      </div>
    );
  }

  const rol: Roles =
    user?.info?.rol &&
    ["administrador", "reservante", "viajero", "consultor"].includes(
      user.info.rol
    )
      ? user.info.rol
      : "no-rol";

  if (admit[rol]) {
    return <>{children}</>;
  }

  return <></>;
};
