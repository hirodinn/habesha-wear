import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Search,
  Trash2,
  AlertCircle,
} from "lucide-react";

const AdminOrdersView = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [productsById, setProductsById] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products");
        const list = Array.isArray(response.data) ? response.data : [];
        const map = list.reduce((acc, p) => {
          if (p?._id) acc[String(p._id)] = p;
          return acc;
        }, {});
        setProductsById(map);
      } catch {
        setProductsById({});
      }
    };
    fetchProducts();
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

  const handleDeleteOrder = async (order) => {
    if (
      !confirm(
        `Are you sure you want to delete order "${order._id}"? This action is permanent.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`/api/orders/${order._id}`);
      setActionMessage({
        type: "success",
        text: `Order ${order._id} deleted permanently.`,
      });
      if (expandedOrderId === order._id) setExpandedOrderId(null);
      fetchOrders();
    } catch {
      setActionMessage({
        type: "error",
        text: "Failed to delete order.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(typeof o.userId === "object" ? o.userId?._id : o.userId)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(typeof o.userId === "object" ? o.userId?.name : "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getOrderUserId = (order) => {
    const u = order?.userId;
    if (!u) return "N/A";
    if (typeof u === "string") return u;
    return u._id || u.id ? String(u._id || u.id) : "N/A";
  };

  const getOrderUserName = (order) => {
    const u = order?.userId;
    if (!u) return "Unknown Customer";
    if (typeof u === "object" && u.name) return u.name;
    if (typeof u === "object" && (u._id || u.id)) {
      const fallback = usersById[String(u._id || u.id)];
      if (fallback?.name) return fallback.name;
    }
    if (typeof u === "string" && usersById[u]?.name) return usersById[u].name;
    return "Unknown Customer";
  };

  const resolveProduct = (productRef) => {
    if (!productRef) return null;
    if (typeof productRef === "object" && productRef.name) return productRef;
    if (typeof productRef === "object" && (productRef._id || productRef.id)) {
      return productsById[String(productRef._id || productRef.id)] || null;
    }
    if (typeof productRef === "string") return productsById[productRef] || null;
    return null;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "shipped":
        return "bg-[var(--color-burgundy)]/20 text-[var(--color-burgundy)]";
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
          <div className="p-3 bg-[var(--color-burgundy)]/10 rounded-2xl border border-[var(--color-burgundy)]/20">
            <Package className="w-8 h-8 text-[var(--color-burgundy)]" />
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
              Order Management
            </h1>
            <p className="text-(--text-secondary)">
              Logistics and delivery tracking
            </p>
          </div>
        </div>

        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-burgundy)] transition-colors w-5 h-5" />
          <input
            type="text"
            placeholder="Search by order ID or user ID..."
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
                <Fragment key={order._id}>
                  <tr
                    onDoubleClick={() =>
                      setExpandedOrderId((prev) =>
                        prev === order._id ? null : order._id
                      )
                    }
                    className={`group transition-colors cursor-pointer ${
                      expandedOrderId === order._id
                        ? "bg-[var(--color-burgundy)]/10"
                        : "hover:bg-[var(--color-burgundy)]/5"
                    }`}
                    title="Double-click to expand/collapse"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-(--text-secondary)">
                      {order._id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-(--text-main)">
                        {getOrderUserName(order)}
                      </div>
                      <div className="text-[10px] text-(--text-secondary) font-mono mt-1 truncate max-w-[240px]">
                        {getOrderUserId(order)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-(--text-secondary)">
                      {new Date(
                        order.createdAt || order.orderDate || Date.now()
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
                          className="bg-(--input-bg) border border-(--border-color) rounded-lg text-xs p-1 focus:outline-none focus:border-[var(--color-burgundy)] cursor-pointer text-(--text-main)"
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(order);
                          }}
                          disabled={loading}
                          className="p-1.5 text-(--text-secondary) hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all cursor-pointer"
                          title="Hard Delete Order"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedOrderId === order._id && (
                    <tr className="bg-[var(--color-burgundy)]/5 animate-fade-in">
                      <td colSpan="5" className="px-6 py-6 border-b border-(--border-color)">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-secondary)">
                              Order Details
                            </h4>
                            <p className="text-sm text-(--text-main)">
                              <span className="font-semibold">Customer:</span>{" "}
                              {getOrderUserName(order)}
                            </p>
                            <p className="text-sm text-(--text-main)">
                              <span className="font-semibold">User ID:</span>{" "}
                              {getOrderUserId(order)}
                            </p>
                            {typeof order.userId === "object" && order.userId?.email && (
                              <p className="text-sm text-(--text-main)">
                                <span className="font-semibold">Email:</span> {order.userId.email}
                              </p>
                            )}
                            <p className="text-sm text-(--text-main)">
                              <span className="font-semibold">Total:</span>{" "}
                              {Number(order.totalAmount || 0).toLocaleString()} Birr
                            </p>
                            <p className="text-sm text-(--text-main)">
                              <span className="font-semibold">Ordered:</span>{" "}
                              {new Date(order.orderDate || order.createdAt || Date.now()).toLocaleString()}
                            </p>
                            <p className="text-sm text-(--text-main)">
                              <span className="font-semibold">Delivery Date:</span>{" "}
                              {order.deliveredDate
                                ? new Date(order.deliveredDate).toLocaleString()
                                : "N/A"}
                            </p>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-secondary)">
                              Items ({order.products?.length || 0})
                            </h4>
                            {order.products?.length ? (
                              <div className="space-y-2">
                                {order.products.map((item, idx) => (
                                  (() => {
                                    const product = resolveProduct(item.productId);
                                    const image = product?.images?.[0];
                                    const name = product?.name || "Unknown Product";
                                    const productId =
                                      typeof item.productId === "object"
                                        ? item.productId?._id || item.productId?.id
                                        : item.productId;
                                    return (
                                  <div
                                    key={idx}
                                    className="p-3 rounded-lg border border-(--border-color) bg-(--bg-main) flex items-center gap-3"
                                  >
                                    {image ? (
                                      <img
                                        src={image}
                                        alt={name}
                                        className="w-10 h-10 rounded-lg object-cover border border-(--border-color)"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-lg border border-(--border-color) bg-(--bg-card) flex items-center justify-center text-[10px] text-(--text-secondary)">
                                        N/A
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="text-sm text-(--text-main) font-semibold truncate">
                                        {name}
                                      </p>
                                      <p className="text-xs text-(--text-secondary)">
                                        Quantity: <span className="font-semibold">{item.quantity}</span>
                                      </p>
                                      <p className="text-[10px] text-(--text-secondary) font-mono truncate">
                                        Product ID: {productId}
                                      </p>
                                    </div>
                                  </div>
                                    );
                                  })()
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-(--text-secondary)">No items found.</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
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
