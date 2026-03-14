import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, toggleDarkMode } from "../../redux/userAction";
import { Sun, Moon, User, LogOut, LogIn, ShoppingCart, Store } from "lucide-react";

const Header = () => {
  const { user, darkMode } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const navLinkClass = (path) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
      location.pathname === path
        ? "bg-[var(--color-gold)] text-[var(--color-burgundy)]"
        : "text-[var(--text-main)] hover:bg-[var(--color-burgundy)]/10 hover:text-[var(--color-gold)]"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] bg-[var(--bg-card)]/95 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo, Shop, Cart */}
        <nav className="flex items-center gap-1 sm:gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 mr-2 sm:mr-4 text-[var(--text-main)] hover:opacity-90 transition-opacity"
          >
            <span className="font-display font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-burgundy)]">
              Habesha Wear
            </span>
          </Link>
          <Link to="/" className={navLinkClass("/")}>
            <Store size={18} aria-hidden />
            <span className="hidden sm:inline">Shop</span>
          </Link>
          {user?.role !== "admin" && user?.role !== "owner" && (
            <Link to="/cart" className={`${navLinkClass("/cart")} relative`}>
              <ShoppingCart size={18} aria-hidden />
              <span className="hidden sm:inline">Cart</span>
              {cartItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[var(--color-burgundy)] text-white text-[10px] font-bold px-1">
                  {cartItems.length}
                </span>
              )}
            </Link>
          )}
        </nav>

        {/* Right: Theme, Account/Login, Logout */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className="p-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--color-burgundy)]/10 hover:text-[var(--color-gold)] transition-all"
            title={darkMode ? "Light mode" : "Dark mode"}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="p-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--color-burgundy)]/10 hover:text-[var(--color-gold)] transition-all"
                title="Account / Dashboard"
                aria-label="Dashboard"
              >
                <User size={20} />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--color-burgundy)]/10 hover:text-red-400 transition-all"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="p-2.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--color-burgundy)]/10 hover:text-[var(--color-gold)] transition-all"
              title="Log in"
              aria-label="Log in"
            >
              <LogIn size={20} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
