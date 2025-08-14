// src/context/CartContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { CartItem } from "../types";
import useAuth from "../hooks/useAuth";
import { formatNumberWithCommas } from "../utils/format";
import { CartService } from "../services/CartService";

const CartContext = createContext<{
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  totalCart: string;
}>({
  cart: [],
  setCart: () => {},
  totalCart: "0",
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalCart, setTotalCart] = useState<string>("0");

  //Este es para cargar la información del carrito, se usara al client
  useEffect(() => {
    if (!user) {
      setCart([]);
      return;
    }
    CartService.getInstance()
      .getCartItems()
      .then((response) => {
        const { data } = response;
        console.log(response);
        setCart(data);
      })
      .catch((error) => {
        setCart([]);
        console.error(
          error.response || error.message || "Error al agregar al carrito"
        );
      });
    console.log("HACIENDO CAMBIOS");
  }, [user?.id]);

  useEffect(() => {
    setTotalCart(
      formatNumberWithCommas(
        cart.length > 0
          ? cart
              .filter((cart) => cart.selected)
              .reduce((sum, item) => sum + item.total, 0)
          : 0
      )
    );
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, setCart, totalCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
