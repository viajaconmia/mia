import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  Hotel,
  Car,
  Plane,
  Calendar,
  Users,
  MapPin,
  Trash,
  ShoppingCart,
  CircleSlash,
  CheckCircle2,
  BadgeDollarSign,
  Wallet,
  CreditCard,
  ArrowBigLeft,
  Plus,
  Wifi,
  ArrowRight,
  CarFront,
  Cog,
  ShieldCheck,
} from "lucide-react";
import Button from "./atom/Button";
import { useCart } from "../context/cartContext";
import { CartItem } from "../types";
import { CartService } from "../services/CartService";
import { formatDate, formatNumberWithCommas } from "../utils/format";
import { InputRadio } from "./atom/Input";
import { useNotification } from "../hooks/useNotification";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import useAuth from "../hooks/useAuth";
import { StripeService } from "../services/StripeService";
import { loadStripe, PaymentMethod } from "@stripe/stripe-js";
import {
  AmexLogo,
  DinersLogo,
  Logo,
  VisaLogo,
  DiscoverLogo,
  JcbLogo,
  MasterCardLogo,
  UnionPayLogo,
} from "./atom/Logo";
import { API_KEY_STRIPE } from "../constants/apiConstant";
import { UserSingleton } from "../services/UserSingleton";
import { MetodosDePago } from "../types/newIndex";
import { PagosService } from "../services/PagosService";
import { ProtectedComponent } from "../middleware/ProtectedComponent";
import { SolicitudService } from "../services/SolicitudService";
import { fixEncoding, getHora } from "../utils/formatters";

