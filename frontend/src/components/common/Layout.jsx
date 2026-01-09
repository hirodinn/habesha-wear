import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import { useEffect } from "react";

const Layout = ({ children }) => {
  const { darkMode, isSidebarCollapsed: isCollapsed } = useSelector(
    (state) => state.auth
  );

  // Apply dark mode class to html/body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans selection:bg-sky-500/30 relative transition-colors duration-300">
      {/* Background Ambience (Subtle) */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        {/* Light Mode Blobs (Soft) */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sky-200/40 dark:bg-sky-900/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 dark:bg-blue-900/10 blur-[120px] animate-pulse delay-1000" />
      </div>

      <Sidebar />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${
          isCollapsed ? "md:ml-20" : "md:ml-72"
        }`}
      >
        <main className="container mx-auto px-6 py-8 relative z-10 flex-1 flex flex-col pb-32 md:pb-12">
          {children}
        </main>

        <footer className="border-t border-(--border-color) py-6 relative z-10 bg-(--bg-card)/50 backdrop-blur-sm mt-auto mb-20 md:mb-0">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-2xl font-display font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-700 to-gray-900 dark:from-gray-400 dark:to-gray-200">
                Habesha Wear
              </div>
              <div className="text-(--text-secondary) text-sm">
                © {new Date().getFullYear()} Crafted with precision.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
