import { useState, useEffect } from "react";
import axios from "axios";
import {
  Package,
  Search,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

const AdminOrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      await axios.put(`/api/orders/${orderId}`, { status: newStatus });
      setActionMessage({
        type: "success",
        text: `Order status updated to ${newStatus}.`,
      });
      fetchOrders();
    } catch {
      setActionMessage({
        type: "error",
        text: "Failed to update order status.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-500/30">
            <Package className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-(--text-main)">
              Order Management
            </h1>
            <p className="text-(--text-secondary)">
              Logistics and delivery tracking
            </p>
          </div>
        </div>

        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors w-5 h-5" />
          <input
            type="text"
            placeholder="Search by order ID or user ID..."
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
                  Order ID
                </th>
                <th className="px-6 py-4 font-bold border-b border-(--border-color)">
                  User
                </th>
                <th className="px-6 py-4 font-bold border-b border-(--border-color)">
                  Date
                </th>
                <th className="px-6 py-4 font-bold border-b border-(--border-color)">
                  Status
                </th>
                <th className="px-6 py-4 font-bold border-b border-(--border-color)">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-color)">
              {filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="group hover:bg-sky-500/5 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs text-(--text-secondary)">
                    {order._id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-(--text-main)">
                      {order.userId}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-(--text-secondary)">
                    {new Date(
                      order.createdAt ||
                        order._id.getTimestamp?.() ||
                        Date.now()
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        className="bg-(--input-bg) border border-(--border-color) rounded-lg text-xs p-1 focus:outline-none focus:border-sky-500 cursor-pointer text-(--text-main)"
                        value={order.status || "pending"}
                        onChange={(e) =>
                          handleUpdateStatus(order._id, e.target.value)
                        }
                        disabled={loading}
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-500/20" />
                    <p className="text-(--text-secondary)">No orders found.</p>
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

export default AdminOrdersView;
