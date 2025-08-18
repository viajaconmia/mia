// src/context/CartContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { CartItem } from "../types";
import useAuth from "../hooks/useAuth";
import { CartService } from "../services/CartService";

const CartContext = createContext<{
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  totalCart: number;
  handleActualizarCarrito: () => void;
}>({
  cart: [],
  setCart: () => {},
  totalCart: 0,
  handleActualizarCarrito: () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalCart, setTotalCart] = useState<number>(0);

  useEffect(() => {
    handleActualizarCarrito();
  }, [user?.id]);

  useEffect(() => {
    setTotalCart(
      Number(
        (cart.length > 0
          ? cart
              .filter((cart) => cart.selected)
              .reduce((sum, item) => sum + item.total, 0)
          : 0
        ).toFixed(2)
      )
    );
  }, [cart]);

  const handleActualizarCarrito = () => {
    if (!user) {
      setCart([]);
      return;
    }
    CartService.getInstance()
      .getCartItems()
      .then((response) => {
        const { data } = response;
        console.log(response);
        if (data == null) {
          setCart([]);
          return;
        }
        setCart(data);
      })
      .catch((error) => {
        setCart([]);
        console.error(
          error.response || error.message || "Error al agregar al carrito"
        );
      });
  };

  return (
    <CartContext.Provider
      value={{ cart, setCart, totalCart, handleActualizarCarrito }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
