import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  X,
  Loader2,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

const VendorView = () => {
  const [preProducts, setPreProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchPreProducts();
  }, []);

  const fetchPreProducts = async () => {
    try {
      const response = await axios.get("/api/preproducts");
      setPreProducts(response.data);
    } catch (error) {
      console.error("Error fetching pre-products:", error);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const invalidFiles = files.filter((f) => !validTypes.includes(f.type));

    if (invalidFiles.length > 0) {
      setMessage({
        type: "error",
        text: "Please select only image files (JPEG, PNG, WebP, or GIF)",
      });
      return;
    }

    // Limit to 5 images total
    const newFiles = [...selectedImages, ...files].slice(0, 5);
    setSelectedImages(newFiles);

    // Create preview URLs
    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleRemoveImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedImages.length === 0) {
      setMessage({
        type: "error",
        text: "Please select at least one image for your product.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("price", newProduct.price);
      formData.append("category", newProduct.category);
      formData.append("stock", newProduct.stock);

      // Append images
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      await axios.post("/api/preproducts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage({ type: "success", text: "Product submitted for approval!" });
      setShowForm(false);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
      });
      setSelectedImages([]);
      setImagePreviews([]);
      fetchPreProducts();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Submission failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          badge:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20",
          dot: "bg-yellow-500",
          border: "border-yellow-500",
        };
      case "accepted":
        return {
          badge:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-500/20",
          dot: "bg-green-500",
          border: "border-green-500",
        };
      case "rejected":
        return {
          badge:
            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-500/20",
          dot: "bg-red-500",
          border: "border-red-500",
        };
      default:
        return {
          badge:
            "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-500/20",
          dot: "bg-gray-500",
          border: "border-gray-500",
        };
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return <CheckCircle size={14} />;
      case "rejected":
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-(--border-color) pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-sky-400 to-blue-600 mb-1">
            Vendor Portal
          </h1>
          <p className="text-(--text-secondary) text-sm">
            Manage your inventory and submissions
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span>{showForm ? "Cancel Submission" : "New Submisson"}</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 animate-slide-up ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-300"
              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <XCircle size={20} />
          )}
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="card-standard p-6 md:p-8 animate-fade-in shadow-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-(--text-main)">
            <Package className="text-sky-500" />
            Product Details
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-(--text-secondary)">
                Product Name
              </label>
              <input
                required
                className="input-field"
                placeholder="e.g. Traditional Dress"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-(--text-secondary)">
                Description
              </label>
              <textarea
                required
                rows={4}
                className="input-field resize-none"
                placeholder="Describe materials, sizing, etc."
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-(--text-secondary)">
                Price (Birr)
              </label>
              <input
                type="number"
                required
                className="input-field"
                placeholder="0.00"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-(--text-secondary)">
                Stock Quantity
              </label>
              <input
                type="number"
                required
                className="input-field"
                placeholder="0"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, stock: e.target.value })
                }
              />
            </div>

            {/* Image Upload Section */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-sm font-medium text-(--text-secondary)">
                Product Images (Required, max 5)
              </label>

              <div className="border-2 border-dashed border-(--border-color) rounded-xl p-6 text-center hover:border-sky-500/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  id="imageUpload"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <label
                  htmlFor="imageUpload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="p-3 bg-sky-500/10 rounded-full">
                    <Upload className="w-6 h-6 text-sky-500" />
                  </div>
                  <div>
                    <p className="text-(--text-main) font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-(--text-secondary)">
                      PNG, JPG, WebP or GIF (max 5MB each, up to 5 images)
                    </p>
                  </div>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-(--border-color)"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-(--text-secondary)">
                Category
              </label>
              <select
                required
                className="input-field appearance-none"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
              >
                <option value="" disabled>
                  Select Category
                </option>
                <option value="clothing">Clothing</option>
                <option value="footwear">Footwear</option>
                <option value="accessories">Accessories</option>
                <option value="traditional">Traditional</option>
              </select>
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  "Submit for Review"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product List */}
      <h3 className="text-lg font-semibold text-(--text-secondary) mt-8 mb-4">
        Submission History
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {preProducts.map((product) => (
          <div
            key={product._id}
            className={`card-standard p-5 relative group bg-(--bg-card) border-l-4 transition-all hover:translate-x-1 ${
              getStatusColor(product.status).border
            }`}
          >
            <div className="absolute top-4 right-4">
              <span
                className={`text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold uppercase tracking-wider border ${
                  getStatusColor(product.status).badge
                }`}
              >
                {getStatusIcon(product.status)}
                <span
                  className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    getStatusColor(product.status).dot
                  }`}
                />
                {product.status}
              </span>
            </div>

            {/* Product Images */}
            {product.images && product.images.length > 0 ? (
              <div className="mb-3">
                <div className="relative h-40 bg-(--bg-main) rounded-lg overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
                      <ImageIcon size={12} />
                      {product.images.length}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="mb-4 pt-2">
              <h3 className="font-bold text-lg text-(--text-main) mb-1">
                {product.name}
              </h3>
              <p className="text-(--text-secondary) text-sm line-clamp-2 min-h-[40px]">
                {product.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-(--bg-main) rounded-md text-xs text-(--text-secondary) border border-(--border-color)">
                {product.category}
              </span>
              <span className="px-2 py-1 bg-(--bg-main) rounded-md text-xs text-(--text-secondary) border border-(--border-color)">
                Stock: {product.stock}
              </span>
            </div>

            <div className="pt-4 border-t border-(--border-color) flex justify-between items-center">
              <span className="text-(--text-main) font-bold">
                {product.price} Birr
              </span>
              <button className="text-(--text-secondary) hover:text-(--text-main) transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ))}
        {preProducts.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-(--border-color) rounded-3xl bg-(--bg-card)">
            <Package className="w-12 h-12 mx-auto mb-3 text-(--text-secondary) opacity-50" />
            <p className="text-(--text-main) font-medium">
              No products submitted yet.
            </p>
            <p className="text-(--text-secondary) text-sm">
              Use the form above to add your first item.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorView;
