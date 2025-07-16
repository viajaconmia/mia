import React from "react";
import InteractiveElement from "./Button"; // Importa el átomo

interface NavigationLinkProps {
  href: string;
  icon: React.ElementType;
  text: string;
  className?: string;
  onClick?: () => void; // Optional click handler for side effects
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({
  href,
  icon: Icon,
  text,
  className,
  onClick,
}) => (
  <InteractiveElement
    as="link" // Siempre se renderiza como un enlace
    href={href}
    icon={Icon}
    className={`text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 ${className}`}
    variant="ghost" // Puedes definir una variante por defecto o pasarla
    onClick={onClick}
  >
    {text}
  </InteractiveElement>
);
