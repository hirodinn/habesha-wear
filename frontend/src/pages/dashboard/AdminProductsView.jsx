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
                <th className="px-6 py-4 font-bold border-b border-(--border-color) text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-color)">
              {filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="group hover:bg-sky-500/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-(--bg-main) border border-(--border-color) shrink-0">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingBag size={20} />
                          </div>
                        )}
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
                    <span className="font-bold text-sm text-sky-500">
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
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button className="p-2 text-(--text-secondary) hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/10 rounded-lg transition-all cursor-pointer">
                        <ExternalLink size={16} />
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
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
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
