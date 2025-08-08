import React, { useState } from "react";
import {
  Menu,
  X,
  MessageSquare,
  FileText,
  User2,
  ChevronDown,
  Settings,
  LifeBuoy,
  LogOut,
  HelpCircle,
  BarChart,
  BookOpen,
} from "lucide-react";
import type { User } from "../types";
import { Link } from "wouter";

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

export const Navigation: React.FC<NavigationProps> = ({
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

  const renderAuthenticatedLinks = () => (
    <>
      {/* Main Navigation Items */}
      <div className="hidden md:flex items-center space-x-4">
        <button
          onClick={onChatClick}
          className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Habla con MIA</span>
        </button>
        <button
          onClick={onBookingsClick}
          className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>Reporte de Reservas</span>
        </button>

        {/* <a
          href="#"
          className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Mejora tu Viaje</span>
        </a> */}

        <button
          onClick={onSupportClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 space-x-2"
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Contactar a Soporte</span>
        </button>

        {/* User Dropdown */}
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

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100">
              <button
                onClick={() => {
                  onProfileClick();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <User2 className="w-4 h-4" />
                <span>Mi Perfil</span>
              </button>
              <button
                onClick={() => {
                  onAdminClick();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Consultas</span>
              </button>
              <Link
                href="/dashboard"
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <BarChart className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  onConfigurationClick();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => {
                  onLogout();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderUnauthenticatedLinks = () => (
    <>
      <button
        onClick={onChatClick}
        className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Habla con MIA</span>
      </button>
      <button
        onClick={onFAQClick}
        className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
      >
        <HelpCircle className="w-4 h-4" />
        <span>FAQ</span>
      </button>
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

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <a href="/">
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
            {user ? renderAuthenticatedLinks() : renderUnauthenticatedLinks()}
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
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <button
                  onClick={onChatClick}
                  className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Habla con MIA</span>
                </button>
                <button
                  onClick={onBookingsClick}
                  className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Reporte de Reservas</span>
                </button>
                {/* <a
                  href="#"
                  className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Mejora tu Viaje</span>
                </a> */}
                <button
                  onClick={onSupportClick}
                  className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2"
                >
                  <LifeBuoy className="w-4 h-4" />
                  <span>Contactar a Soporte</span>
                </button>
                <button
                  onClick={onProfileClick}
                  className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2"
                >
                  <User2 className="w-4 h-4" />
                  <span>Mi Perfil</span>
                </button>
                <button
                  onClick={onConfigurationClick}
                  className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configuración</span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onChatClick}
                  className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Habla con MIA</span>
                </button>
                <button
                  onClick={onFAQClick}
                  className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>FAQ</span>
                </button>
                <button
                  onClick={onLogin}
                  className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={onRegister}
                  className="w-full text-left px-3 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Regístrate
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
