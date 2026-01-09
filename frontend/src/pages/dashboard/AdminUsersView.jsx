import { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  Search,
  Trash2,
  AlertCircle,
  Mail,
  Shield,
  User,
} from "lucide-react";

const AdminUsersView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (user) => {
    if (user.role === "owner") {
      alert("The owner cannot be deleted.");
      return;
    }
    if (
      !confirm(
        `Are you sure you want to delete user ${user.email}? This action is permanent.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`/api/users/${user._id}`);
      setActionMessage({
        type: "success",
        text: `User ${user.email} deleted.`,
      });
      fetchUsers();
    } catch (error) {
      setActionMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to delete user.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-500/30">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-(--text-main)">
              User Management
            </h1>
            <p className="text-(--text-secondary)">
              View and manage platform accounts
            </p>
          </div>
        </div>

        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors w-5 h-5" />
          <input
            type="text"
            placeholder="Search by email or name..."
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className="card-standard p-6 flex flex-col justify-between group hover:border-sky-500/30 bg-(--bg-card)"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-(--bg-main) border border-(--border-color)">
                  {user.role === "admin" || user.role === "owner" ? (
                    <Shield className="w-6 h-6 text-sky-500" />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    user.role === "owner"
                      ? "bg-purple-100 text-purple-700 border-purple-200"
                      : user.role === "admin"
                      ? "bg-sky-100 text-sky-700 border-sky-200"
                      : user.role === "vendor"
                      ? "bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  {user.role}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-lg text-(--text-main) truncate">
                  {user.name}
                </h3>
                <div className="flex items-center gap-2 text-(--text-secondary) text-sm mt-1">
                  <Mail size={14} />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-(--border-color) flex justify-end">
              <button
                onClick={() => handleDeleteUser(user)}
                disabled={loading || user.role === "owner"}
                className="p-2 text-(--text-secondary) hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Delete User"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="col-span-full text-center py-20 bg-(--bg-card) rounded-3xl border border-(--border-color) border-dashed">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-500/20" />
            <h3 className="text-xl font-bold text-(--text-main)">
              No users found
            </h3>
            <p className="text-(--text-secondary)">
              {searchTerm
                ? "No users match your search."
                : "No users registered on the platform."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersView;
