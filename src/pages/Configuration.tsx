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
} from "lucide-react";
import { supabase } from "../services/supabaseClient";

export const Configuration = () => {
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
            const { data: user, error: userError } =
              await supabase.auth.getUser();
            if (userError) {
              throw userError;
            }
            if (!user) {
              throw new Error("No hay usuario autenticado");
            }
            const responseCompany = await createNewEmpresa(data, user.user.id);
            if (!responseCompany.success) {
              throw new Error("No se pudo registrar a la empresa");
            }
            console.log(responseCompany);
          } catch (error) {
            console.error("Error creando nueva empresa", error);
          }
        } else {
          try {
            const { data: user, error: userError } =
              await supabase.auth.getUser();
            if (userError) {
              throw userError;
            }
            if (!user) {
              throw new Error("No hay usuario autenticado");
            }
            const responseCompany = await updateEmpresa(
              data,
              data.id_empresa,
              user.user.id
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
            const { data: user, error: userError } =
              await supabase.auth.getUser();
            if (userError) {
              throw userError;
            }
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
            const { data: user, error: userError } =
              await supabase.auth.getUser();
            if (userError) {
              throw userError;
            }
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
            const { data: user, error: userError } =
              await supabase.auth.getUser();
            if (userError) {
              throw userError;
            }
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
    <div className="min-h-screen bg-gray-50 mt-12">
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
                              <button
                                onClick={() =>
                                  handleDelete("company", company.id_empresa)
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
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
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                                  handleDelete("employee", employee.id_viajero)
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
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
    </div>
  );
};
