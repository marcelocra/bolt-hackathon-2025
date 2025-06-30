import React from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";

/**
 * Reusable confirmation modal component with customizable content and actions
 */

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  icon?: LucideIcon;
  iconClass?: string;
  iconBgClass?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "bg-blue-500 hover:bg-blue-600",
  icon: Icon,
  iconClass = "text-blue-400",
  iconBgClass = "bg-blue-500/20",
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700/50 shadow-2xl">
        <div className="text-center space-y-4">
          {Icon && (
            <div
              className={`w-12 h-12 ${iconBgClass} rounded-full flex items-center justify-center mx-auto`}
            >
              <Icon className={`w-6 h-6 ${iconClass}`} />
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{message}</p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 text-sm font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2 px-4 ${confirmButtonClass} text-white rounded-lg transition-all duration-200 text-sm font-medium`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
