const ROUTES = {
  HOME: "/",
  MIA: {
    HOME: "/mia",
  },
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
  DASHBOARD: "/consultas/general",
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
    ID_PAGOS: (id: string )=>`/factura/pagos/${id}`,
    PAGOS: `/factura/pagos/:id`
  },
  BOOKINGS: {
    HOME: "/bookings",
    ID: "/bookings/:id",
    ID_SOLICITUD: (id: string) => `/bookings/${btoa(id)}`,
  },
  IMPERSONADO: "/impersonado",
};

export default ROUTES;
