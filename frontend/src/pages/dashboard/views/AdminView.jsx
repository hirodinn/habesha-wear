import { useState, useEffect } from "react";
import axios from "axios";
import {
  Check,
  X,
  Shield,
  Users,
  ShoppingBag,
  AlertCircle,
  TrendingUp,
  Package,
  Layers,
  ShoppingCart,
  Truck,
} from "lucide-react";

const AdminView = () => {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    pendingProducts: 0,
    orders: 0,
    carts: 0,
  });
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    fetchPendingProducts();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchPendingProducts = async () => {
    try {
      let response = await axios.get("/api/preproducts");
      console.log(response);
      response = response.data.filter((res) => res.status === "pending");
      console.log(response);
      setPendingProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching pending products:", error);
    }
  };

  const handleApprove = async (product) => {
    setLoading(true);
    try {
      const { _id, __v, ...productData } = product;
      await axios.post("/api/products", productData);
      await axios.delete(`/api/preproducts/${_id}`);
      setActionMessage({ type: "success", text: `Approved ${product.name}` });
      fetchPendingProducts();
      fetchStats();
    } catch (error) {
      console.error(error);
      setActionMessage({
        type: "error",
        text:
          "Approval failed: " +
          (error.response?.data?.message || error.message),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (
      !confirm(
        "Are you sure you want to reject this product? This will delete the request."
      )
    )
      return;
    setLoading(true);
    try {
      await axios.delete(`/api/preproducts/${id}`);
      setActionMessage({
        type: "success",
        text: "Product request rejected/deleted.",
      });
      fetchPendingProducts();
      fetchStats();
    } catch (error) {
      setActionMessage({ type: "error", text: "Rejection failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-sky-100 dark:bg-sky-900/20 rounded-2xl border border-sky-200 dark:border-sky-500/30">
          <Shield className="w-8 h-8 text-sky-600 dark:text-sky-400" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-sky-600 via-blue-600 to-indigo-600 dark:from-sky-400 dark:via-blue-400 dark:to-indigo-400">
            Command Center
          </h1>
          <p className="text-[var(--text-secondary)]">
            Platform Overview & Management
          </p>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card-standard p-6 relative overflow-hidden group bg-[var(--bg-card)]">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Package className="text-blue-600 dark:text-blue-400 w-5 h-5" />
            </div>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">Total Products</p>
          <p className="text-3xl font-display font-bold mt-1 text-[var(--text-main)]">
            {stats.products}
          </p>
        </div>

        <div className="card-standard p-6 relative overflow-hidden group bg-[var(--bg-card)]">
          <div className="absolute right-0 top-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl group-hover:bg-sky-500/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-sky-100 dark:bg-sky-900/20 rounded-lg">
              <Users className="text-sky-600 dark:text-sky-400 w-5 h-5" />
            </div>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">Total Users</p>
          <p className="text-3xl font-display font-bold mt-1 text-[var(--text-main)]">
            {stats.users}
          </p>
        </div>

        <div className="card-standard p-6 relative overflow-hidden group bg-[var(--bg-card)]">
          <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Layers className="text-orange-600 dark:text-orange-400 w-5 h-5" />
            </div>
            {stats.pendingProducts > 0 && (
              <span className="text-xs font-bold text-orange-500 flex items-center gap-1">
                <AlertCircle size={12} /> Action Needed
              </span>
            )}
          </div>
          <p className="text-[var(--text-secondary)] text-sm">
            Pending Approval
          </p>
          <p className="text-3xl font-display font-bold mt-1 text-[var(--text-main)]">
            {stats.pendingProducts}
          </p>
        </div>

        <div className="card-standard p-6 relative overflow-hidden group bg-[var(--bg-card)]">
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
              <Truck className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
            </div>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">Total Orders</p>
          <p className="text-3xl font-display font-bold mt-1 text-[var(--text-main)]">
            {stats.orders}
          </p>
        </div>

        <div className="card-standard p-6 relative overflow-hidden group bg-[var(--bg-card)]">
          <div className="absolute right-0 top-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl group-hover:bg-pink-500/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
              <ShoppingCart className="text-pink-600 dark:text-pink-400 w-5 h-5" />
            </div>
          </div>
          <p className="text-[var(--text-secondary)] text-sm">Active Carts</p>
          <p className="text-3xl font-display font-bold mt-1 text-[var(--text-main)]">
            {stats.carts}
          </p>
        </div>
      </div>

      {/* Approval Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-3 text-[var(--text-main)]">
          <span className="w-2 h-8 bg-sky-500 rounded-full" />
          Validation Queue
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {pendingProducts.map((product) => (
            <div
              key={product._id}
              className="card-standard p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-sky-500/30 bg-[var(--bg-card)]"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-xl text-[var(--text-main)]">
                    {product.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--bg-main)] text-xs text-[var(--text-secondary)] border border-[var(--border-color)] uppercase tracking-wide">
                    {product.category}
                  </span>
                </div>
                <p className="text-[var(--text-secondary)] text-sm mb-4 max-w-2xl leading-relaxed">
                  {product.description}
                </p>
                <div className="flex gap-6 text-sm">
                  <div className="flex flex-col">
                    <span className="text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                      Price
                    </span>
                    <span className="font-bold text-[var(--text-main)] text-lg">
                      {product.price} Birr
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                      Stock
                    </span>
                    <span className="font-bold text-[var(--text-main)] text-lg">
                      {product.stock} Units
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                <button
                  onClick={() => handleApprove(product)}
                  disabled={loading}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md shadow-green-500/20"
                >
                  <Check size={18} /> Approve
                </button>
                <button
                  onClick={() => handleReject(product._id)}
                  disabled={loading}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-[var(--border-color)] hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 dark:hover:border-red-800 text-[var(--text-secondary)] hover:text-red-500 font-bold rounded-xl transition-all"
                >
                  <X size={18} /> Reject
                </button>
              </div>
            </div>
          ))}
          {pendingProducts.length === 0 && (
            <div className="text-center py-20 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] border-dashed">
              <Check className="w-16 h-16 mx-auto mb-4 text-green-500/30" />
              <h3 className="text-xl font-bold text-[var(--text-main)]">
                All caught up!
              </h3>
              <p className="text-[var(--text-secondary)]">
                No products pending approval at this time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminView;
