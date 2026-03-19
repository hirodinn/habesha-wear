import { useState, useEffect } from "react";
import orderService from "../../../services/orderService";
import {
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShoppingBag,
  RefreshCw,
  Calendar,
  Receipt,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const CustomerView = () => {
  const formatNumber = (value) => Number(value || 0).toLocaleString("en-US");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    else setLoading(true);

    try {
      const data = await orderService.getOrders();
      setOrders(Array.isArray(data) ? data : []);
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
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
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

  const getOrderItemName = (item) => {
    if (item?.productName) return item.productName;

    const product = item?.productId;
    if (product && typeof product === "object") {
      if (product.name) return product.name;
      const productObjectId = product._id || product.id;
      if (productObjectId) {
        return `Product ${String(productObjectId).slice(-6).toUpperCase()}`;
      }
      return "Product";
    }

    if (typeof product === "string") {
      return `Product ${String(product).slice(-6).toUpperCase()}`;
    }

    return "Product";
  };

  const getOrderItemImage = (item) => {
    if (item?.image) return item.image;
    if (Array.isArray(item?.images) && item.images.length > 0) return item.images[0];

    const product = item?.productId;
    if (product && typeof product === "object") {
      if (Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0];
      }
    }

    return null;
  };

  const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

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
            <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2">
              <Sparkles size={12} /> customer dashboard
            </p>
            <h1 className="text-3xl font-display font-bold text-[var(--text-main)] mb-2">
              My Orders
            </h1>
            <p className="text-[var(--text-secondary)] font-medium">
              Modern overview of your purchases.
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
          <p className="text-xs uppercase text-[var(--text-secondary)] tracking-wider">Total Orders</p>
          <p className="text-2xl font-bold mt-1">{formatNumber(orders.length)}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
          <p className="text-xs uppercase text-[var(--text-secondary)] tracking-wider">Total Spent</p>
          <p className="text-2xl font-bold mt-1">{formatNumber(totalSpent)} Birr</p>
        </div>
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
          <p className="text-xs uppercase text-[var(--text-secondary)] tracking-wider">Latest Status</p>
          <p className="text-2xl font-bold mt-1 capitalize">{orders[0]?.status || "-"}</p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-20 card-standard bg-[var(--bg-card)] border-dashed border-2">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)] opacity-30" />
            <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">No orders found</h3>
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
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const items = getOrderItems(order);
              const status = (order.status || "pending").toLowerCase();

              return (
                <div
                  key={order._id}
                  className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 md:p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div className="flex-1 min-w-0">
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

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        <div className="rounded-xl border border-[var(--border-color)] p-3 bg-[var(--bg-main)]/30">
                          <p className="text-[10px] font-bold uppercase text-[var(--text-secondary)] flex items-center gap-1">
                            <Calendar size={11} /> Placed
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
                        <div className="rounded-xl border border-[var(--border-color)] p-3 bg-[var(--bg-main)]/30">
                          <p className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Items</p>
                          <p className="text-sm font-bold text-[var(--text-main)] mt-1">
                            {formatNumber(items.length)}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl p-4 border border-[var(--border-color)]/50 bg-[var(--bg-main)]/40">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-3">
                          Order Items
                        </p>
                        <div className="space-y-2">
                          {items.slice(0, 3).map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-3 px-2 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                {getOrderItemImage(item) ? (
                                  <img
                                    src={getOrderItemImage(item)}
                                    alt={getOrderItemName(item)}
                                    className="h-9 w-9 rounded-lg object-cover border border-[var(--border-color)]"
                                  />
                                ) : (
                                  <div className="h-9 w-9 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)]">
                                    <ShoppingBag size={14} />
                                  </div>
                                )}
                                <p className="text-[12px] font-semibold text-[var(--text-main)] truncate">
                                  {getOrderItemName(item)}
                                </p>
                              </div>
                              <p className="text-[11px] text-[var(--text-secondary)] whitespace-nowrap">
                                x{formatNumber(item.quantity || 1)}
                              </p>
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

                    <div className="w-full lg:w-48 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)]/40 p-4">
                      <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Summary</p>
                      <p className="text-2xl font-bold mt-2 text-[var(--text-main)]">
                        {formatNumber(order.totalAmount)}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">Birr</p>
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
