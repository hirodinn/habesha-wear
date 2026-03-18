import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Shield,
  Users,
  AlertCircle,
  Package,
  ShoppingCart,
  Truck,
  ChevronRight,
  DollarSign,
  BadgeCheck,
  Clock3,
  Archive,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from "recharts";

const AdminView = () => {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    pendingProducts: 0,
    orders: 0,
    carts: 0,
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchChartData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get("/api/products"),
        axios.get("/api/orders"),
      ]);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setProducts([]);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchChartData();
  }, []);

  const productStatusData = useMemo(() => {
    const counts = { active: 0, pending: 0, archived: 0 };
    products.forEach((p) => {
      const key = (p?.status || "pending").toLowerCase();
      if (Object.prototype.hasOwnProperty.call(counts, key)) counts[key] += 1;
    });
    return [
      { name: "Active", value: counts.active, color: "#16a34a" },
      { name: "Pending", value: counts.pending, color: "#f59e0b" },
      { name: "Archived", value: counts.archived, color: "#64748b" },
    ];
  }, [products]);

  const topCategoryData = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const key = (p?.category || "Uncategorized").trim() || "Uncategorized";
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [products]);

  const ordersByMonthData = useMemo(() => {
    const now = new Date();
    const monthLabels = [];
    const monthMap = new Map();

    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-US", { month: "short" });
      monthLabels.push({ key, label });
      monthMap.set(key, 0);
    }

    orders.forEach((o) => {
      const dateValue = o?.orderDate || o?.createdAt;
      if (!dateValue) return;
      const d = new Date(dateValue);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthMap.has(key)) {
        monthMap.set(key, (monthMap.get(key) || 0) + 1);
      }
    });

    return monthLabels.map((m) => ({ month: m.label, orders: monthMap.get(m.key) || 0 }));
  }, [orders]);

  const revenueSummary = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o?.totalAmount || 0), 0);
    const averageOrderValue = orders.length ? totalRevenue / orders.length : 0;
    const deliveredOrders = orders.filter((o) => o?.status === "delivered").length;
    const shippedOrders = orders.filter((o) => o?.status === "shipped").length;
    const pendingOrders = orders.filter((o) => o?.status === "pending").length;
    const cancelledOrders = orders.filter((o) => o?.status === "cancelled").length;
    const fulfillmentRate = orders.length
      ? ((deliveredOrders + shippedOrders) / orders.length) * 100
      : 0;

    return {
      totalRevenue,
      averageOrderValue,
      deliveredOrders,
      shippedOrders,
      pendingOrders,
      cancelledOrders,
      fulfillmentRate,
    };
  }, [orders]);

  const inventoryInsights = useMemo(() => {
    const lowStock = products.filter((p) => Number(p?.stock || 0) > 0 && Number(p?.stock || 0) <= 5).length;
    const outOfStock = products.filter((p) => Number(p?.stock || 0) <= 0).length;
    const activeProducts = products.filter((p) => p?.status === "active").length;
    const avgRating = products.length
      ? products.reduce((sum, p) => sum + Number(p?.ratingAverage || 0), 0) / products.length
      : 0;

    return {
      lowStock,
      outOfStock,
      activeProducts,
      avgRating,
    };
  }, [products]);

  const revenueByMonthData = useMemo(() => {
    const now = new Date();
    const monthLabels = [];
    const monthMap = new Map();

    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-US", { month: "short" });
      monthLabels.push({ key, label });
      monthMap.set(key, 0);
    }

    orders.forEach((o) => {
      const dateValue = o?.orderDate || o?.createdAt;
      if (!dateValue) return;
      const d = new Date(dateValue);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthMap.has(key)) {
        monthMap.set(key, (monthMap.get(key) || 0) + Number(o?.totalAmount || 0));
      }
    });

    return monthLabels.map((m) => ({ month: m.label, revenue: monthMap.get(m.key) || 0 }));
  }, [orders]);

  const orderStatusData = useMemo(
    () => [
      { name: "Pending", value: revenueSummary.pendingOrders, color: "#f59e0b" },
      { name: "Shipped", value: revenueSummary.shippedOrders, color: "#0ea5e9" },
      { name: "Delivered", value: revenueSummary.deliveredOrders, color: "#16a34a" },
      { name: "Cancelled", value: revenueSummary.cancelledOrders, color: "#ef4444" },
    ],
    [revenueSummary]
  );

  const formatNumber = (value) => Number(value || 0).toLocaleString("en-US");

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-burgundy)]/20 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--color-burgundy)]/5 p-6 md:p-8">
        <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-[var(--color-burgundy)]/10 blur-3xl" />
        <div className="absolute -left-14 -bottom-14 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[var(--color-burgundy)]/10 rounded-2xl border border-[var(--color-burgundy)]/20">
              <Shield className="w-8 h-8 text-[var(--color-burgundy)]" />
            </div>
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--text-main)]">
                Admin Intelligence Hub
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                Real-time store performance, operations, and fulfillment analytics.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-[260px]">
            <div className="rounded-xl border border-(--border-color) bg-[var(--bg-main)]/70 p-3">
              <p className="text-xs text-[var(--text-secondary)]">Total Revenue</p>
              <p className="text-lg font-bold text-[var(--text-main)]">{formatNumber(revenueSummary.totalRevenue)} Birr</p>
            </div>
            <div className="rounded-xl border border-(--border-color) bg-[var(--bg-main)]/70 p-3">
              <p className="text-xs text-[var(--text-secondary)]">Fulfillment</p>
              <p className="text-lg font-bold text-[var(--text-main)]">{revenueSummary.fulfillmentRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats – clickable to admin sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Link
          to="/admin/products"
          className="card-standard p-6 relative overflow-hidden group bg-[var(--bg-card)] border-[var(--color-burgundy)]/10 hover:border-[var(--color-burgundy)]/30 transition-colors block"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--color-burgundy)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-burgundy)]/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[var(--color-burgundy)]/10 rounded-lg">
              <Package className="text-[var(--color-burgundy)] w-5 h-5" />
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--color-burgundy)]" />
          </div>
          <p className="text-[var(--text-secondary)] text-sm">Total Products</p>
          <p className="text-3xl font-display font-bold mt-1 text-[var(--text-main)]">
            {stats.products}
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="card-standard p-6 relative overflow-hidden group bg-[var(--bg-card)] border-[var(--color-burgundy)]/10 hover:border-[var(--color-burgundy)]/30 transition-colors block"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--color-burgundy)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-burgundy)]/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[var(--color-burgundy)]/10 rounded-lg">
              <Users className="text-[var(--color-burgundy)] w-5 h-5" />
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--color-burgundy)]" />
          </div>
          <p className="text-[var(--text-secondary)] text-sm">Total Users</p>
          <p className="text-3xl font-display font-bold mt-1 text-[var(--text-main)]">
            {stats.users}
          </p>
        </Link>

        <Link
          to="/admin/pending"
          className="card-standard p-6 relative overflow-hidden group bg-[var(--bg-card)] border-[var(--color-burgundy)]/10 hover:border-[var(--color-burgundy)]/30 transition-colors block"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertCircle className="text-amber-600 dark:text-amber-400 w-5 h-5" />
            </div>
            {stats.pendingProducts > 0 && (
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle size={12} /> Action Needed
              </span>
            )}
            {stats.pendingProducts === 0 && (
              <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--color-burgundy)]" />
            )}
          </div>
          <p className="text-[var(--text-secondary)] text-sm">
            Pending Approval
          </p>
          <p className="text-3xl font-display font-bold mt-1 text-[var(--text-main)]">
            {stats.pendingProducts}
          </p>
        </Link>

        <Link
          to="/admin/orders"
          className="card-standard p-6 relative overflow-hidden group bg-[var(--bg-card)] border-[var(--color-burgundy)]/10 hover:border-[var(--color-burgundy)]/30 transition-colors block"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--color-burgundy)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-burgundy)]/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[var(--color-burgundy)]/10 rounded-lg">
              <Truck className="text-[var(--color-burgundy)] w-5 h-5" />
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--color-burgundy)]" />
          </div>
          <p className="text-[var(--text-secondary)] text-sm">Total Orders</p>
          <p className="text-3xl font-display font-bold mt-1 text-[var(--text-main)]">
            {stats.orders}
          </p>
        </Link>

        <Link
          to="/admin/carts"
          className="card-standard p-6 relative overflow-hidden group bg-[var(--bg-card)] border-[var(--color-burgundy)]/10 hover:border-[var(--color-burgundy)]/30 transition-colors block"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--color-burgundy)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-burgundy)]/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[var(--color-burgundy)]/10 rounded-lg">
              <ShoppingCart className="text-[var(--color-burgundy)] w-5 h-5" />
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--color-burgundy)]" />
          </div>
          <p className="text-[var(--text-secondary)] text-sm">Active Carts</p>
          <p className="text-3xl font-display font-bold mt-1 text-[var(--text-main)]">
            {stats.carts}
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-4 card-standard p-5 bg-[var(--bg-card)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--text-main)]">Product Status</h3>
            <span className="text-xs text-[var(--text-secondary)]">Live Mix</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {productStatusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value}`, name]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
            {productStatusData.map((item) => (
              <div key={item.name} className="rounded-lg border border-(--border-color) px-2 py-1.5">
                <p className="font-semibold" style={{ color: item.color }}>
                  {item.name}
                </p>
                <p className="text-[var(--text-main)] font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="xl:col-span-8 card-standard p-5 bg-[var(--bg-card)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--text-main)]">Orders Trend</h3>
            <span className="text-xs text-[var(--text-secondary)]">Last 6 Months</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ordersByMonthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7f1d1d" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#7f1d1d" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`${value} orders`, "Orders"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#7f1d1d"
                  strokeWidth={3}
                  fill="url(#ordersGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="xl:col-span-6 card-standard p-5 bg-[var(--bg-card)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--text-main)]">Revenue Trend</h3>
            <span className="text-xs text-[var(--text-secondary)]">Monthly Gross (Birr)</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByMonthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`${formatNumber(value)} Birr`, "Revenue"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid rgba(148, 163, 184, 0.25)" }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="xl:col-span-6 card-standard p-5 bg-[var(--bg-card)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--text-main)]">Order Status Distribution</h3>
            <span className="text-xs text-[var(--text-secondary)]">Operational Health</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderStatusData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`${value} orders`, "Orders"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid rgba(148, 163, 184, 0.25)" }}
                />
                <Legend />
                <Bar dataKey="value" name="Orders" radius={[8, 8, 0, 0]}>
                  {orderStatusData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="xl:col-span-12 card-standard p-5 bg-[var(--bg-card)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--text-main)]">Top Categories</h3>
            <span className="text-xs text-[var(--text-secondary)]">By Product Count</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCategoryData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`${value} products`, "Count"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#7f1d1d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card-standard p-4 bg-[var(--bg-card)] border-[var(--color-burgundy)]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Avg Order Value</p>
              <p className="text-2xl font-bold text-[var(--text-main)] mt-1">{formatNumber(revenueSummary.averageOrderValue)} Birr</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="card-standard p-4 bg-[var(--bg-card)] border-[var(--color-burgundy)]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Low Stock Items</p>
              <p className="text-2xl font-bold text-[var(--text-main)] mt-1">{inventoryInsights.lowStock}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock3 className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="card-standard p-4 bg-[var(--bg-card)] border-[var(--color-burgundy)]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Out of Stock</p>
              <p className="text-2xl font-bold text-[var(--text-main)] mt-1">{inventoryInsights.outOfStock}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Archive className="w-5 h-5 text-rose-600" />
            </div>
          </div>
        </div>

        <div className="card-standard p-4 bg-[var(--bg-card)] border-[var(--color-burgundy)]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Average Product Rating</p>
              <p className="text-2xl font-bold text-[var(--text-main)] mt-1">{inventoryInsights.avgRating.toFixed(2)} / 5</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <BadgeCheck className="w-5 h-5 text-sky-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
