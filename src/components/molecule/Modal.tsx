import React, { ReactNode, useEffect } from "react";

interface ModalProps {
  onClose: () => void;
  title?: string;
  children: ReactNode;
  subtitle?: string;
  open: boolean;
  icon?: React.ElementType;
}

const Modal: React.FC<ModalProps> = ({
  onClose,
  title,
  children,
  subtitle,
  open,
  icon: Icon,
}) => {
  useEffect(() => {
    bodyClass.add();
    return () => {
      bodyClass.remove();
    };
  }, []);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          ></div>
          <div
            className="relative bg-white rounded-lg overflow-hidden shadow-xl transform transition-all w-fit max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-2 top-2 p-2 text-lg font-bold"
              aria-label="Cerrar"
              onClick={onClose}
            >
              ×
            </button>
            <div className="p-6 space-y-2">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
                {Icon && (
                  <div className="w-12 h-12 bg-gradient-to-r from-sky-100 to-sky-200 rounded-full flex items-center justify-center">
                    <Icon className=" w-6 h-6" />
                  </div>
                )}
                <div className="">
                  {title && (
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-sm text-gray-500">{subtitle}</p>
                  )}
                </div>
              </div>
              <div className="w-full overflow-y-auto relative max-h-[70vh]">
                {children}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;

const bodyClass = {
  add: () => document.body.classList.add("modal-open-no-scroll"),
  remove: () => document.body.classList.remove("modal-open-no-scroll"),
};
