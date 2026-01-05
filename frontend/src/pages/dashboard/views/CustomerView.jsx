import { useState, useEffect } from "react";
import orderService from "../../../services/orderService";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";

const CustomerView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "shipped":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in w-full">
      <div className="bg-linear-to-br from-sky-500 to-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-sky-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="opacity-90 font-medium">
            Track your traditional treasures
          </p>
        </div>
        <Package className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-10 -rotate-12" />
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-20 card-standard bg-[var(--bg-card)] border-dashed border-2">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)] opacity-30" />
            <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">
              No orders found
            </h3>
            <p className="text-[var(--text-secondary)]">
              Start exploring our collection to place your first order!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="card-standard overflow-hidden bg-[var(--bg-card)] border-l-4 transition-all hover:translate-x-1 group flex flex-col h-full"
                style={{
                  borderLeftColor:
                    order.status?.toLowerCase() === "delivered"
                      ? "#22c55e"
                      : order.status?.toLowerCase() === "shipped"
                      ? "#3b82f6"
                      : order.status?.toLowerCase() === "pending"
                      ? "#eab308"
                      : "#64748b",
                }}
              >
                <div className="p-6 flex-1 flex flex-col">
                  {/* Order Header */}
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                        Order Ref
                      </p>
                      <h3 className="text-lg font-display font-bold text-[var(--text-main)]">
                        #{order._id.slice(-8).toUpperCase()}
                      </h3>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold leading-none ${getStatusColor(
                        order.status || "Pending"
                      )}`}
                    >
                      {getStatusIcon(order.status || "Pending")}
                      <span className="uppercase tracking-wider">
                        {order.status || "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-[var(--border-color)]/30">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                        Placed On
                      </p>
                      <p className="text-xs font-semibold text-[var(--text-main)]">
                        {new Date(order.orderDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                        Total
                      </p>
                      <p className="text-sm font-bold text-sky-500">
                        {order.totalAmount} Birr
                      </p>
                    </div>
                  </div>

                  {/* Item Summary Box */}
                  <div className="flex-1 bg-[var(--bg-main)]/50 rounded-2xl p-4 border border-[var(--border-color)]/50 ring-1 ring-black/[0.02] dark:ring-white/[0.02] mb-6">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                        Items
                      </span>
                      <span className="text-[10px] font-bold text-sky-500">
                        {order.items?.length || 0} Total
                      </span>
                    </div>
                    <div className="space-y-2">
                      {order.items?.slice(0, 2).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 px-2 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm"
                        >
                          <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 flex-shrink-0">
                            <Package size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-[var(--text-main)] truncate">
                              {item.productName || "Product"}
                            </p>
                            <p className="text-[9px] text-[var(--text-secondary)] font-medium">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <p className="text-[10px] font-bold text-sky-500/70 text-center pt-1">
                          + {order.items.length - 2} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Mapping to Grid Bottom */}
                  <div className="flex items-center gap-2 mt-auto">
                    <button className="flex-1 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 shadow-lg shadow-sky-500/20 transition-all">
                      Details
                    </button>
                    <button className="px-4 py-2.5 rounded-xl bg-[var(--bg-main)] text-[var(--text-main)] text-xs font-bold border border-[var(--border-color)] hover:border-sky-500/50 transition-all">
                      Track
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerView;
