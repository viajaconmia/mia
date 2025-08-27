// src/components/NavContainerModal.tsx
"use client";

import { Suspense, useState } from "react";
import Button from "../atom/Button";
import { ScrollArea } from "../atom/scroll-area";
import {
  ArrowUpRight as ArrowIcon,
  CalendarDays as BookingsIcon,
  CreditCard as PaymentIcon,
  FileText as InvoicesIcon,
} from "lucide-react";
import Link from "next/link";

// Interfaces para las propiedades
interface Tab {
  title: string;
  tab: string;
  icon: React.ElementType;
  component?: React.ReactNode;
}

interface NavLink {
  href: string;
  title: string;
  icon: React.ElementType;
}

interface ClientLayoutProps {
  tabs?: Tab[];
  title?: string;
  defaultTab?: string;
  links?: NavLink[];
  children?: React.ReactNode;
}

// Datos de ejemplo para los tabs
const sampleTabs: Tab[] = [
  {
    title: "Reservas",
    tab: "bookings",
    icon: BookingsIcon,
    component: (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Detalles de Reservas</h2>
        <p className="text-gray-600">Aquí se muestran todas las reservas de tu cuenta.</p>
      </div>
    ),
  },
  {
    title: "Pagos",
    tab: "payments",
    icon: PaymentIcon,
    component: (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Historial de Pagos</h2>
        <p className="text-gray-600">Revisa tu historial de transacciones y pagos.</p>
      </div>
    ),
  },
  {
    title: "Facturas",
    tab: "invoices",
    icon: InvoicesIcon,
    component: (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Facturas Pendientes</h2>
        <p className="text-gray-600">Descarga o visualiza tus facturas de servicios.</p>
      </div>
    ),
  },
];

// Componente para el ícono de Mia (reemplazar con el componente real)
const MiaIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" fill="currentColor" />
  </svg>
);

export default function NavContainerModal({
  tabs = sampleTabs,
  title = "Detalles",
  links = [],
  children,
}: ClientLayoutProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [currentTab, setCurrentTab] = useState(tabs[0]?.tab || "");

  // Si el modal está cerrado, mostrar solo el botón para abrirlo
  if (!isModalOpen) {
    return (
      <Button onClick={() => setIsModalOpen(true)}>
        Abrir Detalles
      </Button>
    );
  }

  // Determinar si la barra lateral está expandida
  const isSidebarExpanded = isSidebarOpen || isSidebarHovered;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full h-[80vh] max-w-4xl rounded-xl overflow-hidden bg-white shadow-lg">
        {/* Botón de cerrar */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <ArrowIcon className="rotate-90" />
        </Button>

        <div className="flex h-full w-full min-w-[85vw]">
          {/* Sidebar */}
          <div
            className={`relative h-full bg-white/70 transition-all duration-300 ${isSidebarExpanded ? "w-52" : "w-16"
              }`}
          >
            {/* Botón para expandir/contraer sidebar */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute w-full right-0 top-0 z-40 h-12 flex justify-end pr-5 items-center"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <ArrowIcon
                className={`transition-transform ${isSidebarOpen ? "rotate-180" : ""
                  }`}
              />
            </Button>

            {/* Contenido del Sidebar */}
            <ScrollArea
              className="h-full py-6"
              onMouseOver={() => setIsSidebarHovered(true)}
              onMouseOut={() => setIsSidebarHovered(false)}
            >
              <div className="space-y-4">
                <div className="px-3 py-2">
                  <div className="space-y-1">
                    {/* Logo y título */}
                    <div className="flex gap-2 h-fit items-center mb-8 mt-4">
                      <MiaIcon />
                      {isSidebarExpanded && (
                        <h2 className="text-xl font-semibold transition-all">
                          {title}
                        </h2>
                      )}
                    </div>

                    {/* Navegación */}
                    <nav className="space-y-2">
                      {/* Enlaces */}
                      {links.map((item) => (
                        <Link
                          href={item.href}
                          key={item.href}
                          className="flex items-center justify-start w-full gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-blue-50 hover:text-blue-900"
                        >
                          <item.icon className="h-4 w-4" />
                          {isSidebarExpanded && (
                            <span className="whitespace-nowrap">{item.title}</span>
                          )}
                        </Link>
                      ))}

                      {/* Pestañas */}
                      {tabs.map((item) => (
                        <button
                          onClick={() => setCurrentTab(item.tab)}
                          key={item.tab}
                          className={`flex items-center justify-start w-full gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-blue-50 hover:text-blue-900 ${currentTab === item.tab
                            ? "bg-blue-100 text-blue-900"
                            : "text-gray-500"
                            }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {isSidebarExpanded && (
                            <span className="whitespace-nowrap">{item.title}</span>
                          )}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Contenido Principal */}
          <div className="flex-1 overflow-y-auto min-h-[600px] border-l">
            {children}

            {tabs.length > 0 && (
              <Suspense
                fallback={
                  <div className="p-6">
                    <h1>Cargando tu contenido...</h1>
                  </div>
                }
              >
                {tabs
                  .filter((item) => item.tab === currentTab)
                  .map((item) => (
                    <div className="h-[600px] overflow-y-auto" key={item.tab}>
                      {item.component}
                    </div>
                  ))}
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}