import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CustomerView from "./views/CustomerView";
import VendorView from "./views/VendorView";
import AdminView from "./views/AdminView";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="font-display text-2xl font-bold mb-2 text-[var(--text-main)]">Access Denied</h2>
        <p className="text-[var(--text-secondary)] mb-6">
          Please log in to view your dashboard.
        </p>
        <Link
          to="/login"
          className="btn-primary"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // Role-based Switching
  switch (user.role) {
    case "customer":
      return <CustomerView />;
    case "vendor":
      return <VendorView />;
    case "admin":
    case "owner":
      return <AdminView />;
    default:
      return (
        <div className="text-center py-12">
          <h2 className="font-display text-xl text-red-500">Unknown Role: {user.role}</h2>
          <p className="text-[var(--text-secondary)]">
            Your account has an invalid role configuration.
          </p>
        </div>
      );
  }
};

export default Dashboard;
