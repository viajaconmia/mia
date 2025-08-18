import { X } from "lucide-react";
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
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          ></div>

          <div
            className="relative bg-white rounded-lg overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col max-w-[90vw] lg:max-w-6xl">
              <div className="flex items-center justify-between gap-2 border-b border-gray-200 p-4                ">
                <div className="flex items-center gap-2">
                  {Icon && (
                    <div className="w-12 h-12 bg-gradient-to-r from-sky-100 to-sky-200 rounded-full flex items-center justify-center">
                      <Icon className=" w-6 h-6" />
                    </div>
                  )}
                  <div>
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
                <button onClick={() => onClose()}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative max-h-[calc(100vh-10rem)] w-full">
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
