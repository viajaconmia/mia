import { Route } from "wouter";
import ProtectedRoute from "./ProtectedRoute";

export const RouteSecure: React.FC<{
  path: string;
  component: React.ComponentType<any>;
  restricted?: boolean;
}> = ({ path, component: Component, restricted = false }) => {
  return (
    <>
      <Route path={path}>
        <ProtectedRoute restricted={restricted}>
          <Component></Component>
        </ProtectedRoute>
      </Route>
    </>
  );
};
