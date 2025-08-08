import React, { useEffect, useState } from "react";
import {
  Company,
  Employee,
  Assignment,
  FormMode,
  Tag,
  Policy,
  TaxInfo,
  CompanyWithTaxInfo,
} from "../types";
import { CompanyForm } from "../components/CompanyForm";
import { EmployeeForm } from "../components/EmployeeForm";
import { AssignmentForm } from "../components/AssignmentForm";
import { TagForm } from "../components/TagForm";
import { PolicyForm } from "../components/PolicyForm";
import { DatosFiscalesForm } from "../components/DatosFiscalesForm";
import { FiscalDataModal } from "../components/FiscalDataModal";
import {
  createNewEmpresa,
  createNewViajero,
  createNewDatosFiscales,
  updateEmpresa,
  updateViajero,
  deleteTraveler,
  deleteCompany,
} from "../hooks/useDatabase";
import {
  fetchCompaniesAgent,
  fetchViajerosCompanies,
  fetchEmpresasDatosFiscales,
} from "../hooks/useFetch";
import {
  Building2,
  Users,
  Link,
  Search,
  Plus,
  Pencil,
  Trash2,
  Tags,
  BookOpen,
  BookOpenText,
  Bell,
  FileEdit,
  User,
  Lock,
  Shield,
  CheckCircle,
  UserCog,
} from "lucide-react";
import Modal from "../components/molecule/Modal";
import ProtectedRoute from "../middleware/ProtectedRoute";
import useAuth from "../hooks/useAuth";
import Button from "../components/atom/Button";
import Loader from "../components/atom/Loader";
import { useNotification } from "../hooks/useNotification";
import { UserSingleton } from "../services/UserSingleton";
import { ProtectedComponent } from "../middleware/ProtectedComponent";

