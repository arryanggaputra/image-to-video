import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemoveToast: (id: string) => void;
}

function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button
            onClick={() => onRemoveToast(toast.id)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
export type { Toast };
