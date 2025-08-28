
import {
  ArrowDown,
  MoreVertical,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import Loader from "../atom/Loader";
import React from "react";

export interface ColumnsTable<T> {
  key: keyof T | null;
  header: string;
  renderer?: React.FC<{ value: any; item: T; index: number }>;
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
  actionMenu?: {
    sections: Array<{
      title: string;
      actions: Array<{
        label: string;
        icon: React.ComponentType<any>;
        onClick: (item: T) => void;
      }>;
    }>;
  };
  expandableContent?: (item: T) => React.ReactNode;
  loading?: boolean;
}

export const Table = <T extends {}>({
  id,
  data = [],
  columns = [],
  defaultSort,
  maxHeight = "28rem",
  actionMenu,
  expandableContent,
  loading = false,
}: TableProps<T>) => {
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
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);

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

  const toggleMenu = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === index ? null : index);
  };

  // Cerrar menú al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Columnas a mostrar
  const tableColumns = useMemo(() => {
    const cols = [...columns];

    // Añadir columna de expansión si está habilitada
    if (expandableContent) {
      cols.unshift({
        key: "__expand__",
        header: "",
      } as ColumnsTable<T>);
    }

    // Añadir columna de acciones si está habilitada
    if (actionMenu) {
      cols.push({
        key: "actions",
        header: "ACCIONES",
      } as ColumnsTable<T>);
    }

    return cols;
  }, [columns, expandableContent, actionMenu]);

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
          <thead className="sticky z-10 bg-gray-50 top-0">
            <tr>
              {tableColumns.map((column) => (
                <th
                  key={String(column.key)}
                  onClick={() => handleSort(String(column.key))}
                  className={`px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider ${column.key !== "actions" && column.key !== "__expand__"
                    ? "cursor-pointer"
                    : "cursor-default"
                    }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>{column.header}</span>
                    {currentSort.key === column.key && column.key !== "actions" && column.key !== "__expand__" && (
                      <ArrowDown
                        className={`w-4 h-4 transition-transform ${currentSort.direction === "asc" ? "rotate-180" : ""
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

                    // Columna de expansión
                    if (columnKey === "__expand__" && expandableContent) {
                      return (
                        <td
                          key={`${index}-${columnKey}`}
                          className="px-2 py-4 whitespace-nowrap text-sm text-gray-800 text-center"
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

                    // Columna de acciones
                    if (columnKey === "actions" && actionMenu) {
                      return (
                        <td
                          key={`${index}-${columnKey}`}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center relative"
                        >
                          <div className="flex justify-center">
                            <button
                              onClick={(e) => toggleMenu(index, e)}
                              className="p-1 rounded hover:bg-gray-200 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenu === index && (
                              <div
                                ref={menuRef}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {actionMenu.sections.map((section, sectionIndex) => (
                                  <div key={sectionIndex}>
                                    {section.title && (
                                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-100">
                                        {section.title}
                                      </div>
                                    )}
                                    {section.actions.map((action, actionIndex) => {
                                      const IconComponent = action.icon;
                                      return (
                                        <button
                                          key={actionIndex}
                                          onClick={() => {
                                            action.onClick(item);
                                            setActiveMenu(null);
                                          }}
                                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                          <IconComponent className="w-4 h-4 mr-2" />
                                          {action.label}
                                        </button>
                                      );
                                    })}
                                    {sectionIndex < actionMenu.sections.length - 1 && (
                                      <div className="border-t border-gray-200 my-1"></div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    }

                    // Columnas normales
                    const value = (item as any)[columnKey];
                    return (
                      <td
                        key={`${index}-${columnKey}`}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center"
                      >
                        {column.renderer ? (
                          <column.renderer value={value} item={item} index={index} />
                        ) : (
                          String(value !== undefined && value !== null ? value : "")
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Fila expandible */}
                {expandableContent && expandedRows.has(index) && (
                  <tr>
                    <td colSpan={tableColumns.length} className="px-4 py-3 bg-gray-50">
                      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
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