export const Configuration = () => {
  const [selectedViajero, setSelectedViajero] = useState<InfoUsuario | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    | "companies"
    | "employees"
    | "assignments"
    | "tags"
    | "policies"
    | "notifications"
    | "taxInfo"
  >("companies");
  const [companies, setCompanies] = useState<CompanyWithTaxInfo[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [datosFiscales, setDatosFiscales] = useState<TaxInfo[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyWithTaxInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
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
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const fetchData = async () => {
    if (activeTab === "companies") {
      const data = await fetchEmpresasDatosFiscales();
      if (data && Array.isArray(data)) {
        const formattedCompanies: CompanyWithTaxInfo[] = data.map(
          (company) => ({
            ...company,
            id_empresa: company.id_empresa,
            razon_social: company.razon_social,
            nombre_comercial: company.nombre_comercial,
            empresa_direccion: company.empresa_direccion || "", // Asegurar que haya dirección
            empresa_municipio: company.empresa_municipio,
            empresa_estado: company.empresa_estado,
            empresa_colonia: company.empresa_colonia,
            empresa_cp: company.empresa_cp,
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
                  codigo_postal_fiscal: company.codigo_postal_fiscal.toString(),
                  regimen_fiscal: company.regimen_fiscal || "",
                  razon_social: company.razon_social_df || "",
                }
              : null,
          })
        );

        setCompanies(formattedCompanies);
        console.log(companies);
      }
    } else if (activeTab === "employees") {
      const data = await fetchViajerosCompanies();
      setEmployees(data);
    } else if (activeTab === "taxInfo") {
      const data = await fetchEmpresasDatosFiscales();
      setDatosFiscales(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // List of departments (could be moved to a separate configuration)
  const departments = [
    "Ingenieria",
    "Marketing",
    "Ventas",
    "Recursos Humanos",
    "Finanzas",
    "Operaciones",
  ];

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

  const handleDelete = async (
    type: "company" | "employee" | "assignment" | "tag" | "policy",
    id: string
  ) => {
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
        /*setAssignments(assignments.filter((a) => a.employeeId !== id));
        setPolicies(policies.map(p => ({
          ...p,
          employeeIds: p.employeeIds.filter(eId => eId !== id)
        })));*/
        break;
      case "assignment":
        setAssignments(assignments.filter((a) => a.id !== id));
        break;
      case "tag":
        setTags(tags.filter((t) => t.id !== id));
        setEmployees(
          employees.map((e) => ({
            ...e,
            tagIds: e.tagIds.filter((tId) => tId !== id),
          }))
        );
        break;
      case "policy":
        setPolicies(policies.filter((p) => p.id !== id));
        break;
    }
  };

  const handleSubmit = async (
    type: "company" | "employee" | "assignment" | "tag" | "policy" | "taxInfo",
    data: any
  ) => {
    const id = formMode === "create" ? crypto.randomUUID() : selectedItem.id;
    const newData = { ...data, id };
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

      case "taxInfo":
        if (formMode === "create") {
          console.log(data);
          try {
            if (!user) {
              throw new Error("No hay usuario autenticado");
            }
            const responseCompany = await createNewDatosFiscales(data);
            if (!responseCompany.success) {
              throw new Error("No se pudo registrar los datos fiscales");
            }
            console.log(responseCompany);
          } catch (error) {
            console.error("Error creando nuevis datos fiscales", error);
          }
        } else {
          setCompanies(
            companies.map((c) => (c.id_empresa === id ? newData : c))
          );
        }
        break;
      case "assignment":
        if (formMode === "create") {
          setAssignments([...assignments, newData]);
        } else {
          setAssignments(assignments.map((a) => (a.id === id ? newData : a)));
        }
        break;
      case "tag":
        if (formMode === "create") {
          setTags([...tags, newData]);
        } else {
          setTags(tags.map((t) => (t.id === id ? newData : t)));
        }
        break;
      case "policy":
        if (formMode === "create") {
          setPolicies([...policies, newData]);
        } else {
          setPolicies(policies.map((p) => (p.id === id ? newData : p)));
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
      case "assignments":
        return (
          <AssignmentForm
            companies={companies}
            employees={employees}
            onSubmit={(data) => handleSubmit("assignment", data)}
            onCancel={() => setShowForm(false)}
            initialData={selectedItem}
          />
        );
      case "taxInfo":
        return (
          <DatosFiscalesForm
            onSubmit={(data) => handleSubmit("taxInfo", data)}
            onCancel={() => setShowForm(false)}
            initialData={selectedItem}
          />
        );
      case "tags":
        return (
          <TagForm
            onSubmit={(data) => handleSubmit("tag", data)}
            onCancel={() => setShowForm(false)}
            initialData={selectedItem}
            employees={employees}
          />
        );
      case "policies":
        return (
          <PolicyForm
            onSubmit={(data) => handleSubmit("policy", data)}
            onCancel={() => setShowForm(false)}
            departments={departments}
            employees={employees}
            initialData={selectedItem}
            empresas={companies}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Configuración de la cuenta
        </h1>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap">
              <button
                onClick={() => {
                  setActiveTab("companies");
                  setShowForm(false);
                }}
                className={`${
                  activeTab === "companies"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } flex items-center w-1/5 py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <Building2 className="mr-2 h-5 w-5" />
                Compañias
              </button>
              <button
                onClick={() => {
                  setActiveTab("employees");
                  setShowForm(false);
                }}
                className={`${
                  activeTab === "employees"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } flex items-center w-1/5 py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <Users className="mr-2 h-5 w-5" />
                Viajeros
              </button>
              {/* <button
                onClick={() => setActiveTab('assignments')}
                className={`${
                  activeTab === 'assignments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center w-1/5 py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <Link className="mr-2 h-5 w-5" />
                Assignments
              </button> */}
              {/* <button
                onClick={() => setActiveTab('taxInfo')}
                className={`${activeTab === 'taxInfo'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex items-center w-1/5 py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <BookOpenText className="mr-2 h-5 w-5" />
                Datos fiscales
              </button> */}
              {/*<button
                onClick={() => setActiveTab('tags')}
                className={`${activeTab === 'tags'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex items-center w-1/5 py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <Tags className="mr-2 h-5 w-5" />
                Etiquetas
              </button>*/}
              {/*<button
                onClick={() => setActiveTab('policies')}
                className={`${activeTab === 'policies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex items-center w-1/5 py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Politicas
              </button>*/}
              <button
                onClick={() => {
                  setActiveTab("notifications");
                  setShowForm(false);
                }}
                className={`${
                  activeTab === "notifications"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } flex items-center w-1/5 py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <Bell className="mr-2 h-5 w-5" />
                Notificaciones
              </button>
            </nav>
          </div>

          <div className="p-6">
            {showForm ? (
              renderForm()
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      pattern="^[^<>]*$"
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
                        {activeTab === "taxInfo" && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Empresa
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              RFC
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Dirección
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Estado/Municipio
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Código Postal
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Régimen Fiscal
                            </th>
                          </>
                        )}

                        {activeTab === "assignments" && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Compañia
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Empleado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rol
                            </th>
                          </>
                        )}
                        {activeTab === "tags" && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nombre de la etiqueta
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Descripción
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Usada por
                            </th>
                          </>
                        )}
                        {activeTab === "policies" && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nombre de politica
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Estatus
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Validez
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
                              {company.empresa_direccion}
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
                                  ?.map((emp) => emp.razon_social)
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
                                  <Button
                                    onClick={() => {
                                      setSelectedViajero(employee);
                                    }}
                                    variant="secondary"
                                  >
                                    Definir rol
                                  </Button>
                                </ProtectedComponent>
                              )}
                            </td>
                          </tr>
                        ))}
                      {activeTab === "taxInfo" &&
                        datosFiscales.map((datosFiscal) => {
                          const empresa = companies.find(
                            (c) => c.id_empresa === datosFiscal.id_empresa
                          ); // Suponiendo que 'companies' contiene las empresas relacionadas
                          return (
                            <tr key={datosFiscal.id_datos_fiscales}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {/* Aquí puedes mostrar algo relacionado con la empresa o el ID */}
                                  <div className="text-sm font-medium text-gray-900">
                                    {empresa
                                      ? empresa.razon_social
                                      : "Empresa no encontrada"}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {datosFiscal.rfc || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {datosFiscal.calle || "-"},{" "}
                                {datosFiscal.colonia || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {datosFiscal.estado || "-"},{" "}
                                {datosFiscal.municipio || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {datosFiscal.codigo_postal_fiscal || "-"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {datosFiscal.regimen_fiscal || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => {
                                    setFormMode("edit");
                                    setSelectedItem(datosFiscal);
                                    setShowForm(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 mr-4"
                                >
                                  <Pencil className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(
                                      "datosFiscal",
                                      datosFiscal.id_datos_fiscales
                                    )
                                  }
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}

                      {activeTab === "tags" &&
                        handleSearch(tags).map((tag) => {
                          const taggedEmployees = employees.filter((e) =>
                            e.tagIds?.includes(tag.id)
                          );
                          return (
                            <tr key={tag.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div
                                    className="h-6 w-6 rounded mr-2"
                                    style={{ backgroundColor: tag.color }}
                                  />
                                  <div className="text-sm font-medium text-gray-900">
                                    {tag.name}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {tag.description || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {taggedEmployees.length} employees
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => {
                                    setFormMode("edit");
                                    setSelectedItem(tag);
                                    setShowForm(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 mr-4"
                                >
                                  <Pencil className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete("tag", tag.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      {activeTab === "policies" &&
                        handleSearch(policies).map((policy) => (
                          <tr key={policy.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {policy.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {policy.description.length > 50
                                  ? policy.description.substring(0, 50) + "..."
                                  : policy.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  policy.type === "budget"
                                    ? "bg-green-100 text-green-800"
                                    : policy.type === "schedule"
                                    ? "bg-blue-100 text-blue-800"
                                    : policy.type === "benefits"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {policy.type.charAt(0).toUpperCase() +
                                  policy.type.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  policy.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : policy.status === "inactive"
                                    ? "bg-gray-100 text-gray-800"
                                    : policy.status === "draft"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {policy.status.charAt(0).toUpperCase() +
                                  policy.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(policy.startDate).toLocaleDateString()}{" "}
                              -
                              <br />
                              {new Date(policy.endDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => {
                                  setFormMode("edit");
                                  setSelectedItem(policy);
                                  setShowForm(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <Pencil className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete("policy", policy.id)
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
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
    </div>
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
  const [valid, setValid] = useState<boolean>(false);
  const { validarViajeroToRol, loading, viajeroToUsuarioWithRol } = useAuth();
  const notificationContext = useNotification();

  if (!viajero) return null;

  // Verifica si notificationContext existe antes de usar showNotification
  const showNotification = notificationContext?.showNotification ?? (() => {});

  console.log(viajero);
  const roles = [
    {
      id: "consultor",
      label: "Consultor",
      icon: CheckCircle,
      color: "bg-blue-500",
      description: "Puede ver la información",
    },
    {
      id: "viajero",
      label: "Viajero",
      icon: User,
      color: "bg-blue-500",
      description: "Puede ver las reservas",
    },
    {
      id: "reservante",
      label: "Reservante",
      icon: Shield,
      color: "bg-green-500",
      description: "Gestión del sistema",
    },
    {
      id: "administrador",
      label: "Administrador",
      icon: UserCog,
      color: "bg-purple-500",
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
    <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-md mx-auto">
      {/* Header
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Asignar Rol</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configura el acceso inicial
        </p>
      </div> */}
      {/* User Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">{viajero.nombre}</p>
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
            {roles.map((role) => {
              const IconComponent = role.icon;
              return (
                <label
                  key={role.id}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedRole === role.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.id}
                    checked={selectedRole === role.id}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-8 h-8 ${role.color} rounded-full flex items-center justify-center mr-3`}
                  >
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {role.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {role.description}
                    </div>
                  </div>
                  {selectedRole === role.id && (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña Inicial
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-medium"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
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
              "Asignar Rol"
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
