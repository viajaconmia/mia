const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  AUTH: {
    HOME: "/auth/",
    REGISTER: "/auth/register",
    RESET_PASSWORD: "/auth/reset-password",
  },
  HOTELS: {
    SEARCH: "/hotels/search",
    ID: "/hotels/:id",
    ID_CREATE: (id: string) => `/hotels/${id}`,
  },
  FAQ: "/faq",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  NOT_FOUND: "/404",
  CONSULTAS: {
    REDIRECT: "/consultas/:subpath",
    HOME: "/consultas/general",
    SUBPATH: (path: string) => `/consultas/${path}`,
    SEARCH: (path: string, search: string) =>
      `/consultas/${path}?search=${search}`,
  },
  FACTURACION: {
    HOME: "/factura/:id",
    ID: (path: string) => `/factura/${path}`,
  },
  BOOKINGS: {
    HOME: "/bookings",
    ID: "/bookings/:id",
    ID_SOLICITUD: (id: string) => `/bookings/${id}`,
  },
};

export default ROUTES;
