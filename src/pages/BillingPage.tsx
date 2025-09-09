import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  Mail,
  Receipt,
  Building2,
  FileText,
  DollarSign,
  Percent,
  ArrowRight,
  CheckCircle2,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "../utils/format";
import { DataInvoice, DescargaFactura, ProductInvoice } from "../types/billing";
import { useApi } from "../hooks/useApi";
import { useRoute, Link } from "wouter";
import { HEADERS_API, URL } from "../constants/apiConstant";
import { DataFiscalModalWithCompanies } from "../components/DataFiscalModalWithCompanies";
import { CompanyWithTaxInfo } from "../types";
import { Root } from "../types/billing";
import { useUser } from "../context/userContext";
import { useNotification } from "../hooks/useNotification";

// Catálogos completos del SAT
const cfdiUseOptions = [
  { value: "G01", label: "G01 - Adquisición de mercancías" },
  { value: "G02", label: "G02 - Devoluciones, descuentos o bonificaciones" },
  { value: "G03", label: "G03 - Gastos en general" },
  { value: "I01", label: "I01 - Construcciones" },
  {
    value: "I02",
    label: "I02 - Mobilario y equipo de oficina por inversiones",
  },
  { value: "I03", label: "I03 - Equipo de transporte" },
  { value: "I04", label: "I04 - Equipo de cómputo y accesorios" },
  {
    value: "I05",
    label: "I05 - Dados, troqueles, moldes, matrices y herramental",
  },
  { value: "I06", label: "I06 - Comunicaciones telefónicas" },
  { value: "I07", label: "I07 - Comunicaciones satelitales" },
  { value: "I08", label: "I08 - Otra maquinaria y equipo" },
  {
    value: "D01",
    label: "D01 - Honorarios médicos, dentales y gastos hospitalarios",
  },
  {
    value: "D02",
    label: "D02 - Gastos médicos por incapacidad o discapacidad",
  },
  { value: "D03", label: "D03 - Gastos funerales" },
  { value: "D04", label: "D04 - Donativos" },
  {
    value: "D05",
    label:
      "D05 - Intereses reales efectivamente pagados por créditos hipotecarios",
  },
  { value: "D06", label: "D06 - Aportaciones voluntarias al SAR" },
  { value: "D07", label: "D07 - Primas por seguros de gastos médicos" },
  { value: "D08", label: "D08 - Gastos de transportación escolar obligatoria" },
  { value: "D09", label: "D09 - Depósitos en cuentas para el ahorro" },
  { value: "D10", label: "D10 - Pagos por servicios educativos" },
  { value: "S01", label: "S01 - Sin efectos fiscales" },
  { value: "CP01", label: "CP01 - Pagos" },
  { value: "CN01", label: "CN01 - Nómina" },
];

const paymentFormOptions = [
  { value: "01", label: "01 - Efectivo" },
  { value: "02", label: "02 - Cheque nominativo" },
  { value: "03", label: "03 - Transferencia electrónica de fondos" },
  { value: "04", label: "04 - Tarjeta de crédito" },
  { value: "05", label: "05 - Monedero electrónico" },
  { value: "06", label: "06 - Dinero electrónico" },
  { value: "08", label: "08 - Vales de despensa" },
  { value: "12", label: "12 - Dación en pago" },
  { value: "13", label: "13 - Pago por subrogación" },
  { value: "14", label: "14 - Pago por consignación" },
  { value: "15", label: "15 - Condonación" },
  { value: "17", label: "17 - Compensación" },
  { value: "23", label: "23 - Novación" },
  { value: "24", label: "24 - Confusión" },
  { value: "25", label: "25 - Remisión de deuda" },
  { value: "26", label: "26 - Prescripción o caducidad" },
  { value: "27", label: "27 - A satisfacción del acreedor" },
  { value: "28", label: "28 - Tarjeta de débito" },
  { value: "29", label: "29 - Tarjeta de servicios" },
  { value: "30", label: "30 - Aplicación de anticipos" },
  { value: "31", label: "31 - Intermediario pagos" },
  { value: "99", label: "99 - Por definir" },
];

const paymentMethodOptions = [
  { value: "PUE", label: "PUE - Pago en una sola exhibición" },
  { value: "PPD", label: "PPD - Pago en parcialidades o diferido" },
];

interface FiscalDataModalProps {
  isOpen: boolean;
}

