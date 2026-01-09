import { useState, useEffect } from "react";
import axios from "axios";
import {
  ShoppingCart,
  Search,
  Users,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

const AdminCartsView = () => {
  const [carts, setCarts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredCarts = carts.filter(
    (c) =>
      c._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-sky-100 dark:bg-sky-900/20 rounded-2xl border border-sky-200 dark:border-sky-500/30">
            <ShoppingCart className="w-8 h-8 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-(--text-main)">
              Cart Management
            </h1>
            <p className="text-(--text-secondary)">
              Overview of active abandoned/ongoing carts
            </p>
          </div>
        </div>

        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors w-5 h-5" />
          <input
            type="text"
            placeholder="Search by cart or user ID..."
            className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl pl-12 pr-4 py-2.5 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all text-(--text-main) placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCarts.map((cart) => (
          <div
            key={cart._id}
            className="card-standard p-6 flex flex-col group hover:border-sky-500/30 bg-(--bg-card)"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-(--bg-main) rounded-lg border border-(--border-color)">
                <Clock className="w-5 h-5 text-(--text-secondary)" />
              </div>
              <span className="text-xs font-bold text-sky-500 bg-sky-500/10 px-2 py-1 rounded-md">
                Active
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-secondary)">
                  Cart ID
                </span>
                <p className="text-xs font-mono text-(--text-main) truncate">
                  {cart._id}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-secondary)">
                  User ID
                </span>
                <p className="text-xs font-mono text-(--text-main) truncate">
                  {cart.userId}
                </p>
              </div>
              <div className="pt-2">
                <div className="flex justify-between items-center bg-(--bg-main) p-3 rounded-xl border border-(--border-color)">
                  <span className="text-sm font-bold text-(--text-main)">
                    Total Items
                  </span>
                  <span className="bg-sky-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {cart.products?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-(--border-color) flex justify-between items-center">
              <span className="text-xs text-(--text-secondary)">
                Last updated: 3 hours ago
              </span>
              <button className="p-2 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/10 rounded-lg transition-all cursor-pointer">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ))}
        {filteredCarts.length === 0 && (
          <div className="col-span-full text-center py-20 bg-(--bg-card) rounded-3xl border border-(--border-color) border-dashed">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-sky-500/20" />
            <h3 className="text-xl font-bold text-(--text-main)">
              No active carts
            </h3>
            <p className="text-(--text-secondary)">
              Perfect! No abandoned shopping carts currently.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCartsView;
