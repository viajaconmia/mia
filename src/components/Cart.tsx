import React, { useRef } from "react";
import {
  Hotel,
  Car,
  Plane,
  Calendar,
  Users,
  MapPin,
  Trash,
  ShoppingCart,
} from "lucide-react";
import Button from "./atom/Button";
import { useCart } from "../context/cartContext";
import { CartItem } from "../types";

const CartItemComponent: React.FC<{
  item: CartItem;
  onSelect: (id: string, select: boolean) => void;
  onDelete: (id: string) => void;
}> = ({ item, onSelect, onDelete }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "MXN",
    }).format(price);
  };

  const renderDetails = () => {
    switch (item.type) {
      case "hotel":
        return (
          <>
            <p className="font-medium">{item.details.hotel}</p>
            <div className="flex flex-col gap-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{item.details.noches} noches</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{item.details.room}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(item.details.check_in).toLocaleDateString()}
                  {" - "}
                  {new Date(item.details.check_out).toLocaleDateString()}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-2">
              <span className="font-medium">Viajero principal:</span>{" "}
              {item.details.viajero_principal}
            </p>
          </>
        );

      case "car_rental":
        return (
          <>
            <p className="font-medium">{item.details.company}</p>
            <div className="flex flex-col gap-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Recogida: {item.details.pickup_location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <MapPin className="w-4 h-4" />
                <span>Entrega: {item.details.dropoff_location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(item.details.pickup_date).toLocaleDateString()}
                  {" - "}
                  {new Date(item.details.dropoff_date).toLocaleDateString()}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-2">
              <span className="font-medium">Conductor:</span>{" "}
              {item.details.driver_name}
            </p>
          </>
        );

      case "flight":
        return (
          <>
            <p className="font-medium">{item.details.airline}</p>
            <div className="flex flex-col gap-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>
                  {item.details.origin} → {item.details.destination}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Salida:{" "}
                  {new Date(item.details.departure_date).toLocaleDateString()}
                </span>
              </div>
              {item.details.return_date && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Regreso:{" "}
                    {new Date(item.details.return_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-700 mt-2">
              <span className="font-medium">Pasajeros:</span>{" "}
              {item.details.passengers.length}
            </p>
          </>
        );
      default:
        return null;
    }
  };

  const getPrimaryIcon = () => {
    switch (item.type) {
      case "hotel":
        return <Hotel className="h-5 w-5 text-sky-600" />;
      case "car_rental":
        return <Car className="h-5 w-5 text-sky-700" />;
      case "flight":
        return <Plane className="h-5 w-5 text-sky-600" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`${
        item.selected ? "bg-white shadow-lg" : "bg-gray-300"
      } rounded-xl w-full border border-gray-200 flex flex-col justify-between`}
    >
      <div className="flex flex-col justify-between">
        <div className="flex justify-between items-center border-b p-4">
          <div className="flex items-center gap-2">
            {getPrimaryIcon()}
            <h3 className="font-semibold text-gray-800">
              {item.type.replace("_", " ")}
            </h3>
          </div>
          <span className="text-lg font-bold text-sky-700">
            {formatPrice(item.total)}
          </span>
        </div>
        <div className="space-y-2 px-4 py-2">{renderDetails()}</div>
      </div>
      <div className="flex border-t p-4 justify-end gap-2">
        <Button
          onClick={() => onDelete(item.id)}
          size="md"
          className="w-full"
          variant="warning"
          icon={Trash}
        >
          Eliminar
        </Button>
        <Button
          onClick={() => {
            onSelect(item.id, item.selected);
          }}
          size="md"
          className="w-full"
          variant="primary"
        >
          {item.selected ? "Quitar del pago" : "Agregar del pago"}
        </Button>
      </div>
    </div>
  );
};

export const Cart = () => {
  const { cart, setCart, totalCart } = useCart();
  const refContainer = useRef<HTMLDivElement>(null);

  const handleSelectCart = (id: string, value: boolean) => {
    setCart((prev) =>
      prev.map((cartItem) =>
        cartItem.id == id ? { ...cartItem, selected: !value } : cartItem
      )
    );
  };

  const handleDeleteCart = (id: string) => {
    setCart((prev) => prev.filter((cart) => cart.id != id));
  };

  if (cart.length == 0) {
    return (
      <div className="w-full h-full flex justify-center items-center flex-col">
        <div className="flex gap-2 items-center">
          <ShoppingCart className="text-gray-500"></ShoppingCart>
          <h1 className="text-xl text-gray-500 font-bold">
            Parece que tu carrito esta vacio
          </h1>
        </div>
      </div>
    );
  }

  return (
    // Tu componente de carrito con la lógica de scroll
    <div
      ref={refContainer}
      className="mx-auto relative min-h-full flex flex-col @container w-full bg-gray-100" // 👈 Cambios: flex flex-col
    >
      {/* Contenedor de los items, adaptable a diferentes tamaños de pantalla */}
      <div className="grid grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3 gap-4 p-4 overflow-y-auto pb-14 flex-grow">
        {cart.map((item) => (
          <CartItemComponent
            key={item.id}
            item={item}
            onSelect={handleSelectCart}
            onDelete={handleDeleteCart}
          />
        ))}
      </div>

      {/* Sección del total y botón de pago */}
      <div className="bg-white rounded-t-lg p-6 shadow-lg border border-gray-200 sticky bottom-0 z-10">
        <div className="flex justify-between items-center text-2xl font-bold mb-4">
          <span>Total:</span>
          <span className="text-sky-700">{totalCart}</span>
        </div>
        <Button size="full">Proceder al Pago</Button>
      </div>
    </div>
  );
};
