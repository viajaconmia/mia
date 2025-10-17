import { useLocation, useSearchParams } from "wouter";
import { Invoice, ModalType, Reserva } from "../../types/services";
import { ColumnsTable, Table } from "../atom/table";
import ROUTES from "../../constants/routes";
import { Payment } from "../../services/PagosService";
import Button from "../atom/Button";
import { FacturamaService } from "../../services/FacturamaService";
import { fetchFullDetalles } from "../../services/detalles";
import {
  downloadXMLBase64,
  downloadXMLUrl,
  viewPDFBase64,
  viewPDFUrl,
} from "../../utils/files";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import Donut from "../Donut";
import {
  calculateGrandTotalForMonthYear,
  calculateNightsByHotelForMonthYear,
  calculateTotalByHotelForMonthYear,
} from "../../utils/calculos";
import { Building2, Calendar, DollarSign } from "lucide-react";
import { formatNumberWithCommas } from "../../utils/format";
import { StatCard } from "../atom/StatCard";
import { SelectInput } from "../atom/Input";
import useResize from "../../hooks/useResize";
import { BookingCard } from "../molecule/Cards/CardBooking";
import { PaymentCard } from "../molecule/Cards/CardPayment";
import { InvoiceCard } from "../molecule/Cards/CardInvoice";

const typesModal: ModalType[] = ["payment", "invoice", "booking"];

interface TwoColumnDropdownProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

const TwoColumnDropdown: React.FC<TwoColumnDropdownProps> = ({
  leftContent,
  rightContent,
}) => {
  return (
    <div className="flex justify-around flex-col md:flex-row  w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 grid-cols-2">
      <div className="flex-1 px-4 text-center">{leftContent}</div>
      <div className="flex-1 px-4 text-center">{rightContent}</div>
    </div>
  );
};

