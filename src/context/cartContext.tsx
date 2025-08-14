// src/context/CartContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { CartItem } from "../types";
import useAuth from "../hooks/useAuth";
import { formatNumberWithCommas } from "../utils/format";

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
    const cartItems: CartItem[] = [
      {
        selected: false,
        id: "HTL001",
        type: "hotel",
        total: 450.0,
        details: {
          hotel: "Hotel Barceló Madrid gggggggggggggg",
          id_hotel: "BCN_MAD_001",
          check_in: "2024-03-15",
          check_out: "2024-03-18",
          room: "Suite Deluxe",
          viajero_principal: "Juan Pérez García",
          id_acompanantes: ["ACC001", "ACC002"],
          noches: 3,
          id_agente: "AG001",
          usuario_creador: "admin@travel.com",
        },
      },
      {
        selected: false,
        id: "CAR001",
        type: "car_rental",
        total: 180.0,
        details: {
          company: "Europcar",
          pickup_location: "Aeropuerto Madrid-Barajas",
          dropoff_location: "Centro Madrid",
          pickup_date: "2024-03-15",
          dropoff_date: "2024-03-18",
          driver_name: "María González López",
        },
      },
      {
        selected: false,
        id: "FLT001",
        type: "flight",
        total: 320.0,
        details: {
          airline: "Iberiammmmmmmmmmmmmm",
          origin: "Barcelona (BCN)",
          destination: "Madrid (MAD)",
          departure_date: "2024-03-15",
          return_date: "2024-03-18",
          passengers: [
            { id: "P001", nombre: "Juan Pérez García", is_principal: true },
            { id: "P002", nombre: "Ana Pérez Martín", is_principal: false },
          ],
        },
      },
      {
        selected: false,
        id: "HTL002",
        type: "hotel",
        total: 450.0,
        details: {
          hotel:
            "Hotel Barceló Madrid ggggggggggggjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjgg",
          id_hotel: "BCN_MAD_001",
          check_in: "2024-03-15",
          check_out: "2024-03-18",
          room: "Suite Deluxe",
          viajero_principal: "Juan Pérez García",
          id_acompanantes: ["ACC001", "ACC002"],
          noches: 3,
          id_agente: "AG001",
          usuario_creador: "admin@travel.com",
        },
      },
      {
        selected: false,
        id: "CAR002",
        type: "car_rental",
        total: 180.0,
        details: {
          company: "Europcar",
          pickup_location: "Aeropuerto Madrid-Barajas",
          dropoff_location: "Centro Madrid",
          pickup_date: "2024-03-15",
          dropoff_date: "2024-03-18",
          driver_name: "María González López",
        },
      },
      {
        selected: false,
        id: "FLT002",
        type: "flight",
        total: 3200000.24,
        details: {
          airline: "Iberia",
          origin: "Barcelona (BCN)",
          destination: "Madrid (MAD)",
          departure_date: "2024-03-15",
          return_date: "2024-03-18",
          passengers: [
            { id: "P001", nombre: "Juan Pérez García", is_principal: true },
            { id: "P002", nombre: "Ana Pérez Martín", is_principal: false },
          ],
        },
      },
    ];
    setCart(cartItems);
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
