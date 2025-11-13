import { useState } from "react";
import {
  Trash2,
  CheckCircle2,
  AlertCircle,
  Package,
  RotateCcw,
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { useDomainsQuery, useDeleteDomainMutation } from "../lib/queries";

interface SubmittedUrlsListProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

function SubmittedUrlsList({ onSuccess, onError }: SubmittedUrlsListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const {
    data: domains = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useDomainsQuery();
  const deleteDomainMutation = useDeleteDomainMutation();

  const handleRefresh = async () => {
    try {
      await refetch();
      onSuccess("Status refreshed!");
    } catch (error) {
      onError("Failed to refresh");
    }
  };

  const handleDelete = async (id: number) => {
    const deletedDomain = domains.find((domain) => domain.id === id);
    try {
      await deleteDomainMutation.mutateAsync(id);
      setDeleteConfirm(null);
      onSuccess(`Deleted: ${deletedDomain?.url}`);
    } catch (error) {
      onError("Failed to delete URL");
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
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg p-8 text-center border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load URLs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
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

      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Submitted URLs
          </h2>
          <button
            onClick={handleRefresh}
            disabled={isRefetching}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm hover:shadow-md"
            title="Refresh status"
          >
            <RotateCcw
              className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            {isRefetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

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

                  <div className="flex items-center gap-2">
                    {domain.status === "complete" && (
                      <RouterLink
                        to={`/products/${domain.id}`}
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                        title="View Products"
                      >
                        <Package className="w-4 h-4" />
                      </RouterLink>
                    )}

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
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SubmittedUrlsList;
