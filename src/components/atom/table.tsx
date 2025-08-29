import { ArrowDown, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Loader from "../atom/Loader";
import React from "react";
import Button from "./Button";
import { formatDate, formatNumberWithCommas } from "../../utils/format";

type ComponentPropsMap<T> = {
  text: { value: string };
  number: { value: number };
  button: {
    item: T;
    onClick?: (item: T) => void;
    value: string;
    variant?: "primary" | "secondary" | "ghost" | "warning";
  };
  date: { value: string };
  precio: { value: number | string | null | undefined };
};
function createComponents<T>() {
  const map: {
    [K in keyof ComponentPropsMap<T>]: React.FC<
      ComponentPropsMap<T>[K] & { index: number; newValue: (keyof T)[] }
    >;
  } = {
    text: ({ value }) => <span>{value}</span>,
    number: ({ value }) => <strong>{value}</strong>,
    button: ({ item, onClick, value, variant }) => (
      <div className="w-full flex justify-center items-center">
        <Button size="sm" onClick={() => onClick?.(item)} variant={variant}>
          {String(value)}
        </Button>
      </div>
    ),
    date: ({ value }) => <span>{formatDate(value)}</span>,
    precio: ({ value }) => <span>{formatNumberWithCommas(value)}</span>,
  };
  return map;
}
export interface ColumnsTable<
  T,
  K extends keyof ComponentPropsMap<T> = keyof ComponentPropsMap<T>
> {
  key: keyof T | null;
  header: string;
  component: K;
  componentProps?: Omit<ComponentPropsMap<T>[K], "value" | "item" | "index">;
}

interface TableProps<T> {
  id?: string;
  data: T[];
  columns: ColumnsTable<T>[];
  defaultSort?: {
    key: string;
    direction: "asc" | "desc";
  };
  exportButton?: boolean;
  leyenda?: string;
  children?: React.ReactNode;
  maxHeight?: string;
  expandableContent?: (item: T) => React.ReactNode;
  loading?: boolean;
}

export const Table = <T extends Record<string, any>>({
  id,
  data = [],
  columns = [],
  defaultSort,
  maxHeight = "32rem",
  expandableContent,
  loading = false,
}: TableProps<T>) => {
  const components = createComponents();
  const [displayData, setDisplayData] = useState<T[]>(data);
  const [currentSort, setCurrentSort] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>(
    defaultSort || {
      key: columns.length > 0 ? String(columns[0].key) : "",
      direction: "asc",
    }
  );
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    setDisplayData(data);
  }, [data]);

  // Aplicar ordenamiento por defecto al cargar
  useEffect(() => {
    if (defaultSort) {
      handleSort(defaultSort.key, false);
    }
  }, []);

  const handleSort = (key: string, updateState = true) => {
    if (key === "actions") return;

    const isAsc = currentSort.key === key && currentSort.direction === "asc";
    const newDirection = isAsc ? "desc" : "asc";

    const sortedData = [...displayData].sort((a, b) => {
      const aValue = (a as any)[key];
      const bValue = (b as any)[key];

      // Manejar valores nulos o indefinidos
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return newDirection === "asc" ? -1 : 1;
      if (bValue == null) return newDirection === "asc" ? 1 : -1;

      if (aValue < bValue) return newDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return newDirection === "asc" ? 1 : -1;
      return 0;
    });

    setDisplayData(sortedData);

    if (updateState) {
      setCurrentSort({ key, direction: newDirection });
    }
  };

  const toggleRowExpansion = (index: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  // Columnas a mostrar
  const tableColumns = useMemo(() => {
    const cols = [...columns];

    if (expandableContent) {
      cols.unshift({
        key: "__expand__",
        header: "",
      } as ColumnsTable<T>);
    }

    return cols;
  }, [columns, expandableContent]);

  if (!data || data.length === 0) {
    return (
      <div className="px-6 py-4 w-full text-center text-sm text-gray-500 border rounded-md flex-1 flex items-center justify-center">
        No se encontraron registros.
      </div>
    );
  }

  return (
    <div className="relative w-full" id={id}>
      {loading && <Loader />}

      <div
        className="overflow-y-auto relative border border-gray-200 rounded-xl shadow-sm w-full"
        style={{ maxHeight }}
      >
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="sticky z-10 bg-gray-100 top-0">
            <tr>
              {tableColumns.map((column) => (
                <th
                  key={String(column.key)}
                  onClick={() => handleSort(String(column.key))}
                  className={`px-6 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                    column.key !== "__expand__"
                      ? "cursor-pointer"
                      : "cursor-default"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>{column.header}</span>
                    {currentSort.key === column.key &&
                      column.key !== "__expand__" && (
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
              <React.Fragment key={index}>
                <tr className="hover:bg-gray-50">
                  {tableColumns.map((column) => {
                    const columnKey = String(column.key);
                    const value = (item as any)[columnKey];
                    const Comp = components[column.component];
                    const baseProps: any = {
                      item,
                      index,
                      ...(column.componentProps ?? {}),
                    };
                    baseProps.value = value;

                    // Only access newValue if it exists on componentProps
                    if (
                      column.componentProps &&
                      "newValue" in column.componentProps
                    ) {
                      let columnas = (
                        column.componentProps.newValue as string[]
                      ).map((prop: string) => item[prop]);
                      let newValue;
                      for (let i = 0; i < columnas.length; i++) {
                        if (columnas[i] != undefined && columnas[i] != null) {
                          newValue = columnas[i];
                        }
                      }
                      baseProps.value = newValue ? newValue : "";
                    }

                    // Columna de expansión
                    if (columnKey === "__expand__" && expandableContent) {
                      return (
                        <td
                          key={`${index}-${columnKey}`}
                          className="px-2 py-2 whitespace-nowrap text-sm text-gray-800 text-center"
                        >
                          <button
                            onClick={() => toggleRowExpansion(index)}
                            className="p-1 rounded hover:bg-gray-200 transition-colors"
                          >
                            {expandedRows.has(index) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      );
                    }

                    // Columnas normales
                    return (
                      <td
                        key={`${index}-${columnKey}`}
                        className="px-6 py-2 whitespace-nowrap text-sm text-gray-800 text-center"
                      >
                        {column.component ? (
                          <Comp {...baseProps} />
                        ) : (
                          String(
                            value !== undefined && value !== null ? value : ""
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Fila expandible */}
                {expandableContent && expandedRows.has(index) && (
                  <tr>
                    <td
                      colSpan={tableColumns.length}
                      className="p-2 py-4 bg-gray-500"
                    >
                      <div className=" rounded-lg shadow-sm border">
                        {expandableContent(item)}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
