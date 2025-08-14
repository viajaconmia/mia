import { UserSingleton } from "../services/UserSingleton";
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
    const user = UserSingleton.getInstance().getUser();
    if (!user) throw new Error("No hay usuario autenticado");
    if (!user.info) throw new Error("error");

    const companiesData = await getCompaniesAgent(user.info.id_agente);
    return companiesData.data || [];
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
};

export const fetchViajerosCompanies = async () => {
  try {
    const user = UserSingleton.getInstance().getUser();
    if (!user) throw new Error("No hay usuario autenticado");
    if (!user.info) throw new Error("error");

    const employeesData = await getCompaniesAgentViajeros(user.info.id_agente);
    return employeesData.data || [];
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
};

export const fetchEmpresasDatosFiscales = async () => {
  try {
    const user = UserSingleton.getInstance().getUser();
    if (!user) throw new Error("No hay usuario autenticado");
    if (!user.info) throw new Error("error");

    const employeesData = await getEmpresasDatosFiscales(user.info.id_agente);
    return employeesData.data || [];
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
};

export const fetchPaymentMethods = async () => {
  try {
    const user = UserSingleton.getInstance().getUser();
    if (!user) throw new Error("No hay usuario autenticado");
    if (!user.info) throw new Error("error");

    const paymentMehtods = await getPaymentMethods(user.info.id_agente);
    if (paymentMehtods.error) throw paymentMehtods.error;
    return paymentMehtods || [];
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return [];
  }
};

export const fetchCreditAgent = async () => {
  try {
    const user = UserSingleton.getInstance().getUser();
    if (!user) throw new Error("No hay usuario autenticado");
    if (!user.info) throw new Error("error");

    const creditData = await getCreditAgent(user.info.id_agente);
    console.log(creditData);
    return creditData || [];
  } catch (error) {
    console.error("Error fetching credit:", error);
    return [];
  }
};

export const fetchPagosAgent = async () => {
  try {
    const user = UserSingleton.getInstance().getUser();
    if (!user) throw new Error("No hay usuario autenticado");
    if (!user.info) throw new Error("error");

    const paymentData = await getPagosAgente(user.info.id_agente);

    console.log(paymentData);
    return paymentData || [];
  } catch (error) {
    console.error("Error fetching credit:", error);
    return [];
  }
};

export const fetchPendientesAgent = async () => {
  try {
    const user = UserSingleton.getInstance().getUser();
    if (!user) throw new Error("No hay usuario autenticado");
    if (!user.info) throw new Error("error");

    const paymentData = await getPendientesAgente(user.info.id_agente);

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
