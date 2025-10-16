import { useEffect, useState } from "react";
import { NavigationLink } from "../atom/NavigationLink";
import ROUTES from "../../constants/routes";
import Button from "../atom/Button";
import { AuthModal } from "../AuthModal";
import useAuth from "../../hooks/useAuth";
import { Logo } from "../atom/Logo";
import { useLocation } from "wouter";

const Inicio = () => {
  const [_, setLocation] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setLocation(ROUTES.CONSULTAS.HOME);
    }
  }, [user]);

  return (
    <>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="grid md:grid-cols-2 gap-x-2 p-4 place-items-center h-full">
        <div className="relative z-10 text-white space-y-8 max-w-[90%]">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ¡Hola! Soy MIA!
            </h1>
            <h2 className=" text-2xl md:text-3xl font-semibold text-gray-50">
              Tu Agente de Inteligencia para Viajes Corporativos.
            </h2>
            <h3 className="text-sm md:text-base text-gray-200">
              Automatiza la gestión de tus viajes. Reserva vuelos, hoteles y
              autos en minutos con precisión y eficiencia impulsadas por la
              Inteligencia Artificial.
            </h3>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="secondary"
              className="w-full"
            >
              Iniciar Sesión
            </Button>
            <NavigationLink
              variant="primary"
              className="w-full"
              href={ROUTES.AUTH.REGISTER}
            >
              Regístrate
            </NavigationLink>
          </div>
        </div>
        <Logo className="text-white w-[80%] max-w-96 self-start md:self-center"></Logo>
      </div>
      {/* <div className="fixed bottom-10 right-10 flex flex-row items-center gap-x-3 text-md text-gray-50">
        MIA Ahora en WhatsApp!
        <a
          href="https://wa.me/525510445254?text=Hola,%20necesito%20que%20me%20ayudes%20a%20realizar%20una%20reserva"
          target="_blank"
          className="bg-green-600 p-2 w-12 h-12 justify-center items-center flex rounded-full"
        >
          <Phone />
        </a>
      </div> */}
    </>
  );
};

export default Inicio;
