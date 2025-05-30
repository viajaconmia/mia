import { Hotel } from "../types/hotel";

export const fetchHotelById = async (
  id: string,
  callback: (data: Hotel) => void
) => {
  try {
    const data = await fetch(
      `https://chatmia.wl.r.appspot.com/hotel?id=${id}`,
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Content-Type": "application/json",
        },
      }
    ).then((res) => res.json());
    console.log("Data:", data);
    callback(data);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
