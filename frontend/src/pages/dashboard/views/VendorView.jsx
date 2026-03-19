import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import productService from "../../../services/productService";
import ProductImageCarousel from "../../../components/shop/ProductImageCarousel";
import RatingStars from "../../../components/shop/RatingStars";
import {
  Plus,
  Package,
  CheckCircle,
  XCircle,
  X,
  Loader2,
  Upload,
  Store,
} from "lucide-react";

const STATUS_ALL = "all";
const STATUS_ACTIVE = "active";
const STATUS_PENDING = "pending";
const STATUS_ARCHIVED = "archived";

const VendorView = () => {
  const { user } = useSelector((state) => state.auth);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [loadingVendorProducts, setLoadingVendorProducts] = useState(true);

  /** Only products owned by the current vendor (frontend filter in case backend cookie is missing). */
  const myLiveProducts = useMemo(() => {
    if (!user?.id && !user?._id) return vendorProducts;
    const id = String(user.id ?? user._id);
    return vendorProducts.filter((p) => {
      const ownerId = p.ownedBy ? String(p.ownedBy._id ?? p.ownedBy) : "";
      return ownerId === id;
    });
  }, [vendorProducts, user]);

  /** Status filter: All, Active, Pending, Archived */
  const [statusFilter, setStatusFilter] = useState(STATUS_ALL);
  const filteredProducts = useMemo(() => {
    if (statusFilter === STATUS_ALL) return myLiveProducts;
    return myLiveProducts.filter((p) => (p.status || "active") === statusFilter);
  }, [myLiveProducts, statusFilter]);

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
  const [categories, setCategories] = useState([]);
  const [updatingStockId, setUpdatingStockId] = useState(null);
  const [editStockValue, setEditStockValue] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoadingVendorProducts(true);
      try {
        const list = await productService.fetchVendorProducts();
        setVendorProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Error loading vendor products:", err);
        setVendorProducts([]);
      } finally {
        setLoadingVendorProducts(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await productService.fetchCategories();
        setCategories(list.length ? list : ["Accessories", "Clothing", "Modern", "Traditional"]);
      } catch (err) {
        console.error("Error loading categories:", err);
        setCategories(["Accessories", "Clothing", "Modern", "Traditional"]);
      }
    };
    load();
  }, []);

  const refreshVendorProducts = async () => {
    try {
      const list = await productService.fetchVendorProducts();
      setVendorProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error refreshing vendor products:", err);
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    const num = parseInt(newStock, 10);
    if (Number.isNaN(num) || num < 0) {
      setMessage({ type: "error", text: "Enter a valid stock amount (0 or more)." });
      return;
    }
    setUpdatingStockId(productId);
    setMessage(null);
    try {
      await productService.updateProductStock(productId, num);
      setMessage({ type: "success", text: "Stock updated." });
      setEditStockValue("");
      setUpdatingStockId(null);
      await refreshVendorProducts();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update stock.",
      });
      setUpdatingStockId(null);
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
      refreshVendorProducts();
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
      case "active":
        return {
          badge:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-500/20",
          dot: "bg-green-500",
          border: "border-green-500",
        };
      case "rejected":
      case "archived":
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

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-(--border-color) pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-[var(--color-burgundy)] to-[var(--color-burgundy-dark)] mb-1">
            Vendor Portal
          </h1>
          <p className="text-(--text-secondary) text-sm">
            Manage your inventory and submissions
          </p>
        </div>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn-primary flex items-center gap-2"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span>{showForm ? "Cancel" : "New submission"}</span>
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

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-(--text-secondary)">Status:</span>
        {[
          { value: STATUS_ALL, label: "All" },
          { value: STATUS_ACTIVE, label: "Active" },
          { value: STATUS_PENDING, label: "Pending" },
          { value: STATUS_ARCHIVED, label: "Archived" },
        ].map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              statusFilter === value
                ? "bg-[var(--color-burgundy)] text-white"
                : "bg-(--bg-card) text-(--text-secondary) border border-(--border-color) hover:border-[var(--color-burgundy)]/30"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {loadingVendorProducts ? (
          <div className="flex items-center justify-center py-20 rounded-2xl bg-(--bg-card) border border-(--border-color)">
            <Loader2 className="w-10 h-10 text-[var(--color-burgundy)] animate-spin" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="group rounded-2xl border border-(--border-color) bg-(--bg-card) overflow-hidden hover:border-[var(--color-burgundy)]/25 transition-colors duration-300"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-(--bg-main)">
                    <ProductImageCarousel
                      images={product.images}
                      alt={product.name}
                      className="w-full h-full"
                      imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      placeholder={
                        <div className="w-full h-full flex items-center justify-center text-(--text-secondary)">
                          <Package size={48} className="opacity-30" />
                        </div>
                      }
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/90 dark:bg-black/70 backdrop-blur-sm text-(--text-main) border border-(--border-color)">
                        {product.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 z-10">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase ${getStatusColor(product.status).badge}`}>
                        {product.status || "active"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-bold text-(--text-main) text-lg truncate mb-1">{product.name}</h3>
                    <p className="text-(--text-secondary) text-sm line-clamp-2 mb-2">{product.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <RatingStars rating={Number(product.ratingAverage || 0)} size={14} />
                      <span className="text-xs font-semibold text-(--text-main)">
                        {Number(product.ratingCount || 0) > 0
                          ? `${Number(product.ratingAverage || 0).toFixed(1)} (${Number(product.ratingCount)} reviews)`
                          : "No ratings yet"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3 items-center">
                      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-(--bg-main) text-(--text-secondary) border border-(--border-color)">
                        Stock: {product.stock}
                      </span>
                      {updatingStockId === product._id ? (
                        <span className="flex items-center gap-1.5 text-xs">
                          <input
                            type="number"
                            min="0"
                            className="w-16 rounded border border-(--border-color) bg-(--input-bg) px-2 py-1 text-(--text-main) text-xs"
                            value={editStockValue}
                            onChange={(e) => setEditStockValue(e.target.value)}
                            placeholder={product.stock}
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateStock(product._id, editStockValue)}
                            className="px-2 py-1 rounded bg-[var(--color-burgundy)] text-white text-xs font-medium"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => { setUpdatingStockId(null); setEditStockValue(""); }}
                            className="text-(--text-secondary) hover:text-(--text-main) text-xs"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setUpdatingStockId(product._id); setEditStockValue(String(product.stock ?? 0)); }}
                          className="px-2 py-1 rounded-lg text-xs font-medium bg-[var(--color-burgundy)]/10 text-[var(--color-burgundy)] border border-[var(--color-burgundy)]/20 hover:bg-[var(--color-burgundy)]/20"
                        >
                          Update amount
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-start">
                      <span className="font-bold text-lg text-[var(--color-burgundy)]">
                        {Number(product.price || 0).toLocaleString()} Birr
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center rounded-2xl border-2 border-dashed border-(--border-color) bg-(--bg-card)">
              <Store className="w-14 h-14 mx-auto mb-4 text-(--text-secondary) opacity-40" />
              <p className="text-(--text-main) font-semibold mb-1">
                {myLiveProducts.length === 0 ? "No products live yet" : `No products match "${statusFilter}"`}
              </p>
              <p className="text-(--text-secondary) text-sm mb-4">
                {myLiveProducts.length === 0 ? "Products you own appear here after approval. Submit items for review to get started." : "Try another status filter."}
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus size={18} />
                New submission
              </button>
            </div>
          )}
      </div>

      {showForm && (
        <div className="card-standard p-6 md:p-8 animate-fade-in shadow-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-(--text-main)">
            <Package className="text-[var(--color-burgundy)]" />
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

              <div className="border-2 border-dashed border-(--border-color) rounded-xl p-6 text-center hover:border-[var(--color-burgundy)]/50 transition-colors cursor-pointer">
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
                  <div className="p-3 bg-[var(--color-burgundy)]/10 rounded-full">
                    <Upload className="w-6 h-6 text-[var(--color-burgundy)]" />
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
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
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
    </div>
  );
};

export default VendorView;
