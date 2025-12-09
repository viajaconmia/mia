"use client";

import { useState, useEffect } from "react";
import { Building2, ShoppingCartIcon, Car, Plane } from "lucide-react";
import useAuth from "../hooks/useAuth";
import Button from "./atom/Button";
import { useNotification } from "../hooks/useNotification";
import { Logo } from "./atom/Logo";
import { useChat } from "../hooks/useChat";
import { Viajero, ViajerosService } from "../services/ViajerosService";
import { calcularEdad } from "../lib/calculates";
import {
  ComboBox,
  ComboBoxOption2,
  InputDate,
  NumberInput,
  SelectInput,
} from "./atom/Input";
import { SolicitudService } from "../services/SolicitudService";
import { useCart } from "../context/cartContext";
import { getHora } from "../utils/formatters";

function areAllFieldsFilled(obj: any, excludeKeys: string[] = []): boolean {
  if (obj === null || obj === undefined) return false;

  if (
    typeof obj === "string" ||
    typeof obj === "number" ||
    typeof obj === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(obj)) {
    return (
      obj.length > 0 &&
      obj.every((item) => areAllFieldsFilled(item, excludeKeys))
    );
  }

  if (typeof obj === "object") {
    return Object.entries(obj).every(([key, value]) => {
      if (excludeKeys.includes(key)) return true;
      return areAllFieldsFilled(value, excludeKeys);
    });
  }

  return false;
}

