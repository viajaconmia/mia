import React, { useState, useEffect, ReactNode } from "react";
import { Building, BarChart, Calendar, DollarSign, Clock } from "lucide-react";
import { Barchart } from "../components/Chart";
import { ChartLine } from "../components/LineChart";
import { Link } from "wouter";
import { HEADERS_API, URL } from "../constants/apiConstant";
import { useUser } from "../context/authContext";
import Donut from "../components/Donut";

// Componente de Tarjeta de Estadísticas
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
}) => (
  <div className="bg-white rounded-lg shadow-md p-4">
    <div className="flex gap-4 items-center flex-row">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <div>
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
);
// Componente de Navegación
const Navigation: React.FC<{
  buttons: NavButton[];
  // selectedDashboard: number;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  // onSelect: (id: number) => void;
}> = ({
  buttons,
  selectedDashboard,
  onSelect,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
}) => (
  <nav className="bg-white shadow-md p-4">
    <div className="flex items-center gap-2">
      <Link href="/">
        <svg
          className="h-8 w-auto"
          viewBox="0 0 1152 539"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <path
              className="fill-blue-600"
              d="M209.06,500.55s-.04.03-.06.02c-64.5-64.5-133.27-131.46-133.27-209.51,0-86.62,84.17-157.09,187.63-157.09s187.63,70.47,187.63,157.09c0,74.79-63.42,139.58-150.8,154.08-.02,0-.05-.01-.05-.04l-8.8-53.12c61.28-10.16,105.76-52.6,105.76-100.92,0-56.91-60-103.2-133.74-103.2s-133.74,46.3-133.74,103.2c0,49.8,48,93.56,111.66,101.79,0,0,.01,0,.01.02l-32.23,107.69Z"
            />
            <ellipse
              className="fill-gray-800"
              cx="215.01"
              cy="277.85"
              rx="28.37"
              ry="37.7"
            />
            <ellipse
              className="fill-gray-800"
              cx="317.34"
              cy="277.85"
              rx="28.37"
              ry="37.7"
            />
            <path
              className="fill-blue-600"
              d="M344.98,125.54c-2.9,0-5.84-.69-8.58-2.14-70.29-37.27-135.91-1.73-138.67-.2-8.84,4.91-20.01,1.76-24.95-7.07-4.94-8.82-1.84-19.96,6.96-24.93,3.45-1.95,85.44-47.12,173.85-.23,8.95,4.75,12.36,15.86,7.62,24.81-3.29,6.21-9.65,9.76-16.23,9.76Z"
            />
          </g>
        </svg>
      </Link>
      {buttons.map((button) => (
        <button
          key={button.id}
          onClick={() => onSelect(button.id)}
          className={`px-4 pl-2 flex gap-2 py-2 rounded-lg transition-colors ${
            selectedDashboard === button.id
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          {button.icon ? <button.icon /> : <></>}
          {button.label}
        </button>
      ))}
      <div className="flex gap-3 w-full justify-end">
        <MonthSelector
          selectedMonth={selectedMonth}
          onChange={(month) => setSelectedMonth(Number(month))}
        />
        <YearSelector
          selectedYear={selectedYear}
          onChange={(year) => setSelectedYear(year)}
        />
      </div>
    </div>
  </nav>
);
// Componente Selector de Mes
const MonthSelector: React.FC<{
  selectedMonth: number;
  onChange: (month: string) => void;
}> = ({ selectedMonth, onChange }) => {
  const months = [
    { value: 1, month: "Enero" },
    { value: 2, month: "Febrero" },
    { value: 3, month: "Marzo" },
    { value: 4, month: "Abril" },
    { value: 5, month: "Mayo" },
    { value: 6, month: "Junio" },
    { value: 7, month: "Julio" },
    { value: 8, month: "Agosto" },
    { value: 9, month: "Septiembre" },
    { value: 10, month: "Octubre" },
    { value: 11, month: "Noviembre" },
    { value: 12, month: "Diciembre" },
  ];

  return (
    <div className="relative">
      <select
        value={selectedMonth}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {months.map((month) => (
          <option key={month.month} value={month.value}>
            {month.month}
          </option>
        ))}
      </select>
    </div>
  );
};
// Componente Selector de Año
const YearSelector: React.FC<{
  selectedYear: number;
  onChange: (year: number) => void;
}> = ({ selectedYear, onChange }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="relative">
      <select
        value={selectedYear}
        onChange={(e) => onChange(Number(e.target.value))}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};
const GraphContainer = ({
  selectedMonth,
  selectedYear,
}: {
  selectedMonth: number;
  selectedYear: number;
}) => {
  const { authState } = useUser();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchMonthlyStats = async () => {
      try {
        const response = await fetch(
          `${URL}/v1/mia/stats/year?year=${selectedYear}&id_user=${authState?.user?.id}`,
          {
            method: "GET",
            headers: HEADERS_API,
          }
        );
        const json = await response.json();
        console.log(json);
        setData(json);
      } catch (error) {
        console.error("Error al obtener estadísticas mensuales:", error);
      }
    };

    fetchMonthlyStats();
  }, [selectedMonth, selectedYear, authState?.user?.id]);

  let summary = [
    {
      name: "Gastos",
      data: data
        .filter((obj) => obj.mes.includes(`${selectedMonth}`))
        .map((obj, index) => ({
          name: obj.hotel,
          amount: Number(obj.total_gastado),
          color: `bg-cyan-${index + 1}00`,
        })),
    },
  ];
  let summary1 = [
    {
      name: "Noches",
      data: data
        .filter((obj) => obj.mes.includes(`${selectedMonth}`))
        .map((obj, index) => ({
          name: obj.hotel,
          amount: obj.visitas,
          color: `bg-cyan-${index + 1}00`,
        })),
    },
  ];

  console.log(summary);

  return (
    <div className="col-span-4 flex gap-4">
      {data.length > 0 && (
        <Donut
          summary={summary}
          titulo="Grafica por gasto"
          subtitulo="Aqui veras cuanto es tu gasto por mes"
          simbol="$"
        ></Donut>
      )}
      {data.length > 0 && (
        <Donut
          summary={summary1}
          titulo="Grafica por noches"
          subtitulo="Aqui veras cuantas noches por mes reservaron"
        ></Donut>
      )}
    </div>
  );
};

const DashboardGrid: React.FC<{
  id_user: string;
  selectedMonth: number;
  selectedYear: number;
}> = ({ id_user, selectedMonth, selectedYear }) => {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);

  const fechaHoy = new Date();
  fechaHoy.setHours(0, 0, 0, 0);

  const cards = [
    {
      title: "Reservas Pasadas",
      value:
        monthlyStats.filter((obj) => new Date(obj.check_out) < fechaHoy)
          .length || "0",
      icon: Clock,
    },
    {
      title: "Reservas Activas",
      value:
        monthlyStats.filter(
          (obj) =>
            new Date(obj.check_in) <= fechaHoy &&
            new Date(obj.check_out) > fechaHoy
        ).length || "0",
      icon: Calendar,
    },
    {
      title: "Proximas Reservas",
      value:
        monthlyStats.filter((obj) => new Date(obj.check_in) > fechaHoy)
          .length || "0",
      icon: Building,
    },
    {
      title: "Gasto Mensual",
      value: `$${(
        monthlyStats.reduce(
          (accumulator, currentValue) =>
            accumulator + Number(currentValue.total),
          0
        ) || 0
      ).toLocaleString("es-MX")}`,
      icon: DollarSign,
    },
  ];

  useEffect(() => {
    const fetchMonthlyStats = async () => {
      try {
        const response = await fetch(
          `${URL}/v1/mia/stats/monthly?month=${selectedMonth}&year=${selectedYear}&id_user=${id_user}`,
          {
            method: "GET",
            headers: HEADERS_API,
          }
        );
        const json = await response.json();
        setMonthlyStats(json.data);
      } catch (error) {
        console.error("Error al obtener estadísticas mensuales:", error);
      }
    };

    fetchMonthlyStats();
  }, [selectedMonth, selectedYear, id_user]);

  return (
    <div className="flex-1 p-6">
      {/* Sección de Estadísticas Mensuales */}
      <div className="mb-8">
        {cards && (
          <SectionStats title="Resumen Mensual" subtitle="Estadísticas por mes">
            {cards.map((card) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                icon={card.icon}
                subtitle="Este mes"
              />
            ))}
          </SectionStats>
        )}
        <SectionStats title="Resumen Anual" subtitle="Estadísticas por año">
          <GraphContainer
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          ></GraphContainer>
        </SectionStats>
      </div>
    </div>
  );
};

const SectionStats: React.FC<{
  title: string;
  subtitle: string;
  children: ReactNode;
}> = ({ title, subtitle, children }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {children}
      </div>
    </div>
  );
};

// Componente Principal de la Aplicación
export function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { authState } = useUser();
  // const [selectedDashboard, setSelectedDashboard] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col">
        <Navigation
          buttons={navButtons}
          // selectedDashboard={selectedDashboard}
          // onSelect={setSelectedDashboard}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />
        {authState?.user ? (
          <DashboardGrid
            id_user={authState.user.id}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        ) : (
          <p>Usuario no encontrado</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

interface MonthlyStats {
  id_solicitud: string;
  id_servicio: string;
  confirmation_code: string;
  id_viajero: string;
  hotel: string;
  check_in: string;
  check_out: string;
  room: string;
  total: number;
  status: string;
  id_usuario_generador: string;
}

interface NavButton {
  id: number;
  label: string;
  icon?: typeof Building;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: typeof Building;
  subtitle?: string;
}

// Constantes
const navButtons: NavButton[] = [
  { id: 0, label: "Panel", icon: BarChart },
  { id: 1, label: "Proximamente...", icon: Clock },
];
