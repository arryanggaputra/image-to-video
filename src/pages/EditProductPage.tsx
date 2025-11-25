import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Image as ImageIcon,
  Trash2,
  Plus,
  Save,
  X,
  ExternalLink,
  Edit3,
  Loader2,
} from "lucide-react";

interface UpdateProductData {
  title?: string;
  description?: string;
  images?: string[];
}

function EditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedImages, setEditedImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(
    null
  );
  const [editingImageUrl, setEditingImageUrl] = useState("");
  const [savingImageIndex, setSavingImageIndex] = useState<number | null>(null);

  // Fetch product data
  const {
    data: productResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }
      const result = await response.json();
      console.log("Product API response:", result); // Debug log
      return result;
    },
    enabled: !!productId,
  });

  // Extract product data from response
  const product = productResponse?.success
    ? productResponse.data
    : productResponse;

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (data: UpdateProductData) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update product");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["domain-with-products"] });
    },
  });

  // Initialize form data when product loads
  useEffect(() => {
    if (product) {
      console.log("Setting form data from product:", product); // Debug log
      setEditedTitle(product.title || "");
      setEditedDescription(product.description || "");
      setEditedImages(product.images || []);
    }
  }, [product]);

  // Debug: Log current form state
  useEffect(() => {
    console.log("Form state:", {
      editedTitle,
      editedDescription,
      editedImages,
      product: product,
    });
  }, [editedTitle, editedDescription, editedImages, product]);

  const handleRemoveImage = (index: number) => {
    setEditedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditImage = (index: number) => {
    setEditingImageIndex(index);
    setEditingImageUrl(editedImages[index]);
  };

  const handleSaveImageEdit = async () => {
    console.log("Attempting to save image edit:", {
      editingImageIndex,
      editingImageUrl,
      isValid: isValidImageUrl(editingImageUrl),
    });

    if (editingImageIndex !== null && isValidImageUrl(editingImageUrl)) {
      const newImages = [...editedImages];
      newImages[editingImageIndex] = editingImageUrl.trim();

      console.log("Updating images from:", editedImages);
      console.log("Updating images to:", newImages);

      // Update local state
      setEditedImages(newImages);

      // Save immediately to database
      setSavingImageIndex(editingImageIndex);
      try {
        await updateProductMutation.mutateAsync({
          title: editedTitle || product?.title,
          description: editedDescription || product?.description,
          images: newImages,
        });
        console.log("Image saved to database successfully");
      } catch (error) {
        console.error("Failed to save image to database:", error);
        // Revert local state on error
        setEditedImages(editedImages);
      } finally {
        setSavingImageIndex(null);
      }

      setEditingImageIndex(null);
      setEditingImageUrl("");
    } else {
      console.log("Save failed - invalid URL or no editing index");
    }
  };

  const handleCancelImageEdit = () => {
    setEditingImageIndex(null);
    setEditingImageUrl("");
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setEditedImages((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
      setIsAddingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateProductMutation.mutateAsync({
        title: editedTitle,
        description: editedDescription,
        images: editedImages,
      });
      navigate(-1); // Go back to previous page
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  const hasChanges = () => {
    if (!product) return false;
    return (
      editedTitle !== (product.title || "") ||
      editedDescription !== (product.description || "") ||
      JSON.stringify(editedImages) !== JSON.stringify(product.images || [])
    );
  };

  const isValidImageUrl = (url: string) => {
    if (!url || url.trim() === "") return false;
    try {
      const urlObj = new URL(url.trim());
      // Allow any URL with http or https protocol
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <ImageIcon className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Loading Product...
          </h2>
          <p className="text-gray-600">Fetching product data</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <ImageIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            Could not load product data for editing
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-xl">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Edit Product
              </h1>
              <p className="text-gray-600">
                Modify product information and images
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Original
              </a>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={!hasChanges() || updateProductMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {updateProductMutation.isPending
                ? "Saving..."
                : "Save All Changes"}
            </button>
            {hasChanges() && (
              <p className="text-xs text-gray-500 mt-2">
                Note: Image edits are saved automatically. This button saves
                title/description changes.
              </p>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Product Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                  {product?.title && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Original: "{product.title}")
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder={product?.title || "Enter product title..."}
                />
                {!editedTitle && product?.title && (
                  <button
                    type="button"
                    onClick={() => setEditedTitle(product.title || "")}
                    className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Use original title
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                  {product?.description && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Original: "{product.description.slice(0, 50)}...")
                    </span>
                  )}
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                  placeholder={
                    product?.description || "Enter product description..."
                  }
                />
                {!editedDescription && product?.description && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditedDescription(product.description || "")
                    }
                    className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Use original description
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Product Images ({editedImages.length})
              </h2>
              <button
                onClick={() => setIsAddingImage(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Image
              </button>
            </div>

            {/* Add New Image Form */}
            {isAddingImage && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="https://example.com/image.jpg"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddImage();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddImage}
                    disabled={!isValidImageUrl(newImageUrl)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingImage(false);
                      setNewImageUrl("");
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {newImageUrl && !isValidImageUrl(newImageUrl) && (
                  <p className="text-red-500 text-xs mt-1">
                    Please enter a valid image URL (jpg, png, gif, webp, svg)
                  </p>
                )}
              </div>
            )}

            {/* Images Grid */}
            {editedImages.length === 0 ? (
              <div className="space-y-4">
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Custom Images
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {product?.images && product.images.length > 0
                      ? "Using original product images. Add custom images to override."
                      : "Add some images to showcase this product"}
                  </p>
                </div>

                {/* Show original images as read-only when no custom images */}
                {product?.images && product.images.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">
                        Original Images ({product.images.length} images)
                      </h4>
                      <button
                        type="button"
                        onClick={() => setEditedImages([...product.images])}
                        className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        Use Original Images
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {product.images.map((imageUrl: string, index: number) => (
                        <div
                          key={index}
                          className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square opacity-75 border-2 border-dashed border-gray-300"
                        >
                          <img
                            src={imageUrl}
                            alt={`Original image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onLoad={() =>
                              console.log(
                                `Image ${index + 1} loaded:`,
                                imageUrl
                              )
                            }
                            onError={(e) => {
                              console.log(
                                `Image ${index + 1} failed to load:`,
                                imageUrl
                              );
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove(
                                "hidden"
                              );
                            }}
                          />
                          <div className="hidden w-full h-full bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                            <span className="text-xs text-gray-500 ml-2">
                              Failed to load
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
                            <p className="text-xs truncate">{imageUrl}</p>
                          </div>
                          <div className="absolute top-2 left-2">
                            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                              Original #{index + 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {editedImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
                  >
                    <img
                      src={imageUrl}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                    <div className="hidden w-full h-full bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <span className="text-xs text-gray-500 ml-2">
                        Invalid Image
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => handleEditImage(index)}
                        className="p-1.5 bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-blue-600 transition-all duration-200"
                        title="Edit image URL"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Image URL overlay or edit input */}
                    {editingImageIndex === index ? (
                      <div className="absolute bottom-0 left-0 right-0 bg-white p-2 border-t">
                        <input
                          type="url"
                          value={editingImageUrl}
                          onChange={(e) => setEditingImageUrl(e.target.value)}
                          className={`w-full px-2 py-1 text-xs border rounded ${
                            editingImageUrl && !isValidImageUrl(editingImageUrl)
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter image URL (https://...)"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleSaveImageEdit();
                            } else if (e.key === "Escape") {
                              handleCancelImageEdit();
                            }
                          }}
                          autoFocus
                        />
                        {editingImageUrl &&
                          !isValidImageUrl(editingImageUrl) && (
                            <p className="text-red-500 text-xs mt-1">
                              Please enter a valid URL starting with http:// or
                              https://
                            </p>
                          )}
                        <div className="flex gap-1 mt-1">
                          <button
                            onClick={handleSaveImageEdit}
                            disabled={
                              !isValidImageUrl(editingImageUrl) ||
                              savingImageIndex === index
                            }
                            className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            {savingImageIndex === index ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save"
                            )}
                          </button>
                          <button
                            onClick={handleCancelImageEdit}
                            className="flex-1 px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs truncate">{imageUrl}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProductPage;
