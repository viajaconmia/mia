import React, { useEffect, useState } from "react";
import { Employee, FormMode, TaxInfo, CompanyWithTaxInfo } from "../types";
import { CompanyForm } from "../components/CompanyForm";
import { EmployeeForm } from "../components/EmployeeForm";
import { FiscalDataModal } from "../components/FiscalDataModal";
import {} from "module";
import {
  createNewEmpresa,
  createNewViajero,
  updateEmpresa,
  updateViajero,
  deleteTraveler,
  deleteCompany,
} from "../hooks/useDatabase";
import {
  fetchViajerosCompanies,
  fetchEmpresasDatosFiscales,
} from "../hooks/useFetch";
import {
  Building2,
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  FileEdit,
  User,
  Lock,
  Shield,
  CheckCircle,
  UserCog,
} from "lucide-react";
import Modal from "../components/molecule/Modal";
import useAuth from "../hooks/useAuth";
import Button from "../components/atom/Button";
import { useNotification } from "../hooks/useNotification";
import { UserSingleton } from "../services/UserSingleton";
import { ProtectedComponent } from "../middleware/ProtectedComponent";
import { InputRadio, InputText } from "../components/atom/Input";
import { TabsList } from "../components/molecule/TabsList";

export const Configuration = () => {
  const [selectedViajero, setSelectedViajero] = useState<InfoUsuario | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"companies" | "employees">(
    "companies"
  );
  const [companies, setCompanies] = useState<CompanyWithTaxInfo[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyWithTaxInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const handleSaveFiscalData = (companyId: string, fiscalData: TaxInfo) => {
    setCompanies(
      companies.map((company) =>
        company.id_empresa === companyId
          ? { ...company, taxInfo: fiscalData }
          : company
      )
    );
    setShowModal(false);
  };

  const fetchData = async () => {
    if (activeTab === "companies") {
      const data = await fetchEmpresasDatosFiscales();
      if (data && Array.isArray(data)) {
        const formattedCompanies: CompanyWithTaxInfo[] = data;
        setCompanies(formattedCompanies);
      }
    } else if (activeTab === "employees") {
      const data = await fetchViajerosCompanies();
      setEmployees(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleSearch = (items: any[]) => {
    if (!searchTerm) return items;
    return items.filter((item) =>
      Object.values(item).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const handleDelete = async (type: "company" | "employee", id: string) => {
    console.log(id);
    if (!confirm("Estas seguro que quieres eliminarlo?")) return;

    switch (type) {
      case "company":
        const respondeDeleteCompany = await deleteCompany(id);
        if (respondeDeleteCompany.success) {
          setCompanies(companies.filter((c) => c.id_empresa !== id));
        }
        //setAssignments(assignments.filter((a) => a.companyId !== id));
        break;
      case "employee":
        const respondeDeleteEmployee = await deleteTraveler(id);
        if (respondeDeleteEmployee.success) {
          setEmployees(employees.filter((e) => e.id_viajero !== id));
        }
        break;
    }
  };

  const handleSubmit = async (
    type: "company" | "employee" | "assignment" | "tag" | "policy" | "taxInfo",
    data: any
  ) => {
    console.log(data);
    switch (type) {
      case "company":
        if (formMode === "create") {
          try {
            if (!user) {
              throw new Error("No hay usuario autenticado");
            }
            const responseCompany = await createNewEmpresa(data, user.id);
            if (!responseCompany.success) {
              throw new Error("No se pudo registrar a la empresa");
            }
            console.log(responseCompany);
          } catch (error) {
            console.error("Error creando nueva empresa", error);
          }
        } else {
          try {
            if (!user) {
              throw new Error("No hay usuario autenticado");
            }
            const responseCompany = await updateEmpresa(
              data,
              data.id_empresa,
              user.id
            );
            if (!responseCompany.success) {
              throw new Error("No se pudo actualizar a la empresa");
            }
            console.log(responseCompany);
          } catch (error) {
            console.error("Error actualizando la empresa", error);
          }
        }
        break;
      case "employee":
        if (formMode === "create") {
          try {
            if (!user) {
              throw new Error("No hay usuario autenticado");
            }
            const responseCompany = await createNewViajero(
              data,
              data.id_empresas
            );
            if (!responseCompany.success) {
              throw new Error("No se pudo registrar al viajero");
            }
            console.log(responseCompany);
          } catch (error) {
            console.error("Error creando al nuevo viajero", error);
          }
        } else {
          try {
            if (!user) {
              throw new Error("No hay usuario autenticado");
            }
            const responseCompany = await updateViajero(
              data,
              data.id_empresas,
              data.id_viajero
            );
            if (!responseCompany.success) {
              throw new Error("No se pudo actualizar al viajero");
            }
            console.log(responseCompany);
          } catch (error) {
            console.error("Error actualizando viajero", error);
          }
        }
        break;
    }
    fetchData();
    setShowForm(false);
    setSelectedItem(null);
  };

  const renderForm = () => {
    switch (activeTab) {
      case "companies":
        return (
          <CompanyForm
            onSubmit={(data) => handleSubmit("company", data)}
            onCancel={() => setShowForm(false)}
            initialData={selectedItem}
          />
        );
      case "employees":
        return (
          <EmployeeForm
            onSubmit={(data) => handleSubmit("employee", data)}
            onCancel={() => setShowForm(false)}
            // tags={tags}
            // departments={departments}
            initialData={selectedItem}
          />
        );
    }
  };

  return (
    <>
      <>
        {/* // <div className="min-h-screen bg-gray-50 pt-12">
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> */}
        {/* <h1 className="text-xl font-bold text-gray-100 mb-4">
          Configuración de la cuenta
        </h1> */}
        <div className="flex justify-center items-center">
          <div className="bg-white rounded-lg shadow mt-8 w-[95vw] max-w-7xl">
            <TabsList
              tabs={[
                { tab: "companies", icon: Building2 },
                { tab: "employees", icon: Users },
              ]}
              activeTab={activeTab}
              onChange={(tab) => {
                setActiveTab(tab as "companies" | "employees");
                setShowForm(false);
              }}
            />

            <div className="p-6">
              {showForm ? (
                renderForm()
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        pattern="^[^<div>]*$"
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setFormMode("create");
                        setSelectedItem(null);
                        setShowForm(true);
                      }}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Añadir nueva
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          {activeTab === "companies" && (
                            <>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre de la empresa
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Calle y número
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo de persona
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Datos Fiscales
                              </th>
                            </>
                          )}
                          {activeTab === "employees" && (
                            <>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Viajero
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Empresas
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha de nacimiento
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contacto
                              </th>
                            </>
                          )}
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activeTab === "companies" &&
                          handleSearch(companies).map((company) => (
                            <tr key={company.id_empresa}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {company.logo ? (
                                    <img
                                      src={company.logo}
                                      alt={company.nombre_comercial}
                                      className="h-10 w-10 rounded-full mr-3"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                      <Building2 className="h-6 w-6 text-gray-500" />
                                    </div>
                                  )}
                                  <div className="text-sm font-medium text-gray-900">
                                    {company.nombre_comercial}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {company.empresa_direccion || ""}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {company.tipo_persona}
                                <br />
                                {company.phone}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                  onClick={() => {
                                    setSelectedCompany(company);
                                    setShowModal(true);
                                  }}
                                >
                                  <FileEdit size={16} className="mr-2" />
                                  Datos fiscales
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {company.rn != 1 && (
                                  <ProtectedComponent
                                    admit={{
                                      administrador: true,
                                      reservante: false,
                                      viajero: false,
                                      consultor: false,
                                      "no-rol": false,
                                    }}
                                  >
                                    <button
                                      onClick={() => {
                                        setFormMode("edit");
                                        setSelectedItem(company);
                                        setShowForm(true);
                                      }}
                                      className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                      <Pencil className="h-5 w-5" />
                                    </button>
                                    {/* <button
                                    onClick={() =>
                                      handleDelete(
                                        "company",
                                        company.id_empresa
                                      )
                                    }
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button> */}
                                  </ProtectedComponent>
                                )}
                              </td>
                            </tr>
                          ))}
                        {activeTab === "employees" &&
                          handleSearch(employees).map((employee) => (
                            <tr key={employee.id_viajero}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {employee.photo ? (
                                    <img
                                      src={employee.photo}
                                      alt={employee.primer_nombre}
                                      className="h-10 w-10 rounded-full mr-3"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                      <Users className="h-6 w-6 text-gray-500" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {employee.primer_nombre}{" "}
                                      {employee.segundo_nombre}{" "}
                                      {employee.apellido_paterno}{" "}
                                      {employee.apellido_materno}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {employee.empresas
                                    ?.map(
                                      (emp: { razon_social: any }) =>
                                        emp.razon_social
                                    )
                                    .join(", ")}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {employee.fecha_nacimiento
                                  ? new Date(
                                      employee.fecha_nacimiento
                                    ).toLocaleDateString()
                                  : ""}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {employee.correo}
                                <br />
                                {employee.telefono}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                {employee.rn != 1 && (
                                  <ProtectedComponent
                                    admit={{
                                      administrador: true,
                                      reservante: false,
                                      viajero: false,
                                      consultor: false,
                                      "no-rol": false,
                                    }}
                                  >
                                    <button
                                      onClick={() => {
                                        setFormMode("edit");
                                        setSelectedItem(employee);
                                        setShowForm(true);
                                      }}
                                      className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                      <Pencil className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDelete(
                                          "employee",
                                          employee.id_viajero
                                        )
                                      }
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                    {/* <Button
                                    onClick={() => setSelectedViajero(employee)}
                                    className="col-span-2"
                                  >
                                    Editar rol
                                  </Button> */}
                                    {!employee.is_user && (
                                      <Button
                                        onClick={() => {
                                          setSelectedViajero(employee);
                                        }}
                                        variant="secondary"
                                      >
                                        Definir rol
                                      </Button>
                                    )}
                                  </ProtectedComponent>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {selectedCompany && (
          <FiscalDataModal
            company={selectedCompany}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSaveFiscalData}
          />
        )}
        <Modal
          open={!!selectedViajero}
          title={`Asignar rol`}
          subtitle="Configura el acceso inicial"
          onClose={() => {
            setSelectedViajero(null);
          }}
          icon={Shield}
        >
          <DefinirRol
            viajero={selectedViajero}
            onClose={() => {
              setSelectedViajero(null);
            }}
          ></DefinirRol>
        </Modal>
      </>
    </>
  );
};

const DefinirRol = ({
  viajero,
  onClose,
}: {
  viajero: InfoUsuario | null;
  onClose: () => void;
}) => {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [, setValid] = useState<boolean>(false);
  const { validarViajeroToRol, loading, viajeroToUsuarioWithRol } = useAuth();
  const notificationContext = useNotification();

  if (!viajero) return null;

  const showNotification = notificationContext?.showNotification ?? (() => {});

  const roles = [
    {
      id: "consultor",
      label: "Consultor",
      icon: CheckCircle,
      color: "bg-blue",
      description: "Puede ver la información",
    },
    {
      id: "viajero",
      label: "Viajero",
      icon: User,
      color: "bg-blue",
      description: "Puede ver las reservas",
    },
    {
      id: "reservante",
      label: "Reservante",
      icon: Shield,
      color: "bg-green",
      description: "Gestión del sistema",
    },
    {
      id: "administrador",
      label: "Administrador",
      icon: UserCog,
      color: "bg-purple",
      description: "Acceso completo",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !password) return;
    if (!UserSingleton.getInstance().getUser()?.info?.id_agente)
      throw new Error("No hay usuario");

    try {
      const { message } = await viajeroToUsuarioWithRol({
        correo: viajero.correo,
        id_agente:
          UserSingleton.getInstance().getUser()?.info?.id_agente ?? null,
        id_viajero: viajero.id_viajero,
        password,
        rol: selectedRole,
      });
      showNotification("success", message);
      onClose();
    } catch (error: any) {
      console.error(error);
      showNotification("error", error.message);
    }
  };

  useEffect(() => {
    validarViajeroToRol(viajero.correo)
      .then((result) => {
        setValid(result);
      })
      .catch((error) => {
        console.log(error);
        onClose();
      });
  }, []);

  const isFormValid = selectedRole && password.length >= 8;

  return (
    <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-md mx-auto p-4">
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">
              {viajero.nombre_agente_completo}
            </p>
            <p className="text-sm text-gray-600">{viajero.correo}</p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Seleccionar Rol
          </label>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((role) => (
              <InputRadio
                item={role}
                name="role"
                onChange={setSelectedRole}
                selectedItem={selectedRole}
              ></InputRadio>
            ))}
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contraseña Inicial
          </label>
          <div className="relative">
            <InputText
              icon={Lock}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(value) => setPassword(value)}
              placeholder="Mínimo 8 caracteres"
            />
            <Button
              variant="ghost"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-medium"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </Button>
          </div>
          {password && password.length < 6 && (
            <p className="text-xs text-red-500 mt-1">
              La contraseña debe tener al menos 6 caracteres
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button type="submit" disabled={!isFormValid || loading} size="full">
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Guardando...
              </div>
            ) : (
              "Asignar"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export type Empresa = {
  id_empresa: string;
  razon_social: string;
};

export type InfoUsuario = {
  id_agente: string;
  monto_credito: string | null;
  saldo: string;
  tiene_credito_consolidado: number;
  nombre: string;
  notas: string;
  por_confirmar: string;
  vendedor: string | null;
  created_agente: string; // ISO string, puedes usar Date si prefieres
  id_viajero: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  apellido_paterno: string;
  apellido_materno: string | null;
  correo: string;
  fecha_nacimiento: string | null;
  genero: string | null;
  telefono: string | null;
  created_at: string;
  updated_at: string;
  nacionalidad: string | null;
  numero_pasaporte: string | null;
  numero_empleado: string | null;
  nombre_agente_completo: string;
  empresas: Empresa[];
  rn: number;
  wallet: string;
};