const FiscalDataModal: React.FC<FiscalDataModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="text-red-500 w-5 h-5" />
          <h2 className="text-lg font-semibold text-gray-900">Atención</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Necesitas tener tus datos fiscales en orden, actualiza tus datos
          fiscales en tu configuración.
        </p>
        <div className="flex justify-end">
          <Link
            to="/"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Ir a Configuración
          </Link>
        </div>
      </div>
    </div>
  );
};

const BillingPage: React.FC<BillingPageProps> = ({ onBack, invoiceData }) => {
  const { authState } = useUser();
  const [match, params] = useRoute("/factura/:id");
  const [showFiscalModal, setShowFiscalModal] = useState(false);
  const [solicitud, setSolicitud] = useState(null);
  const [idCompany, setIdCompany] = useState<string | null>(null);
  const [selectedCfdiUse, setSelectedCfdiUse] = useState("G03");
  const [selectedPaymentForm, setSelectedPaymentForm] = useState("03");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("PUE");
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [descarga, setDescarga] = useState<DescargaFactura | null>(null);
  const [descargaxml, setDescargaxml] = useState<DescargaFactura | null>(null);
  const [isEmpresaSelected, setIsEmpresaSelected] = useState("");
  const [isInvoiceGenerated, setIsInvoiceGenerated] = useState<Root | null>(
    null
  );
  const { showNotification } = useNotification();
  const { crearCfdi, descargarFactura, mandarCorreo } = useApi();
  const [cfdi, setCfdi] = useState({
    Receiver: {
      Name: "",
      CfdiUse: "",
      Rfc: "",
      FiscalRegime: "",
      TaxZipCode: "",
    },
    CfdiType: "",
    NameId: "",
    Observations: "",
    ExpeditionPlace: "",
    Serie: null,
    Folio: 0,
    PaymentForm: "",
    PaymentMethod: "",
    Exportation: "",
    Items: [
      {
        Quantity: "",
        ProductCode: "",
        UnitCode: "",
        Unit: "",
        Description: "",
        // IdentificationNumber: "",
        UnitPrice: "",
        Subtotal: "",
        TaxObject: "",
        Taxes: [
          {
            Name: "",
            Rate: "",
            Total: "",
            Base: "",
            IsRetention: "",
            IsFederalTax: "",
          },
        ],
        Total: "",
      },
    ],
  });

  useEffect(() => {
    const fetchReservation = async () => {
      if (match) {
        const response = await fetch(
          `${URL}/v1/mia/solicitud/id?id=${params.id}`,
          {
            method: "GET",
            headers: HEADERS_API,
          }
        );
        const json = await response.json();
        console.log("😊", json);
        const data_solicitud = json.data[0];
        console.log(data_solicitud);
        const responsefiscal = await fetch(
          `${URL}/v1/mia/datosFiscales/id?id=${idCompany}`,
          {
            method: "GET",
            headers: HEADERS_API,
          }
        );
        console.log(responsefiscal);
        setSolicitud(data_solicitud);

        const jsonfiscal = await responsefiscal.json();
        const data_fiscal = jsonfiscal[0];
        console.log(data_fiscal);
        if (!data_fiscal.rfc || !data_fiscal.codigo_postal_fiscal) {
          setShowFiscalModal(true);
          setCfdi({
            Receiver: {
              Name: "",
              CfdiUse: selectedCfdiUse,
              Rfc: "",
              FiscalRegime: "",
              TaxZipCode: "",
            },
            CfdiType: "",
            NameId: "",
            Observations: "",
            ExpeditionPlace: "",
            Serie: null,
            Folio: 0,
            PaymentForm: selectedPaymentForm,
            PaymentMethod: "",
            Exportation: "",
            Items: [
              {
                Quantity: "",
                ProductCode: "",
                UnitCode: "",
                Unit: "",
                Description: "",
                // IdentificationNumber: "",
                UnitPrice: "",
                Subtotal: "",
                TaxObject: "",
                Taxes: [
                  {
                    Name: "",
                    Rate: "",
                    Total: "",
                    Base: "",
                    IsRetention: "",
                    IsFederalTax: "",
                  },
                ],
                Total: "",
              },
            ],
          });
          return;
        }
        // Suponiendo que data_solicitud.total ya incluye el IVA
        const total = Number(data_solicitud.total_solicitud);
        const subtotal = +(total / 1.16).toFixed(2); // antes de IVA
        const iva = +(total - subtotal).toFixed(2); // solo el IVA

        setCfdi({
          Receiver: {
            Name: data_fiscal.razon_social_df,
            CfdiUse: selectedCfdiUse,
            Rfc: data_fiscal.rfc,
            FiscalRegime: data_fiscal.regimen_fiscal || "612",
            TaxZipCode:
              data_fiscal.codigo_postal_fiscal.length < 5
                ? data_fiscal.empresa_cp
                : data_fiscal.codigo_postal_fiscal,
          },
          CfdiType: "I",
          NameId: "1",
          ExpeditionPlace: "11570",
          // ExpeditionPlace: "42501", //Codigo Postal DE PRUEBA
          Serie: null,
          Folio: Math.round(Math.random() * 999999999),
          PaymentForm: selectedPaymentForm,
          PaymentMethod: "PUE",
          Exportation: "01",
          Observations: `${data_solicitud.hotel} de ${formatDate(
            data_solicitud.check_in
          )} - ${formatDate(data_solicitud.check_out)}`,
          Items: [
            {
              Quantity: "1",
              ProductCode: "90121500",
              UnitCode: "E48",
              Unit: "Unidad de servicio",
              Description: "Servicio de administración y Gestión de Reservas",
              // IdentificationNumber: "EDL",
              UnitPrice: subtotal.toFixed(2),
              Subtotal: subtotal.toFixed(2),
              TaxObject: "02",
              Taxes: [
                {
                  Name: "IVA",
                  Rate: "0.16", // sin comillas
                  Total: iva.toFixed(2),
                  Base: subtotal.toFixed(2),
                  IsRetention: "false",
                  IsFederalTax: "true",
                },
              ],
              Total: total.toFixed(2),
            },
          ],
        });
      }
    };
    if (idCompany) {
      fetchReservation();
    } else {
      return;
    }
  }, [idCompany, selectedCfdiUse, selectedPaymentForm]);

  const handleUpdateCompany = (idCompany: any) => {
    console.log("ID Company updated:", idCompany);
    setIsEmpresaSelected(idCompany.id_empresa);
    setIdCompany(idCompany.taxInfo.id_datos_fiscales);
  };

  useEffect(() => {
    if (!idCompany) {
      setShowFiscalModal(true);
    }
  }, []);

  const handleSendEmail = async () => {
    if (isInvoiceGenerated?.Id) {
      const correo = prompt(
        "¿A que correo electronico deseas mandar la factura?"
      );
      await mandarCorreo(isInvoiceGenerated?.Id, correo || "");
      alert("El correo fue mandado con exito");
    } else {
      alert("ocurrio un error");
    }
  };

  const validateInvoiceData = () => {
    console.log(cfdi.Receiver);
    console.log(selectedCfdiUse);
    console.log(selectedPaymentForm);
    if (
      !cfdi.Receiver.Rfc ||
      !cfdi.Receiver.TaxZipCode ||
      !selectedCfdiUse ||
      !selectedPaymentForm
    ) {
      setShowValidationModal(true);
      return false;
    }
    return true;
  };

  const handleGenerateInvoice = async () => {
    if (validateInvoiceData()) {
      const invoiceData = {
        ...cfdi,
        Receiver: {
          ...cfdi.Receiver,
          CfdiUse: selectedCfdiUse,
        },
        PaymentForm: selectedPaymentForm,
      };
      try {
        // Obtener la fecha actual
        const now = new Date();

        // Restar una hora a la fecha actual
        now.setHours(now.getHours() - 6);

        // Formatear la fecha en el formato requerido: "YYYY-MM-DDTHH:mm:ss"
        const formattedDate = now.toISOString().split(".")[0];

        console.log({
          cfdi: {
            ...cfdi,
            Currency: "MXN", // Add the required currency
            OrderNumber: Math.round(Math.random() * 999999), // Add a placeholder or dynamic order number
            Date: formattedDate, // Ensure the date is within the 72-hour limit
          },
          info_user: {
            id_user: authState?.user?.id,
            id_solicitud: params?.id,
          },
          datos_empresa: {
            rfc: cfdi.Receiver.Rfc,
            id_empresa: isEmpresaSelected,
          },
        });

        const response = await crearCfdi({
          cfdi: {
            ...cfdi,
            Currency: "MXN", // Add the required currency
            OrderNumber: Math.round(Math.random() * 999999), // Add a placeholder or dynamic order number
            Date: formattedDate, // Ensure the date is within the 72-hour limit
          },
          info_user: {
            id_user: authState?.user?.id,
            id_solicitud: params?.id,
          },
          datos_empresa: {
            rfc: cfdi.Receiver.Rfc,
            id_empresa: isEmpresaSelected,
          },
        });
        if (response.error) {
          throw new Error(response);
        }
        alert("Se ha generado con exito la factura");
        descargarFactura(response.data.Id)
          .then((factura) => setDescarga(factura))
          .catch((err) => console.error(err));
        descargarFactura(response.data.Id, "xml")
          .then((factura) => setDescargaxml(factura))
          .catch((err) => console.error(err));
        setIsInvoiceGenerated(response.data);
      } catch (error: any) {
        showNotification("error", error.message);
      }
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-600 to-blue-800 py-4">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <a
            href="/"
            className="flex items-center text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Volver</span>
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-0">
            {/* Left Column - Header and Details */}
            <div className="col-span-8 border-r border-gray-200">
              <div className="p-4 bg-blue-50 border-b border-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Facturación
                    </h2>
                    <p className="text-sm text-gray-600">
                      Detalles de la factura
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Billing Details */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <Building2 className="w-4 h-4 text-blue-600 mr-2" />
                      Datos de Facturación
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        RFC: {cfdi?.Receiver.Rfc}
                      </p>
                      <p className="text-sm text-gray-600">
                        {cfdi?.Receiver.Name}
                      </p>
                    </div>
                  </div>

                  {/* Reservation Details */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <ShoppingCart className="w-4 h-4 text-blue-600 mr-2" />
                      Detalles de la Reserva
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900">
                        {solicitud?.hotel || ""}
                      </p>
                      <p className="text-sm text-gray-600">
                        {solicitud ? (
                          <>
                            {formatDate(solicitud?.check_in)} -
                            {formatDate(solicitud?.check_out)}
                          </>
                        ) : (
                          <p> </p>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amount Details */}
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="w-4 h-4 text-blue-600 mr-2" />
                    Desglose
                  </h3>

                  <div className="space-y-2">
                    <AmountDetailsSplit
                      amount={formatCurrency(cfdi?.Items?.[0]?.Subtotal || 0)}
                      label="Subtotal"
                      icon={<DollarSign className="w-4 h-4 text-gray-400" />}
                    />
                    <AmountDetailsSplit
                      amount={formatCurrency(
                        cfdi?.Items?.[0]?.Taxes?.[0]?.Total || 0
                      )}
                      label={`IVA (${
                        (cfdi?.Items?.[0]?.Taxes?.[0]?.Rate ?? 0) * 100
                      }%)`}
                      icon={<Percent className="w-4 h-4 text-gray-400" />}
                    />
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-900">
                          Total
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(cfdi?.Items?.[0]?.Total || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Actions */}
            <div className="col-span-4 bg-gray-50 p-4 flex flex-col justify-between">
              <div>
                {/* CFDI Use Select */}
                <div className="space-y-1 mb-4">
                  <label className="block text-xs font-medium text-gray-700">
                    Uso de CFDI
                  </label>
                  <select
                    value={selectedCfdiUse}
                    onChange={(e) => setSelectedCfdiUse(e.target.value)}
                    className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {cfdiUseOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Form Select */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Forma de Pago
                  </label>
                  <select
                    value={selectedPaymentForm}
                    onChange={(e) => setSelectedPaymentForm(e.target.value)}
                    className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {paymentFormOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Method Select */}
              <div className="space-y-1 mb-4">
                <label className="block text-xs font-medium text-gray-700">
                  Método de Pago
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {paymentMethodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                {isInvoiceGenerated ? (
                  <>
                    <button
                      onClick={handleSendEmail}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">Enviar por Correo</span>
                    </button>
                    <a
                      href={`data:application/pdf;base64,${descarga?.Content}`}
                      download="factura.pdf"
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Descargar PDF</span>
                    </a>
                    <a
                      href={`data:application/xml;base64,${descargaxml?.Content}`}
                      download="factura.pdf"
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Descargar XML</span>
                    </a>
                  </>
                ) : (
                  <button
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={handleGenerateInvoice}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Confirmar y Generar
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DataFiscalModalWithCompanies
        onClose={() => setShowFiscalModal(false)}
        actualizarCompany={handleUpdateCompany}
        isOpen={showFiscalModal}
      />

      {/* Validation Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="text-red-500 w-5 h-5" />
              <h2 className="text-lg font-semibold text-gray-900">
                Error de Validación
              </h2>
            </div>
            <p className="text-gray-700 mb-4">
              Por favor, regresa a tu configuración y establece los datos
              fiscales para poder realizar tu factura
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowValidationModal(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AmountDetailsSplit = ({
  amount,
  label,
  icon,
}: {
  amount: string;
  label: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        {icon}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-medium text-gray-900">{amount}</span>
    </div>
  );
};

interface BillingPageProps {
  onBack: () => void;
  invoiceData?: DataInvoice;
}

export default BillingPage;
