import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Shield,
  Users,
  AlertCircle,
  Package,
  ShoppingCart,
  Truck,
  ChevronRight,
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
        <div className="p-3 bg-[var(--color-gold)]/10 rounded-2xl border border-[var(--color-gold)]/20">
          <Shield className="w-8 h-8 text-[var(--color-burgundy)]" />
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-gold)] via-[var(--color-burgundy)] to-[var(--color-burgundy)]">
            Command Center
          </h1>
          <p className="text-[var(--text-secondary)]">
            Platform Overview & Management
          </p>
        </div>
      </div>

      {/* Quick Stats – clickable to admin sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Link
          to="/admin/products"
          className="card-standard p-6 relative overflow-hidden group bg-[var(--bg-card)] border-[var(--color-gold)]/10 hover:border-[var(--color-gold)]/30 transition-colors block"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--color-burgundy)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-burgundy)]/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[var(--color-gold)]/10 rounded-lg">
              <Package className="text-[var(--color-burgundy)] w-5 h-5" />
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--color-gold)]" />
          </div>
          <p className="text-[var(--text-secondary)] text-sm">Total Products</p>
          <p className="text-3xl font-display font-bold mt-1 text-[var(--text-main)]">
            {stats.products}
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="card-standard p-6 relative overflow-hidden group bg-[var(--bg-card)] border-[var(--color-gold)]/10 hover:border-[var(--color-gold)]/30 transition-colors block"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--color-gold)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-gold)]/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[var(--color-gold)]/10 rounded-lg">
              <Users className="text-[var(--color-burgundy)] w-5 h-5" />
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--color-gold)]" />
          </div>
          <p className="text-[var(--text-secondary)] text-sm">Total Users</p>
          <p className="text-3xl font-display font-bold mt-1 text-[var(--text-main)]">
            {stats.users}
          </p>
        </Link>

        <Link
          to="/admin/pending"
          className="card-standard p-6 relative overflow-hidden group bg-[var(--bg-card)] border-[var(--color-gold)]/10 hover:border-[var(--color-gold)]/30 transition-colors block"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertCircle className="text-amber-600 dark:text-amber-400 w-5 h-5" />
            </div>
            {stats.pendingProducts > 0 && (
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle size={12} /> Action Needed
              </span>
            )}
            {stats.pendingProducts === 0 && (
              <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--color-gold)]" />
            )}
          </div>
          <p className="text-[var(--text-secondary)] text-sm">
            Pending Approval
          </p>
          <p className="text-3xl font-display font-bold mt-1 text-[var(--text-main)]">
            {stats.pendingProducts}
          </p>
        </Link>

        <Link
          to="/admin/orders"
          className="card-standard p-6 relative overflow-hidden group bg-[var(--bg-card)] border-[var(--color-gold)]/10 hover:border-[var(--color-gold)]/30 transition-colors block"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--color-burgundy)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-burgundy)]/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[var(--color-burgundy)]/10 rounded-lg">
              <Truck className="text-[var(--color-burgundy)] w-5 h-5" />
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--color-gold)]" />
          </div>
          <p className="text-[var(--text-secondary)] text-sm">Total Orders</p>
          <p className="text-3xl font-display font-bold mt-1 text-[var(--text-main)]">
            {stats.orders}
          </p>
        </Link>

        <Link
          to="/admin/carts"
          className="card-standard p-6 relative overflow-hidden group bg-[var(--bg-card)] border-[var(--color-gold)]/10 hover:border-[var(--color-gold)]/30 transition-colors block"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--color-gold)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-gold)]/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[var(--color-gold)]/10 rounded-lg">
              <ShoppingCart className="text-[var(--color-burgundy)] w-5 h-5" />
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--color-gold)]" />
          </div>
          <p className="text-[var(--text-secondary)] text-sm">Active Carts</p>
          <p className="text-3xl font-display font-bold mt-1 text-[var(--text-main)]">
            {stats.carts}
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdminView;