const ExpandedContentRenderer = ({
  item,
  itemType,
}: {
  item: any;
  itemType: ModalType;
}) => {
  const [, setLocation] = useLocation();
  const renderTypes = typesModal.filter((type) => type !== itemType);
  const { user } = useAuth();

  const [full, setFull] = useState<{
    reservas: any[];
    pagos: any[];
    facturas: any[];
  }>({ reservas: [], pagos: [], facturas: [] });
  const [loading, setLoading] = useState(false);

  // id a buscar según el tipo de fila expandida
  const pickIdBuscar = (it: any, type: ModalType): string | null => {
    console.log(it, type);
    switch (type) {
      case "booking":
        return it?.id_hospedaje || null;
      case "payment":
        return it?.raw_id || null;
      case "invoice":
        return it?.id_factura || null;
      default:
        return null;
    }
  };

  // normalizadores -> mapean lo que venga del SP a las keys usadas en tus columnas
  const normalizeReservas = (arr: any[] = []) =>
    arr.map((r) => ({
      ...r,
      codigo_reservacion_hotel:
        r.codigo_reservacion_hotel || r.id_hospedaje || r.id_booking || "",
      hotel: r.hotel || r.hotel_name || r.nombre_hotel || "",
      total:
        r.total ??
        r.total_price ??
        r.solicitud_total ??
        r.total_solicitado ??
        0,
    }));

  const normalizePagos = (arr: any[] = []) =>
    arr.map((p) => ({
      ...p,
      id_pago: p.id_pago || p.raw_id || String(p.id_saldo ?? ""),
      raw_id: p.raw_id, // lo dejamos por si lo usas para navegar
      monto: p.monto ?? p.total ?? p.amount ?? p.total_pago ?? 0,
    }));

  const normalizeFacturas = (arr: any[] = []) =>
    arr.map((f) => ({
      ...f,
      id_factura: f.id_factura || f.folio || f.id_facturama || "",
      total: f.total ?? f.total_factura ?? f.amount ?? 0,
    }));

  useEffect(() => {
    const id_agente = user?.info?.id_agente;
    const id_buscar = pickIdBuscar(item, itemType);

    if (!id_agente || !id_buscar) {
      console.warn("[Expanded] Falta id_agente o id_buscar", {
        id_agente,
        id_buscar,
        itemType,
        item,
      });
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const resp = await fetchFullDetalles({ id_agente, id_buscar });

        setFull({
          reservas: normalizeReservas(resp.reservas),
          pagos: normalizePagos(resp.pagos),
          facturas: normalizeFacturas(resp.facturas),
        });
      } catch (err) {
        console.error("Error getFullDetalles (Expanded):", err);
        setFull({ reservas: [], pagos: [], facturas: [] });
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.info?.id_agente, item, itemType]);

  // columnas — iguales a las tuyas
  const booking_columns: ColumnsTable<Reserva>[] = [
    {
      key: "codigo_reservacion_hotel",
      header: "ID",
      component: "copiar_and_button",
      componentProps: {
        variant: "ghost",
        onClick: ({ item }: { item: Reserva }) => {
          setLocation(
            ROUTES.CONSULTAS.SEARCH(
              "reservaciones",
              item.codigo_reservacion_hotel || ""
            )
          );
        },
      },
    },
    { key: "hotel", header: "Hotel", component: "text" },
    { key: "total", header: "Total", component: "precio" },
  ];

  const payment_columns: ColumnsTable<Payment & { id_pago: string }>[] = [
    {
      key: "id_pago",
      header: "ID",
      component: "copiar_and_button",
      componentProps: {
        variant: "ghost",
        onClick: ({ item }: { item: Payment & { id_pago: string } }) => {
          setLocation(
            ROUTES.CONSULTAS.SEARCH(
              "pagos",
              String(item.raw_id || item.id_pago) || ""
            )
          );
        },
      },
    },
    { key: "monto", header: "Total", component: "precio" },
  ];

  const invoice_columns: ColumnsTable<Invoice>[] = [
    {
      key: "id_factura",
      header: "ID",
      component: "copiar_and_button",
      componentProps: {
        variant: "ghost",
        onClick: ({ item }: { item: Invoice }) =>
          setLocation(
            ROUTES.CONSULTAS.SEARCH("facturas", item.id_factura || "")
          ),
      },
    },
    { key: "total", header: "Total", component: "precio" },
  ];

  // construir datasets desde la RESPUESTA del SP
  const renderData: {
    [K in ModalType]: {
      columns: ColumnsTable<any>[];
      title: string;
      data: any[];
    };
  } = {
    booking: {
      title: "Reservas asociadas",
      columns: booking_columns,
      data: full.reservas,
    },
    payment: {
      title: "Pagos asociados",
      columns: payment_columns,
      data: full.pagos,
    },
    invoice: {
      title: "Facturas asociadas",
      columns: invoice_columns,
      data: full.facturas,
    },
  };

  const left = renderData[renderTypes[0]];
  const right = renderData[renderTypes[1]];

  if (loading) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        Buscando relaciones…
      </div>
    );
  }

  return (
    <TwoColumnDropdown
      leftContent={
        <div className="space-y-2">
          <h1>{left.title}</h1>
          <Table<(typeof left.data)[0]>
            data={left.data}
            columns={left.columns as ColumnsTable<(typeof left.data)[0]>[]}
          />
        </div>
      }
      rightContent={
        <div className="space-y-2">
          <h1>{right.title}</h1>
          <Table<(typeof right.data)[0]>
            data={right.data}
            columns={right.columns as ColumnsTable<(typeof right.data)[0]>[]}
          />
        </div>
      }
    />
  );
};

