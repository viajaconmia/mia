import { URL, HEADERS_API } from "../constants/apiConstant";
import { UserSingleton } from "../services/UserSingleton";

export const useSolicitud = () => {
  const crearSolicitud = async (solicitud: any, id_usuario: any) =>
    await postSolicitud(solicitud, id_usuario);

  const crearSolicitudChat = async (solicitud: any, id_usuario: any) =>
    await postChatSolicitud(solicitud, id_usuario);

  const obtenerSolicitudes = async (
    callback: (json: PostBodyParams) => any,
    user
  ) => getSolicitud(callback, user);

  const obtenerSolicitudesClient = async (
    callback: (json: Booking) => void,
    user: string
  ) => getSolicitudClient(callback, user);

  const obtenerSolicitudesWithViajero = async (
    callback: (json: PostBodyParams) => any,
    user
  ) => getSolicitudViajero(callback, user);
  return {
    crearSolicitud,
    obtenerSolicitudes,
    obtenerSolicitudesClient,
    obtenerSolicitudesWithViajero,
    crearSolicitudChat,
  };
};

async function getSolicitudClient(
  callback: (json: Booking) => void,
  user: string
) {
  try {
    const response = await fetch(
      `${URL}/v1/mia/solicitud/forclient?id=${user}`,
      {
        method: "GET",
        headers: HEADERS_API,
      }
    );
    const json = await response.json();
    console.log(json);
    callback(json);
  } catch (error) {
    console.log(error);
  }
}
async function getSolicitudViajero(
  callback: (json: PostBodyParams) => void,
  user: string
) {
  try {
    const response = await fetch(
      `${URL}/v1/mia/solicitud/withviajero?id=${user}`,
      {
        method: "GET",
        headers: HEADERS_API,
      }
    );
    const json = await response.json();
    console.log(json);

    console.log("Esto es lo que esta sucediendo: ", json);
    const data = json.map((reservaDB) => {
      return {
        id: reservaDB.id_solicitud,
        confirmation_code: reservaDB.codigo_reservacion_hotel,
        hotel_name: reservaDB.hotel,
        check_in: reservaDB.check_in,
        check_out: reservaDB.check_out,
        room_type: reservaDB.room,
        total_price: reservaDB.total,
        solicitud_total: reservaDB.total,
        status: reservaDB.status,
        traveler_id: [reservaDB.primer_nombre, reservaDB.apellido_paterno]
          .filter((obj) => !!obj)
          .join(" "),
        traveler_name: reservaDB.nombre_viajero,
        created_at: reservaDB.created_at,
        image_url: "",
        is_booking: !!reservaDB.id_booking,
        id_pago: reservaDB.id_pago,
        factura: reservaDB.id_facturama,
        pendiente_por_cobrar: reservaDB.pendiente_por_cobrar,
        id_credito: reservaDB.id_credito,
      };
    });
    callback(data);
  } catch (error) {
    console.log(error);
  }
}
async function getSolicitud(
  callback: (json: PostBodyParams) => void,
  user: string
) {
  try {
    const res = await fetch(`${URL}/v1/mia/solicitud/client?user_id=${user}`, {
      method: "GET",
      headers: HEADERS_API,
    });
    const json = await res.json();
    console.log("Esto es lo que esta sucediendo: ", json);
    const data = json.map((reservaDB) => {
      return {
        id: reservaDB.id_solicitud,
        confirmation_code: reservaDB.confirmation_code,
        hotel_name: reservaDB.hotel,
        check_in: reservaDB.check_in,
        check_out: reservaDB.check_out,
        room_type: reservaDB.room,
        total_price: reservaDB.total,
        status: "completed",
        traveler_id: "xxxxxxxxxxxxx",
        created_at: new Date().toLocaleDateString(),
        image_url: "",
      };
    });
    callback(data);
  } catch (error) {
    console.log(error);
  }
}

