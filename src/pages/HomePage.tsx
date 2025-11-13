import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useDomainsQuery } from "../lib/queries";
import UrlSubmissionForm from "../components/UrlSubmissionForm";
import SubmittedUrlsList from "../components/SubmittedUrlsList";
import ToastContainer, { Toast } from "../components/ToastContainer";

function HomePage() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // React Query hooks
  const { error } = useDomainsQuery();

  const addToast = (message: string, type: "success" | "error") => {
    const toastId = Date.now().toString();
    setToasts((prev) => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-600 mb-4">
            Failed to connect to the server. Please make sure the backend is
            running.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <UrlSubmissionForm
            onSuccess={(message) => addToast(message, "success")}
            onError={(message) => addToast(message, "error")}
          />

          <SubmittedUrlsList
            onSuccess={(message) => addToast(message, "success")}
            onError={(message) => addToast(message, "error")}
          />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