export const BookingsView = ({ bookings }: { bookings: Reserva[] }) => {
  const [, setLocation] = useLocation();
  const [searchParams] = useSearchParams();
  const { setSize } = useResize();
  const params = searchParams.get("search");

  let search = params ? params : "";
  const filterBookings = bookings.filter(
    (booking) =>
      booking.id_booking?.includes(search) ||
      booking.nombre_viajero_reservacion?.includes(search) ||
      booking.codigo_reservacion_hotel?.includes(search) ||
      booking.id_hospedaje?.includes(search) ||
      booking.nombre_viajero_reservacion?.includes(search)
  );

  const bookingColumns: ColumnsTable<Reserva>[] = [
    { key: "created_at", header: "Creado", component: "date" },
    { key: "codigo_reservacion_hotel", header: "Codigo", component: "text" },
    { key: "hotel", header: "Hotel", component: "text" },
    { key: "nombre_viajero_reservacion", header: "Viajero", component: "text" },
    { key: "check_in", header: "Check-in", component: "date" },
    { key: "check_out", header: "Check-out", component: "date" },
    {
      key: "room",
      header: "Cuarto",
      component: "custom",
      componentProps: {
        component: ({ item }: { item: Reserva }) => (
          <span className="uppercase">{item.room || ""}</span>
        ),
      },
    },
    { key: "total", header: "Precio", component: "text" },
    {
      key: "id_solicitud",
      header: "Acciones",
      component: "custom",
      componentProps: {
        component: ({ item }: { item: Reserva }) => {
          return (
            <div className="flex gap-2">
              {!item.id_credito && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setLocation(ROUTES.FACTURACION.ID(item.id_solicitud));
                  }}
                >
                  Facturar
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => {
                  setLocation(ROUTES.BOOKINGS.ID_SOLICITUD(item.id_solicitud));
                }}
              >
                Ver Reserva
              </Button>
            </div>
          );
        },
      },
    },
  ];

  return (
    <>
      {setSize([
        {
          size: "base",
          obj: (
            <div className="space-y-3 px-2">
              {filterBookings
                .filter((it) => it.id_hospedaje != null)
                .map((booking) => (
                  <BookingCard
                    key={
                      booking.id_booking + (Math.random() * 9999999).toFixed(0)
                    }
                    data={booking}
                    OnToggleExpand={() => (
                      <ExpandedContentRenderer
                        item={booking}
                        itemType={"booking"}
                      />
                    )}
                    onViewDetails={(item: Reserva) => {
                      setLocation(
                        ROUTES.BOOKINGS.ID_SOLICITUD(item.id_solicitud)
                      );
                    }}
                  />
                ))}
            </div>
          ),
        },
        {
          size: "md",
          obj: (
            <>
              <Table<Reserva>
                id="bookingsTable"
                data={filterBookings}
                columns={bookingColumns}
                expandableContent={(booking) => (
                  <ExpandedContentRenderer item={booking} itemType="booking" />
                )}
              />
            </>
          ),
        },
      ])}
    </>
  );
};

export const PaymentsView = ({ payments }: { payments: Payment[] }) => {
  const [searchParams] = useSearchParams();
  const params = searchParams.get("search");
  const { setSize } = useResize();

  console.log(payments);
  let search = params ? params : "";
  const filterPayments = payments.filter((payment) =>
    String(payment.raw_id)?.includes(search)
  );
  const paymentColumns: ColumnsTable<Payment>[] = [
    {
      key: "raw_id",
      header: "ID",
      component: "id",
      componentProps: { index: 12 },
    },
    { key: "fecha_pago", header: "Fecha de Pago", component: "date" },
    { key: "monto", header: "Monto", component: "precio" },
    { key: "metodo", header: "Forma de Pago", component: "text" },
    { key: "tipo", header: "Tipo de Tarjeta", component: "text" },
    // {
    //   key: null,
    //   header: "Acción",
    //   component: "button",
    //   componentProps: {
    //     label: "Facturar",
    //     onClick: ({ item }: { item: Payment }) => {
    //       console.log(item);
    //     },
    //   },
    // },
  ];

  return (
    <>
      {setSize([
        {
          size: "base",
          obj: (
            <div className="space-y-3 px-2">
              {filterPayments
                // .filter((it) => it.id_hospedaje != null)
                .map((payment) => (
                  <PaymentCard
                    key={
                      payment.id_movimiento +
                      (Math.random() * 9999999).toFixed(0)
                    }
                    data={payment}
                    OnToggleExpand={() => (
                      <ExpandedContentRenderer
                        item={payment}
                        itemType={"payment"}
                      />
                    )}
                  />
                ))}
            </div>
          ),
        },
        {
          size: "md",
          obj: (
            <>
              <Table<Payment>
                id="paymentsTable"
                data={filterPayments}
                columns={paymentColumns}
                expandableContent={(payment) => (
                  <ExpandedContentRenderer item={payment} itemType="payment" />
                )}
              />
            </>
          ),
        },
      ])}
    </>
  );
};

