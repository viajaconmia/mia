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
import { formatCurrency, formatDate } from "../helpers/helpers";
import { DataInvoice, DescargaFactura, ProductInvoice } from "../types/billing";
import { useApi } from "../hooks/useApi";
import { useRoute, Link } from "wouter";
import { HEADERS_API, URL } from "../constants/apiConstant";
import { DataFiscalModalWithCompanies } from "../components/DataFiscalModalWithCompanies";
import { CompanyWithTaxInfo } from "../types";
import { Root } from "../types/billing";
import { useUser } from "../context/authContext";

const cfdiUseOptions = [
  { value: "P01", label: "Por definir" },
  { value: "G01", label: "Adquisición de mercancías" },
  { value: "G02", label: "Devoluciones, descuentos o bonificaciones" },
  { value: "G03", label: "Gastos en general" },
  { value: "P01", label: "Por definir" },
];

const paymentFormOptions = [
  { value: "01", label: "Efectivo" },
  { value: "02", label: "Cheque nominativo" },
  { value: "03", label: "Transferencia electrónica de fondos" },
  { value: "04", label: "Tarjeta de crédito" },
  { value: "28", label: "Tarjeta de débito" },
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

export const BillingPage: React.FC<BillingPageProps> = ({
  onBack,
  invoiceData,
}) => {
  const { authState } = useUser();
  const [match, params] = useRoute("/factura/:id");
  const [showFiscalModal, setShowFiscalModal] = useState(false);
  const [solicitud, setSolicitud] = useState(null);
  const [idCompany, setIdCompany] = useState<string | null>(null);
  const [selectedCfdiUse, setSelectedCfdiUse] = useState("G03");
  const [selectedPaymentForm, setSelectedPaymentForm] = useState("03");
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [descarga, setDescarga] = useState<DescargaFactura | null>(null);
  const [isInvoiceGenerated, setIsInvoiceGenerated] = useState<Root | null>(
    null
  );
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
        IdentificationNumber: "",
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
        const data_solicitud = json[0];
        console.log(data_solicitud);
        const responsefiscal = await fetch(
          `${URL}/v1/mia/datosFiscales/id?id=${idCompany}`,
          {
            method: "GET",
            headers: HEADERS_API,
          }
        );
        console.log(data_solicitud);
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
                IdentificationNumber: "",
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
        setCfdi({
          Receiver: {
            Name: data_fiscal.razon_social,
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
          ExpeditionPlace: "42501",
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
              IdentificationNumber: "EDL",
              UnitPrice: (data_solicitud.total * 0.84).toFixed(2),
              Subtotal: (data_solicitud.total * 0.84).toFixed(2),
              TaxObject: "02",
              Taxes: [
                {
                  Name: "IVA",
                  Rate: "0.16",
                  Total: (data_solicitud.total * 0.16).toFixed(2),
                  Base: data_solicitud.total,
                  IsRetention: "false",
                  IsFederalTax: "true",
                },
              ],
              Total: data_solicitud.total,
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

  const handleUpdateCompany = (idCompany: string) => {
    setIdCompany(idCompany);
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

        console.log(formattedDate);
        // Ejemplo: "2025-04-06T12:10:00"

        const response = await crearCfdi({
          cfdi: {
            ...cfdi,
            Currency: "MXN", // Add the required currency
            OrderNumber: "12345", // Add a placeholder or dynamic order number
            Date: formattedDate, // Ensure the date is within the 72-hour limit
          },
          info_user: {
            id_user: authState?.user?.id,
            id_solicitud: params?.id,
          },
        });
        if (response.error) {
          throw new Error(response);
        }
        alert("Se ha generado con exito la factura");
        descargarFactura(response.data.Id)
          .then((factura) => setDescarga(factura))
          .catch((err) => console.error(err));
        setIsInvoiceGenerated(response.data);
      } catch (error) {
        alert("Ocurrio un error, intenta mas tarde");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 py-4">
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
