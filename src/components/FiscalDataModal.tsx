import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CompanyWithTaxInfo, TaxInfo } from "../types";
import {
  createNewDatosFiscales,
  updateNewDatosFiscales,
} from "../hooks/useDatabase";
import { URL } from "../constants/apiConstant";
import useAuth from "../hooks/useAuth";

interface FiscalDataModalProps {
  company: CompanyWithTaxInfo;
  isOpen: boolean;
  onClose: () => void;
  onSave: (companyId: string, fiscalData: TaxInfo) => void;
}

const API_KEY =
  "nkt-U9TdZU63UENrblg1WI9I1Ln9NcGrOyaCANcpoS2PJT3BlbkFJ1KW2NIGUYF87cuvgUF3Q976fv4fPrnWQroZf0RzXTZTA942H3AMTKFKJHV6cTi8c6dd6tybUD65fybhPJT3BlbkFJ1KW2NIGPrnWQroZf0RzXTZTA942H3AMTKFy15whckAGSSRSTDvsvfHsrtbXhdrT";
const AUTH = { "x-api-key": API_KEY };

// Catálogo resumido y tipado por persona (PF, PM o AMBOS)
const REGIMENES: Record<
  string,
  { label: string; persona: "PF" | "PM" | "AMBOS" }
> = {
  // PM
  "601": { label: "General de Ley Personas Morales", persona: "PM" },
  "603": { label: "Personas Morales con Fines no Lucrativos", persona: "PM" },
  "609": { label: "Consolidación", persona: "PM" },
  "617": { label: "Sociedades Cooperativas de Producción", persona: "PM" },
  "618": { label: "Sociedades Cooperativas de Consumo", persona: "PM" },
  "619": { label: "Sociedades Cooperativas de Ahorro y Préstamo", persona: "PM" },
  "620": {
    label:
      "Sociedades Coop. de Producción que optan por diferir sus ingresos",
    persona: "PM",
  },
  "623": { label: "Opcional para Grupos de Sociedades", persona: "PM" },
  "624": { label: "Coordinados", persona: "PM" },
  "627": { label: "Régimen Simplificado de Confianza (RESICO) - Personas Morales", persona: "PM" },
  "628": { label: "Hidrocarburos", persona: "PM" },
  "629": {
    label: "Regímenes Fiscales Preferentes y Empresas Multinacionales",
    persona: "PM",
  },
  // PF
  "604": { label: "Servicios Profesionales (Honorarios)", persona: "PF" },
  "605": {
    label: "Sueldos y Salarios e Ingresos Asimilados a Salarios",
    persona: "PF",
  },
  "606": { label: "Arrendamiento", persona: "PF" },
  "607": {
    label: "Régimen de Enajenación o Adquisición de Bienes",
    persona: "PF",
  },
  "608": { label: "Demás ingresos", persona: "PF" },
  "610": {
    label:
      "Residentes en el Extranjero sin Establecimiento Permanente en México",
    persona: "PF",
  },
  "611": {
    label: "Ingresos por Dividendos (socios y accionistas)",
    persona: "PF",
  },
  "612": {
    label: "Actividades Empresariales y Profesionales",
    persona: "PF",
  },
  "613": {
    label: "Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras (PF)",
    persona: "PF",
  },
  "614": { label: "Ingresos por intereses", persona: "PF" },
  "615": {
    label: "Ingresos por obtención de premios",
    persona: "PF",
  },
  "616": { label: "Sin obligaciones fiscales", persona: "PF" },
  "621": { label: "Incorporación Fiscal", persona: "PF" },
  "625": {
    label: "Actividades Empresariales a través de Plataformas Tecnológicas",
    persona: "PF",
  },
  "626": {
    label: "Régimen Simplificado de Confianza (RESICO) - Personas Físicas",
    persona: "PF",
  },
  "630": {
    label: "Enajenación de acciones en bolsa de valores",
    persona: "PF",
  },
  // AMBOS
  "622": {
    label:
      "Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras (PF y PM)",
    persona: "AMBOS",
  },
  // (Opcional, no vigente, PM)
  "602": {
    label: "Personas Morales con fines no lucrativos (no vigente)",
    persona: "PM",
  },
};

function normalizePersona(input?: string): "PF" | "PM" {
  const s = (input || "").toLowerCase();
  if (s.includes("física") || s.includes("fisica") || s === "pf" || s === "f")
    return "PF";
  if (s.includes("moral") || s === "pm" || s === "m") return "PM";
  // Default razonable si viene vacío o raro:
  return "PM";
}

