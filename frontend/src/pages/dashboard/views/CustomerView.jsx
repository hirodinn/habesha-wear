import { useState, useEffect } from "react";
import orderService from "../../../services/orderService";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  ShoppingBag,
  RefreshCw,
  Search,
  XCircle,
  Calendar,
  Receipt,
  Boxes,
} from "lucide-react";
import { Link } from "react-router-dom";

const CustomerView = () => {
  const formatNumber = (value) => Number(value || 0).toLocaleString("en-US");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    else setLoading(true);

    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "shipped":
        return "bg-[var(--color-burgundy)]/20 text-[var(--color-burgundy)]";
      case "delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock size={14} />;
      case "shipped":
        return <Truck size={14} />;
      case "delivered":
        return <CheckCircle2 size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

  const getOrderItems = (order) => {
    const items = order.items || order.products || [];
    return Array.isArray(items) ? items : [];
  };

  const filteredOrders = orders.filter((order) => {
    const status = (order.status || "pending").toLowerCase();
    const ref = order._id?.slice(-8).toUpperCase() || "";
    const query = search.trim().toLowerCase();

    const matchesStatus = statusFilter === "all" || status === statusFilter;
    const matchesSearch = !query || ref.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status?.toLowerCase() === "pending").length,
    shipped: orders.filter((o) => o.status?.toLowerCase() === "shipped").length,
    delivered: orders.filter((o) => o.status?.toLowerCase() === "delivered").length,
    cancelled: orders.filter((o) => o.status?.toLowerCase() === "cancelled").length,
  };

  const statusOptions = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-[var(--color-burgundy)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in w-full">
      <div className="rounded-3xl p-6 md:p-8 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-lg relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--color-burgundy)]/10 via-transparent to-[var(--color-burgundy)]/5" />
        <div className="relative z-10 flex justify-between items-start gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2">
              customer dashboard
            </p>
            <h1 className="text-3xl font-display font-bold text-[var(--text-main)] mb-2">
              My Orders
            </h1>
            <p className="text-[var(--text-secondary)] font-medium">
              Clean overview of all your purchases and delivery status.
            </p>
          </div>
          <button
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            className="p-3 bg-[var(--bg-main)] hover:bg-[var(--bg-main)]/70 rounded-2xl transition-all active:scale-95 disabled:opacity-50 group text-[var(--text-main)] border border-[var(--border-color)]"
            title="Refresh Orders"
          >
            <RefreshCw
              size={20}
              className={`${
                isRefreshing
                  ? "animate-spin"
                  : "group-hover:rotate-180 transition-transform duration-500"
              }`}
            />
          </button>
        </div>
        <Package className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-[var(--color-burgundy)] opacity-10 -rotate-12" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {statusOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => setStatusFilter(option.key)}
            className={`rounded-xl px-3 py-2.5 border text-sm font-semibold transition-all ${
              statusFilter === option.key
                ? "bg-[var(--color-burgundy)] text-white border-[var(--color-burgundy)]"
                : "bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-color)] hover:border-[var(--color-burgundy)]/40"
            }`}
          >
            {option.label} ({formatNumber(counts[option.key] || 0)})
          </button>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search
          size={17}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order reference"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--color-burgundy)]/30"
        />
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-20 card-standard bg-[var(--bg-card)] border-dashed border-2">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)] opacity-30" />
            <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">
              No orders found
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Start exploring our collection to place your first order!
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 rounded-2xl bg-[var(--color-burgundy)] text-white font-bold hover:bg-[var(--color-burgundy-light)] transition-all shadow-lg active:scale-95"
            >
              Shop Now
            </Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 card-standard bg-[var(--bg-card)]">
            <XCircle className="w-12 h-12 mx-auto mb-4 text-[var(--text-secondary)] opacity-40" />
            <h3 className="text-lg font-bold text-[var(--text-main)]">No matching orders</h3>
            <p className="text-[var(--text-secondary)] mt-2">
              Try changing filters or search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
            {filteredOrders.map((order) => {
              const items = getOrderItems(order);
              const status = (order.status || "pending").toLowerCase();

              return (
                <div
                  key={order._id}
                  className="card-standard overflow-hidden bg-[var(--bg-card)] transition-all hover:-translate-y-0.5 group flex flex-col h-full"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                          Order
                        </p>
                        <h3 className="text-lg font-display font-bold text-[var(--text-main)]">
                          #{order._id.slice(-8).toUpperCase()}
                        </h3>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold leading-none ${getStatusColor(
                          status
                        )}`}
                      >
                        {getStatusIcon(status)}
                        <span className="uppercase tracking-wider">{status}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="rounded-xl border border-[var(--border-color)] p-3 bg-[var(--bg-main)]/30">
                        <p className="text-[10px] font-bold uppercase text-[var(--text-secondary)] flex items-center gap-1">
                          <Calendar size={11} /> Placed On
                        </p>
                        <p className="text-xs font-semibold text-[var(--text-main)] mt-1">
                          {new Date(order.orderDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="rounded-xl border border-[var(--border-color)] p-3 bg-[var(--bg-main)]/30">
                        <p className="text-[10px] font-bold uppercase text-[var(--text-secondary)] flex items-center gap-1">
                          <Receipt size={11} /> Total
                        </p>
                        <p className="text-sm font-bold text-[var(--text-main)] mt-1">
                          {formatNumber(order.totalAmount)} Birr
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 rounded-2xl p-4 border border-[var(--border-color)]/50 bg-[var(--bg-main)]/40 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1">
                          <Boxes size={11} />
                          Items
                        </span>
                        <span className="text-[10px] font-bold text-[var(--text-main)]">
                          {formatNumber(items.length)} Total
                        </span>
                      </div>

                      <div className="space-y-2">
                        {items.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 px-2 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-main)] shrink-0">
                              <Package size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-[var(--text-main)] truncate">
                                {item.productName ||
                                  (item.productId
                                    ? `Product ${String(item.productId).slice(-6).toUpperCase()}`
                                    : "Product")}
                              </p>
                              <p className="text-[10px] text-[var(--text-secondary)] font-medium">
                                Qty: {formatNumber(item.quantity || 1)}
                              </p>
                            </div>
                          </div>
                        ))}

                        {items.length > 3 && (
                          <p className="text-[10px] font-bold text-[var(--color-burgundy)]/80 text-center pt-1">
                            + {formatNumber(items.length - 3)} more items
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerView;
