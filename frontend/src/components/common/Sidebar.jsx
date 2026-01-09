import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  logoutUser,
  toggleDarkMode,
  toggleSidebar,
} from "../../redux/userAction";
import {
  User as UserIcon,
  LogOut,
  Package,
  Sun,
  Moon,
  ShoppingCart,
  LayoutDashboard,
  Info,
  ChevronLeft,
  ChevronRight,
  Home,
  Clock,
  Users,
  Tag,
} from "lucide-react";

const NavItem = ({ to, icon: Icon, label, badge, isCollapsed, location }) => {
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 relative ${
        isActive
          ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
          : "text-(--text-secondary) hover:bg-sky-500/10 hover:text-sky-500"
      }`}
      title={isCollapsed ? label : ""}
    >
      <div className="shrink-0">
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      {!isCollapsed && (
        <span className="font-semibold text-sm whitespace-nowrap overflow-hidden animate-fade-in">
          {label}
        </span>
      )}
      {badge > 0 && (
        <span
          className={`absolute ${
            isCollapsed ? "top-1 right-1" : "right-3"
          } flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-(--bg-card)`}
        >
          {badge}
        </span>
      )}
      {isActive && !isCollapsed && (
        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      )}
    </Link>
  );
};

const Sidebar = () => {
  const {
    user,
    darkMode,
    isSidebarCollapsed: isCollapsed,
  } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col h-screen fixed left-0 top-0 border-r border-(--border-color) bg-(--bg-card)/80 backdrop-blur-xl transition-all duration-500 ease-in-out z-50 ${
          isCollapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Header: Logo */}
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-linear-to-br from-sky-400 to-blue-600 rounded-2xl text-white shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-all duration-500 group-hover:rotate-6">
              <Package size={22} strokeWidth={2.5} />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-display font-bold tracking-tight text-(--text-main) animate-fade-in">
                Habesha Wear
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          <div
            className={`mb-4 px-2 text-[10px] font-bold uppercase tracking-widest text-(--text-secondary) opacity-50 transition-opacity duration-300 ${
              isCollapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            Main Menu
          </div>
          {user?.role !== "admin" && user?.role !== "owner" && (
            <NavItem
              to="/"
              icon={Home}
              label="Shop"
              isCollapsed={isCollapsed}
              location={location}
            />
          )}
          {user && user.role !== "admin" && user.role !== "owner" && (
            <NavItem
              to="/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
              isCollapsed={isCollapsed}
              location={location}
            />
          )}

          {/* Admin/Owner Direct Links */}
          {(user?.role === "admin" || user?.role === "owner") && (
            <>
              <div
                className={`mt-6 mb-4 px-2 text-[10px] font-bold uppercase tracking-widest text-(--text-secondary) opacity-50 transition-opacity duration-300 ${
                  isCollapsed ? "opacity-0" : "opacity-100"
                }`}
              >
                Management
              </div>
              <NavItem
                to="/admin/pending"
                icon={Clock}
                label="Pending"
                isCollapsed={isCollapsed}
                location={location}
              />
              <NavItem
                to="/admin/users"
                icon={Users}
                label="Users"
                isCollapsed={isCollapsed}
                location={location}
              />
              <NavItem
                to="/admin/orders"
                icon={Package}
                label="Orders"
                isCollapsed={isCollapsed}
                location={location}
              />
              <NavItem
                to="/admin/products"
                icon={Tag}
                label="Products"
                isCollapsed={isCollapsed}
                location={location}
              />
              <NavItem
                to="/admin/carts"
                icon={ShoppingCart}
                label="Carts"
                isCollapsed={isCollapsed}
                location={location}
              />
            </>
          )}

          {user &&
            user.role !== "vendor" &&
            user.role !== "admin" &&
            user.role !== "owner" && (
              <NavItem
                to="/cart"
                icon={ShoppingCart}
                label="Cart"
                badge={cartItems.length}
                isCollapsed={isCollapsed}
                location={location}
              />
            )}
          <NavItem
            to="/about"
            icon={Info}
            label="About"
            isCollapsed={isCollapsed}
            location={location}
          />
        </nav>

        {/* Footer: Theme, Profile, Logout */}
        <div className="p-4 border-t border-(--border-color) space-y-4">
          {/* Theme Toggle Wrapper */}
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-(--text-secondary) hover:bg-(--bg-card) transition-all border border-transparent hover:border-(--border-color) group"
          >
            <div className="shrink-0 group-hover:rotate-12 transition-transform">
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </div>
            {!isCollapsed && (
              <span className="text-sm font-semibold truncate animate-fade-in">
                {darkMode ? "Light Mode" : "Dark Mode"}
              </span>
            )}
          </button>

          {/* User Profile */}
          {user ? (
            <div className="space-y-2">
              <div
                className={`flex items-center gap-3 p-2 rounded-2xl bg-(--bg-main) border border-(--border-color) transition-all ${
                  isCollapsed ? "justify-center" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/10">
                  <UserIcon size={18} strokeWidth={2.5} />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 animate-fade-in">
                    <p className="text-sm font-bold text-(--text-main) truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-sky-500 font-bold uppercase tracking-wide">
                      {user.role}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-semibold text-sm"
              >
                <LogOut size={22} />
                {!isCollapsed && (
                  <span className="animate-fade-in">Sign Out</span>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sky-500 hover:bg-sky-50 transition-colors font-semibold text-sm"
              >
                <UserIcon size={22} />
                {!isCollapsed && (
                  <span className="animate-fade-in">Log In</span>
                )}
              </Link>
            </div>
          )}

          {/* Collapse Button */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="hidden md:flex absolute -right-4 top-24 w-8 h-8 rounded-full bg-(--bg-card) border border-(--border-color) items-center justify-center text-(--text-secondary) hover:text-sky-500 shadow-sm transition-all hover:scale-110 active:scale-90"
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>
      </aside>

      {/* MOBILE FLOATING DOCK */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-16 bg-(--bg-card)/80 backdrop-blur-2xl border border-(--border-color) rounded-3xl shadow-2xl z-50 flex items-center justify-around px-2">
        {user?.role !== "admin" && user?.role !== "owner" && (
          <Link
            to="/"
            className={`p-3 rounded-2xl transition-all ${
              location.pathname === "/"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                : "text-(--text-secondary)"
            }`}
          >
            <Home size={22} />
          </Link>
        )}
        {user && user.role !== "vendor" && (
          <Link
            to="/cart"
            className={`p-3 rounded-2xl transition-all relative ${
              location.pathname === "/cart"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                : "text-(--text-secondary)"
            }`}
          >
            <ShoppingCart size={22} />
            {cartItems.length > 0 && (
              <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-(--bg-card)">
                {cartItems.length}
              </span>
            )}
          </Link>
        )}
        {user && user.role !== "admin" && user.role !== "owner" ? (
          <Link
            to="/dashboard"
            className={`p-3 rounded-2xl transition-all ${
              location.pathname === "/dashboard"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                : "text-(--text-secondary)"
            }`}
          >
            <LayoutDashboard size={22} />
          </Link>
        ) : (
          !user && (
            <Link
              to="/login"
              className={`p-3 rounded-2xl transition-all ${
                location.pathname === "/login"
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                  : "text-(--text-secondary)"
              }`}
            >
              <UserIcon size={22} />
            </Link>
          )
        )}
        <button
          onClick={() => dispatch(toggleDarkMode())}
          className="p-3 text-(--text-secondary)"
        >
          {darkMode ? <Sun size={22} /> : <Moon size={22} />}
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
