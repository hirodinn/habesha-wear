import { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  Search,
  Trash2,
  AlertCircle,
  Mail,
  Shield,
  Plus,
  X,
  UserPlus,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useSelector } from "react-redux";

const AdminAdminsView = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user: currentUser } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const fetchAdmins = async () => {
    try {
      const response = await axios.get("/api/users");
      // Filter only admins
      const adminsOnly = response.data.filter((u) => u.role === "admin");
      setAdmins(adminsOnly);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDeleteAdmin = async (admin) => {
    if (
      !confirm(
        `Are you sure you want to delete admin ${admin.email}? This action is permanent.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`/api/users/${admin._id}`);
      setActionMessage({
        type: "success",
        text: `Admin ${admin.email} deleted.`,
      });
      fetchAdmins();
    } catch (error) {
      setActionMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to delete admin.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionMessage(null);

    try {
      await axios.post("/api/users/add-admin", formData);
      setActionMessage({
        type: "success",
        text: `Admin ${formData.email} added successfully!`,
      });
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "" });
      fetchAdmins();
    } catch (error) {
      setActionMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to add admin.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-500/30">
            <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-(--text-main)">
              Admin Management
            </h1>
            <p className="text-(--text-secondary)">
              View and manage platform administrators
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors w-5 h-5" />
            <input
              type="text"
              placeholder="Search admins..."
              className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl pl-12 pr-4 py-2.5 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all text-(--text-main) placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {currentUser?.role === "owner" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-sky-500/20 cursor-pointer"
            >
              <Plus size={18} /> Add Admin
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 animate-slide-up ${
            actionMessage.type === "success"
              ? "bg-green-100 dark:bg-green-900/10 border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-300"
              : "bg-red-100 dark:bg-red-900/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={20} />
            {actionMessage.text}
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="card-standard overflow-hidden bg-(--bg-card)">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-(--bg-main) text-(--text-secondary) text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold border-b border-(--border-color)">
                  Admin
                </th>
                <th className="px-6 py-4 font-bold border-b border-(--border-color)">
                  Email
                </th>
                <th className="px-6 py-4 font-bold border-b border-(--border-color)">
                  Role
                </th>
                <th className="px-6 py-4 font-bold border-b border-(--border-color) text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-color)">
              {filteredAdmins.map((admin) => (
                <tr
                  key={admin._id}
                  className="group hover:bg-sky-500/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-(--bg-main) border border-(--border-color)">
                        <Shield size={16} className="text-sky-500" />
                      </div>
                      <span className="font-bold text-sm text-(--text-main)">
                        {admin.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-(--text-secondary) text-sm">
                      <Mail size={14} />
                      {admin.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-sky-100 text-sky-700 border-sky-200">
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {currentUser?.role === "owner" && (
                      <button
                        onClick={() => handleDeleteAdmin(admin)}
                        disabled={loading}
                        className="p-2 text-(--text-secondary) hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Delete Admin"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAdmins.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-500/20" />
                    <p className="text-(--text-secondary)">
                      {searchTerm
                        ? "No admins match your search."
                        : "No platform administrators found."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-(--bg-card) border border-(--border-color) rounded-3xl shadow-2xl animate-scale-up overflow-hidden">
            <div className="p-6 border-b border-(--border-color) flex items-center justify-between bg-(--bg-main)">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-500/10 rounded-xl">
                  <UserPlus className="w-6 h-6 text-sky-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-(--text-main)">
                    Add New Admin
                  </h2>
                  <p className="text-xs text-(--text-secondary)">
                    Create a new administrator account
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-(--text-secondary) hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-(--text-main) ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="John Doe"
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all text-(--text-main)"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-(--text-main) ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@habeshawear.com"
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all text-(--text-main)"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-(--text-main) ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all text-(--text-main)"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-secondary) hover:text-sky-500 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-(--border-color) text-(--text-secondary) font-bold rounded-xl hover:bg-(--bg-main) transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Create Admin"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdminsView;
