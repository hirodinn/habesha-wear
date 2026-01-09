import { useState, useEffect } from "react";
import axios from "axios";
import { Check, X, Clock, AlertCircle, Search } from "lucide-react";

const AdminPendingView = () => {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPendingProducts = async () => {
    try {
      const response = await axios.get("/api/preproducts");
      setPendingProducts(response.data);
    } catch (error) {
      console.error("Error fetching pending products:", error);
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const handleApprove = async (product) => {
    setLoading(true);
    try {
      const { _id, __v, ...productData } = product;
      delete productData.status;
      console.log(productData);
      await axios.post("/api/products", productData);
      await axios.put(`/api/preproducts/${_id}`, { status: "accepted" });
      setActionMessage({ type: "success", text: `Approved ${product.name}` });
      fetchPendingProducts();
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
      await axios.put(`/api/preproducts/${id}`, { status: "rejected" });
      setActionMessage({
        type: "success",
        text: "Product request rejected/deleted.",
      });
      fetchPendingProducts();
    } catch {
      setActionMessage({ type: "error", text: "Rejection failed." });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = pendingProducts.filter(
    (p) =>
      p.status === "pending" &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-500/30">
            <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-(--text-main)">
              Pending Approvals
            </h1>
            <p className="text-(--text-secondary)">
              Validate and approve vendor products
            </p>
          </div>
        </div>

        <div className="relative group min-w-75">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors w-5 h-5" />
          <input
            type="text"
            placeholder="Search pending products..."
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

      <div className="grid grid-cols-1 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="card-standard p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-sky-500/30 bg-(--bg-card)"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-xl text-(--text-main)">
                  {product.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-(--bg-main) text-xs text-(--text-secondary) border border-(--border-color) uppercase tracking-wide">
                  {product.category}
                </span>
              </div>
              <p className="text-(--text-secondary) text-sm mb-4 max-w-2xl leading-relaxed">
                {product.description}
              </p>
              <div className="flex gap-6 text-sm">
                <div className="flex flex-col">
                  <span className="text-(--text-secondary) text-xs uppercase tracking-wider">
                    Price
                  </span>
                  <span className="font-bold text-(--text-main) text-lg">
                    {product.price} Birr
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-(--text-secondary) text-xs uppercase tracking-wider">
                    Stock
                  </span>
                  <span className="font-bold text-(--text-main) text-lg">
                    {product.stock} Units
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-(--text-secondary) text-xs uppercase tracking-wider">
                    Vendor ID
                  </span>
                  <span className="font-medium text-(--text-main)">
                    {product.userId || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
              <button
                onClick={() => handleApprove(product)}
                disabled={loading}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md shadow-green-500/20 cursor-pointer disabled:opacity-50"
              >
                <Check size={18} /> Approve
              </button>
              <button
                onClick={() => handleReject(product._id)}
                disabled={loading}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-(--border-color) hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 dark:hover:border-red-800 text-(--text-secondary) hover:text-red-500 font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <X size={18} /> Reject
              </button>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-(--bg-card) rounded-3xl border border-(--border-color) border-dashed">
            <Check className="w-16 h-16 mx-auto mb-4 text-green-500/30" />
            <h3 className="text-xl font-bold text-(--text-main)">
              No pending products
            </h3>
            <p className="text-(--text-secondary)">
              {searchTerm
                ? "No products match your search."
                : "All caught up! No items to approve."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPendingView;
