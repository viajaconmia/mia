import { HEADERS_API, URL } from "../constants/apiConstant";
import { Reservation } from "../types/index";

export const fetchReservation = async (
  id: string,
  callback: (data: Reservation) => void
) => {
  const response = await fetch(`${URL}/v1/mia/solicitud/id?id=${id}`, {
    method: "GET",
    headers: HEADERS_API,
  });
  const json: Reservation[] = await response.json();
  console.log(json);
  const data = json[0];
  callback(data);
};