export const InvoicesView = ({ invoices }: { invoices: Invoice[] }) => {
  const [searchParams] = useSearchParams();
  const params = searchParams.get("search");
  const { setSize } = useResize();

  let search = params ? params : "";
  const filterInvoices = invoices.filter((invoice) =>
    invoice.id_factura?.includes(search)
  );
  const invoiceColumns: ColumnsTable<Invoice>[] = [
    {
      key: "id_factura",
      header: "ID",
      component: "id",
      componentProps: { index: 12 },
    },
    { key: "uuid_factura", header: "Folio fiscal", component: "text" },
    { key: "fecha_emision", header: "Fecha Facturación", component: "date" },
    { key: "total", header: "Total", component: "precio" },
    {
      key: null,
      header: "Detalles",
      component: "custom",
      componentProps: {
        component: ({ item }: { item: Invoice }) => {
          return (
            <div className="flex w-full gap-2">
              {(item.id_facturama || item.url_pdf) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (item.id_facturama) {
                      FacturamaService.getInstance()
                        .downloadCFDI({
                          id: item.id_facturama,
                          type: "pdf",
                        })
                        .then(({ data }) => viewPDFBase64(data?.Content || ""))
                        .catch((error) =>
                          console.log(
                            error.response ||
                              error.message ||
                              "Error al obtener la factura"
                          )
                        );
                    } else if (item.url_pdf) {
                      viewPDFUrl(item.url_pdf);
                    }
                  }}
                >
                  PDF
                </Button>
              )}
              {(item.id_facturama || item.url_xml) && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    if (item.id_facturama) {
                      FacturamaService.getInstance()
                        .downloadCFDI({
                          id: item.id_facturama,
                          type: "xml",
                        })
                        .then(({ data }) =>
                          downloadXMLBase64(
                            data?.Content || "",
                            `${item.id_factura.slice(0, 8)}-${
                              item.created_at.split("T")[0]
                            }.xml`
                          )
                        )
                        .catch((error) =>
                          console.log(
                            error.response ||
                              error.message ||
                              "Error al obtener la factura"
                          )
                        );
                    } else if (item.url_xml) {
                      downloadXMLUrl(
                        item.url_xml,
                        `${item.id_factura.slice(0, 8)}-${
                          item.created_at.split("T")[0]
                        }.xml`
                      );
                    }
                  }}
                >
                  XML
                </Button>
              )}
            </div>
          );
        },
      },
    },
  ];

  return (
    <>
      {setSize([
        {
          size: "base",
          obj: (
            <div className="space-y-3 px-2">
              {filterInvoices
                // .filter((it) => it.id_hospedaje != null)
                .map((invoice) => (
                  <InvoiceCard
                    key={
                      invoice.id_factura + (Math.random() * 9999999).toFixed(0)
                    }
                    data={invoice}
                    OnToggleExpand={() => (
                      <ExpandedContentRenderer
                        item={invoice}
                        itemType={"invoice"}
                      />
                    )}
                  />
                ))}
            </div>
          ),
        },
        {
          size: "md",
          obj: (
            <>
              <Table<Invoice>
                id="invoicesTable"
                data={filterInvoices}
                columns={invoiceColumns}
                expandableContent={(invoice) => (
                  <ExpandedContentRenderer item={invoice} itemType="invoice" />
                )}
              />
            </>
          ),
        },
      ])}
    </>
  );
};

