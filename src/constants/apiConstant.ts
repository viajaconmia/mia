export const ENDPOINTS = {
  create: "/create-checkout-session",
  retrieve: "/get-checkout-session",
  facturas: {
    getClientes: {
      method: "GET",
      endpoint: "/clients",
    },
    getClientesPorRfc: {
      method: "GET",
      endpoint: "/clients/rfc",
    },
    getClientesPorId: {
      method: "GET",
      endpoint: "/clients/id",
    },
    getCfdi: {
      method: "GET",
      endpoint: "/invoice",
    },
    createClient: {
      method: "POST",
      endpoint: "/clients",
    },
    createCfdi: {
      method: "POST",
      endpoint: "/cfdi",
    },
    downloadCfdi: {
      method: "POST",
      endpoint: "/download",
    },
    sendEmail: {
      method: "POST",
      endpoint: "/send-email",
    },
  },
};
export const URL = "https://mianoktos.vercel.app";
// export const URL = "http://localhost:3001";

export const ROUTES = {
  stripe: "/v1/stripe",
  factura: "/v1/factura",
};
export const pruebaapi =
  "nkt-U9TdZU63UENrblg1WI9I1Ln9NcGrOyaCANcpoS2PJT3BlbkFJ1KW2NIGUYF87cuvgUF3Q976fv4fPrnWQroZf0RzXTZTA942H3AMTKFKJHV6cTi8c6dd6tybUD65fybhPJT3BlbkFJ1KW2NIGPrnWQroZf0RzXTZTA942H3AMTKFy15whckAGSSRSTDvsvfHsrtbXhdrT";
export const HEADERS_API = {
  "Content-Type": "application/json",
  "x-api-key": pruebaapi,
};
