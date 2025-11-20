import { useState } from "react";
import {
  ExternalLink,
  Image,
  Play,
  Video,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  Upload,
} from "lucide-react";
import { Product } from "../lib/api";
import {
  useGenerateVideoMutation,
  useVideoStatusQuery,
  useDeleteProductMutation,
  usePublishToDailymotionMutation,
  useDailymotionStatusQuery,
} from "../lib/queries";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const [showVideoStatus, setShowVideoStatus] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDailymotionStatus, setShowDailymotionStatus] = useState(false);

  const generateVideoMutation = useGenerateVideoMutation();
  const deleteProductMutation = useDeleteProductMutation();
  const publishToDailymotionMutation = usePublishToDailymotionMutation();

  // Only query video status if we're showing it or if video is processing
  const { data: videoStatus, isLoading: statusLoading } = useVideoStatusQuery(
    product.id,
    showVideoStatus || product.videoStatus === "processing"
  );

  // Query Dailymotion status if needed
  const { data: dailymotionStatus, isLoading: dailymotionStatusLoading } =
    useDailymotionStatusQuery(
      product.id,
      showDailymotionStatus || product.dailymotionStatus === "publishing"
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

  const handleDeleteProduct = async () => {
    try {
      await deleteProductMutation.mutateAsync(product.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handlePublishToDailymotion = async () => {
    try {
      await publishToDailymotionMutation.mutateAsync(product.id);
      setShowDailymotionStatus(true);
    } catch (error) {
      console.error("Failed to publish to Dailymotion:", error);
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

  const getDailymotionStatusIcon = (status: string) => {
    switch (status) {
      case "publishing":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "published":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Upload className="w-4 h-4" />;
    }
  };

  // Use the most recent status (from query or product data)
  const currentVideoStatus = videoStatus?.videoStatus || product.videoStatus;
  const currentVideoUrl = videoStatus?.videoUrl || product.videoUrl;
  const currentDailymotionStatus =
    dailymotionStatus?.dailymotionStatus || product.dailymotionStatus;
  const currentDailymotionUrl =
    dailymotionStatus?.dailymotionUrl || product.dailymotionUrl;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Product Image - Left Side */}
        {product.images && product.images.length > 0 && (
          <div className="w-48 h-48 bg-gray-100 relative flex items-center justify-center shrink-0">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.nextElementSibling?.classList.remove("hidden");
              }}
            />
            {/* Fallback for broken images */}
            <div className="hidden w-full h-full bg-gray-100 items-center justify-center">
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

        {/* Product Info - Right Side */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
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
                  <div
                    key={index}
                    className="w-12 h-12 bg-gray-50 rounded border shrink-0 flex items-center justify-center overflow-hidden"
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 2}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
                {product.images.length > 4 && (
                  <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500 shrink-0">
                    +{product.images.length - 4}
                  </div>
                )}
              </div>
            )}

            {/* Video Section */}
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

              {/* Tombol utama dinamis */}
              <div className="mt-2">
                {currentVideoStatus === "finish" && currentVideoUrl && (
                  <a
                    href={currentVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    <Play className="w-4 h-4" />
                    Watch Video
                  </a>
                )}

                {currentVideoStatus === "processing" && (
                  <button
                    disabled
                    className="flex w-full items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Video...
                  </button>
                )}

                {currentVideoStatus === "error" && (
                  <button
                    onClick={handleGenerateVideo}
                    disabled={generateVideoMutation.isPending}
                    className="flex w-full items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {generateVideoMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Video className="w-4 h-4" />
                    )}
                    Retry Generate
                  </button>
                )}

                {(currentVideoStatus === "unavailable" ||
                  !currentVideoStatus) && (
                  <button
                    onClick={handleGenerateVideo}
                    disabled={generateVideoMutation.isPending}
                    className="flex w-full items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    {generateVideoMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Video className="w-4 h-4" />
                    )}
                    Generate Video
                  </button>
                )}
              </div>

              {statusLoading && (
                <p className="text-xs text-gray-500 mt-2">Checking status...</p>
              )}
            </div>

            {/* Dailymotion Section */}
            <div className="mb-3 p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getDailymotionStatusIcon(currentDailymotionStatus)}
                  <span className="text-sm font-medium">
                    Dailymotion Status
                  </span>
                </div>
                <span className="text-xs text-gray-500 capitalize">
                  {currentDailymotionStatus.replace("_", " ")}
                </span>
              </div>

              <div className="mt-2">
                {currentDailymotionStatus === "published" &&
                  currentDailymotionUrl && (
                    <a
                      href={currentDailymotionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                    >
                      <Play className="w-4 h-4" />
                      Watch on Dailymotion
                    </a>
                  )}

                {currentDailymotionStatus === "publishing" && (
                  <button
                    disabled
                    className="flex w-full items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing to Dailymotion...
                  </button>
                )}

                {currentDailymotionStatus === "error" && (
                  <button
                    onClick={handlePublishToDailymotion}
                    disabled={
                      publishToDailymotionMutation.isPending ||
                      currentVideoStatus !== "finish"
                    }
                    className="flex w-full items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {publishToDailymotionMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Retry Publish
                  </button>
                )}

                {currentDailymotionStatus === "not_published" && (
                  <button
                    onClick={handlePublishToDailymotion}
                    disabled={
                      publishToDailymotionMutation.isPending ||
                      currentVideoStatus !== "finish"
                    }
                    className="flex w-full items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors text-sm font-medium"
                    title={
                      currentVideoStatus !== "finish"
                        ? "Generate video first"
                        : "Publish to Dailymotion"
                    }
                  >
                    {publishToDailymotionMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Publish to Dailymotion
                  </button>
                )}
              </div>

              {dailymotionStatusLoading && (
                <p className="text-xs text-gray-500 mt-2">
                  Checking Dailymotion status...
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {formatTime(product.createdAt)}
            </span>
            <div className="flex items-center gap-2">
              {!showDeleteConfirm ? (
                <>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleteProductMutation.isPending}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View
                  </a>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleteProductMutation.isPending}
                    className="text-xs px-2 py-1 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProduct}
                    disabled={deleteProductMutation.isPending}
                    className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleteProductMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Confirm"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
