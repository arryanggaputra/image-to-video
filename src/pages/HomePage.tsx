import { useState } from "react";
import { Link, Trash2, CheckCircle2, AlertCircle, X } from "lucide-react";
import {
  useDomainsQuery,
  useCreateDomainMutation,
  useDeleteDomainMutation,
} from "../lib/queries";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

function HomePage() {
  const [url, setUrl] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // React Query hooks
  const { data: domains = [], isLoading, error } = useDomainsQuery();
  const createDomainMutation = useCreateDomainMutation();
  const deleteDomainMutation = useDeleteDomainMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      try {
        await createDomainMutation.mutateAsync({
          url: url.trim(),
          status: "pending",
        });
        setUrl("");
        addToast("URL submitted successfully!", "success");
      } catch (error) {
        addToast("Failed to submit URL", "error");
      }
    }
  };

  const addToast = (message: string, type: "success" | "error") => {
    const toastId = Date.now().toString();
    setToasts((prev) => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 3000);
  };

  const handleDelete = async (id: number) => {
    const deletedDomain = domains.find((domain) => domain.id === id);
    try {
      await deleteDomainMutation.mutateAsync(id);
      setDeleteConfirm(null);
      addToast(`Deleted: ${deletedDomain?.url}`, "success");
    } catch (error) {
      addToast("Failed to delete URL", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-100 text-green-800";
      case "generating":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="w-4 h-4" />;
      case "error":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
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
      {deleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full z-50 animate-in fade-in zoom-in duration-200">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Delete URL?
            </h2>
            <p className="text-gray-600 mb-6 text-sm break-all">
              {domains.find((domain) => domain.id === deleteConfirm)?.url}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteDomainMutation.isPending}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                {deleteDomainMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </>
      )}

      {toasts.length > 0 && (
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
                onClick={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                }
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl mb-6 mx-auto">
            <Link className="w-6 h-6 text-white" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
            Submit URLs
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Add a URL to the list and track its processing status
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                disabled={createDomainMutation.isPending}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={createDomainMutation.isPending}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              {createDomainMutation.isPending ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Submitted URLs
          </h2>

          {isLoading ? (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-500">Loading URLs...</p>
            </div>
          ) : domains.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-500">No URLs submitted yet</p>
            </div>
          ) : (
            domains.map((domain) => (
              <div
                key={domain.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 mb-2">
                      <a
                        href={domain.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {domain.url}
                      </a>
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(domain.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(
                        domain.status
                      )}`}
                    >
                      {getStatusIcon(domain.status)}
                      <span className="capitalize">{domain.status}</span>
                    </div>

                    <button
                      onClick={() => setDeleteConfirm(domain.id)}
                      disabled={deleteDomainMutation.isPending}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
