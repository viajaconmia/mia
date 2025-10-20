// src/hooks/useTailwindBreakpoints.js
import { useState, useEffect, useCallback } from "react";

// 1. Definición de las medidas de Tailwind (min-width en px)
const SCREENS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

type Size = "base" | "sm" | "md" | "lg" | "xl" | "2xl";

// Función para obtener el size actual
const getBreakpoint = (width: number): Size => {
  // Ordena de mayor a menor para aplicar el enfoque mobile-first (min-width)
  const sortedKeys = (Object.keys(SCREENS) as Array<keyof typeof SCREENS>).sort(
    (a, b) => SCREENS[b] - SCREENS[a]
  );

  for (const key of sortedKeys) {
    if (width >= SCREENS[key]) {
      return key; // Devuelve '2xl', 'xl', 'lg', etc.
    }
  }
  // Si no se cumple ningún min-width, es el tamaño base (extra-small o 'base')
  return "base";
};

export function useResize() {
  const [size, setBreakpoint] = useState<Size>(() =>
    getBreakpoint(window.innerWidth)
  );

  const handleResize = useCallback(() => {
    const currentBreakpoint = getBreakpoint(window.innerWidth);
    setBreakpoint(currentBreakpoint);
  }, []);

  useEffect(() => {
    // Escucha el evento de redimensionamiento de la ventana
    window.addEventListener("resize", handleResize);
    // Limpieza al desmontar el componente
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const setSize = useCallback(
    (
      objetos: { size: Size; obj: any }[]
    ): {
      indice: number;
      size: Size;
      obj: any;
    } => {
      const sizes = ["base", "sm", "md", "lg", "xl", "2xl"];
      const indexSlice = sizes.indexOf(size);
      const validSize = sizes.slice(0, indexSlice + 1);
      const orderObjects = objetos
        .map((obj) => ({ ...obj, indice: validSize.indexOf(obj.size) }))
        .filter((obj) => obj.indice >= 0)
        .sort((a, b) => a.indice - b.indice);
      return orderObjects[orderObjects.length - 1].obj;
    },
    [size]
  );

  // Devuelve el size actual
  return { size, setSize };
}

export default useResize;
