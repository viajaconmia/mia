import { useCallback, useState } from "react";

const useLoading = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleLoading = useCallback(async <T>(fn: () => Promise<T>) => {
    setLoading(true);
    try {
      fn();
    } catch (error) {}
  });

  return { loading, handleLoading };
};
