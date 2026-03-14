import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./Header";

const Layout = ({ children }) => {
  const darkMode = useSelector((state) => state.auth.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[var(--color-burgundy)]/20 transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--color-burgundy)]/5 dark:bg-[var(--color-burgundy)]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-burgundy)]/5 dark:bg-[var(--color-burgundy)]/10 blur-[100px]" />
      </div>

      <Header />

      <main className="flex-1 w-full container mx-auto px-4 sm:px-6 py-8 relative z-10">
        {children}
      </main>

      <footer className="py-6 mt-auto border-t border-[var(--border-color)] bg-[var(--bg-card)]/50">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <span className="font-display font-bold text-lg text-[var(--color-burgundy)]">
              Habesha Wear
            </span>
            <Link
              to="/about"
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--color-burgundy)] transition-colors"
            >
              About
            </Link>
          </div>
          <span className="text-sm text-[var(--text-secondary)]">
            © {new Date().getFullYear()} — Crafted with precision.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
