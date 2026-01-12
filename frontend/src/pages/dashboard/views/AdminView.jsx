import { useState, useEffect } from "react";
import axios from "axios";
import {
  Shield,
  Users,
  AlertCircle,
  Package,
  ShoppingCart,
  Truck,
} from "lucide-react";

const AdminView = () => {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    pendingProducts: 0,
    orders: 0,
    carts: 0,
  });

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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
              <AlertCircle className="text-orange-600 dark:text-orange-400 w-5 h-5" />
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
    </div>
  );
};

export default AdminView;
