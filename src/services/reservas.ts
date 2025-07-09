import { HEADERS_API, URL } from "../constants/apiConstant";
import { ReservationDetails } from "../types/index";

export const fetchReservation = async (
  id: string,
  callback: (data: ReservationDetails) => void
) => {
  const response = await fetch(`${URL}/v1/mia/solicitud/id?id=${id}`, {
    method: "GET",
    headers: HEADERS_API,
  });
  const json = await response.json();
  console.log(json);
  const data: ReservationDetails = json.data[0];
  callback(data);
};