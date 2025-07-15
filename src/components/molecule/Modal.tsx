import React, { ReactNode, useEffect } from "react";

interface ModalProps {
  onClose: () => void;
  title?: string;
  children: ReactNode;
  subtitle?: string;
  open: boolean;
}

const Modal: React.FC<ModalProps> = ({
  onClose,
  title,
  children,
  subtitle,
  open,
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
            className="relative bg-white rounded-lg overflow-hidden shadow-xl transform transition-all w-[90vw] max-w-2xl"
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
            <div className="p-4 space-y-2">
              <div className="border-b border-gray-200 pb-4">
                {title && (
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-500">{subtitle}</p>
                )}
              </div>
              <div className="w-full overflow-y-auto relative">{children}</div>
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
