import { MiaLogoIcon } from "../../lib/icons";
import { NavigationLink } from "../atom/NavigationLink";
import { useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  User2,
  Settings,
  LogOut,
  BookOpen,
  BarChart,
  ShoppingCart,
  Headphones,
  Plus,
} from "lucide-react";
import { AuthModal } from "../AuthModal";
import ROUTES from "../../constants/routes";
import Button from "../atom/Button";
import useAuth from "../../hooks/useAuth";
import { SupportModal } from "../SupportModal";
import { ProtectedComponent } from "../../middleware/ProtectedComponent";
import Modal from "../molecule/Modal";
import { Cart } from "../Cart";
import { useCart } from "../../context/cartContext";
import { formatNumberWithCommas } from "../../utils/format";
import useResize from "../../hooks/useResize";
import { useLocation } from "wouter";

export const NavigationBar = () => {
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const { user, handleLogout } = useAuth();

  const onSupportClick = () => {
    setIsSupportModalOpen(true);
  };

  return (
    <>
      <nav
        className={`${
          user ? "hidden md:block" : ""
        } bg-gradient-to-br from-blue-100 to-blue-200  shadow-lg fixed w-full top-0 z-50`}
      >
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
              {user && (
                <AuthLinks
                  handleLogout={handleLogout}
                  onSupportClick={onSupportClick}
                  onCart={() => setOpenCart(true)}
                />
              )}
            </div>
          </div>
        </div>
      </nav>
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {user && (
        <>
          <Modal
            open={openCart}
            onClose={() => {
              setOpenCart(false);
            }}
            icon={ShoppingCart}
            title="Carrito"
            subtitle="Selecciona los items que deseas pagar"
          >
            <div className="w-[90vw] lg:max-w-4xl h-[calc(100vh-11rem)]">
              <Cart></Cart>
            </div>
          </Modal>
          <div className="md:hidden bg-white shadow-2xl squad-t-lg border-t border-gray-100 fixed bottom-0 z-50 w-full">
            <AuthLinks
              onCart={() => setOpenCart(true)}
              handleLogout={handleLogout}
              onSupportClick={onSupportClick}
            />
          </div>
        </>
      )}
    </>
  );
};

interface AuthLinksProps {
  handleLogout: () => void;
  onSupportClick: () => void;
  onCart: () => void;
}

export const AuthLinks: React.FC<AuthLinksProps> = ({
  handleLogout,
  onSupportClick,
  onCart,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [_, setLocation] = useLocation();
  const { totalCart } = useCart();
  const { setSize } = useResize();

  return (
    <>
      <div className="relative flex flex-col md:flex-row">
        <div>
          <UserDropdown
            handleLogout={handleLogout}
            setIsDropdownOpen={setIsDropdownOpen}
            isDropdownOpen={isDropdownOpen}
          />
        </div>
        <div className=" p-1 md:p-3 flex justify-around gap-4">
          <Button
            variant="ghost"
            className="w-full text-gray-700"
            size={
              setSize([
                { size: "base", obj: "squad" },
                { size: "sm", obj: "md" },
              ]) as unknown as "squad" | "md"
            }
            icon={MessageSquare}
            onClick={() => {
              setLocation(ROUTES.MIA.HOME);
            }}
          >
            MIA
          </Button>
          <Button
            size={
              setSize([
                { size: "base", obj: "squad" },
                { size: "sm", obj: "md" },
              ]) as unknown as "squad" | "md"
            }
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            variant="ghost"
            className="w-full flex items-center space-x-2 text-gray-800 md:order-5"
            icon={User2}
          >
            Mi cuenta
          </Button>
          <Button
            variant="primary"
            className="text-gray-700"
            size={
              setSize([
                { size: "base", obj: "squad" },
                { size: "sm", obj: "md" },
              ]) as unknown as "squad" | "md"
            }
            icon={Plus}
            onClick={() => {
              setLocation(ROUTES.HOTELS.SEARCH);
            }}
          >
            Reservar
          </Button>
          <Button
            variant="ghost"
            size={
              setSize([
                { size: "base", obj: "squad" },
                { size: "sm", obj: "md" },
              ]) as unknown as "squad" | "md"
            }
            onClick={onSupportClick}
            icon={Headphones}
            className="w-full text-gray-700"
          >
            Soporte
          </Button>
          <Button
            variant="ghost"
            size={
              setSize([
                { size: "base", obj: "squad" },
                { size: "sm", obj: "md" },
              ]) as unknown as "squad" | "md"
            }
            icon={ShoppingCart}
            className="w-full text-gray-700"
            onClick={onCart}
          >
            {formatNumberWithCommas(totalCart)}
          </Button>
        </div>
      </div>
    </>
  );
};

interface UserDropdownProps {
  handleLogout: () => void;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDropdownOpen: boolean;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  handleLogout,
  setIsDropdownOpen,
  isDropdownOpen,
}) => {
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
    <>
      {isDropdownOpen && (
        <div
          ref={groupRef}
          className="absolute w-full right-0 h-fit bottom-[100%] md:top-[80%] mt-2 md:w-40 bg-white squad-lg shadow-lg py-1 z-[90] border border-gray-100"
        >
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
              className="!justify-start !items-start text-gray-700"
              onClick={handleClose}
            >
              Mi Perfil
            </NavigationLink>
            <NavigationLink
              href={ROUTES.CONSULTAS.HOME}
              icon={BookOpen}
              className="!justify-start !items-start text-gray-700"
              onClick={handleClose}
            >
              Consultas
            </NavigationLink>
            <NavigationLink
              href={ROUTES.SETTINGS}
              icon={Settings}
              className="!justify-start !items-start text-gray-700"
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
    </>
  );
};