export const ReservationPanel = () => {
  const { state } = useChat();
  const { user } = useAuth();
  const [viajeros, setViajeros] = useState<Viajero[]>();
  const { showNotification } = useNotification();
  const { handleActualizarCarrito } = useCart();

  useEffect(() => {
    if (user?.info?.id_agente) {
      ViajerosService.getInstance()
        .getViajeros()
        .then((res) => setViajeros(res.data || []));
    }
  }, [user?.info?.id_agente]);

  const handleSubmit = async () => {
    try {
      if (!state.select) throw new Error("");
      const { extra, type, item } = state.select;
      if (extra == null) throw new Error("");

      const solicitud = {
        type:
          type == "vuelo" ? "flight" : type == "carro" ? "car_rental" : "hotel",
        proveedor:
          type == "carro"
            ? item.provider?.name
            : type == "hotel"
            ? item.hotel
            : Array.isArray(item.segments.segment)
            ? item.segments.segment[0].airline
            : item.segments.segment.airline,
        id_usuario_generador: user?.info?.id_viajero,
        id_viajero:
          type == "carro"
            ? extra.principal?.id_viajero
            : type == "hotel"
            ? extra.viajero?.id_viajero
            : extra.viajero?.id_viajero,
        viajero_principal:
          type == "carro"
            ? extra.principal?.nombre_completo
            : type == "hotel"
            ? extra.viajero?.nombre_completo
            : extra.viajero?.nombre_completo,
        hotel: type == "hotel" ? item.hotel : null,
        check_in:
          type == "carro"
            ? item.rentalPeriod?.pickupLocation?.dateTime
            : type == "hotel"
            ? extra.check_in
            : Array.isArray(item.segments.segment)
            ? item.segments.segment[0].departureTime
            : item.segments.segment.departureTime,
        check_out:
          type == "carro"
            ? item.rentalPeriod?.returnLocation?.dateTime
            : type == "hotel"
            ? extra.check_out
            : Array.isArray(item.segments.segment)
            ? item.segments.segment[item.segments.segment.length - 1]
                .arrivalTime
            : item.segments.segment.arrivalTime,
        room: type == "hotel" ? extra.room : null,
        total:
          type == "carro"
            ? item.price?.total
            : type == "hotel"
            ? extra.precio
            : item.price?.total,
        status: "pending",
        viajeros_adicionales: type == "hotel" ? extra.acompanantes : null,
        id_agente: user?.info?.id_agente,
        origen: "cliente",
        usuario_creador: user?.info?.id_viajero,
        item: { ...state.select },
      };

      const { message, data } =
        await SolicitudService.getInstance().crearSolicitud({
          solicitudes: solicitud,
          tradicional: false,
        });
      handleActualizarCarrito();
      showNotification("success", message);
      return data;
    } catch (error: any) {
      showNotification("error", error.message || "Error al guardar la reserva");
    }
  };

  if (state.select == null) {
    return (
      <div className="h-full p-6  flex items-center justify-center">
        <div className="text-center text-[#10244c93]">
          <p className="text-3xl mb-2">Aún no hay detalles de la reservación</p>
          <p className="text-sm opacity-80 flex justify-center">
            <span>
              <Logo className="w-full -rotate-12 transform text-sky-950" />
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full py-4 space-y-2 overflow-y-auto">
      <div className="flex items-center space-x-2 px-4">
        {/* === AUTO DE RENTA === */}
        {state.select?.type == "carro" && (
          <>
            <Car className="w-5 h-5 text-[#10244c]" />
            <h3 className="text-lg font-semibold text-[#10244c]">
              Renta de Auto
            </h3>
          </>
        )}
        {state.select.type == "vuelo" && (
          <>
            <Plane className="w-5 h-5 text-[#10244c]" />
            <h3 className="text-lg font-semibold text-[#10244c]">
              Vuelo seleccionado
            </h3>
          </>
        )}
        {state.select.type == "hotel" && (
          <>
            <Building2 className="w-5 h-5 text-[#10244c]" />
            <h3 className="text-lg font-semibold text-[#10244c]">
              Hotel seleccionado
            </h3>
          </>
        )}
      </div>
      {state.select?.type == "carro" && (
        <>
          <RentaCartSolicitud
            onSubmit={handleSubmit}
            viajeros={viajeros || []}
          />
        </>
      )}
      {state.select.type == "vuelo" && (
        <>
          <RentaVueloSolicitud
            onSubmit={handleSubmit}
            viajeros={viajeros || []}
          />
        </>
      )}
      {state.select.type == "hotel" && (
        <>
          <RentaHotelSolicitud
            onSubmit={handleSubmit}
            viajeros={viajeros || []}
          ></RentaHotelSolicitud>
        </>
      )}
    </div>
  );
};

const RentaCartSolicitud = ({
  onSubmit,
  viajeros,
}: {
  onSubmit: () => void;
  viajeros: Viajero[];
}) => {
  const { state, updateSelect } = useChat();
  const { showNotification } = useNotification();
  if (state.select?.type != "carro") return null;

  const handleSubmit = () => {
    try {
      if (state.select?.type != "carro") return null;
      if (
        !state.select.extra?.principal?.fecha_nacimiento &&
        !state.select.extra?.edad
      )
        throw new Error("El viajero principal no tiene fecha de cumpleaños");
      onSubmit();
    } catch (error: any) {
      showNotification(
        "error",
        error.message || "Error al procesar la solicitud del carro"
      );
    }
  };

  const addDriver = () => {
    if (state.select?.type != "carro") return;
    if (state.select == null) return;
    const currentDrivers = state.select.extra?.conductoresExtras || [];
    actualizarCarro("conductoresExtras", [...currentDrivers, null]);
  };

  const actualizarCarro = (
    key: keyof {
      principal?: Viajero;
      conductoresExtras?: (Viajero | null)[];
      edad?: number;
    },
    value: Viajero | (Viajero | null)[] | number
  ) => {
    if (state.select == null) return;
    if (state.select.type != "carro") return;

    const newExtra = { ...state.select.extra, [key]: value } as {
      principal?: Viajero;
      conductoresExtras?: Viajero[];
      edad: number;
    };

    updateSelect({
      ...state.select,
      extra: newExtra,
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg p-6 space-y-6">
        {/* resumen del auto */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-[#10244c]/80">Vehículo</p>
            <p className="text-lg font-semibold text-[#10244c]">
              {state.select?.item.carDetails?.make || "Vehículo"}{" "}
              {state.select?.item.carDetails?.model || ""}
            </p>
            {state.select?.item.carDetails?.category && (
              <p className="text-sm text-[#10244c]/70">
                {state.select?.item.carDetails.category}
              </p>
            )}
            {state.select?.item.carDetails?.passengers && (
              <p className="text-sm text-[#10244c]/70 mt-1">
                {state.select?.item.carDetails.passengers} pasajeros
              </p>
            )}
          </div>

          {state.select?.item.price?.total && (
            <div className="text-right">
              <p className="text-sm text-[#10244c]/80">Precio Total</p>
              <p className="text-xl font-semibold text-[#10244c]">
                {state.select?.item.price.total}{" "}
                {state.select?.item.price.currency || ""}
              </p>
              {state.select?.item.rentalPeriod?.days && (
                <p className="text-xs text-[#10244c]/70 mt-1">
                  {state.select?.item.rentalPeriod.days} días de renta
                </p>
              )}
            </div>
          )}
        </div>

        {/* campos viajero para auto */}
        <div className="">
          <ComboBox
            label="Conductor principal"
            value={
              state.select.extra?.principal
                ? {
                    name: state.select.extra.principal.nombre_completo ?? "",
                    content: state.select.extra.principal,
                  }
                : null
            }
            options={viajeros.map((v) => ({
              name: v.nombre_completo ?? "",
              content: v,
            }))}
            onChange={(value: ComboBoxOption2<Viajero> | null) => {
              if (value == null) return;
              actualizarCarro("principal", value.content);
            }}
          />

          <NumberInput
            label="Edad del conductor"
            value={state.select.extra?.edad || 0}
            onChange={(value: string) => {
              actualizarCarro("edad", Number(value || 0));
            }}
          />
          {state.select.extra?.principal?.fecha_nacimiento && (
            <p
              className="text-xs text-blue-500 hover:text-blue-700 hover:underline cursor-pointer"
              onClick={() => {
                if (state.select == null) return;
                if (state.select.type != "carro") return;

                actualizarCarro(
                  "edad",
                  calcularEdad(
                    state.select?.extra?.principal?.fecha_nacimiento || ""
                  ) ?? 0
                );
              }}
            >
              Segun los datos, esta es la edad del viajero:{" "}
              {calcularEdad(state.select.extra.principal.fecha_nacimiento)},
              quieres actualizarla?
            </p>
          )}

          <div className="space-y-2 md:col-span-2">
            {/* Solo muestra el select si showAdditionalDrivers es true */}
            {state.select.extra?.conductoresExtras &&
              state.select.extra.conductoresExtras.length > 0 && (
                <div>
                  {state.select.extra.conductoresExtras.map((driv, index) => (
                    <ComboBox
                      label="Conductor extra"
                      value={
                        driv
                          ? {
                              name: driv.nombre_completo ?? "",
                              content: driv,
                            }
                          : null
                      }
                      options={viajeros
                        .filter(
                          (v) =>
                            state.select?.type == "carro" &&
                            v.id_viajero !=
                              state.select.extra?.principal?.id_viajero
                        )
                        .map((v) => ({
                          name: v.nombre_completo ?? "",
                          content: v,
                        }))}
                      onChange={(value: ComboBoxOption2<Viajero> | null) => {
                        if (value == null) return;
                        if (state.select?.type != "carro") return;
                        if (state.select == null) return;

                        const newArray: (Viajero | null)[] | undefined =
                          state.select.extra?.conductoresExtras;
                        if (!newArray) return;
                        newArray[index] = value.content;
                        actualizarCarro("conductoresExtras", newArray);
                      }}
                    />
                  ))}
                </div>
              )}
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={addDriver} size="full" variant="ghost">
            ¿Deseas agregar un conductor adicional?
          </Button>
          <Button
            variant="primary"
            size="full"
            icon={ShoppingCartIcon}
            onClick={handleSubmit}
          >
            Agregar al carrito
          </Button>
        </div>
      </div>
    </div>
  );
};

const RentaHotelSolicitud = ({
  onSubmit,
  viajeros,
}: {
  onSubmit: () => void;
  viajeros: Viajero[];
}) => {
  const { state, updateSelect, updatePrecioByFechas } = useChat();
  const { showNotification } = useNotification();
  if (state.select?.type != "hotel") return null;

  const handleSubmit = () => {
    try {
      if (state.select?.type != "hotel") return null;
      const extra = state.select.extra;
      if (
        extra &&
        (!extra.check_in ||
          !extra.check_out ||
          !extra.precio ||
          !extra.room ||
          !extra.viajero)
      )
        throw new Error("Faltan datos");
      onSubmit();
    } catch (error: any) {
      showNotification(
        "error",
        error.message || "Error al procesar la solicitud del carro"
      );
    }
  };

  const addAcompanante = () => {
    if (state.select?.type != "hotel") return;
    if (state.select == null) return;
    const currentAcompanantes = state.select.extra?.acompanantes || [];
    actualizarReserva("acompanantes", [...currentAcompanantes, null]);
  };

  const actualizarReserva = (
    key: keyof {
      viajero?: Viajero;
      acompanantes?: Viajero[];
      check_in?: string;
      check_out?: string;
      precio?: string;
      currency?: string;
      room?: string;
    },
    value: Viajero | (Viajero | null)[] | number | string
  ) => {
    if (state.select == null) return;
    if (state.select.type != "hotel") return;

    const newExtra = { ...state.select.extra, [key]: value } as {
      viajero?: Viajero;
      acompanantes?: Viajero[];
      check_in?: string;
      check_out?: string;
      precio?: string;
      currency?: string;
      room?: string;
    };

    updateSelect({
      ...state.select,
      extra: newExtra,
    });
  };

  return (
    <div className="space-y-6">
      {state.select.item.imagenes[0] && (
        <div>
          <img
            className="rounded-md h-36 w-full object-cover"
            src={state.select.item.imagenes[0]}
            alt=""
          />
        </div>
      )}
      <div className="rounded-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4">
          <div>
            <p className="text-lg font-semibold text-[#10244c]">
              {state.select?.item.hotel || "Vehículo"}{" "}
            </p>
            {state.select?.item.direccion && (
              <p className="text-xs text-[#10244c]/70">
                {state.select?.item.direccion || ""}
              </p>
            )}
          </div>
        </div>

        <div className="w-full flex flex-col gap-2 px-4">
          <p className="text-sm font-semibold">Precio por noche:</p>
          {state.select.item.tipos_cuartos.map((cuarto) => (
            <div className="flex gap-2 w-full bg-gray-200/70 p-2 text-sm font-normal rounded-md justify-between">
              <p>{cuarto.cuarto || ""}</p>
              <p>
                {cuarto.precio || ""}{" "}
                {state.select?.type == "hotel" &&
                  (state.select.item.currency || "MXN").toUpperCase()}
              </p>
            </div>
          ))}
        </div>

        <div className="px-4 space-y-2">
          <ComboBox
            label="Viajero principal"
            value={
              state.select.extra?.viajero
                ? {
                    name: state.select.extra.viajero.nombre_completo ?? "",
                    content: state.select.extra.viajero,
                  }
                : null
            }
            options={viajeros.map((v) => ({
              name: v.nombre_completo ?? "",
              content: v,
            }))}
            onChange={(value: ComboBoxOption2<Viajero> | null) => {
              if (value == null) return;
              actualizarReserva("viajero", value.content);
            }}
          />

          <SelectInput
            label="Cuarto"
            onChange={(value: string) => {
              updatePrecioByFechas({ room: value });
            }}
            placeholder="Selecciona un cuarto"
            value={state.select.extra?.room || ""}
            options={state.select.item.tipos_cuartos.map((r) => ({
              value: r.cuarto,
              label: r.cuarto,
            }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <InputDate
              label="Check in"
              onChange={(value: string) => {
                updatePrecioByFechas({ check_in: value });
              }}
              value={state.select.extra?.check_in || ""}
            />
            <InputDate
              label="Check out"
              onChange={function (value: string): void {
                updatePrecioByFechas({ check_out: value });
              }}
              value={state.select.extra?.check_out || ""}
            />
          </div>
          <div className="space-y-4">
            {state.select.extra?.acompanantes &&
              state.select.extra.acompanantes.length > 0 && (
                <div>
                  {state.select.extra.acompanantes.map((driv, index) => (
                    <ComboBox
                      label="Conductor extra"
                      value={
                        driv
                          ? {
                              name: driv.nombre_completo ?? "",
                              content: driv,
                            }
                          : null
                      }
                      options={viajeros.map((v) => ({
                        name: v.nombre_completo ?? "",
                        content: v,
                      }))}
                      onChange={(value: ComboBoxOption2<Viajero> | null) => {
                        if (value == null) return;
                        if (state.select?.type != "hotel") return;
                        if (state.select == null) return;

                        const newArray: (Viajero | null)[] | undefined =
                          state.select.extra?.acompanantes;
                        if (!newArray) return;
                        newArray[index] = value.content;
                        actualizarReserva("acompanantes", newArray);
                      }}
                    />
                  ))}
                </div>
              )}
          </div>
        </div>
        {state.select.extra?.precio && (
          <div className="w-full flex justify-end px-4 pt-2 border-t">
            <p className="text-lg font-semibold">
              {state.select.extra.precio || ""}{" "}
              {state.select.item.currency || "MXN"}
            </p>
          </div>
        )}
        <div className="space-y-2 px-4">
          <Button onClick={addAcompanante} size="full" variant="ghost">
            ¿Deseas agregar un acompanante?
          </Button>
          <Button
            variant="primary"
            size="full"
            icon={ShoppingCartIcon}
            onClick={handleSubmit}
          >
            Agregar al carrito
          </Button>
        </div>
      </div>
    </div>
  );
};

const RentaVueloSolicitud = ({
  onSubmit,
  viajeros,
}: {
  onSubmit: () => void;
  viajeros: Viajero[];
}) => {
  const { state, updateSelect } = useChat();
  const { showNotification } = useNotification();
  if (state.select?.type != "vuelo") return null;

  const handleSubmit = () => {
    try {
      if (state.select?.type != "vuelo") return null;
      if (!state.select.extra?.viajero)
        throw new Error("Falta el viajero principal");
      onSubmit();
    } catch (error: any) {
      showNotification(
        "error",
        error.message || "Error al procesar la solicitud del carro"
      );
    }
  };

  const segmentsArray = Array.isArray(state.select.item.segments.segment)
    ? state.select.item.segments.segment
    : [state.select.item.segments.segment];

  const firstSeg = segmentsArray[0];
  const lastSeg = segmentsArray[segmentsArray.length - 1];

  const formatShortDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
    });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6 space-y-6 shadow-md">
        {/* Resumen del vuelo */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col">
            <p className="text-sm text-[#10244c]/80">Itinerario</p>
            <p className="text-lg font-semibold text-[#10244c]">
              {firstSeg.origin.city} ({firstSeg.origin.airportCode}) →{" "}
              {lastSeg.destination.city} ({lastSeg.destination.airportCode})
            </p>
            <p className="text-sm text-[#10244c]/70 mt-1">
              {formatShortDate(firstSeg.departureTime)}{" "}
              {formatTime(firstSeg.departureTime)} ·{" "}
              {state.select.item.itineraryType
                ?.replace("_", " ")
                .toUpperCase() || "TRIP"}
            </p>
            <p className="text-xs text-[#10244c]/60 mt-1">
              {segmentsArray.length}{" "}
              {segmentsArray.length === 1 ? "segmento" : "segmentos"} ·{" "}
              {firstSeg.airline} {firstSeg.flightNumber}
            </p>
          </div>

          {state.select.item.price?.total && (
            <div className="text-right">
              <p className="text-sm text-[#10244c]/80">Precio Total</p>
              <p className="text-xl font-semibold text-[#10244c]">
                {state.select.item.price.total}{" "}
                {state.select.item.price.currency}
              </p>
              {state.select.item.baggage && (
                <p className="text-xs text-[#10244c]/70 mt-1">
                  {state.select.item.baggage.hasCheckedBaggage === "true"
                    ? `Incluye ${state.select.item.baggage.pieces} maleta(s) documentada(s)`
                    : "Sin equipaje documentado"}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Mostrar si es ida o redondo */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#10244c]">
            {state.select.item.itineraryType === "round_trip"
              ? "Vuelo redondo"
              : "Vuelo solo ida"}
          </span>
        </div>

        {/* Mostrar todos los segmentos */}
        <div className="space-y-4">
          {segmentsArray.map((segment, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-[#10244c]/80">
                  {index === 0 ? "Vuelo de ida" : "Vuelo de regreso"}
                </p>
              </div>
              <div className="text-sm text-[#10244c]/70">
                <p>
                  {segment.origin.city} ({segment.origin.airportCode}) →{" "}
                  {segment.destination.city} ({segment.destination.airportCode})
                </p>
                <p>
                  {formatShortDate(segment.departureTime)} -{" "}
                  {formatTime(segment.departureTime)}
                </p>
                <p>
                  {segment.airline} {segment.flightNumber}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Campos del viajero */}
        <div className="">
          <ComboBox
            label="Pasajero"
            value={
              state.select.extra?.viajero
                ? {
                    name: state.select.extra.viajero.nombre_completo ?? "",
                    content: state.select.extra.viajero,
                  }
                : null
            }
            options={viajeros.map((v) => ({
              name: v.nombre_completo ?? "",
              content: v,
            }))}
            onChange={(value: ComboBoxOption2<Viajero> | null) => {
              if (value == null) return;
              if (state.select?.type == "vuelo")
                updateSelect({
                  ...state.select,
                  extra: { viajero: value.content },
                });
            }}
          />
        </div>
        <Button
          variant="primary"
          size="full"
          icon={ShoppingCartIcon}
          onClick={handleSubmit}
        >
          Agregar al carrito
        </Button>
      </div>
    </div>
  );
};
