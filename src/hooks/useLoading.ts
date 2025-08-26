import { useCallback, useState } from "react";

export const useLoading = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleLoading = useCallback(async <T>(fn: () => Promise<T>) => {
    setLoading(true);
    try {
      return fn();
    } catch (error) {
      throw error;
    }
  }, []);

  return { loading, handleLoading };
};
