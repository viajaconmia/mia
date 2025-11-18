import { Route } from "wouter";
import ProtectedRoute from "./ProtectedRoute";

export const RouteSecure: React.FC<{
  path: string;
  component?: React.ComponentType<unknown>;
  restricted?: boolean;
  children?: React.ReactNode; // Aseguramos que 'children' sea un prop válido
}> = ({ path, children, component: Component, restricted = false }) => {
  return (
    <Route path={path}>
      <ProtectedRoute restricted={restricted}>
        {(!children && !Component) ? null :
          children || <Component />}
      </ProtectedRoute>
    </Route>
  );
};