export function FiscalDataModal({
  company,
  isOpen,
  onClose,
  onSave,
}: FiscalDataModalProps) {
  const { user } = useAuth();
  const [colonias, setColonias] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(!company.taxInfo);
  const [error, setError] = useState("");

  const persona = normalizePersona(company.tipo_persona);

  const initialTaxData: TaxInfo = {
    id_datos_fiscales: company.id_datos_fiscales || "",
    id_empresa: company.id_empresa,
    rfc: company.rfc || "",
    calle: company.calle || company.empresa_direccion || "",
    colonia: company.colonia || company.empresa_colonia || "",
    municipio: company.municipio || company.empresa_municipio || "",
    estado: company.estado || company.empresa_estado || "",
    codigo_postal_fiscal: company.codigo_postal_fiscal || company.empresa_cp || "",
    regimen_fiscal: company.regimen_fiscal || "",
    razon_social: company.razon_social_df || company.razon_social || "",
  };

  const [formData, setFormData] = useState<TaxInfo>(initialTaxData);

  // Opciones filtradas por tipo de persona
  const regimenOptions = Object.entries(REGIMENES)
    .filter(
      ([, meta]) => meta.persona === persona || meta.persona === "AMBOS"
    )
    .map(([code, meta]) => ({ code, label: `${code} - ${meta.label}` }));

  useEffect(() => {
    if (isOpen) {
      const updated: TaxInfo = {
        id_datos_fiscales: company.id_datos_fiscales || "",
        id_empresa: company.id_empresa,
        rfc: company.rfc || "",
        calle: company.calle || company.empresa_direccion || "",
        colonia: company.colonia || company.empresa_colonia || "",
        municipio: company.municipio || company.empresa_municipio || "",
        estado: company.estado || company.empresa_estado || "",
        codigo_postal_fiscal: company.codigo_postal_fiscal || company.empresa_cp || "",
        regimen_fiscal: company.regimen_fiscal || "",
        razon_social: company.razon_social_df || company.razon_social || "",
      };

      setFormData(updated);
      setIsEditing(!company.taxInfo);
      setError("");

      if (
        updated.codigo_postal_fiscal &&
        updated.codigo_postal_fiscal.length > 4
      ) {
        fetchColonias(updated.codigo_postal_fiscal);
      }
    }
  }, [isOpen, company]);

  const fetchColonias = (codigoPostal: string) => {
    fetch(`${URL}/v1/sepoMex/buscar-codigo-postal?d_codigo=${codigoPostal}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...AUTH },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setColonias(data.data.map((item: any) => item.d_asenta));
          if (!formData.municipio || !formData.estado) {
            setFormData((prev) => ({
              ...prev,
              municipio: data.data[0].D_mnpio,
              estado: data.data[0].d_estado,
            }));
          }
        } else {
          setColonias([]);
        }
      })
      .catch((err) =>
        console.error("Error obteniendo datos de código postal:", err)
      );
  };

  useEffect(() => {
    if (
      formData.codigo_postal_fiscal &&
      formData.codigo_postal_fiscal.length > 4
    ) {
      fetchColonias(formData.codigo_postal_fiscal);
    }
  }, [formData.codigo_postal_fiscal]);

  if (!isOpen) return null;

  const validateRFC = (rfc: string) =>
    /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(rfc);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) throw new Error("No hay usuario autenticado");
      if (!validateRFC(formData.rfc)) {
        setError("El formato del RFC no es válido");
        return;
      }
      let responseCompany;
      if (formData?.id_datos_fiscales) {
        responseCompany = await updateNewDatosFiscales(formData);
      } else {
        responseCompany = await createNewDatosFiscales(formData);
      }
      if (!responseCompany?.success)
        throw new Error("No se pudo registrar los datos fiscales");

      onSave(company.id_empresa, formData);
      setIsEditing(false);
      setError("");
    } catch (err) {
      console.error("Error creando nuevos datos fiscales", err);
      setError("Hubo un error al guardar los datos fiscales. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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
                  {colonias.map((colonia, i) => (
                    <option key={i} value={colonia}>
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
                  onChange={(e) =>
                    setFormData({ ...formData, municipio: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  required
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
                  onChange={(e) =>
                    setFormData({ ...formData, estado: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              {/* Select de Régimen fiscal (filtrado por PF/PM) */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Régimen fiscal {persona === "PF" ? "(Persona Física)" : "(Persona Moral)"}
                </label>
                <select
                  name="regimen_fiscal"
                  value={formData.regimen_fiscal}
                  onChange={(e) =>
                    setFormData({ ...formData, regimen_fiscal: e.target.value })
                  }
                  className="w-full p-2 border rounded-md bg-white"
                  required
                >
                  <option value="">
                    Selecciona un régimen fiscal {persona}
                  </option>
                  {regimenOptions.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(initialTaxData);
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
                {Object.entries(formData).map(([key, value]) => {
                  if (key === "id_empresa" || key === "id_datos_fiscales") return null;
                  const title = key.replace(/_/g, " ").toUpperCase();
                  const isReg = key === "regimen_fiscal";
                  const regText = isReg
                    ? `${value || "N/A"}${value && REGIMENES[String(value)]
                      ? ` - ${REGIMENES[String(value)].label}`
                      : ""
                    }`
                    : value || "N/A";
                  return (
                    <div key={key}>
                      <p className="text-sm font-medium text-gray-700">{title}</p>
                      <p className="mt-1">{regText}</p>
                    </div>
                  );
                })}
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
