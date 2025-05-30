import React from "react";
import { Policy, PolicyType, PolicyStatus } from "../types";
import { X } from "lucide-react";

interface PolicyFormProps {
  onSubmit: (data: Partial<Policy>) => void;
  onCancel: () => void;
  departments: string[];
  employees: { id: string; fullName: string }[];
  initialData?: Policy;
}

export function PolicyForm({
  onSubmit,
  onCancel,
  departments,
  employees,
  initialData,
  empresas,
}: PolicyFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data: Partial<Policy> = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as PolicyType,
      value: formData.get("value") ? Number(formData.get("value")) : undefined,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      departments: Array.from(formData.getAll("departments") as string[]),
      employeeIds: Array.from(formData.getAll("employeeIds") as string[]),
      status: formData.get("status") as PolicyStatus,
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? "Editar politica" : "Crear nueva politica"}
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
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Nombre de la politica
          </label>
          <input
            pattern="^[^<>]*$"
            type="text"
            name="name"
            defaultValue={initialData?.name}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            name="description"
            defaultValue={initialData?.description}
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tipo de politica
          </label>
          <select
            name="type"
            defaultValue={initialData?.type}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="budget">Presupuesto</option>
            <option value="schedule">Horario</option>
            <option value="benefits">Beneficios</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Valor (si es necesario)
          </label>
          <input
            pattern="^[^<>]*$"
            type="number"
            name="value"
            defaultValue={initialData?.value}
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha de inicio
          </label>
          <input pattern="^[^<>]*$"
            type="date"
            name="startDate"
            defaultValue={initialData?.startDate}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha de termino
          </label>
          <input pattern="^[^<>]*$"
            type="date"
            name="endDate"
            defaultValue={initialData?.endDate}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div> */}

        {/* <div>
          <label className="block text-sm font-medium text-gray-700">
            Departamentos
          </label>
          <select
            name="departments"
            multiple
            defaultValue={initialData?.departments || []}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            size={4}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div> */}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Empleados especificos
          </label>
          <select
            name="employeeIds"
            multiple
            defaultValue={initialData?.employeeIds || []}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            size={4}
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Empresas
          </label>
          <select
            name="empresas"
            multiple
            defaultValue={initialData?.empresas || []}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            size={4}
          >
            {empresas.map((empresa) => (
              <option key={empresa.id} value={empresa.name}>
                {empresa.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            defaultValue={initialData?.status || "draft"}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="draft">Borrador</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          {initialData ? "Actualizar Politica" : "Crear politica"}
        </button>
      </div>
    </form>
  );
}
