import { useState, useEffect } from "react";

export const useLocalStorage = <T extends {}>(
  key: string,
  initialValue: T | null = null
) => {
  // Aquí usamos una función de inicialización para useState
  const [value, setValue] = useState<T | null>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      // Si el valor está en localStorage, lo parsea y retorna
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch (error) {
      // En caso de error (p.ej., el valor no es JSON válido), retorna el valor inicial
      console.error("Error parsing localStorage item:", error);
      return initialValue;
    }
  });

  // Aquí, useEffect solo se usa para guardar el valor cuando cambia
  useEffect(() => {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return { value, setear: setValue };
};
