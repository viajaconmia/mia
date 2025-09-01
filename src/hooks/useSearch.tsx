import { useLocation, useParams } from "wouter";

export const useSearch = (param: string = "search") => {
  const params = useParams();
  const location = useLocation();

  return { params, location };
};
