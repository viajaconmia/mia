import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Company } from "../types";
import { URL } from "../constants/apiConstant";

interface CompanyFormProps {
  onSubmit: (data: Partial<Company>) => void;
  onCancel: () => void;
  initialData?: Company;
}

const API_KEY =
  "nkt-U9TdZU63UENrblg1WI9I1Ln9NcGrOyaCANcpoS2PJT3BlbkFJ1KW2NIGUYF87cuvgUF3Q976fv4fPrnWQroZf0RzXTZTA942H3AMTKFKJHV6cTi8c6dd6tybUD65fybhPJT3BlbkFJ1KW2NIGPrnWQroZf0RzXTZTA942H3AMTKFy15whckAGSSRSTDvsvfHsrtbXhdrT";
const AUTH = {
  "x-api-key": API_KEY,
};

export function CompanyForm({
  onSubmit,
  onCancel,
  initialData,
}: CompanyFormProps) {
  const [tipoPersona, setTipoPersona] = useState(
    initialData?.tipo_persona || "fisica"
  );
  const [colonias, setColonias] = useState<string[]>([]);
  const [estado, setEstado] = useState(initialData?.empresa_estado || "");
  const [municipio, setMunicipio] = useState(
    initialData?.empresa_municipio || ""
  );
  const [calle, setCalle] = useState(initialData?.empresa_direccion || "");
  const [colonia, setColonia] = useState(initialData?.empresa_colonia || "");
  const [codigoPostal, setCodigoPostal] = useState(
    initialData?.empresa_cp || ""
  );
  const [idEmpresa, setIdEmpresa] = useState(initialData?.id_empresa || "");

  useEffect(() => {
    if (codigoPostal.length > 4) {
      fetch(`${URL}/v1/sepoMex/buscar-codigo-postal?d_codigo=${codigoPostal}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...AUTH,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data.length > 0) {
            setColonias(data.data.map((item: any) => item.d_asenta)); // Extraer colonias
            setMunicipio(data.data[0].D_mnpio);
            setEstado(data.data[0].d_estado);
          } else {
            setColonias([]);
          }
        })
        .catch((error) =>
          console.error("Error obteniendo datos de código postal:", error)
        );
    }
  }, [codigoPostal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data: Partial<Company> = {
      nombre_comercial: formData.get("nombre_comercial") as string,
      razon_social: formData.get("nombre_comercial") as string,
      tipo_persona: formData.get("tipo_persona") as string,
      empresa_direccion: calle,
      empresa_colonia: colonia,
      empresa_estado: estado,
      empresa_municipio: municipio,
      empresa_cp: formData.get("codigo_postal") as string,
      id_empresa: idEmpresa,
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData
            ? tipoPersona === "fisica"
              ? "Editar Persona Física"
              : "Editar Compañía"
            : tipoPersona === "fisica"
            ? "Registrar Nueva Persona Física"
            : "Registrar Nueva Compañía"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tipo de Persona
        </label>
        <select
          name="tipo_persona"
          required
          value={tipoPersona}
          onChange={(e) => setTipoPersona(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="fisica">Persona Física</option>
          <option value="moral">Persona Moral</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {tipoPersona === "fisica"
              ? "Nombre de la Persona Física"
              : "Nombre Comercial de la Empresa"}
          </label>
          <input
            pattern="^[^<>]*$"
            type="text"
            name="nombre_comercial"
            defaultValue={initialData?.nombre_comercial}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* {tipoPersona === "moral" && <div>
          <label className="block text-sm font-medium text-gray-700">Razón Social</label>
          <input pattern="^[^<>]*$"
            type="text"
            name="razon_social"
            defaultValue={initialData?.razon_social || ''}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>} */}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Calle y número
          </label>
          <input
            pattern="^[^<>]*$"
            type="text"
            name="calle"
            value={calle}
            onChange={(e) => setCalle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Código Postal
          </label>
          <input
            pattern="^[^<>]*$"
            type="text"
            name="codigo_postal"
            value={codigoPostal}
            onChange={(e) => setCodigoPostal(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Colonia
          </label>
          <select
            name="colonia"
            value={colonia}
            onChange={(e) => setColonia(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Seleccione una colonia</option>
            {colonias.map((colonia, index) => (
              <option key={index} value={colonia}>
                {colonia}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <input
            pattern="^[^<>]*$"
            type="text"
            name="estado"
            value={estado}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Municipio
          </label>
          <input
            pattern="^[^<>]*$"
            type="text"
            name="municipio"
            value={municipio}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          {initialData ? "Actualizar" : "Guardar"}{" "}
          {tipoPersona === "fisica" ? "Persona Física" : "Compañía"}
        </button>
      </div>
    </form>
  );
}
