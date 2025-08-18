import { BillingOption, Invoice } from "../types";
import {
  Receipt,
  FileText,
  Calendar,
  Users,
  Building2,
  Layers,
  DollarSign,
  Percent,
  MoreHorizontal as CombineHorizontal,
  Building,
  Clock,
} from "lucide-react";

export const billingOptions: BillingOption[] = [
  // Basic Options
  {
    id: "purchase",
    title: "Facturación por compra",
    description: "Factura el monto total de la compra",
    icon: Receipt,
    allowsComments: false,
    category: "basic",
    disabled: false,
  },
  {
    id: "purchase_with_comments",
    title: "Facturación por compra con comentarios",
    description:
      "Próximamente - Factura el monto total con comentarios personalizados",
    icon: FileText,
    allowsComments: true,
    category: "basic",
    disabled: true,
  },
  {
    id: "reservation",
    title: "Facturación por reserva",
    description: "Próximamente - Factura el monto total de la reserva",
    icon: Calendar,
    allowsComments: false,
    category: "basic",
    disabled: true,
  },
  {
    id: "reservation_with_comments",
    title: "Facturación por reserva con comentarios",
    description:
      "Próximamente - Factura la reserva con comentarios personalizados",
    icon: FileText,
    allowsComments: true,
    category: "basic",
    disabled: true,
  },

  // Advanced Options
  {
    id: "partial_purchase",
    title: "Facturación por parcialidad",
    description: "Próximamente - Factura una parte del monto total",
    icon: DollarSign,
    allowsComments: false,
    category: "advanced",
    disabled: true,
  },
  {
    id: "partial_nights",
    title: "Facturación por noches",
    description: "Próximamente - Factura por noches específicas de la estancia",
    icon: Calendar,
    allowsComments: false,
    category: "advanced",
    disabled: true,
  },
  {
    id: "per_traveler",
    title: "Facturación por viajero",
    description: "Próximamente - Factura separada por cada viajero",
    icon: Users,
    allowsComments: false,
    category: "advanced",
    disabled: true,
  },
  {
    id: "per_service",
    title: "Facturación por servicio",
    description: "Próximamente - Factura separada por tipo de servicio",
    icon: Building2,
    allowsComments: false,
    category: "advanced",
    disabled: true,
  },
  {
    id: "custom_tax",
    title: "IVA personalizado",
    description: "Próximamente - Factura con IVA diferente al 16%",
    icon: Percent,
    allowsComments: false,
    category: "advanced",
    disabled: true,
  },

  // Combined Options
  {
    id: "combined_traveler_service",
    title: "Viajero + Servicio",
    description: "Próximamente - Combina facturación por viajero y servicio",
    icon: CombineHorizontal,
    allowsComments: false,
    category: "combined",
    disabled: true,
  },
  {
    id: "combined_provider",
    title: "Por proveedor",
    description: "Próximamente - Facturación combinada por proveedor",
    icon: Building,
    allowsComments: false,
    category: "combined",
    disabled: true,
  },
];
