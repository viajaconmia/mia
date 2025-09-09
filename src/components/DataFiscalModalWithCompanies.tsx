import React, { useState, useEffect } from "react";
import { X, Building2, Search } from "lucide-react";
import { CompanyWithTaxInfo, TaxInfo } from "../types";
import { fetchEmpresasDatosFiscales } from "../hooks/useFetch";
import { AlertCircle } from "lucide-react";
import { useRoute, Link, useLocation } from "wouter";
import Button from "./atom/Button";
import ROUTES from "../constants/routes";

interface FiscalDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  actualizarCompany: (idDatosFiscales: string) => void;
}

const hasValidRfc = (company: CompanyWithTaxInfo): boolean => {
  return company.taxInfo?.rfc && company.taxInfo.rfc.trim() !== '';
};
// ... rest of the imports and constants remain the same

export function DataFiscalModalWithCompanies({
  isOpen,
  onClose,
  actualizarCompany,
}: FiscalDataModalProps) {
  const [company, setCompany] = useState<CompanyWithTaxInfo | null>(null);
  const [companies, setCompanies] = useState<CompanyWithTaxInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation()
  const [showNoRfcAlert, setShowNoRfcAlert] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setShowNoRfcAlert(false);
      try {
        const data = await fetchEmpresasDatosFiscales();
        if (data && Array.isArray(data)) {
          const formattedCompanies: CompanyWithTaxInfo[] = data.map(
            (company) => ({
              id_empresa: company.id_empresa,
              razon_social: company.razon_social,
              nombre_comercial: company.nombre_comercial,
              direccion: company.empresa_direccion || "",
              tipo_persona: company.tipo_persona,
              taxInfo: company.id_datos_fiscales
                ? {
                  id_datos_fiscales: company.id_datos_fiscales,
                  id_empresa: company.id_empresa,
                  rfc: company.rfc,
                  calle: company.calle,
                  colonia: company.colonia,
                  municipio: company.municipio,
                  estado: company.estado,
                  codigo_postal_fiscal:
                    company.codigo_postal_fiscal.toString(),
                  regimen_fiscal: company.regimen_fiscal || "",
                }
                : null,
            })
          );

          // Filtrar solo empresas con RFC válido
          const empresasConRfc = formattedCompanies.filter(hasValidRfc);
          setCompanies(empresasConRfc);

          // Si solo hay una empresa con RFC, seleccionarla automáticamente
          if (empresasConRfc.length === 1) {
            actualizarCompany(empresasConRfc[0]);
            onClose();
            return;
          }

          // Si no hay empresas con RFC, mostrar alerta
          if (empresasConRfc.length === 0) {
            setShowNoRfcAlert(true);
          }
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, actualizarCompany, onClose]);

  const filteredCompanies = companies.filter(
    (company) =>
      company.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.nombre_comercial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCompany = (company: CompanyWithTaxInfo) => {
    if (company.taxInfo?.id_datos_fiscales) {
      actualizarCompany(company);
      onClose();
    } else {
      setCompany(company);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Seleccionar Empresa</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {showNoRfcAlert ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    No tienes empresas con RFC registrado. Necesitas tener una empresa con RFC para poder facturar.
                  </p>
                  <div className="mt-2">
                    <Button
                      onClick={() => { setLocation(ROUTES.SETTINGS) }}
                    >
                      Ir a Configurar Empresas
                    </Button>
                    <button
                      onClick={onClose}
                      className="ml-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  pattern="^[^<>]*$"
                  type="text"
                  placeholder="Buscar empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid gap-4 max-h-[50vh] overflow-y-auto">
                  {filteredCompanies.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No se encontraron empresas con RFC registrado
                    </div>
                  ) : (
                    filteredCompanies.map((company) => (
                      <button
                        key={company.id_empresa}
                        onClick={() => handleSelectCompany(company)}
                        className="w-full text-left p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-all group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                              {company.razon_social}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {company.nombre_comercial}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              RFC: {company.taxInfo?.rfc}
                            </p>
                          </div>
                          {company.taxInfo?.id_datos_fiscales && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Datos fiscales disponibles
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
