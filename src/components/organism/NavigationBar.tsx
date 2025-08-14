import { MiaLogoIcon } from "../../lib/icons";
import { NavigationLink } from "../atom/NavigationLink";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  HelpCircle,
  MessageSquare,
  FileText,
  LifeBuoy,
  User2,
  Settings,
  LogOut,
  BookOpen,
  BarChart,
  ShoppingCart,
} from "lucide-react";
import type { User } from "../../types";
import { AuthModal } from "../AuthModal";
import ROUTES from "../../constants/routes";
import Button from "../atom/Button";
import useAuth from "../../hooks/useAuth";
import { SupportModal } from "../SupportModal";
import { SupabaseClient } from "../../services/supabaseClient";
import { ProtectedComponent } from "../../middleware/ProtectedComponent";
import Modal from "../molecule/Modal";
import { Cart } from "../Cart";
import { useCart } from "../../context/cartContext";

export const NavigationBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const { user, handleLogout } = useAuth();

  const onSupportClick = () => {
    setIsSupportModalOpen(true);
  };
  return (
    <>
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <a href="/">
                  <MiaLogoIcon />
                </a>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {user ? (
                <AuthLinks
                  user={user}
                  handleLogout={() => {
                    SupabaseClient.getInstance()
                      .logOut()
                      .then(() => {})
                      .catch((error) => console.log(error));
                  }}
                  onSupportClick={onSupportClick}
                  onCart={() => setOpenCart(true)}
                />
              ) : (
                <GuestLinks onLogin={() => setIsModalOpen(true)} />
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 "
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
            onCart={() => setOpenCart(true)}
            user={user ?? null}
            handleLogout={handleLogout}
            onSupportClick={onSupportClick}
            setIsModalOpen={setIsModalOpen}
          />
        )}
      </nav>
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Modal
        open={openCart}
        onClose={() => {
          setOpenCart(false);
        }}
        icon={ShoppingCart}
        title="Carrito"
      >
        <div className="w-[90vw] lg:max-w-4xl h-[calc(100vh-10rem)]">
          <Cart></Cart>
        </div>
      </Modal>
    </>
  );
};

interface MobileMenuProps {
  user: User | null;
  handleLogout: () => void;
  onSupportClick: () => void;
  setIsModalOpen: (value: boolean) => void;
  onCart: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  user,
  onCart,
  handleLogout,
  onSupportClick,
  setIsModalOpen,
}) => {
  return (
    <div className="md:hidden bg-white border-t border-gray-100">
      <div className="px-2 pt-2 pb-3 space-y-1">
        {user ? (
          <AuthLinks
            onCart={onCart}
            user={user}
            handleLogout={handleLogout}
            onSupportClick={onSupportClick}
          />
        ) : (
          <GuestLinks onLogin={() => setIsModalOpen(true)} />
        )}
      </div>
    </div>
  );
};

interface AuthLinksProps {
  user: User | null;
  handleLogout: () => void;
  onSupportClick: () => void;
  onCart: () => void;
}

export const AuthLinks: React.FC<AuthLinksProps> = ({
  user,
  handleLogout,
  onSupportClick,
  onCart,
}) => {
  const { totalCart } = useCart();
  return (
    <>
      <NavigationLink href={ROUTES.HOME} icon={MessageSquare}>
        Habla con MIA
      </NavigationLink>
      <NavigationLink href={ROUTES.BOOKINGS.HOME} icon={FileText}>
        Reporte de Reservas
      </NavigationLink>
      <Button onClick={onSupportClick} icon={LifeBuoy} className="w-full">
        Contactar a Soporte
      </Button>
      <UserDropdown user={user} handleLogout={handleLogout} />
      <Button
        variant="ghost"
        icon={ShoppingCart}
        className="w-full text-gray-700"
        onClick={onCart}
      >
        {totalCart}
      </Button>
    </>
  );
};

interface UserDropdownProps {
  user: User | null;
  handleLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, handleLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);
  const handleClose = () => {
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        groupRef.current &&
        !groupRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={groupRef}>
      <Button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        variant="ghost"
        className="flex items-center space-x-2 text-gray-800 w-full"
        icon={User2}
      >
        {user?.name || "Usuario"}
      </Button>

      {isDropdownOpen && (
        <div className="absolute w-full right-0 mt-2 md:w-40 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100">
          <ProtectedComponent
            admit={{
              administrador: true,
              reservante: true,
              viajero: false,
              consultor: true,
              "no-rol": false,
            }}
          >
            <NavigationLink
              href={ROUTES.PROFILE}
              icon={User2}
              className="!justify-start !items-start"
              onClick={handleClose}
            >
              Mi Perfil
            </NavigationLink>
            <NavigationLink
              href={ROUTES.CONSULTAS}
              icon={BookOpen}
              className="!justify-start !items-start"
              onClick={handleClose}
            >
              Consultas
            </NavigationLink>
            <NavigationLink
              href={ROUTES.DASHBOARD}
              icon={BarChart}
              className="!justify-start !items-start"
              onClick={handleClose}
            >
              Dashboard
            </NavigationLink>
            <NavigationLink
              href={ROUTES.SETTINGS}
              icon={Settings}
              className="!justify-start !items-start"
              onClick={handleClose}
            >
              Configuración
            </NavigationLink>
            <div className="border-t border-gray-100 my-1"></div>
          </ProtectedComponent>
          <Button
            variant="ghost"
            icon={LogOut}
            onClick={() => {
              handleClose();
              handleLogout();
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex space-x-2 hover:text-red-700 !justify-start !items-start"
          >
            Cerrar Sesión
          </Button>
        </div>
      )}
    </div>
  );
};

export const GuestLinks: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <>
    <NavigationLink href={ROUTES.HOME} icon={MessageSquare}>
      Habla con MIA
    </NavigationLink>
    <NavigationLink href={ROUTES.FAQ} icon={HelpCircle}>
      FAQ
    </NavigationLink>
    <Button onClick={onLogin} variant="secondary" className="w-full">
      Iniciar Sesión
    </Button>
    <NavigationLink variant="primary" href={ROUTES.AUTH.REGISTER}>
      Regístrate
    </NavigationLink>
  </>
);