const CartItemComponent: React.FC<{
  item: CartItem;
  onSelect: (id: string, select: boolean) => void;
  onDelete: (id: string) => void;
}> = ({ item, onSelect, onDelete }) => {
  const renderDetails = () => {
    switch (item.type) {
      case "hotel":
        return (
          <>
            <p className="font-medium">{item.details.hotel}</p>
            <span className="text-xs uppercase flex gap-2">
              <Users className="w-4 h-4"></Users>
              {item.details.viajero_principal}
            </span>
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
                  {formatDate(item.details.check_in)}
                  {" - "}
                  {formatDate(item.details.check_out)}
                </span>
              </div>
            </div>
          </>
        );

      case "car_rental":
        return (
          <>
            <CarRentalComponent item={item} />
          </>
        );

      case "flight":
        return (
          <>
            <FlightComponent item={item}></FlightComponent>
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
            {formatNumberWithCommas(item.total)}
          </span>
        </div>
        <div className="space-y-2 px-4 py-2">{renderDetails()}</div>
      </div>
      <div className="flex flex-wrap border-t p-4 justify-end gap-2">
        <Button
          onClick={() => {
            onSelect(item.id, item.selected);
          }}
          size="md"
          className="w-full"
          variant="primary"
          icon={!item.selected ? CheckCircle2 : CircleSlash}
        >
          {item.selected ? "Quitar de la selección" : "Seleccionar para pagar"}
        </Button>
        <Button
          onClick={() => onDelete(item.id)}
          size="md"
          className="w-full"
          variant="warning"
          icon={Trash}
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
};

export const Cart = () => {
  const { cart, setCart, totalCart } = useCart();
  const refContainer = useRef<HTMLDivElement>(null);
  const handleSelectCart = (id: string, value: boolean) => {
    CartService.getInstance()
      .updateSelected(id, !value)
      .then(() => {
        setCart((prev) =>
          prev.map((cartItem) =>
            cartItem.id == id ? { ...cartItem, selected: !value } : cartItem
          )
        );
      })
      .catch((error) => {
        console.error(
          error.response || error.message || "Error al agregar al carrito"
        );
      });
  };

  const handleDeleteCart = (id: string) => {
    CartService.getInstance()
      .deleteCartItem(id)
      .then(() => {
        setCart((prev) => prev.filter((cart) => cart.id != id));
      })
      .catch((error) => {
        console.error(
          error.response || error.message || "Error al agregar al carrito"
        );
      });
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
    <ProtectedComponent
      admit={{
        administrador: true,
        reservante: true,
        viajero: false,
        consultor: false,
        "no-rol": false,
      }}
    >
      <div
        ref={refContainer}
        className="mx-auto relative h-full flex flex-col @container w-full bg-gray-100" // 👈 Cambios: flex flex-col
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
        <ContainerTerminalPago total={totalCart}></ContainerTerminalPago>
      </div>
    </ProtectedComponent>
  );
};

type ViewsToPayment =
  | "details"
  | "forma_pago"
  | MetodosDePago
  | "agregar_tarjeta";

const ContainerTerminalPago = ({ total }: { total: number }) => {
  const [view, setView] = useState<ViewsToPayment>("details");
  const { saldos } = useCart();

  const views: Record<ViewsToPayment, ReactNode> = {
    details: <DetailsPago total={total} onProcedPayment={setView} />,
    forma_pago: <MetodosPago setView={setView} total={total} />,
    credito: (
      <PagoCredito
        saldo={saldos?.credito || 0}
        total={total}
        setView={setView}
      ></PagoCredito>
    ),
    tarjeta: <PagoTarjeta setView={setView}></PagoTarjeta>,
    wallet: (
      <PagoSaldo
        saldo={saldos?.wallet || 0}
        total={total}
        setView={setView}
      ></PagoSaldo>
    ),
    agregar_tarjeta: <ViewGuardarTarjeta setView={setView} />,
  };

  return (
    <div className="bg-white rounded-t-lg p-4 shadow-xl border border-gray-300 sticky bottom-0 z-10">
      <div className="flex justify-between items-center text-2xl font-bold mb-4">
        <span>Total:</span>
        <span className="text-sky-700">{formatNumberWithCommas(total)}</span>
      </div>
      <Elements stripe={stripePromise}>
        {Object.entries(views)
          .filter(([key]) => key == view)
          .map(([key]) => (
            <React.Fragment key={key}>
              {views[key as ViewsToPayment]}
            </React.Fragment>
          ))}
      </Elements>
    </div>
  );
};

const DetailsPago = ({
  total,
  onProcedPayment,
}: {
  total: number;
  onProcedPayment: React.Dispatch<React.SetStateAction<ViewsToPayment>>;
}) => {
  const { showNotification } = useNotification();
  const { handleActualizarCarrito, handleActualizarMetodosPago } = useCart();

  const handleProcedPayment = () => {
    try {
      if (total <= 0)
        throw new Error("Por favor selecciona un item para pagar");

      onProcedPayment("forma_pago");
    } catch (error: any) {
      console.log(error.message);
      showNotification("error", error.message);
    }
  };
  return (
    <>
      <Button
        onClick={async () => {
          const { data } = await CartService.getInstance().procesarCotizacion();
          handleActualizarCarrito();
          handleActualizarMetodosPago();
          console.log(data);
        }}
        size="full"
      >
        Procesar Cotización
      </Button>
      <Button onClick={handleProcedPayment} size="full">
        Proceder al Pago
      </Button>
    </>
  );
};

const metodos_pago: {
  id: MetodosDePago;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}[] = [
  {
    id: "wallet",
    label: "Wallet",
    icon: Wallet,
    color: "bg-green",
    description: "Saldo a favor disponible",
  },
  {
    id: "credito",
    label: "Credito",
    icon: BadgeDollarSign,
    color: "bg-yellow",
    description: "Credito disponible",
  },
  {
    id: "tarjeta",
    label: "Tarjeta",
    icon: CreditCard,
    color: "bg-blue",
    description: "Paga con tu tarjeta",
  },
];

const MetodosPago = ({
  total,
  setView,
}: {
  total: number;
  setView: React.Dispatch<React.SetStateAction<ViewsToPayment>>;
}) => {
  const [selectedMetodo, setSelectedMetodo] = useState<MetodosDePago | "">("");
  const { saldos } = useCart();

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 @xl:grid-cols-3 gap-2">
        {metodos_pago.map((metodo) => (
          <InputRadio<MetodosDePago | "">
            item={
              metodo.id == "tarjeta"
                ? metodo
                : {
                    ...metodo,
                    description: saldos
                      ? `Saldo disponible: ${formatNumberWithCommas(
                          saldos[metodo.id]
                        )}`
                      : "",
                  }
            }
            key={metodo.id}
            name="metodo_pago"
            onChange={setSelectedMetodo}
            selectedItem={selectedMetodo}
            disabled={
              metodo.id != "tarjeta" &&
              (saldos ? saldos[metodo.id] < total : false)
            }
          />
        ))}
      </div>
      <ButtonsHandlerFlow
        onPast={() => setView("details")}
        pastTitle={"Regresar"}
        onNext={() => {
          if (selectedMetodo) setView(selectedMetodo);
        }}
        disabled={!selectedMetodo}
      ></ButtonsHandlerFlow>
    </div>
  );
};

const ButtonsHandlerFlow = ({
  onPast,
  pastTitle = "Cancelar",
  onNext,
  disabled = false,
  nextTitle = "Continuar",
}: {
  onPast: () => void;
  pastTitle?: string;
  onNext: () => void;
  disabled?: boolean;
  nextTitle?: string;
}) => {
  return (
    <div className="flex gap-2 my-4">
      <Button
        variant="warning"
        className="w-full"
        icon={ArrowBigLeft}
        onClick={onPast}
      >
        {pastTitle}
      </Button>
      <Button
        className="w-full"
        variant="primary"
        icon={CheckCircle2}
        disabled={disabled}
        onClick={onNext}
      >
        {nextTitle}
      </Button>
    </div>
  );
};

export const brandIcons: Record<string, React.ReactNode> = {
  visa: <VisaLogo className="h-8 w-8" />,
  mastercard: <MasterCardLogo className="h-8 w-8" />,
  amex: <AmexLogo className="h-8 w-8" />,
  discover: <DiscoverLogo className="h-8 w-8" />,
  diners: <DinersLogo className="h-8 w-8" />,
  jcb: <JcbLogo className="h-8 w-8" />,
  unionpay: <UnionPayLogo className="h-8 w-8" />,
  unknown: <CreditCard className="h-8 w-8" />,
};

const PagoTarjeta = ({
  setView,
}: {
  setView: React.Dispatch<React.SetStateAction<ViewsToPayment>>;
}) => {
  const [tarjetas, setTarjetas] = useState<PaymentMethod[]>([]);
  const [selectedTarjeta, setSelectedTarjeta] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const {
    totalCart,
    cart,
    handleActualizarCarrito,
    handleActualizarMetodosPago,
  } = useCart();
  const { showNotification } = useNotification();

  useEffect(() => {
    StripeService.getInstance()
      .getTarjetasCliente()
      .then((response) => {
        const { data } = response;
        console.log(data);
        setTarjetas(data || []);
      })
      .catch((error) => {
        console.error(
          error.response || error.message || "Error en jalar tarjetas"
        );
      });
  }, []);

  const handlePagoConTarjeta = async () => {
    try {
      if (!selectedTarjeta)
        throw new Error("No se ha seleccionado ninguna tarjeta");
      const itemsCart = cart.filter((item) => item.selected);
      const selectedCard = tarjetas.filter(
        (card) => card.id === selectedTarjeta
      );
      if (itemsCart.length == 0)
        throw new Error("No has seleccionado ningun item");
      setLoading(true);
      const { message } = await StripeService.getInstance().crearPago(
        totalCart.toFixed(2),
        selectedTarjeta,
        itemsCart,
        selectedCard[0]
      );

      showNotification("success", message);
      handleActualizarCarrito();
      handleActualizarMetodosPago();
      setView("details");
    } catch (error: any) {
      showNotification("error", error.message || "Error al procesar el pago");
      console.log(
        error.response || error.message || "Error en procesar el pago"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center rounded-lg flex flex-col justify-center">
        <ul className="grid @lg:grid-cols-2 @3xl:grid-cols-3 gap-2 w-full">
          {tarjetas.map((tarjeta) => {
            let brand = tarjeta.card?.brand ?? "unknown";
            let last4 = tarjeta.card?.last4 ?? "****";
            let expMonth = tarjeta.card?.exp_month.toString() ?? "MM";
            let expYear = tarjeta.card?.exp_year.toString() ?? "YY";
            return (
              <CardStyle
                key={tarjeta.id}
                className={` transition-all duration-300 ${
                  selectedTarjeta === null
                    ? "scale-95 shadow-xl hover:shadow-none"
                    : selectedTarjeta === tarjeta.id
                    ? "scale-100"
                    : "scale-95 shadow-xl hover:shadow-none"
                }`}
              >
                <div
                  className={`rounded-lg absolute w-full h-full top-0 right-0  z-10`}
                >
                  <label
                    className={`flex flex-col justify-between items-center w-full h-full p-2 cursor-pointer ${
                      selectedTarjeta === null
                        ? "bg-black/20"
                        : selectedTarjeta === tarjeta.id
                        ? ""
                        : "bg-black/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tarjeta_pago"
                      className="hidden"
                      value={tarjeta.id}
                      checked={selectedTarjeta === tarjeta.id}
                      onChange={() => setSelectedTarjeta(tarjeta.id)}
                    />
                    <div className="flex justify-between items-start w-full">
                      {brandIcons[brand] || <CreditCard className="h-8 w-8" />}
                      <Wifi className="h-6 w-6 transform rotate-90" />
                    </div>
                    <p className="text-gray-100 text-lg">
                      **** **** **** {last4}
                    </p>
                    <div className="flex w-full justify-end">
                      <p className="text-gray-100 text-xs">
                        {expMonth.length < 2 ? `0${expMonth}` : expMonth}/
                        {expYear.length > 2 ? expYear.slice(-2) : expYear}
                      </p>
                    </div>
                  </label>
                </div>
              </CardStyle>
            );
          })}
          <li className="">
            <Button
              onClick={() => setView("agregar_tarjeta")}
              variant="secondary"
              size="full"
              className="h-full border-2 border-dashed border-gray-300 bg-gray-50"
              icon={Plus}
            >
              Agregar nuevo metodo de pago
            </Button>
          </li>
        </ul>
      </div>
      <ButtonsHandlerFlow
        onPast={() => setView("forma_pago")}
        pastTitle={"Regresar"}
        onNext={handlePagoConTarjeta}
        nextTitle="Pagar"
        disabled={!selectedTarjeta || loading}
      />
    </div>
  );
};

const cardStyle = {
  style: {
    base: {
      color: "#fff",
      fontSize: "16px",
      iconColor: "#fff",
      "::placeholder": {
        color: "#cbd5e1", // gris claro
      },
    },
    invalid: {
      color: "#ff0000", // rojo
    },
    complete: {
      color: "#bbf7d0", // verde claro
    },
  },
  hidePostalCode: true, // Oculta el campo de código postal
  hideIcon: false, // Oculta el ícono de Stripe (opcional)
  disabled: false, // Si quieres deshabilitar la edición
  disableLink: true,
};

let stripePromise = loadStripe(API_KEY_STRIPE);

const ViewGuardarTarjeta = ({
  setView,
}: {
  setView: React.Dispatch<React.SetStateAction<ViewsToPayment>>;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const handleSubmit = async () => {
    try {
      if (!stripe || !elements)
        throw new Error("No se pudo obtener Stripe o Elements");
      const cardElement = elements.getElement(CardElement);
      if (!cardElement)
        throw new Error("No se pudo obtener el elemento de la tarjeta");
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });
      const id_agente = user?.info?.id_agente;
      if (error) throw new Error(error.message);
      if (!id_agente) throw new Error("No se pudo obtener el id del agente");
      if (!paymentMethod?.id)
        throw new Error("No se pudo crear el metodo de pago");
      const { message } =
        await StripeService.getInstance().guardarTarjetaStripe(
          paymentMethod.id
        );
      showNotification("success", message);
      setView("tarjeta");
    } catch (error: any) {
      console.log(error);
      showNotification("error", error.message);
    }
  };

  return (
    <>
      <div className="flex flex-col w-full px-4">
        <div className="flex flex-col gap-2">
          {/* Tarjeta estilizada */}
          <CardStyle>
            <div className="rounded-lg bg-black/20 backdrop-blur-md px-4 py-3 border border-white/20 relative z-10">
              <CardElement
                onChange={(event) => {
                  if (event.error) {
                    showNotification("error", event.error.message);
                  }
                }}
                options={cardStyle}
              />
            </div>
          </CardStyle>

          <ButtonsHandlerFlow
            onNext={() => handleSubmit()}
            nextTitle={"Guardar"}
            onPast={() => setView("tarjeta")}
            pastTitle={"Regresar"}
          />
        </div>
      </div>
    </>
  );
};

const CardStyle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`relative rounded-lg p-5 pb-24 h-fit bg-gradient-to-br from-blue-500 via-blue-400 to-blue-200 text-white overflow-hidden ${className}`}
    >
      {/* CardElement dentro de la tarjeta */}
      {children}
      <Logo className="w-60 h-60 absolute -top-10 -right-16" />
    </div>
  );
};

function PagoSaldo({
  saldo,
  total,
  setView,
}: {
  saldo: number;
  total: number;
  setView: React.Dispatch<React.SetStateAction<ViewsToPayment>>;
}) {
  const {
    cart,
    totalCart,
    handleActualizarCarrito,
    handleActualizarMetodosPago,
  } = useCart();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState<boolean>(false);
  const restante = saldo - total;

  const handlePagarSaldo = async () => {
    setLoading(true);
    try {
      if (restante < 0) throw new Error("No tienes saldo suficiente");
      const itemsCart = cart.filter((item) => item.selected);
      const id_agente = UserSingleton.getInstance().getUser()?.info?.id_agente;
      if (!id_agente)
        throw new Error(
          "Ha ocurrido un error inesperado, intenta iniciar sesion de nuevo"
        );
      if (itemsCart.length == 0)
        throw new Error("No has seleccionado ningun item");
      const { message, data } =
        await SolicitudService.getInstance().PagarSolicitudesConWallet({
          items: itemsCart,
          total: totalCart.toFixed(2),
        });
      console.log(data);
      showNotification("success", message);
      handleActualizarCarrito();
      handleActualizarMetodosPago();
      setView("details");
    } catch (error: any) {
      console.error(error.response || error.message || "Error");
      showNotification("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 rounded-2xl text-gray-800 flex flex-col gap-2 pb-0">
      <h2 className="text-lg font-semibold border-b">Tu saldo:</h2>

      <ManejoPrecios
        restante={restante}
        saldo={saldo}
        total={total}
      ></ManejoPrecios>

      <ButtonsHandlerFlow
        onPast={() => {
          setView("forma_pago");
        }}
        onNext={handlePagarSaldo}
        nextTitle={"Pagar"}
        disabled={restante < 0 || total <= 0 || loading}
      ></ButtonsHandlerFlow>
    </div>
  );
}
function PagoCredito({
  saldo,
  total,
  setView,
}: {
  saldo: number;
  total: number;
  setView: React.Dispatch<React.SetStateAction<ViewsToPayment>>;
}) {
  const {
    cart,
    totalCart,
    handleActualizarCarrito,
    handleActualizarMetodosPago,
  } = useCart();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const restante = saldo - total;

  const handlePagarConCredito = async () => {
    try {
      if (restante < 0) throw new Error("No tienes saldo suficiente");
      const id_agente = UserSingleton.getInstance().getUser()?.info?.id_agente;
      if (!id_agente)
        throw new Error(
          "Ha ocurrido un error inesperado, intenta iniciar sesion de nuevo"
        );
      const itemsCart = cart.filter((item) => item.selected);
      if (itemsCart.length == 0)
        throw new Error("No has seleccionado ningun item");
      setLoading(true);
      const { data, message } =
        await PagosService.getInstance().pagarCarritoCredito(
          totalCart.toFixed(2),
          itemsCart
        );
      // console.log({ items: itemsCart, total: totalCart.toFixed(2), id_agente });
      showNotification(
        "success",
        message + `\n Tu credito actual es de: ${data?.current_saldo}`
      );
      handleActualizarCarrito();
      handleActualizarMetodosPago();
      setView("details");
    } catch (error: any) {
      console.error(error.response || error.message || "Error");
      showNotification("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 rounded-2xl text-gray-800 flex flex-col gap-2 pb-0">
      <h2 className="text-lg font-semibold border-b">Tu credito:</h2>

      <ManejoPrecios
        restante={restante}
        saldo={saldo}
        total={total}
      ></ManejoPrecios>

      <ButtonsHandlerFlow
        onPast={() => {
          setView("forma_pago");
        }}
        onNext={handlePagarConCredito}
        nextTitle={"Pagar"}
        disabled={restante < 0 || total <= 0 || loading}
      ></ButtonsHandlerFlow>
    </div>
  );
}

const ManejoPrecios = ({
  saldo,
  total,
  restante,
}: {
  saldo: number;
  total: number;
  restante: number;
}) => (
  <>
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-400">Total:</span>
      <span className="font-medium">{formatNumberWithCommas(saldo)}</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-400">Gastado:</span>
      <span className="font-medium text-red-400">
        {formatNumberWithCommas(total)}
      </span>
    </div>
    <div className="flex justify-between items-center border-t pt-2">
      <span className="text-sm text-gray-400">Restante:</span>
      <span className="font-bold text-green-400">
        {formatNumberWithCommas(restante)}
      </span>
    </div>
  </>
);

const FlightComponent = ({ item }: { item: any }) => {
  // 1. Acceso seguro a la data profunda
  const flightData = item?.details?.data?.item?.item;
  const rawSegment = flightData?.segments?.segment;

  // 2. NORMALIZACIÓN: Truco para XML -> JSON
  // Si rawSegment es un array, lo usamos. Si es un objeto, lo metemos en un array. Si es null, array vacío.
  const segments = Array.isArray(rawSegment)
    ? rawSegment
    : rawSegment
    ? [rawSegment]
    : [];

  // Si no hay segmentos, no renderizamos nada o mostramos error
  if (segments.length === 0) return null;

  // 3. Datos Calculados
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  const airlineName = item?.details?.proveedor || firstSegment?.airline;
  const isRoundTrip =
    flightData?.itineraryType !== "one_way" || item?.details?.return_date;

  return (
    <div className="flex flex-col gap-y-3 p-2">
      {/* --- CABECERA: Aerolínea y Tipo --- */}
      <div className="flex justify-between items-center">
        <span className="font-bold text-gray-900 flex items-center gap-2 text-lg">
          <Plane className="h-4 w-4 text-blue-600" />
          {airlineName}
        </span>
        {segments.length > 1 && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
            {segments.length - 1}{" "}
            {segments.length - 1 === 1 ? "Escala" : "Escalas"}
          </span>
        )}
      </div>
      <span className="text-xs uppercase flex gap-2">
        <Users className="w-4 h-4"></Users>
        {item.details.viajero_principal}
      </span>

      {/* --- ITINERARIO DETALLADO (Segmentos / Escalas) --- */}
      <div className="flex flex-col gap-2 border-l-2 border-gray-200 pl-3 ml-1">
        {segments.map((seg, index) => (
          <div key={index} className="relative pb-2 last:pb-0">
            {/* Bolita decorativa de la línea de tiempo */}
            <div className="absolute -left-[19px] top-1 h-3 w-3 rounded-full border-2 border-white bg-gray-400"></div>

            <div className="text-sm">
              {/* Vuelo y Ruta Específica del tramo */}
              <div className="flex items-center gap-1 font-medium text-gray-800">
                <span>{seg.origin.airportCode}</span>
                <ArrowRight className="h-3 w-3 text-gray-400" />
                <span>{seg.destination.airportCode}</span>
              </div>

              {/* Horarios del tramo */}
              <div className="text-xs text-gray-500 mt-0.5 flex flex-col sm:flex-row sm:gap-3">
                <span>Salida: {formatDate(seg.departureTime)}</span>
                <span>Llegada: {formatDate(seg.arrivalTime)}</span>
              </div>

              <p className="text-[10px] text-gray-400 mt-1">
                Vuelo: {seg.airline} {seg.flightNumber}
              </p>
            </div>

            {/* Si no es el último, mostramos un aviso de escala (opcional) */}
            {index < segments.length - 1 && (
              <div className="my-2 text-xs text-orange-600 font-medium italic">
                Cambio de avión / Escala
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- RESUMEN FINAL Y REGRESO --- */}
      <div className="mt-1 pt-2 border-t border-gray-100 text-sm text-gray-600">
        {/* Resumen Origen -> Destino Final */}
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="font-medium">
            {fixEncoding(firstSegment.origin.city)} →{" "}
            {fixEncoding(lastSegment.destination.city)}
          </span>
        </div>

        {/* Información de Regreso (Si existe) */}
        {isRoundTrip && item?.details?.return_date && (
          <div className="flex items-center gap-2 text-blue-600 mt-2 bg-blue-50 p-2 rounded-md">
            <Calendar className="h-4 w-4 shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-xs">Vuelo de Regreso</span>
              <span className="text-xs">
                Fecha: {formatDate(item.details.return_date)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CarRentalComponent = ({ item }: { item: any }) => {
  // const { item } = item.details.data.item;
  const { item: data } = item.details.data;
  // Validamos si hay información mínima para mostrar
  // if (!details.company && !details.pickup_location) return null;

  return (
    <div className="flex flex-col gap-y-3 p-2">
      {/* 1. Cabecera: Compañía de Renta */}
      <div className="flex items-center justify-between gap-2">
        <div className="p-1.5 rounded-md flex gap-2 items-center">
          <div>
            <CarFront className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-1">
            {data.item.carDetails.make} {data.item.carDetails.model}{" "}
            <span className="text-sm font-normal text-gray-500">o similar</span>
          </h3>
        </div>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
          {data.item.provider?.name}
        </span>
      </div>
      <span className="text-xs uppercase flex gap-2">
        <Users className="w-4 h-4"></Users>
        {data.extra.principal.nombre_completo}
      </span>
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
        {/* Categoría */}
        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
          <CarFront className="h-3 w-3" />
          <span>{fixEncoding(data.item.carDetails.category)}</span>
        </div>

        {/* Pasajeros */}
        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
          <Users className="h-3 w-3" />
          <span>{data.item.carDetails.passengers}</span>
        </div>

        {/* Transmisión (Traducimos automatic -> Automático si es necesario) */}
        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md capitalize">
          <Cog className="h-3 w-3" />
          <span>
            {data.item.carDetails.transmission === "automatic"
              ? "Automático"
              : data.item.carDetails.transmission}
          </span>
        </div>
      </div>

      {/* 2. Bloque de Ubicaciones (Línea visual) */}
      <div className="relative flex flex-col gap-4 border-l-2 border-gray-200 pl-4 ml-2 my-1">
        {/* Recogida */}
        <div className="relative">
          {/* Bolita decorativa */}
          <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              Recogida
            </span>
            <span className="font-medium text-gray-800 text-sm">
              {fixEncoding(data.item.rentalPeriod.pickupLocation.address)}
            </span>
            {data.item.rentalPeriod.pickupLocation.dateTime && (
              <div className="flex items-center gap-1 text-xs text-blue-600 mt-0.5 font-medium">
                <Calendar className="h-3 w-3" />
                {formatDate(
                  data.item.rentalPeriod.pickupLocation.dateTime
                )} - {getHora(data.item.rentalPeriod.pickupLocation.dateTime)}
              </div>
            )}
          </div>
        </div>

        {/* Entrega */}
        <div className="relative">
          {/* Bolita decorativa */}
          <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-red-400"></div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              Entrega
            </span>
            <span className="font-medium text-gray-800 text-sm">
              {fixEncoding(data.item.rentalPeriod.returnLocation.address)}
            </span>
            {data.item.rentalPeriod.returnLocation.dateTime && (
              <div className="flex items-center gap-1 text-xs text-blue-600 mt-0.5 font-medium">
                <Calendar className="h-3 w-3" />
                {formatDate(
                  data.item.rentalPeriod.returnLocation.dateTime
                )} - {getHora(data.item.rentalPeriod.returnLocation.dateTime)}
              </div>
            )}
          </div>
        </div>
      </div>
      {data.item.price?.includedFeatures && (
        <div className="mt-1 pt-3 border-t border-gray-100">
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-snug">
              <span className="font-semibold text-gray-800">Incluye: </span>
              {/* Reemplazamos comas por bullets o lo dejamos como texto corrido arreglado */}
              {fixEncoding(data.item.price.includedFeatures)
                .split(",")
                .join(" • ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
