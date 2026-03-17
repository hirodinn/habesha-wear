import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Search, Trash2, AlertCircle } from "lucide-react";

const AdminCartsView = () => {
  const navigate = useNavigate();
  const [carts, setCarts] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [productsById, setProductsById] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCartId, setExpandedCartId] = useState(null);

  const fetchCarts = async () => {
    try {
      const response = await axios.get("/api/carts");
      setCarts(response.data);
    } catch (error) {
      console.error("Error fetching carts:", error);
    }
  };

  useEffect(() => {
    fetchCarts();
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

  const filteredCarts = carts.filter(
    (c) =>
      c._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(typeof c.userId === "object" ? c.userId?._id : c.userId)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(typeof c.userId === "object" ? c.userId?.name : "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getCartUserId = (cart) =>
    typeof cart.userId === "object" ? cart.userId?._id : cart.userId;
  const getCartUserName = (cart) => {
    if (typeof cart.userId === "object" && cart.userId?.name) return cart.userId.name;
    const id = getCartUserId(cart);
    if (id && usersById[String(id)]?.name) return usersById[String(id)].name;
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

  const handleDeleteCart = async (cart) => {
    if (
      !confirm(
        `Are you sure you want to delete cart "${cart._id}"? This action is permanent.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`/api/carts/${cart._id}`);
      setActionMessage({
        type: "success",
        text: `Cart ${cart._id} deleted permanently.`,
      });
      if (expandedCartId === cart._id) setExpandedCartId(null);
      fetchCarts();
    } catch (error) {
      setActionMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to delete cart.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[var(--color-burgundy)]/10 rounded-2xl border border-[var(--color-burgundy)]/20">
            <ShoppingCart className="w-8 h-8 text-[var(--color-burgundy)]" />
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
              Cart Management
            </h1>
            <p className="text-(--text-secondary)">
              Overview of active abandoned/ongoing carts
            </p>
          </div>
        </div>

        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-burgundy)] transition-colors w-5 h-5" />
          <input
            type="text"
            placeholder="Search by cart or user ID..."
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
                  Cart ID
                </th>
                <th className="px-6 py-4 font-bold border-b border-(--border-color)">
                  User ID
                </th>
                <th className="px-6 py-4 font-bold border-b border-(--border-color)">
                  Items
                </th>
                <th className="px-6 py-4 font-bold border-b border-(--border-color)">
                  Status
                </th>
                <th className="px-6 py-4 font-bold border-b border-(--border-color) text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-color)">
              {filteredCarts.map((cart) => (
                <Fragment key={cart._id}>
                  <tr
                    onDoubleClick={() =>
                      setExpandedCartId((prev) =>
                        prev === cart._id ? null : cart._id
                      )
                    }
                    className={`group transition-colors cursor-pointer ${
                      expandedCartId === cart._id
                        ? "bg-[var(--color-burgundy)]/10"
                        : "hover:bg-[var(--color-burgundy)]/5"
                    }`}
                    title="Double-click to expand/collapse"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-(--text-secondary)">
                      {cart._id}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-(--text-main)">
                      <div className="text-sm font-medium text-(--text-main)">
                        {getCartUserName(cart)}
                      </div>
                      <div className="text-[10px] text-(--text-secondary) font-mono mt-1 truncate max-w-[240px]">
                        {getCartUserId(cart)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-[var(--color-burgundy)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {cart.products?.length || 0}
                        </span>
                        <span className="text-xs text-(--text-secondary) font-medium italic">
                          Items
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-[var(--color-burgundy)] bg-[var(--color-burgundy)]/10 px-2.5 py-1 rounded-full border border-[var(--color-burgundy)]/20 uppercase tracking-wider">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCart(cart);
                          }}
                          disabled={loading}
                          className="p-1.5 text-(--text-secondary) hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all cursor-pointer"
                          title="Hard Delete Cart"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedCartId === cart._id && (
                    <tr className="bg-[var(--color-burgundy)]/5 animate-fade-in">
                      <td colSpan="5" className="px-6 py-6 border-b border-(--border-color)">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-secondary)">
                              Cart Details
                            </h4>
                            <p className="text-sm text-(--text-main) mt-2">
                              <span className="font-semibold">Customer:</span> {getCartUserName(cart)}
                            </p>
                            <p className="text-sm text-(--text-main)">
                              <span className="font-semibold">User ID:</span> {getCartUserId(cart)}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-secondary) mb-2">
                              Items ({cart.products?.length || 0})
                            </h4>
                            {cart.products?.length ? (
                              <div className="space-y-2">
                                {cart.products.map((item, idx) => (
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
                                      <p className="text-sm text-(--text-main) truncate">
                                        <span className="font-semibold">Product:</span> {name}
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
                              <p className="text-sm text-(--text-secondary)">No items in this cart.</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {filteredCarts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-[var(--color-burgundy)]/20" />
                    <p className="text-(--text-secondary)">
                      Perfect! No abandoned shopping carts currently.
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

export default AdminCartsView;
