// src/context/CartContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { CartItem } from "../types";
import useAuth from "../hooks/useAuth";
import { CartService } from "../services/CartService";
import { PagosService } from "../services/PagosService";
import { MetodosDePago } from "../types/newIndex";

const inicialStateSaldos: Record<Exclude<MetodosDePago, "tarjeta">, number> = {
  credito: 0,
  wallet: 0,
};

const CartContext = createContext<{
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  totalCart: number;
  handleActualizarCarrito: () => void;
  handleActualizarMetodosPago: () => void;
  saldos?: Record<Exclude<MetodosDePago, "tarjeta">, number> | null;
}>({
  cart: [],
  setCart: () => { },
  totalCart: 0,
  handleActualizarCarrito: () => { },
  handleActualizarMetodosPago: () => { },
  saldos: inicialStateSaldos,
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalCart, setTotalCart] = useState<number>(0);
  const [saldos, setSaldos] = useState<Record<
    Exclude<MetodosDePago, "tarjeta">,
    number
  > | null>(inicialStateSaldos);

  useEffect(() => {
    handleActualizarCarrito();
    handleActualizarMetodosPago();
  }, [user?.id]);

  // useEffect(() => {
  //   console.log(cart);
  // }, [cart]);

  const handleActualizarMetodosPago = () => {
    if (!user) {
      setSaldos(inicialStateSaldos);
      return;
    }
    PagosService.getInstance()
      .getSaldosByMetodo()
      .then((response) => {
        const { data } = response;
        if (data) {
          setSaldos({
            credito: Number(data.credito || 0),
            wallet: Number(data.wallet || 0),
          });
        }
      })
      .catch((error) => {
        console.error(
          error.response || error.message || "Error en jalar saldos"
        );
      });
  };

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
      value={{
        cart,
        setCart,
        totalCart,
        handleActualizarCarrito,
        saldos,
        handleActualizarMetodosPago,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
