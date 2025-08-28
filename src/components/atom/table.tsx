// components/Table.tsx

import React, { useState, useEffect } from "react";
import { ArrowDown } from "lucide-react";

export interface ColumnsTable<T> {
  key: keyof T | null;
  header: string;
  renderer?: React.FC<{ value: any; item: T }>;
}

interface TableProps<T> {
  id: string;
  data: T[];
  columns: ColumnsTable<T>[];
}

export const Table = <T extends {}>({ id, data, columns }: TableProps<T>) => {
  const [displayData, setDisplayData] = useState<T[]>(data);
  const [currentSort, setCurrentSort] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "",
    direction: "asc",
  });

  useEffect(() => {
    setDisplayData(data);
  }, [data]);

  const handleSort = (key: string) => {
    const isAsc = currentSort.key === key && currentSort.direction === "asc";
    const newDirection = isAsc ? "desc" : "asc";

    const sortedData = [...displayData].sort((a, b) => {
      const aValue = (a as any)[key];
      const bValue = (b as any)[key];

      if (aValue < bValue) return newDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return newDirection === "asc" ? 1 : -1;
      return 0;
    });

    setDisplayData(sortedData);
    setCurrentSort({ key, direction: newDirection });
  };

  if (!data || data.length === 0) {
    return (
      <div className="px-6 py-4 w-full text-center text-sm text-gray-500 border rounded-md flex-1 flex items-center justify-center">
        No se encontraron registros.
      </div>
    );
  }

  return (
    <div
      id={id}
      className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm flex-1 min-h-0"
    >
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead>
          <tr className="bg-gray-50">
            {columns.map((column) => (
              <th
                key={column.key as string}
                onClick={() => handleSort(column.key as string)}
                className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span>{column.header}</span>
                  {currentSort.key === column.key && (
                    <ArrowDown
                      className={`w-4 h-4 transition-transform ${
                        currentSort.direction === "asc" ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayData.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((column) => {
                const value = (item as any)[column.key as string];
                return (
                  <td
                    key={`${index}-${column.key as string}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                  >
                    {column.renderer ? (
                      <column.renderer value={value} item={item} />
                    ) : (
                      String(value)
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
