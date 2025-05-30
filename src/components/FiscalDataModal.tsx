import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CompanyWithTaxInfo, TaxInfo } from "../types";
import {
  createNewDatosFiscales,
  updateNewDatosFiscales,
} from "../hooks/useDatabase";
import { supabase } from "../services/supabaseClient";
import { URL } from "../constants/apiConstant";

interface FiscalDataModalProps {
  company: CompanyWithTaxInfo;
  isOpen: boolean;
  onClose: () => void;
  onSave: (companyId: string, fiscalData: TaxInfo) => void;
}

const API_KEY =
  "nkt-U9TdZU63UENrblg1WI9I1Ln9NcGrOyaCANcpoS2PJT3BlbkFJ1KW2NIGUYF87cuvgUF3Q976fv4fPrnWQroZf0RzXTZTA942H3AMTKFKJHV6cTi8c6dd6tybUD65fybhPJT3BlbkFJ1KW2NIGPrnWQroZf0RzXTZTA942H3AMTKFy15whckAGSSRSTDvsvfHsrtbXhdrT";
const AUTH = {
  "x-api-key": API_KEY,
};

export function FiscalDataModal({
  company,
  isOpen,
  onClose,
  onSave,
}: FiscalDataModalProps) {
  const [colonias, setColonias] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(!company.taxInfo);
  const [formData, setFormData] = useState<TaxInfo>(
    company.taxInfo || {
      id_datos_fiscales: "",
      id_empresa: company.id_empresa,
      rfc: "",
      calle: "",
      colonia: "",
      municipio: "",
      estado: "",
      codigo_postal_fiscal: "",
      regimen_fiscal: "",
      razon_social: "",
    }
  );
  const regimes = {
    "601": "Persona Moral - General de Ley Personas Morales",
    "603": "Persona Moral - Personas Morales con Fines no Lucrativos",
    "605":
      "Persona Física - Sueldos y Salarios e Ingresos Asimilados a Salarios",
    "606": "Persona Física - Arrendamiento",
    "607": "Persona Física - Régimen de Enajenación o Adquisición de Bienes",
    "608": "Persona Física - Demás ingresos",
    "609": "Persona Moral - Consolidación",
    "610":
      "Persona Física - Residentes en el Extranjero sin Establecimiento Permanente en México",
    "611": "Persona Física - Ingresos por Dividendos (socios y accionistas)",
    "612": "Persona Física - Actividades Empresariales y Profesionales",
    "614": "Persona Física - Ingresos por intereses",
    "615": "Persona Física - Régimen de los ingresos por obtención de premios",
    "616": "Persona Física - Sin obligaciones fiscales",
    "620":
      "Persona Moral - Sociedades Cooperativas de Producción que optan por diferir sus ingresos",
    "621": "Persona Física - Incorporación Fiscal",
    "622":
      "Persona Física y Moral - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras",
    "623": "Persona Moral - Opcional para Grupos de Sociedades",
    "624": "Persona Moral - Coordinados",
    "625":
      "Persona Física - Actividades Empresariales a través de Plataformas Tecnológicas",
    "626": "Persona Física - Régimen Simplificado de Confianza (RESICO)",
    "628": "Persona Moral - Hidrocarburos",
    "629":
      "Persona Moral - Regímenes Fiscales Preferentes y Empresas Multinacionales",
    "630": "Persona Física - Enajenación de acciones en bolsa de valores",
  };

  useEffect(() => {
    if (isOpen) {
      setFormData(
        company.taxInfo || {
          id_datos_fiscales: "",
          id_empresa: company.id_empresa,
          rfc: "",
          calle: "",
          colonia: "",
          municipio: "",
          estado: "",
          codigo_postal_fiscal: "",
          regimen_fiscal: "",
          razon_social: "",
        }
      );
      setIsEditing(!company.taxInfo);
      setError("");
    }
  }, [isOpen, company]);

  const [error, setError] = useState("");

  useEffect(() => {
    if (formData.codigo_postal_fiscal.length > 4) {
      fetch(
        `${URL}/v1/sepoMex/buscar-codigo-postal?d_codigo=${formData.codigo_postal_fiscal}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...AUTH,
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data.length > 0) {
            setColonias(data.data.map((item: any) => item.d_asenta)); // Extraer colonias
            setFormData((prev) => ({
              ...prev,
              municipio: data.data[0].D_mnpio,
              estado: data.data[0].d_estado,
            }));
          } else {
            setColonias([]);
          }
        })
        .catch((error) =>
          console.error("Error obteniendo datos de código postal:", error)
        );
    }
  }, [formData.codigo_postal_fiscal]);

  if (!isOpen) return null;

  const validateRFC = (rfc: string) => {
    const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    return rfcRegex.test(rfc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw userError;
      }
      if (!user) {
        throw new Error("No hay usuario autenticado");
      }

      if (!validateRFC(formData.rfc)) {
        setError("El formato del RFC no es válido");
        return;
      }
      let responseCompany;
      if (formData?.id_datos_fiscales) {
        responseCompany = await updateNewDatosFiscales(formData);
        if (!responseCompany.success) {
          throw new Error("No se pudo registrar los datos fiscales");
        }
      } else {
        responseCompany = await createNewDatosFiscales(formData);
        if (!responseCompany.success) {
          throw new Error("No se pudo registrar los datos fiscales");
        }
      }
      console.log("Datos fiscales guardados:", responseCompany);
      onSave(company.id_empresa, formData);
      setIsEditing(false);
      setError("");
    } catch (error) {
      console.error("Error creando nuevos datos fiscales", error);
      setError(
        "Hubo un error al guardar los datos fiscales. Inténtalo de nuevo."
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            Datos Fiscales de {company.razon_social}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razón social
                </label>
                <input
                  pattern="^[^<>]*$"
                  type="text"
                  value={formData.razon_social}
                  onChange={(e) =>
                    setFormData({ ...formData, razon_social: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RFC
                </label>
                <input
                  pattern="^[^<>]*$"
                  type="text"
                  value={formData.rfc}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rfc: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código Postal
                </label>
                <input
                  pattern="^[^<>]*$"
                  type="text"
                  value={formData.codigo_postal_fiscal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      codigo_postal_fiscal: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calle y número
                </label>
                <input
                  pattern="^[^<>]*$"
                  type="text"
                  value={formData.calle}
                  onChange={(e) =>
                    setFormData({ ...formData, calle: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colonia
                </label>
                <select
                  value={formData.colonia}
                  onChange={(e) =>
                    setFormData({ ...formData, colonia: e.target.value })
                  }
                  className="w-full p-2 border rounded-md bg-white"
                  required
                >
                  <option value="">Selecciona una colonia</option>
                  {colonias.map((colonia, index) => (
                    <option key={index} value={colonia}>
                      {colonia}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Municipio
                </label>
                <input
                  pattern="^[^<>]*$"
                  type="text"
                  value={formData.municipio}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <input
                  pattern="^[^<>]*$"
                  type="text"
                  value={formData.estado}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Régimen fiscal
                </label>
                <select
                  name="regimen_fiscal"
                  value={formData.regimen_fiscal}
                  onChange={(e) =>
                    setFormData({ ...formData, regimen_fiscal: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Selecciona un régimen fiscal</option>
                  <option value="601">
                    601 - Persona Moral - General de Ley Personas Morales
                  </option>
                  <option value="603">
                    603 - Persona Moral - Personas Morales con Fines no
                    Lucrativos
                  </option>
                  <option value="605">
                    605 - Persona Física - Sueldos y Salarios e Ingresos
                    Asimilados a Salarios
                  </option>
                  <option value="606">
                    606 - Persona Física - Arrendamiento
                  </option>
                  <option value="607">
                    607 - Persona Física - Régimen de Enajenación o Adquisición
                    de Bienes
                  </option>
                  <option value="608">
                    608 - Persona Física - Demás ingresos
                  </option>
                  <option value="609">
                    609 - Persona Moral - Consolidación
                  </option>
                  <option value="610">
                    610 - Persona Física - Residentes en el Extranjero sin
                    Establecimiento Permanente en México
                  </option>
                  <option value="611">
                    611 - Persona Física - Ingresos por Dividendos (socios y
                    accionistas)
                  </option>
                  <option value="612">
                    612 - Persona Física - Actividades Empresariales y
                    Profesionales
                  </option>
                  <option value="614">
                    614 - Persona Física - Ingresos por intereses
                  </option>
                  <option value="615">
                    615 - Persona Física - Régimen de los ingresos por obtención
                    de premios
                  </option>
                  <option value="616">
                    616 - Persona Física - Sin obligaciones fiscales
                  </option>
                  <option value="620">
                    620 - Persona Moral - Sociedades Cooperativas de Producción
                    que optan por diferir sus ingresos
                  </option>
                  <option value="621">
                    621 - Persona Física - Incorporación Fiscal
                  </option>
                  <option value="622">
                    622 - Persona Física y Moral - Actividades Agrícolas,
                    Ganaderas, Silvícolas y Pesqueras
                  </option>
                  <option value="623">
                    623 - Persona Moral - Opcional para Grupos de Sociedades
                  </option>
                  <option value="624">624 - Persona Moral - Coordinados</option>
                  <option value="625">
                    625 - Persona Física - Actividades Empresariales a través de
                    Plataformas Tecnológicas
                  </option>
                  <option value="626">
                    626 - Persona Física - Régimen Simplificado de Confianza
                    (RESICO)
                  </option>
                  <option value="628">
                    628 - Persona Moral - Hidrocarburos
                  </option>
                  <option value="629">
                    629 - Persona Moral - Regímenes Fiscales Preferentes y
                    Empresas Multinacionales
                  </option>
                  <option value="630">
                    630 - Persona Física - Enajenación de acciones en bolsa de
                    valores
                  </option>
                </select>
              </div>

              <div className="col-span-2 flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(
                      company.taxInfo || {
                        id_datos_fiscales: "",
                        id_empresa: company.id_empresa,
                        rfc: "",
                        calle: "",
                        colonia: "",
                        municipio: "",
                        estado: "",
                        codigo_postal_fiscal: "",
                        regimen_fiscal: "",
                        razon_social: "",
                      }
                    );
                    setIsEditing(false);
                    setError("");
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="col-span-2 grid grid-cols-2 gap-4">
                {Object.entries(formData).map(
                  ([key, value]) =>
                    key != "id_empresa" &&
                    key != "id_datos_fiscales" && (
                      <div key={key}>
                        <p className="text-sm font-medium text-gray-700">
                          {key.replace(/_/g, " ").toUpperCase()}
                        </p>
                        <p className="mt-1">
                          {key === "regimen_fiscal"
                            ? `${value} - ${regimes[value]}`
                            : value || "N/A"}
                        </p>
                      </div>
                    )
                )}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Editar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
