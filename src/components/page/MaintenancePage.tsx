import { CalendarX, Mail, Megaphone, MessageSquare, Phone } from "lucide-react";
import { Logo } from "../atom/Logo";

// Mismos contactos que ya se usan en SupportModal.tsx / ErrorPage.tsx -- no inventar otros.
// Mensaje alineado al aviso oficial ya comunicado a los clientes.
export const MaintenancePage = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-blue-600 to-blue-800 px-4 text-center overflow-y-auto py-10">
      <Logo className="text-white w-20" />

      <div className="flex items-center gap-2 text-white">
        <Megaphone className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Aviso importante</h1>
      </div>

      <p className="max-w-md text-blue-50 text-lg">
        Por el momento, nuestros canales de{" "}
        <strong className="font-semibold">cotización y reservación</strong>{" "}
        se encuentran <strong className="font-semibold">suspendidos</strong>.
      </p>

      <div className="flex items-start gap-3 max-w-md bg-white/10 border border-white/20 rounded-xl p-4 text-left">
        <CalendarX className="w-6 h-6 text-white shrink-0 mt-0.5" />
        <p className="text-blue-50 text-sm">
          Durante este periodo, únicamente podremos dar seguimiento a las{" "}
          <strong className="font-semibold">
            reservas previamente realizadas
          </strong>
          .
        </p>
      </div>

      <p className="max-w-md text-blue-100 text-sm">
        Lamentamos los inconvenientes que esta situación pueda ocasionar y
        agradecemos su comprensión.
      </p>

      <div className="w-full max-w-sm space-y-3 bg-white rounded-xl p-4 shadow-lg">
        <a
          href="https://wa.me/5510445254"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center p-3 transition-colors border rounded-lg hover:bg-green-50 border-green-200 group text-left"
        >
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full shrink-0">
            <MessageSquare className="w-5 h-5 text-green-600" />
          </div>
          <div className="ml-4">
            <h4 className="text-sm font-medium text-gray-900">WhatsApp</h4>
            <p className="text-sm text-gray-500 group-hover:text-green-700">
              5510445254
            </p>
          </div>
        </a>

        <a
          href="mailto:support@noktos.zohodesk.com"
          className="flex items-center p-3 transition-colors border rounded-lg hover:bg-blue-50 border-blue-200 group text-left"
        >
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full shrink-0">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-4">
            <h4 className="text-sm font-medium text-gray-900">
              Correo Electrónico
            </h4>
            <p className="text-sm text-gray-500 group-hover:text-blue-700">
              support@noktos.zohodesk.com
            </p>
          </div>
        </a>

        <a
          href="tel:8006665867"
          className="flex items-center p-3 transition-colors border rounded-lg hover:bg-purple-50 border-purple-200 group text-left"
        >
          <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full shrink-0">
            <Phone className="w-5 h-5 text-purple-600" />
          </div>
          <div className="ml-4">
            <h4 className="text-sm font-medium text-gray-900">Teléfono</h4>
            <p className="text-sm text-gray-500 group-hover:text-purple-700">
              800 666 5867
            </p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default MaintenancePage;
