import { ArrowDown, ChevronDown, ChevronRight, Copy } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Loader from "../atom/Loader";
import React from "react";
import Button from "./Button";
import { formatDate, formatNumberWithCommas } from "../../utils/format";
import { copyToClipboard } from "../../utils";
import { useNotification } from "../../hooks/useNotification";

type ComponentPropsMap<T> = {
  text: { value: string };
  number: { value: number };
  id: { value: string; index: number };
  button: {
    item: T;
    onClick?: ({ item }: { item: T }) => void;
    label: string;
    variant?: "primary" | "secondary" | "ghost" | "warning";
  };
  date: { value: string };
  precio: { value: number | string | null | undefined };
  copiar_and_button: {
    item: T;
    onClick?: ({ item }: { item: T }) => void;
    value: string;
    variant?: "primary" | "secondary" | "ghost" | "warning";
  };

  custom: {
    component: React.ElementType;
    item: T;
  };

  acciones: { onClick: () => void; value: string };
};

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
  const { showNotification } = useNotification();

  function createComponents<T>() {
    const map: {
      [K in keyof ComponentPropsMap<T> | "card_type" | "payment_method"]: React.FC<
        (ComponentPropsMap<T>[K & keyof ComponentPropsMap<T>] extends never ? {} : ComponentPropsMap<T>[K & keyof ComponentPropsMap<T>]) &
        { index: number; newValue: (keyof T)[] }
      >;
    } = {
      // ========== TEXTO BASE (todo mayúsculas por estilo del TD) ==========
      text: ({ value }) => <span className="text-xs">{String(value ?? "")}</span>,

      id: ({ value, index }) => (
        <span className="text-xs">{String(value ?? "").slice(0, index)}</span>
      ),

      number: ({ value }) => <strong className="text-xs">{value}</strong>,

      button: ({ item, onClick, label, variant }) => (
        <div className="w-full flex items-center">
          <Button size="sm" onClick={() => onClick?.({ item })} variant={variant}>
            {String(label)}
          </Button>
        </div>
      ),

      date: ({ value }) => <span className="text-xs">{formatDate(String(value))}</span>,

      // ========== PRECIO: derecha + separador de miles ==========
      precio: ({ value }) => (
        <span className="text-xs block w-full text-right tabular-nums">
          {formatNumberWithCommas(value)}
        </span>
      ),

      copiar_and_button: ({ item, onClick, value, variant }) => (
        <div className="w-full flex justify-between items-center">
          <Button size="sm" onClick={() => onClick?.({ item })} variant={variant}>
            {String(value)}
          </Button>
          <Button
            size="squad"
            onClick={() => {
              try {
                copyToClipboard(value);
                showNotification("success", "Se ha copiado con exito");
              } catch (error: any) {
                console.error(error);
                showNotification("error", error.message || "sucedio un error al copiar el valor");
              }
            }}
            variant="ghost"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      ),

      custom: ({ item, component: Comp }) => <Comp item={item} />,

      acciones: ({ value, onClick }) => <button onClick={onClick}>{value}</button>,

      // ========== NUEVO: normaliza “tipo de tarjeta” a CRÉDITO / DÉBITO ==========
      card_type: ({ value }) => {
        const s = String(value ?? "").trim().toLowerCase();

        // Si está vacío, no renderiza nada
        if (!s) return <span className="text-xs"></span>;

        const isDebit =
          /deb|debi|debito|débito|debit/.test(s) ||
          (s.includes("db") && !s.includes("cr"));

        const label = isDebit ? "DÉBITO" : "CRÉDITO";
        return <span className="text-xs">{label}</span>;
      },


      // ========== NUEVO: forma de pago en mayúsculas uniforme ==========
      payment_method: ({ value }) => {
        const s = String(value ?? "").trim();
        // Mapea algunos alias comunes, agrega más si los usas
        const dict: Record<string, string> = {
          transferencia: "TRANSFERENCIA",
          transfer: "TRANSFERENCIA",
          spei: "SPEI",
          efectivo: "EFECTIVO",
          cash: "EFECTIVO",
          tarjeta: "TARJETA",
          "tarjeta crédito": "TARJETA",
          "tarjeta debito": "TARJETA",
          "tarjeta débito": "TARJETA",
          paypal: "PAYPAL",
          oxxo: "OXXO",
        };
        const k = s.toLowerCase();
        const label = dict[k] || s.toUpperCase();
        return <span className="text-xs">{label}</span>;
      },
    } as any;

    return map;
  }

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
              {tableColumns.map((column) => {
                const isExpand = column.key === "__expand__";
                const isPrecio = column.component === "precio";
                return (
                  <th
                    key={String(column.key)}
                    onClick={() => handleSort(String(column.key))}
                    className={`px-6 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider ${isExpand ? "cursor-default" : "cursor-pointer"
                      } ${isPrecio ? "text-right" : "text-left"}`}
                  >
                    <div
                      className={`flex items-center justify-${isPrecio ? "end" : "start"} space-x-2`}
                    >
                      <span>{column.header}</span>
                      {currentSort.key === column.key && !isExpand && (
                        <ArrowDown
                          className={`w-4 h-4 transition-transform ${currentSort.direction === "asc" ? "rotate-180" : ""
                            }`}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((item, index) => (
              <React.Fragment key={index}>
                <tr className="hover:bg-gray-50">
                  {tableColumns.map((column) => {
                    const columnKey = String(column.key);
                    const value = (item as any)[columnKey];
                    const Comp = (components as any)[column.component]; // podría ser "precio", "card_type", etc.

                    const baseProps: any = {
                      item,
                      index,
                      ...(column.componentProps ?? {}),
                      value,
                    };

                    if (
                      column.componentProps &&
                      "newValue" in column.componentProps
                    ) {
                      const columnas = (column.componentProps as any)
                        .newValue as string[];
                      let newValue;
                      for (let i = 0; i < columnas.length; i++) {
                        if (item[columnas[i]] != null) newValue = item[columnas[i]];
                      }
                      baseProps.value = newValue ?? "";
                    }

                    // Celda expandible
                    if (columnKey === "__expand__" && expandableContent) {
                      return (
                        <td
                          key={`${index}-${columnKey}`}
                          className="px-2 py-2 whitespace-nowrap text-xs text-gray-700 uppercase"
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

                    const isPrecio = column.component === "precio";

                    return (
                      <td
                        key={`${index}-${columnKey}`}
                        className={`px-6 py-2 whitespace-nowrap text-xs text-gray-700 uppercase ${isPrecio ? "text-right" : "text-left"
                          }`}
                      >
                        {column.component ? (
                          <Comp {...baseProps} />
                        ) : (
                          String(value ?? "")
                        )
                          // Asegura mayúsculas si cae en fallback
                          .toUpperCase()}
                      </td>
                    );
                  })}
                </tr>

                {expandableContent && expandedRows.has(index) && (
                  <tr>
                    <td colSpan={tableColumns.length} className="p-2 py-4 bg-blue-100">
                      <div className="rounded-lg shadow-sm border">
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