export const OverviewView = ({ bookings }: { bookings: Reserva[] }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(new Date().getMonth() + 1)
  );
  const [selectedYear, setSelectedYear] = useState(
    String(new Date().getFullYear())
  );
  const { user } = useAuth();

  if (!bookings?.length || !selectedMonth || !selectedYear)
    return (
      <div className="w-full h-full flex justify-center items-center p-6">
        <h1>Parece ser que no tienes reservas actuales</h1>
      </div>
    );

  // Componente para mostrar las gráficas
  const GraphContainer = () => {
    useEffect(() => {
      // const fetchMonthlyStats = async () => {
      //   try {
      //     const endpoint = `${URL}/v1/mia/stats/year?year=${selectedYear}&id_user=${user?.info?.id_agente}&mes=${selectedMonth}`;
      //     const response = await fetch(endpoint, {
      //       method: "GET",
      //       headers: HEADERS_API,
      //     });
      //     const json = await response.json();
      //     // setData(json);
      //   } catch (error) {
      //     console.error("❌ Error al obtener estadísticas mensuales:", error);
      //   }
      // };
      // if (user?.info?.id_agente) {
      //   fetchMonthlyStats();
      // }
    }, [selectedMonth, selectedYear, user?.info?.id_agente]);

    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0);
    const summary = [
      {
        name: "Gastos",
        data: gastosHotel.totalByHotel.map(({ hotel, total }) => ({
          name: hotel,
          amount: Math.round((total + Number.EPSILON) * 100) / 100,
          href: "#",
        })),
      },
    ];

    // console.log(summary, "respestas jbsumas gasto");
    const summary1 = [
      {
        name: "Noches",
        data: nightsByHotel.map((item) => ({
          name: item.hotel,
          amount: item.nights,
          href: "#",
        })),
      },
    ];
    // console.log(nightsByHotel, "respestas noches");

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Donut
          summary={summary}
          titulo="Gráfica por gasto"
          subtitulo="Aquí verás cuanto es tu gasto por mes"
          simbol="$"
        />
        <Donut
          summary={summary1}
          titulo="Gráfica por noches"
          subtitulo="Aquí verás cuántas noches por mes reservaron"
          simbol={""}
        />
      </div>
    );
  };

  // Calcular estadísticas para las tarjetas
  const fechaHoy = new Date();
  fechaHoy.setHours(0, 0, 0, 0);

  // Calcular próximas reservas (con fecha después de hoy)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings.filter((booking) => {
    if (!booking.check_in) return false;
    const checkInDate = new Date(booking.check_in);
    return checkInDate > today;
  });

  // Calcular reservas activas (check-in hoy o antes, check-out después de hoy)
  const activeBookings = bookings.filter((obj) => {
    if (!obj.check_in) return false;

    const checkInDate = new Date(obj.check_in);
    const today = new Date();

    const currentMonth = today.getMonth() + 1; // meses van de 0-11
    const currentYear = today.getFullYear();

    return (
      obj.status_reserva === "Confirmada" &&
      checkInDate <= today &&
      checkInDate.getMonth() + 1 === currentMonth &&
      checkInDate.getFullYear() === currentYear
    );
  }).length;

  // console.log(activeBookings, "enviados de impresion")

  const nightsByHotel = calculateNightsByHotelForMonthYear(
    bookings.filter((b) => b.check_in != null) as any,
    Number(selectedMonth),
    Number(selectedYear)
  );

  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const total = calculateGrandTotalForMonthYear(
    bookings.filter((b) => b.check_in != null) as any,
    currentMonth,
    currentYear
  );

  const totalByHotel = calculateTotalByHotelForMonthYear(
    bookings.filter((b) => b.check_in != null) as any,
    Number(selectedMonth),
    Number(selectedYear)
  );
  const gastosHotel = { total, totalByHotel };

  const cards = [
    {
      title: "Reservas Activas",
      value: activeBookings,
      icon: Calendar,
      subtitle: "Este mes",
      color: "indigo",
    },
    {
      title: "Próximas Reservas",
      value: upcomingBookings.length,
      icon: Building2,
      subtitle: "Reservas futuras",
      color: "yellow",
    },

    {
      title: "Total de Reservas",
      value: bookings.length,
      icon: Calendar,
      subtitle: "Historial completo",
      color: "indigo",
    },
    {
      title: "Gasto Mensual",
      value: `${formatNumberWithCommas(total.toFixed(2))}`,
      icon: DollarSign,
      subtitle: "Este mes",
      color: "green",
    },
  ];

  return (
    <div className="px-4 py-4 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-2">
        {/* CARD ABOUT STATS */}
        {cards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            subtitle={card.subtitle}
            color={card.color as any}
          />
        ))}
      </div>
      {/* Selectores de mes y año */}
      <div className="space-y-2">
        <div className="w-full grid grid-cols-2 gap-2 p-2">
          <SelectInput
            onChange={(e) => setSelectedMonth(e)}
            options={months}
            value={selectedMonth}
          />
          <SelectInput
            onChange={(e) => setSelectedYear(e)}
            options={years}
            value={selectedYear}
          />
        </div>
        <GraphContainer />
      </div>
    </div>
  );
};

const months = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];
const years = Array.from({ length: 5 }, (_, i) =>
  String(new Date().getFullYear() + 2 - i)
).map((year) => ({ value: year, label: year }));
