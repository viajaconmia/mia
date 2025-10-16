import React from "react";
import InteractiveElement from "./Button"; // Importa el átomo

interface NavigationLinkProps {
  href: string;
  icon?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void; // Optional click handler for side effects
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg" | "full" | "squad";
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({
  href,
  icon: Icon = undefined,
  children,
  className = "items-center text-gray-700",
  onClick,
  variant = "ghost",
  size = undefined,
}) => (
  <InteractiveElement
    as="link" // Siempre se renderiza como un enlace
    href={href}
    icon={Icon}
    className={` hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium flex  space-x-2 ${className}`}
    variant={variant}
    onClick={onClick}
    size={size}
  >
    {children}
  </InteractiveElement>
);
