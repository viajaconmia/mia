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
  },
  FAQ: "/faq",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  NOT_FOUND: "/404",
  CONSULTAS: "/consultas",
  BOOKINGS: {
    HOME: "/bookings",
    ID: "/bookings/:id",
  },
};

export default ROUTES;
