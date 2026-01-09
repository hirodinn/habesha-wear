import { useState, useEffect } from "react";
import axios from "axios";
import {
  Tag,
  Search,
  Trash2,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

const AdminProductsView = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-500/30">
            <Tag className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-(--text-main)">
              Product Management
            </h1>
            <p className="text-(--text-secondary)">
              Manage live product listings
            </p>
          </div>
        </div>

        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors w-5 h-5" />
          <input
            type="text"
            placeholder="Search by product name..."
            className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl pl-12 pr-4 py-2.5 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all text-(--text-main) placeholder-gray-400"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="card-standard overflow-hidden group hover:border-sky-500/30 bg-(--bg-card) flex flex-col"
          >
            <div className="relative aspect-square overflow-hidden bg-(--bg-main)">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                  <ShoppingBag size={48} />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="px-2 py-1 rounded-md bg-white/80 dark:bg-black/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-(--text-main) border border-white/20">
                  {product.category}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-(--text-main) truncate flex-1">
                  {product.name}
                </h3>
                <span className="font-bold text-sky-500">
                  {product.price} Birr
                </span>
              </div>
              <p className="text-(--text-secondary) text-sm line-clamp-2 mb-4">
                {product.description}
              </p>

              <div className="mt-auto pt-4 border-t border-(--border-color) flex justify-between items-center">
                <div className="text-xs text-(--text-secondary)">
                  Stock:{" "}
                  <span
                    className={`font-bold ${
                      product.stock < 5 ? "text-red-500" : "text-(--text-main)"
                    }`}
                  >
                    {product.stock}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteProduct(product)}
                  disabled={loading}
                  className="p-2 text-(--text-secondary) hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all cursor-pointer"
                  title="Delete Product"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-20 bg-(--bg-card) rounded-3xl border border-(--border-color) border-dashed">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-500/20" />
            <h3 className="text-xl font-bold text-(--text-main)">
              No products found
            </h3>
            <p className="text-(--text-secondary)">
              {searchTerm
                ? "No products match your search."
                : "No products currently live on the platform."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductsView;
