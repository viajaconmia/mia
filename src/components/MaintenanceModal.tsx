import React from "react";
import { X, CalendarX, Mail, Megaphone, MessageSquare, Phone } from "lucide-react";

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Modal de mantenimiento alineado al aviso oficial ya comunicado a los clientes.
// Mismos contactos de soporte usados en MaintenancePage / SupportModal / ErrorPage.
export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-900/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="relative inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-2xl shadow-2xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10 p-1 rounded-full hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold">Aviso importante</h3>
            <p className="text-blue-100 text-sm mt-2">
              Por el momento, nuestros canales de{" "}
              <strong className="font-semibold text-white">cotización y reservación</strong>{" "}
              se encuentran <strong className="font-semibold text-white">suspendidos</strong>.
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-left">
              <CalendarX className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <p className="text-blue-900 text-xs sm:text-sm">
                Durante este periodo, únicamente podremos dar seguimiento a las{" "}
                <strong className="font-semibold">
                  reservas previamente realizadas
                </strong>
                .
              </p>
            </div>

            <p className="text-gray-500 text-xs text-center">
              Lamentamos los inconvenientes. Para cualquier consulta o seguimiento de reservas previas, puedes contactarnos:
            </p>

            <div className="space-y-2.5">
              <a
                href="https://wa.me/5510445254"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 transition-colors border rounded-lg hover:bg-green-50 border-green-200 group text-left"
              >
                <div className="flex items-center justify-center w-9 h-9 bg-green-100 rounded-full shrink-0">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                </div>
                <div className="ml-3">
                  <h4 className="text-xs font-medium text-gray-900">WhatsApp</h4>
                  <p className="text-xs text-gray-500 group-hover:text-green-700 font-semibold">
                    5510445254
                  </p>
                </div>
              </a>

              <a
                href="mailto:support@noktos.zohodesk.com"
                className="flex items-center p-3 transition-colors border rounded-lg hover:bg-blue-50 border-blue-200 group text-left"
              >
                <div className="flex items-center justify-center w-9 h-9 bg-blue-100 rounded-full shrink-0">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h4 className="text-xs font-medium text-gray-900">Correo Electrónico</h4>
                  <p className="text-xs text-gray-500 group-hover:text-blue-700 font-semibold">
                    support@noktos.zohodesk.com
                  </p>
                </div>
              </a>

              <a
                href="tel:8006665867"
                className="flex items-center p-3 transition-colors border rounded-lg hover:bg-purple-50 border-purple-200 group text-left"
              >
                <div className="flex items-center justify-center w-9 h-9 bg-purple-100 rounded-full shrink-0">
                  <Phone className="w-4 h-4 text-purple-600" />
                </div>
                <div className="ml-3">
                  <h4 className="text-xs font-medium text-gray-900">Teléfono</h4>
                  <p className="text-xs text-gray-500 group-hover:text-purple-700 font-semibold">
                    800 666 5867
                  </p>
                </div>
              </a>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceModal;