async function postChatSolicitud(solicitud: any, id_usuario: string) {
  // Si ya existe un `user_id`, asignamos `id_viajero` desde el `id_usuario`
  //solicitud.id_viajero = id_usuario;
  const responseviajero = await fetch(
    `${URL}/v1/mia/solicitud/viajeroAgente?id=${id_usuario}`,
    {
      method: "GET",
      headers: HEADERS_API,
    }
  );
  const jsonviajero = await responseviajero.json();
  console.log(jsonviajero);
  const dataviajero = jsonviajero[0];
  const { id_viajero } = dataviajero;
  // Generamos un `confirmation_code` si no existe
  if (!solicitud.confirmation_code) {
    solicitud.confirmation_code = Math.round(
      Math.random() * 999999999
    ).toString();
  }

  // Aseguramos que los datos necesarios estén presentes
  const datosSolicitud = {
    solicitudes: [
      {
        confirmation_code: solicitud.confirmation_code,
        id_viajero: id_viajero, // Usamos el `id_usuario` como `id_viajero`
        hotel: solicitud.hotel_name || "Sin nombre", // Si no se encuentra el nombre del hotel, usamos un valor por defecto
        check_in: solicitud.dates.checkIn,
        check_out: solicitud.dates.checkOut,
        room: solicitud.room.type,
        total: solicitud.room.totalPrice,
        status: "pending",
        id_agente: id_usuario,
        nombre_viajero: solicitud.nombre_viajero,
        usuario_creador:
          UserSingleton.getInstance().getUser()?.info?.id_viajero,
      },
    ], // Establecemos el estado por defecto como "pending"
  };

  // Enviamos los datos a la API
  try {
    const res = await fetch(`${URL}/v1/mia/solicitud`, {
      method: "POST",
      headers: HEADERS_API,
      body: JSON.stringify(datosSolicitud),
    });
    const json = await res.json();
    console.log("response from solicitud create", json);
    return json; // Muestra la respuesta del servidor
  } catch (error) {
    console.log(error); // Manejo de errores
  }
}

async function postSolicitud(solicitud: any, id_usuario: string) {
  // Si ya existe un `user_id`, asignamos `id_viajero` desde el `id_usuario`
  //solicitud.id_viajero = id_usuario;

  // Generamos un `confirmation_code` si no existe
  if (!solicitud.confirmation_code) {
    solicitud.confirmation_code = Math.round(
      Math.random() * 999999999
    ).toString();
  }

  // Aseguramos que los datos necesarios estén presentes
  const datosSolicitud = {
    solicitudes: [
      {
        confirmation_code: solicitud.confirmation_code,
        id_viajero: solicitud.id_viajero, // Usamos el `id_usuario` como `id_viajero`
        hotel: solicitud.hotel_name || "Sin nombre", // Si no se encuentra el nombre del hotel, usamos un valor por defecto
        check_in: solicitud.dates.checkIn,
        check_out: solicitud.dates.checkOut,
        room: solicitud.room.type,
        total: solicitud.room.totalPrice,
        status: "pending",
        id_agente: id_usuario,
        nombre_viajero: null,
        viajeros_adicionales: solicitud.viajeros_adicionales || [], // Aseguramos que este campo sea un array, aunque esté vacío
        usuario_creador:
          UserSingleton.getInstance().getUser()?.info?.id_viajero,
      },
    ], // Establecemos el estado por defecto como "pending"
  };

  // Enviamos los datos a la API
  try {
    const res = await fetch(`${URL}/v1/mia/solicitud`, {
      method: "POST",
      headers: HEADERS_API,
      body: JSON.stringify(datosSolicitud),
    });
    const json = await res.json();
    console.log(json);
    return json; // Muestra la respuesta del servidor
  } catch (error) {
    console.log(error); // Manejo de errores
  }
}

type PostBodyParams = {
  confirmation_code: string;
  id_viajero: number;
  hotel_name: string;
  check_in: string;
  check_out: string;
  room_type: string;
  total_price: number;
  status: string;
};

interface Booking {
  id_solicitud: string;
  codigo_reservacion_hotel: string | null;
  nombre: string | null;
  hotel: string;
  check_in: string;
  check_out: string;
  room: string;
  total: string;
  status: string;
  nombre_viajero_completo: string | null;
  nombre_viajero: string | null;
  created_at: string;
  URLImagenHotel: string | null;
  is_booking: number | null;
  id_pago: string | null;
  id_facturama: string | null;
  id_credito: string | null;
  pendiente_por_cobrar: string | null;
  viajero: string;
}
