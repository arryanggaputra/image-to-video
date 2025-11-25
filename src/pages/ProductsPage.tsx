import { useQuery } from "@tanstack/react-query";
import { Package, Calendar, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../lib/api";
import ProductCard from "../components/ProductCard";

function ProductsPage() {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();

  const {
    data: domainData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["domain-with-products", domainId],
    queryFn: () => apiClient.getDomainWithProducts(Number(domainId)),
    enabled: !!domainId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Package className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Loading Products...
          </h2>
          <p className="text-gray-600">Fetching scraped product data</p>
        </div>
      </div>
    );
  }

  if (error || !domainData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Package className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Products
          </h2>
          <p className="text-gray-600 mb-4">
            Failed to load products for this domain
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return (
      dateObj.toLocaleDateString() +
      " " +
      dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
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

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/")}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-xl">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Scraped Products
              </h1>
              <p className="text-gray-600 break-all">{domainData.url}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                  domainData.status
                )}`}
              >
                <span className="capitalize">{domainData.status}</span>
              </div>
              <div className="text-sm text-gray-600">
                <Calendar className="w-4 h-4 inline mr-1" />
                {formatTime(domainData.createdAt)}
              </div>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {domainData.productCount} Products Found
            </div>
          </div>
        </div>

        {/* Products List */}
        {domainData.products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No Products Found
            </h2>
            <p className="text-gray-600">
              No products were scraped from this domain yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {domainData.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
