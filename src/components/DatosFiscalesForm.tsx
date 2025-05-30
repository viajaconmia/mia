import React, { useEffect, useState } from "react";
import { Company, TaxInfo } from "../types";
import { X } from "lucide-react";
import { fetchCompaniesAgent } from "../hooks/useFetch";
import { URL } from "../constants/apiConstant";

interface DatosFiscalesFormProp {
  onSubmit: (data: Partial<TaxInfo>) => void;
  onCancel: () => void;
  initialData?: TaxInfo;
}

const API_KEY =
  "nkt-U9TdZU63UENrblg1WI9I1Ln9NcGrOyaCANcpoS2PJT3BlbkFJ1KW2NIGUYF87cuvgUF3Q976fv4fPrnWQroZf0RzXTZTA942H3AMTKFKJHV6cTi8c6dd6tybUD65fybhPJT3BlbkFJ1KW2NIGPrnWQroZf0RzXTZTA942H3AMTKFy15whckAGSSRSTDvsvfHsrtbXhdrT";
const AUTH = {
  "x-api-key": API_KEY,
};

export function DatosFiscalesForm({
  onSubmit,
  onCancel,
  initialData,
}: DatosFiscalesFormProp) {
  const [empresas, setEmpresas] = useState<Company[]>([]);
  const [codigoPostal, setCodigoPostal] = useState(
    initialData?.codigo_postal_fiscal || ""
  );
  const [datosCodigo, setDatosCodigo] = useState({
    colonia: initialData?.colonia || "",
    municipio: initialData?.municipio || "",
    estado: initialData?.estado || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data: Partial<TaxInfo> = {
      rfc: formData.get("rfc") as string,
      calle: formData.get("calle") as string,
      municipio: formData.get("municipio") as string,
      estado: formData.get("estado") as string,
      colonia: formData.get("colonia") as string,
      codigo_postal_fiscal: formData.get("codigo_postal_fiscal") as string,
      regimen_fiscal: formData.get("regimen_fiscal") as string,
      id_empresa: formData.get("id_empresa") as string,
    };

    onSubmit(data);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Obtiene el primer archivo seleccionado
    if (file) {
      console.log("Archivo seleccionado:", file);
      // Aquí podrías subir el archivo o hacer cualquier otra acción que necesites
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchCompaniesAgent();
      setEmpresas(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (codigoPostal.length > 4) {
      fetch(`${URL}/v1/sepoMex/buscar-codigo-postal?d_codigo=${codigoPostal}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...AUTH, // Asegúrate de que AUTH esté definido
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setDatosCodigo({
              colonia: data.data.d_asenta,
              municipio: data.data.D_mnpio,
              estado: data.data.d_estado,
            });
          }
        })
        .catch((error) =>
          console.error("Error obteniendo datos de código postal:", error)
        );
    }
  }, [codigoPostal]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData
            ? "Editar Datos Fiscales"
            : "Registrar Nuevos Datos Fiscales"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">RFC</label>
          <input
            pattern="^[^<>]*$"
            type="text"
            name="rfc"
            defaultValue={initialData?.rfc}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Calle
          </label>
          <input
            pattern="^[^<>]*$"
            type="text"
            name="calle"
            defaultValue={initialData?.calle}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Código Postal Fiscal
          </label>
          <input
            pattern="^[^<>]*$"
            type="text"
            name="codigo_postal_fiscal"
            value={codigoPostal}
            onChange={(e) => setCodigoPostal(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Colonia
          </label>
          <input
            pattern="^[^<>]*$"
            type="text"
            name="colonia"
            value={datosCodigo.colonia}
            readOnly
            required
            className="mt-1 block w-full bg-gray-100 rounded-md border-gray-300 shadow-sm"
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
            value={datosCodigo.municipio}
            readOnly
            required
            className="mt-1 block w-full bg-gray-100 rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <input
            pattern="^[^<>]*$"
            type="text"
            name="estado"
            value={datosCodigo.estado}
            readOnly
            required
            className="mt-1 block w-full bg-gray-100 rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Regimen Fiscal
          </label>
          <input
            pattern="^[^<>]*$"
            type="text"
            name="regimen_fiscal"
            defaultValue={initialData?.regimen_fiscal}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estado de Situación Fiscal
          </label>
          <input
            pattern="^[^<>]*$"
            type="file"
            name="file_upload"
            accept=".jpg,.png,.pdf" // Puedes restringir los tipos de archivo
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => handleFileChange(e)} // Llamada a la función para manejar el archivo seleccionado
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Empresa
          </label>
          <select
            name="id_empresa"
            defaultValue={initialData?.id_empresa}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Selecciona Empresa</option>
            {empresas.map((empresa) => (
              <option key={empresa.id_empresa} value={empresa.id_empresa}>
                {empresa.razon_social}
              </option>
            ))}
          </select>
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
          {initialData ? "Actualizar Datos Fiscales" : "Crear Datos Fiscales"}
        </button>
      </div>
    </form>
  );
}
