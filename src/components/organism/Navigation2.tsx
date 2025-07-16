import { useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  HelpCircle,
  MessageSquare,
  FileText,
  LifeBuoy,
  User2,
  Settings,
  LogOut,
  BookOpen,
  BarChart,
} from "lucide-react";
import type { User } from "../../types"; // Asegúrate de que la ruta sea correcta

interface NavigationProps {
  user: User | null;
  onLogout: () => void;
  onRegister: () => void;
  onLogin: () => void;
  onProfileClick: () => void;
  onChatClick: () => void;
  onBookingsClick: () => void;
  onFAQClick: () => void;
  onAdminClick: () => void;
  onConfigurationClick: () => void;
  onSupportClick: () => void;
}

export const Navigation2: React.FC<NavigationProps> = ({
  user,
  onLogout,
  onRegister,
  onLogin,
  onProfileClick,
  onChatClick,
  onBookingsClick,
  onFAQClick,
  onConfigurationClick,
  onAdminClick,
  onSupportClick,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <a href="/">
                {/* Your SVG Logo */}
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
              </a>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <AuthLinks
                user={user}
                isDropdownOpen={isDropdownOpen}
                setIsDropdownOpen={setIsDropdownOpen}
                onLogout={onLogout}
                onProfileClick={onProfileClick}
                onChatClick={onChatClick}
                onBookingsClick={onBookingsClick}
                onAdminClick={onAdminClick}
                onConfigurationClick={onConfigurationClick}
                onSupportClick={onSupportClick}
              />
            ) : (
              <GuestLinks
                onLogin={onLogin}
                onRegister={onRegister}
                onChatClick={onChatClick}
                onFAQClick={onFAQClick}
              />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <MobileMenu
          user={user}
          onLogout={onLogout}
          onRegister={onRegister}
          onLogin={onLogin}
          onProfileClick={onProfileClick}
          onChatClick={onChatClick}
          onBookingsClick={onBookingsClick}
          onFAQClick={onFAQClick}
          onConfigurationClick={onConfigurationClick}
          onSupportClick={onSupportClick}
          onMenuItemClick={() => setIsMenuOpen(false)} // Close menu on item click
        />
      )}
    </nav>
  );
};

interface MobileMenuProps {
  user: User | null;
  onLogout: () => void;
  onRegister: () => void;
  onLogin: () => void;
  onProfileClick: () => void;
  onChatClick: () => void;
  onBookingsClick: () => void;
  onFAQClick: () => void;
  onConfigurationClick: () => void;
  onSupportClick: () => void;
  onMenuItemClick: () => void; // To close the mobile menu
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  user,
  onLogout,
  onRegister,
  onLogin,
  onProfileClick,
  onChatClick,
  onBookingsClick,
  onFAQClick,
  onConfigurationClick,
  onSupportClick,
  onMenuItemClick,
}) => {
  return (
    <div className="md:hidden bg-white border-t border-gray-100">
      <div className="px-2 pt-2 pb-3 space-y-1">
        {user ? (
          <>
            <NavigationLink
              href="/chat"
              icon={MessageSquare}
              text="Habla con MIA"
              className="w-full text-left text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => {
                onChatClick();
                onMenuItemClick();
              }}
            />
            <NavigationLink
              href="/bookings"
              icon={FileText}
              text="Reporte de Reservas"
              className="w-full text-left text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => {
                onBookingsClick();
                onMenuItemClick();
              }}
            />
            <button
              onClick={() => {
                onSupportClick();
                onMenuItemClick();
              }}
              className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>Contactar a Soporte</span>
            </button>
            <button
              onClick={() => {
                onProfileClick();
                onMenuItemClick();
              }}
              className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2"
            >
              <User2 className="w-4 h-4" />
              <span>Mi Perfil</span>
            </button>
            <button
              onClick={() => {
                onConfigurationClick();
                onMenuItemClick();
              }}
              className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Configuración</span>
            </button>
            <button
              onClick={() => {
                onLogout();
                onMenuItemClick();
              }}
              className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </>
        ) : (
          <>
            <NavigationLink
              href="/chat"
              icon={MessageSquare}
              text="Habla con MIA"
              className="w-full text-left text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => {
                onChatClick();
                onMenuItemClick();
              }}
            />
            <NavigationLink
              href="/faq"
              icon={HelpCircle}
              text="FAQ"
              className="w-full text-left text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => {
                onFAQClick();
                onMenuItemClick();
              }}
            />
            <button
              onClick={() => {
                onLogin();
                onMenuItemClick();
              }}
              className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                onRegister();
                onMenuItemClick();
              }}
              className="w-full text-left px-3 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Regístrate
            </button>
          </>
        )}
      </div>
    </div>
  );
};

