import React, { useEffect, useState } from "react";
import { Company, Employee } from "../types";
import { X } from "lucide-react";
import { fetchCompaniesAgent } from "../hooks/useFetch";
import { formatDate } from "../helpers/helpers";

interface EmployeeFormProps {
  onSubmit: (data: Partial<Employee>) => void;
  onCancel: () => void;
  // tags: Tag[];
  // departments: string[];
  initialData?: Employee;
}

export function EmployeeForm({
  onSubmit,
  onCancel,
  // tags,
  // departments,
  initialData,
}: EmployeeFormProps) {
  const [empresas, setEmpresas] = useState<Company[]>([]);
  const [selectedEmpresas, setSelectedEmpresas] = useState(
    initialData?.empresas?.map((e) => e.id_empresa) || []
  );
  const handleCheckboxChange = (event: any) => {
    const { value, checked } = event.target;
    setSelectedEmpresas((prev) =>
      checked ? [...prev, value] : prev.filter((id) => id !== value)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data: Partial<Employee> = {
      correo: formData.get("email") as string,
      telefono: formData.get("phone") as string,
      //tagIds: Array.from(formData.getAll('tagIds') as string[]),
      primer_nombre: formData.get("nombre") as string,
      segundo_nombre: formData.get("segundNombre") as string,
      apellido_materno: formData.get("apellidoM") as string,
      apellido_paterno: formData.get("apellidoP") as string,
      id_empresas: formData.getAll("empresa") as string[],
      fecha_nacimiento: formData.get("fecha_nacimiento") as string,
      genero: formData.get("genero") as string,
      numero_empleado: formData.get("numero_empleado") as string,
      numero_pasaporte: formData.get("numero_pasaporte") as string,
      nacionalidad: formData.get("nacionalidad") as string,
      id_viajero: initialData?.id_viajero,
    };

    onSubmit(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchCompaniesAgent();
      setEmpresas(data);
    };
    fetchData();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? "Editar Viajero" : "Añadir Nuevo Viajero"}
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
          <label className="block text-sm font-medium text-gray-700">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            pattern="^[^<>]*$"
            type="text"
            name="nombre"
            defaultValue={initialData?.primer_nombre}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Segundo Nombre
          </label>
          <input
            pattern="^[^<>]*$"
            type="text"
            name="segundNombre"
            defaultValue={initialData?.segundo_nombre || ""}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Apellido Paterno <span className="text-red-500">*</span>
          </label>
          <input
            pattern="^[^<>]*$"
            type="text"
            name="apellidoP"
            defaultValue={initialData?.apellido_paterno}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Apellido Materno
          </label>
          <input
            pattern="^[^<>]*$"
            type="text"
            name="apellidoM"
            defaultValue={initialData?.apellido_materno || ""}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Correo Electronico
          </label>
          <input
            pattern="^[^<>]*$"
            type="email"
            name="email"
            defaultValue={initialData?.correo}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Telefono
          </label>
          <input
            pattern="^[^<>]*$"
            type="tel"
            name="phone"
            defaultValue={initialData?.telefono}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha de Nacimiento
          </label>
          <input
            pattern="^[^<>]*$"
            type="date"
            name="fecha_nacimiento"
            defaultValue={
              initialData?.fecha_nacimiento
                ? new Date(initialData.fecha_nacimiento)
                    .toISOString()
                    .split("T")[0]
                : ""
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Número de Pasaporte
          </label>
          <input
            pattern="^[^<>]*$"
            type="text"
            name="numero_pasaporte"
            defaultValue={initialData?.numero_pasaporte}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Número de Empleado
          </label>
          <input
            pattern="^[^<>]*$"
            type="text"
            name="numero_empleado"
            defaultValue={initialData?.numero_empleado}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nacionalidad
          </label>
          <select
            name="nacionalidad"
            defaultValue={initialData?.nacionalidad || ""}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Selecciona una nacionalidad</option>
            <option value="MX">Mexicana</option>
            <option value="US">Estadounidense</option>
            <option value="CA">Canadiense</option>
            <option value="ES">Española</option>
            <option value="AR">Argentina</option>
            <option value="BR">Brasileña</option>
            <option value="FR">Francesa</option>
            <option value="DE">Alemana</option>
            <option value="IT">Italiana</option>
            <option value="JP">Japonesa</option>
            <option value="CN">China</option>
            <option value="IN">India</option>
            <option value="UK">Británica</option>
            <option value="AU">Australiana</option>
            <option value="CL">Chilena</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sexo (Género)
          </label>
          <select
            name="genero"
            defaultValue={initialData?.genero}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Selecciona genero</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Empresas <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {empresas.map((empresa) => (
              <label
                key={empresa.id_empresa}
                className="relative flex items-start"
              >
                <div className="flex items-center h-5">
                  <input
                    pattern="^[^<>]*$"
                    type="checkbox"
                    name="empresa"
                    value={empresa.id_empresa}
                    checked={selectedEmpresas.includes(empresa.id_empresa)}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    required={selectedEmpresas.length === 0} // Solo requiere si no hay ninguno seleccionado
                  />
                </div>
                <div className="ml-3 text-sm">
                  <span className="font-medium text-gray-700">
                    {empresa.razon_social}
                  </span>
                </div>
              </label>
            ))}
          </div>
          {selectedEmpresas.length === 0 && (
            <p className="text-red-500 text-sm mt-2">
              Debes seleccionar al menos una empresa.
            </p>
          )}
        </div>

        {/* <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Etiquetas
          </label>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {tags.map((tag) => (
              <label
                key={tag.id}
                className="relative flex items-start"
              >
                <div className="flex items-center h-5">
                  <input pattern="^[^<>]*$"
                    type="checkbox"
                    name="tagIds"
                    value={tag.id}
                    defaultChecked={initialData?.tagIds?.includes(tag.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <span
                    className="font-medium text-gray-700"
                    style={{ color: tag.color }}
                  >
                    {tag.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div> */}
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
          {initialData ? "Actualizar Viajero" : "Añadir Viajero"}
        </button>
      </div>
    </form>
  );
}
