import { supabase } from "../services/supabaseClient";
import {
  getCompaniesAgent,
  getCompaniesAgentViajeros,
  getEmpresasDatosFiscales,
  getPaymentMethods,
  getCreditAgent,
  getPagosAgente,
  getHoteles,
  getPendientesAgente,
} from "./useDatabase";

export const fetchCompaniesAgent = async () => {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No hay usuario autenticado");

    const companiesData = await getCompaniesAgent(user.user.id);
    return companiesData.data || [];
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
};

export const fetchViajerosCompanies = async () => {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No hay usuario autenticado");

    const employeesData = await getCompaniesAgentViajeros(user.user.id);
    return employeesData.data || [];
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
};

export const fetchEmpresasDatosFiscales = async () => {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No hay usuario autenticado");

    const employeesData = await getEmpresasDatosFiscales(user.user.id);
    return employeesData.data || [];
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
};

export const fetchPaymentMethods = async () => {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No hay usuario autenticado");

    const paymentMehtods = await getPaymentMethods(user.user.id);
    if (paymentMehtods.error) throw paymentMehtods.error;
    return paymentMehtods || [];
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return [];
  }
};

export const fetchCreditAgent = async () => {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No hay usuario autenticado");

    const creditData = await getCreditAgent(user.user.id);
    return creditData || [];
  } catch (error) {
    console.error("Error fetching credit:", error);
    return [];
  }
};

export const fetchPagosAgent = async () => {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No hay usuario autenticado");
    const paymentData = await getPagosAgente(user.user.id);

    console.log(paymentData);
    return paymentData || [];
  } catch (error) {
    console.error("Error fetching credit:", error);
    return [];
  }
};

export const fetchPendientesAgent = async () => {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No hay usuario autenticado");
    const paymentData = await getPendientesAgente(user.user.id);

    console.log(paymentData);
    return paymentData || [];
  } catch (error) {
    console.error("Error fetching credit:", error);
    return [];
  }
};

export const fetchHoteles = async () => {
  try {
    const hotelsData = await getHoteles();

    console.log(hotelsData);
    return hotelsData || [];
  } catch (error) {
    console.error("Error fetching hoteles:", error);
    return [];
  }
};
