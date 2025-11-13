import { useState } from "react";
import {
  ExternalLink,
  Image,
  Play,
  Video,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Product } from "../lib/api";
import { useGenerateVideoMutation, useVideoStatusQuery } from "../lib/queries";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const [showVideoStatus, setShowVideoStatus] = useState(false);

  const generateVideoMutation = useGenerateVideoMutation();

  // Only query video status if we're showing it or if video is processing
  const { data: videoStatus, isLoading: statusLoading } = useVideoStatusQuery(
    product.id,
    showVideoStatus || product.videoStatus === "processing"
  );

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

  const handleGenerateVideo = async () => {
    try {
      await generateVideoMutation.mutateAsync(product.id);
      setShowVideoStatus(true);
    } catch (error) {
      console.error("Failed to generate video:", error);
    }
  };

  const getVideoStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "finish":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Video className="w-4 h-4" />;
    }
  };

  const getVideoStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "finish":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Use the most recent status (from query or product data)
  const currentVideoStatus = videoStatus?.videoStatus || product.videoStatus;
  const currentVideoUrl = videoStatus?.videoUrl || product.videoUrl;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Product Image */}
      {product.images && product.images.length > 0 && (
        <div className="aspect-w-16 aspect-h-12 bg-gray-100 relative">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.nextElementSibling?.classList.remove("hidden");
            }}
          />
          {/* Fallback for broken images */}
          <div className="hidden w-full h-48 bg-gray-100 items-center justify-center">
            <Image className="w-12 h-12 text-gray-400" />
          </div>

          {/* Video Status Overlay */}
          {(currentVideoStatus !== "unavailable" || showVideoStatus) && (
            <div className="absolute top-2 right-2">
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${getVideoStatusColor(
                  currentVideoStatus
                )}`}
              >
                {getVideoStatusIcon(currentVideoStatus)}
                <span className="capitalize">
                  {currentVideoStatus === "finish"
                    ? "Video Ready"
                    : currentVideoStatus}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {product.description}
        </p>

        {/* Additional Images */}
        {product.images.length > 1 && (
          <div className="flex gap-1 mb-3 overflow-x-auto">
            {product.images.slice(1, 4).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.title} ${index + 2}`}
                className="w-12 h-12 object-cover rounded border shrink-0"
              />
            ))}
            {product.images.length > 4 && (
              <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500 shrink-0">
                +{product.images.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Video Section */}
        {(currentVideoStatus !== "unavailable" || showVideoStatus) && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getVideoStatusIcon(currentVideoStatus)}
                <span className="text-sm font-medium">Video Status</span>
              </div>
              <span className="text-xs text-gray-500 capitalize">
                {currentVideoStatus}
              </span>
            </div>

            {statusLoading && (
              <p className="text-xs text-gray-500">Checking status...</p>
            )}

            {currentVideoStatus === "finish" && currentVideoUrl && (
              <div className="mt-2">
                <a
                  href={currentVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  <Play className="w-4 h-4" />
                  Watch Video
                </a>
              </div>
            )}

            {currentVideoStatus === "error" && (
              <div className="mt-2">
                <p className="text-xs text-red-600 mb-2">
                  Video generation failed
                </p>
                <button
                  onClick={handleGenerateVideo}
                  disabled={generateVideoMutation.isPending}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  {generateVideoMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                  Retry Generate
                </button>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {formatTime(product.createdAt)}
          </span>

          <div className="flex items-center gap-2">
            {/* Generate Video Button */}
            {currentVideoStatus === "unavailable" && !showVideoStatus && (
              <button
                onClick={handleGenerateVideo}
                disabled={generateVideoMutation.isPending}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-xs font-medium"
                title="Generate AI Video"
              >
                {generateVideoMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Video className="w-3 h-3" />
                )}
                Generate Video
              </button>
            )}

            {/* View Product Link */}
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
