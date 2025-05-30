import React from "react";
import { Tag } from "../types";
import { X } from "lucide-react";

interface TagFormProps {
  onSubmit: (data: Partial<Tag>) => void;
  onCancel: () => void;
  initialData?: Tag;
}

export function TagForm({
  onSubmit,
  onCancel,
  initialData,
  employees,
}: TagFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data: Partial<Tag> = {
      name: formData.get("name") as string,
      color: formData.get("color") as string,
      description: formData.get("description") as string,
      employeeIds: Array.from(formData.getAll("employeeIds") as string[]),
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? "Editar Etiqueta" : "Crear Nueva Etiqueta"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre de la etiqueta
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

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Color
          </label>
          <div className="mt-1 flex items-center space-x-2">
            <input
              pattern="^[^<>]*$"
              type="color"
              name="color"
              defaultValue={initialData?.color || "#3B82F6"}
              required
              className="h-10 w-20 rounded-md border-gray-300"
            />
            <span className="text-sm text-gray-500">
              Selecciona un color para la etiqueta
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descripcion (Opcional)
          </label>
          <textarea
            name="description"
            defaultValue={initialData?.description}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
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
                {emp.nombre} {emp.apellidoPaterno} {emp.apellidoMaterno}
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
          {initialData ? "Actualizar etiqueta" : "Crear etiqueta"}
        </button>
      </div>
    </form>
  );
}