interface GuestLinksProps {
  onLogin: () => void;
  onRegister: () => void;
  onChatClick: () => void;
  onFAQClick: () => void;
}

export const GuestLinks: React.FC<GuestLinksProps> = ({
  onLogin,
  onRegister,
  onChatClick,
  onFAQClick,
}) => (
  <>
    <NavigationLink
      href="/chat"
      icon={MessageSquare}
      text="Habla con MIA"
      className="text-gray-700 hover:text-blue-500"
      onClick={onChatClick}
    />
    <NavigationLink
      href="/faq"
      icon={HelpCircle}
      text="FAQ"
      className="text-gray-700 hover:text-blue-500"
      onClick={onFAQClick}
    />
    <div className="flex items-center space-x-4">
      <button
        onClick={onLogin}
        className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
      >
        Iniciar Sesión
      </button>
      <button
        onClick={onRegister}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
      >
        Regístrate
      </button>
    </div>
  </>
);

interface AuthLinksProps {
  user: User | null;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  onProfileClick: () => void;
  onChatClick: () => void;
  onBookingsClick: () => void;
  onAdminClick: () => void;
  onConfigurationClick: () => void;
  onSupportClick: () => void;
}

export const AuthLinks: React.FC<AuthLinksProps> = ({
  user,
  isDropdownOpen,
  setIsDropdownOpen,
  onLogout,
  onProfileClick,
  onChatClick,
  onBookingsClick,
  onAdminClick,
  onConfigurationClick,
  onSupportClick,
}) => (
  <>
    <NavigationLink
      href="/chat"
      icon={MessageSquare}
      text="Habla con MIA"
      className="text-gray-700 hover:text-blue-500"
      onClick={onChatClick} // Keep original click handler for side effects if needed
    />
    <NavigationLink
      href="/bookings"
      icon={FileText}
      text="Reporte de Reservas"
      className="text-gray-700 hover:text-blue-500"
      onClick={onBookingsClick} // Keep original click handler for side effects if needed
    />
    <button
      onClick={onSupportClick}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 space-x-2"
    >
      <LifeBuoy className="w-4 h-4" />
      <span>Contactar a Soporte</span>
    </button>
    <UserDropdown
      user={user}
      isDropdownOpen={isDropdownOpen}
      setIsDropdownOpen={setIsDropdownOpen}
      onLogout={onLogout}
      onProfileClick={onProfileClick}
      onConfigurationClick={onConfigurationClick}
      onAdminClick={onAdminClick}
    />
  </>
);

interface UserDropdownProps {
  user: User | null;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  onProfileClick: () => void;
  onConfigurationClick: () => void;
  onAdminClick: () => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  user,
  isDropdownOpen,
  setIsDropdownOpen,
  onLogout,
  onProfileClick,
  onConfigurationClick,
  onAdminClick,
}) => {
  const handleItemClick = (action: () => void) => {
    action();
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <User2 className="w-4 h-4 text-blue-600" />
        </div>
        <span>{user?.name || "Usuario"}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isDropdownOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100">
          <button
            onClick={() => handleItemClick(onProfileClick)}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <User2 className="w-4 h-4" />
            <span>Mi Perfil</span>
          </button>
          <button
            onClick={() => handleItemClick(onAdminClick)}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Consultas</span>
          </button>
          <NavigationLink
            href="/dashboard"
            icon={BarChart}
            text="Dashboard"
            className="text-gray-700 hover:bg-gray-50 w-full text-left"
            onClick={() => setIsDropdownOpen(false)}
          />
          <button
            onClick={() => handleItemClick(onConfigurationClick)}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Configuración</span>
          </button>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={() => handleItemClick(onLogout)}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
};

import React from "react";
import { Link } from "wouter";

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
  <Link
    href={href}
    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${className}`}
    onClick={onClick}
  >
    <Icon className="w-4 h-4" />
    <span>{text}</span>
  </Link>
);
