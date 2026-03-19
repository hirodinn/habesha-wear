import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Tag,
  Search,
  Trash2,
  AlertCircle,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ProductImageCarousel from "../../components/shop/ProductImageCarousel";

const AdminProductsView = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedProductId, setExpandedProductId] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/users");
        const list = Array.isArray(response.data) ? response.data : [];
        const map = list.reduce((acc, u) => {
          if (u?._id) acc[String(u._id)] = u;
          return acc;
        }, {});
        setUsersById(map);
      } catch {
        setUsersById({});
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteProduct = async (product) => {
    if (
      !confirm(
        `Are you sure you want to delete product "${product.name}"? This action is permanent.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`/api/products/${product._id}`);
      setActionMessage({
        type: "success",
        text: `Product "${product.name}" deleted.`,
      });
      fetchProducts();
    } catch {
      setActionMessage({ type: "error", text: "Failed to delete product." });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (product, nextStatus) => {
    if (!nextStatus || nextStatus === (product.status || "active")) return;

    setLoading(true);
    try {
      await axios.put(`/api/products/${product._id}/status`, {
        status: nextStatus,
      });
      setActionMessage({
        type: "success",
        text: `Status updated for "${product.name}" to ${nextStatus}.`,
      });
      fetchProducts();
    } catch {
      setActionMessage({ type: "error", text: "Failed to update status." });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch ((status || "active").toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20";
      case "archived":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-500/20";
      default:
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-500/20";
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOwnerId = (product) => {
    const owner = product?.ownedBy;
    if (!owner) return "N/A";
    if (typeof owner === "string") return owner;
    return String(owner._id || owner.id || "N/A");
  };

  const getOwnerName = (product) => {
    const owner = product?.ownedBy;
    if (typeof owner === "object" && owner?.name) return owner.name;
    const id = getOwnerId(product);
    if (id && usersById[id]?.name) return usersById[id].name;
    return "Unknown Vendor";
  };

  const getOwnerEmail = (product) => {
    const owner = product?.ownedBy;
    if (typeof owner === "object" && owner?.email) return owner.email;
    const id = getOwnerId(product);
    return usersById[id]?.email || "N/A";
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[var(--color-burgundy)]/10 rounded-2xl border border-[var(--color-burgundy)]/20">
            <Tag className="w-8 h-8 text-[var(--color-burgundy)]" />
          </div>
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-(--text-secondary) hover:text-[var(--color-burgundy)]"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h1 className="text-4xl font-bold text-(--text-main)">
              Product Management
            </h1>
            <p className="text-(--text-secondary)">
              Manage live product listings
            </p>
          </div>
        </div>

        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-burgundy)] transition-colors w-5 h-5" />
          <input
            type="text"
            placeholder="Search by product name..."
            className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl pl-12 pr-4 py-2.5 focus:outline-none focus:border-[var(--color-burgundy)]/50 focus:ring-1 focus:ring-[var(--color-burgundy)]/50 transition-all text-(--text-main) placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 animate-slide-up ${
            actionMessage.type === "success"
              ? "bg-green-100 dark:bg-green-900/10 border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-300"
              : "bg-red-100 dark:bg-red-900/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300"
          }`}
        >
          <AlertCircle size={20} />
          {actionMessage.text}
        </div>
      )}

      <div className="card-standard overflow-hidden bg-(--bg-card)">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-(--bg-main) text-(--text-secondary) text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold border-b border-(--border-color)">
                  Product
                </th>
                <th className="px-6 py-4 font-bold border-b border-(--border-color)">
                  Category
                </th>
                <th className="px-6 py-4 font-bold border-b border-(--border-color)">
                  Price
                </th>
                <th className="px-6 py-4 font-bold border-b border-(--border-color)">
                  Stock
                </th>
                <th className="px-6 py-4 font-bold border-b border-(--border-color)">
                  Rating
                </th>
                <th className="px-6 py-4 font-bold border-b border-(--border-color)">
                  Status
                </th>
                <th className="px-6 py-4 font-bold border-b border-(--border-color) text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-color)">
              {filteredProducts.map((product) => (
                <Fragment key={product._id}>
                  <tr
                    onDoubleClick={() =>
                      setExpandedProductId((prev) =>
                        prev === product._id ? null : product._id
                      )
                    }
                    className={`group transition-colors ${
                      expandedProductId === product._id
                        ? "bg-[var(--color-burgundy)]/10"
                        : "hover:bg-[var(--color-burgundy)]/5"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-(--bg-main) border border-(--border-color) shrink-0">
                          <ProductImageCarousel
                            images={product.images}
                            alt={product.name}
                            className="w-full h-full"
                            imageClassName="w-full h-full object-cover"
                            placeholder={
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ShoppingBag size={20} />
                              </div>
                            }
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-(--text-main) truncate">
                            {product.name}
                          </h3>
                          <p className="text-[10px] text-(--text-secondary) truncate max-w-[200px]">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md bg-(--bg-main) text-[10px] font-bold uppercase tracking-wider text-(--text-secondary) border border-(--border-color)">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-sm text-[var(--color-burgundy)]">
                        {product.price} Birr
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            product.stock < 5
                              ? "text-red-500"
                              : "text-(--text-main)"
                          }`}
                        >
                          {product.stock}
                        </span>
                        <span className="text-[10px] text-(--text-secondary) font-medium uppercase tracking-tighter">
                          Units
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[var(--color-burgundy)]">
                          {product.ratingCount > 0
                            ? Number(product.ratingAverage || 0).toFixed(1)
                            : "-"}
                        </span>
                        <span className="text-[10px] text-(--text-secondary) font-medium">
                          ({product.ratingCount || 0})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${getStatusBadgeClass(
                          product.status
                        )}`}
                      >
                        {product.status || "active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <select
                          value={product.status || "active"}
                          onChange={(e) => handleStatusChange(product, e.target.value)}
                          disabled={loading}
                          className="px-2.5 py-2 rounded-lg text-xs font-semibold border border-(--border-color) bg-(--bg-main) text-(--text-main)"
                          title="Change status"
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="archived">Archived</option>
                        </select>
                        <button
                          onClick={() =>
                            setExpandedProductId(
                              expandedProductId === product._id
                                ? null
                                : product._id
                            )
                          }
                          className="p-2 text-(--text-secondary) hover:text-[var(--color-burgundy)] hover:bg-[var(--color-burgundy)]/5 rounded-lg transition-all cursor-pointer"
                          title={
                            expandedProductId === product._id
                              ? "Collapse Details"
                              : "Expand Details"
                          }
                        >
                          {expandedProductId === product._id ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          disabled={loading}
                          className="p-2 text-(--text-secondary) hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedProductId === product._id && (
                    <tr className="bg-[var(--color-burgundy)]/5 animate-fade-in">
                      <td
                        colSpan="7"
                        className="px-6 py-8 border-b border-(--border-color)"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-secondary)">
                              Product Description
                            </h4>
                            <p className="text-sm text-(--text-main) leading-relaxed">
                              {product.description}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              <div className="bg-(--bg-main) p-3 rounded-xl border border-(--border-color) sm:col-span-2">
                                <span className="block text-[10px] uppercase font-bold text-(--text-secondary) mb-1">
                                  Property Name
                                </span>
                                <span className="text-sm font-semibold text-(--text-main)">
                                  {product.name}
                                </span>
                              </div>
                              <div className="bg-(--bg-main) p-3 rounded-xl border border-(--border-color) sm:col-span-2">
                                <span className="block text-[10px] uppercase font-bold text-(--text-secondary) mb-1">
                                  Product ID
                                </span>
                                <span className="font-mono text-xs text-(--text-main)">
                                  {product._id}
                                </span>
                              </div>
                              <div className="bg-(--bg-main) p-3 rounded-xl border border-(--border-color)">
                                <span className="block text-[10px] uppercase font-bold text-(--text-secondary) mb-1">
                                  Owner Name
                                </span>
                                <span className="text-sm font-semibold text-(--text-main)">
                                  {getOwnerName(product)}
                                </span>
                              </div>
                              <div className="bg-(--bg-main) p-3 rounded-xl border border-(--border-color)">
                                <span className="block text-[10px] uppercase font-bold text-(--text-secondary) mb-1">
                                  Owner Email
                                </span>
                                <span className="text-xs text-(--text-main) break-all">
                                  {getOwnerEmail(product)}
                                </span>
                              </div>
                              <div className="bg-(--bg-main) p-3 rounded-xl border border-(--border-color)">
                                <span className="block text-[10px] uppercase font-bold text-(--text-secondary) mb-1">
                                  Owner ID
                                </span>
                                <span className="font-mono text-xs text-(--text-main)">
                                  {getOwnerId(product)}
                                </span>
                              </div>
                              <div className="bg-(--bg-main) p-3 rounded-xl border border-(--border-color)">
                                <span className="block text-[10px] uppercase font-bold text-(--text-secondary) mb-1">
                                  Status
                                </span>
                                <span className="text-sm font-semibold text-(--text-main)">
                                  {product.status || "active"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-secondary)">
                              All Images ({product.images?.length || 0})
                            </h4>
                            <div className="space-y-4">
                              {product.images?.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`${product.name} ${idx + 1}`}
                                  className="max-w-full max-h-[min(70vh,28rem)] w-auto h-auto object-contain rounded-xl border border-(--border-color) cursor-pointer hover:opacity-95 transition-opacity"
                                  onClick={() => window.open(img, "_blank")}
                                />
                              ))}
                              {(!product.images ||
                                product.images.length === 0) && (
                                <div className="col-span-3 py-8 flex flex-col items-center justify-center bg-(--bg-main) rounded-xl border border-dashed border-(--border-color) text-(--text-secondary)">
                                  <ShoppingBag
                                    size={24}
                                    className="opacity-20 mb-2"
                                  />
                                  <span className="text-xs">
                                    No images available
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-500/20" />
                    <p className="text-(--text-secondary)">
                      {searchTerm
                        ? "No products match your search."
                        : "No products currently live on the platform."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProductsView;
