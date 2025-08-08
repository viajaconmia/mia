import { useLocation } from "wouter";
import useAuth from "../hooks/useAuth";
import { ReactNode } from "react";
import ROUTES from "../constants/routes";
import Loader from "../components/atom/Loader";

const ProtectedRoute = ({
  children,
  restricted,
}: {
  children: ReactNode;
  restricted: boolean;
}) => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, userLoading } = useAuth();

  if (userLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
        <Loader></Loader>
      </div>
    );
  }

  if (restricted) {
    if (!isAuthenticated) {
      setLocation(ROUTES.HOME);
      return (
        <>
          <h1>NO TIENES ACCESO</h1>
        </>
      );
    } else {
      return <>{children}</>;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
