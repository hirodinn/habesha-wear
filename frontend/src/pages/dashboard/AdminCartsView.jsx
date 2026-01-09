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
                <tr
                  key={cart._id}
                  className="group hover:bg-sky-500/5 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs text-(--text-secondary)">
                    {cart._id}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-(--text-main)">
                    {cart.userId}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {cart.products?.length || 0}
                      </span>
                      <span className="text-xs text-(--text-secondary) font-medium italic">
                        Items
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-sky-500 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20 uppercase tracking-wider">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-(--text-secondary) hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/10 rounded-lg transition-all cursor-pointer">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCarts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-sky-500/20" />
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
