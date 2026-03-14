import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../redux/userAction";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, User, ShoppingBag, Store } from "lucide-react";

const InputGroup = ({ label, type, value, onChange, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">
      {label}
    </label>
    <input
      type={type}
      required
      className="input-field"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(formData));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--color-burgundy)]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[var(--color-burgundy)]/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-lg relative z-10 animate-fade-in">
        <div className="card-standard p-8 md:p-10 shadow-xl border-[var(--color-burgundy)]/20">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-bold mb-2 text-[var(--text-main)]">
              Create Account
            </h2>
            <p className="text-[var(--text-secondary)]">
              Join Habesha Wear.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-sm flex items-center gap-2 animate-slide-up">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error.message || "Registration failed"}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputGroup
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <InputGroup
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <InputGroup
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <div className="space-y-3 pt-2">
              <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">
                I want to...
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "customer" })}
                  className={`relative p-4 rounded-2xl border text-left transition-all duration-300 ${
                    formData.role === "customer"
                      ? "bg-[var(--color-burgundy)]/10 border-[var(--color-burgundy)]/50 ring-1 ring-[var(--color-burgundy)]/30"
                      : "bg-[var(--input-bg)] border-[var(--border-color)] hover:border-[var(--color-burgundy)]/40"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg w-fit mb-3 ${
                      formData.role === "customer"
                        ? "bg-[var(--color-burgundy)] text-white"
                        : "bg-[var(--bg-main)] text-[var(--text-secondary)]"
                    }`}
                  >
                    <ShoppingBag size={20} />
                  </div>
                  <div className="font-semibold text-[var(--text-main)]">
                    Shop
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">
                    Browse & Buy
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "vendor" })}
                  className={`relative p-4 rounded-2xl border text-left transition-all duration-300 ${
                    formData.role === "vendor"
                      ? "bg-[var(--color-burgundy)]/10 border-[var(--color-burgundy)]/50 ring-1 ring-[var(--color-burgundy)]/30"
                      : "bg-[var(--input-bg)] border-[var(--border-color)] hover:border-[var(--color-burgundy)]/40"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg w-fit mb-3 ${
                      formData.role === "vendor"
                        ? "bg-[var(--color-burgundy)] text-white"
                        : "bg-[var(--bg-main)] text-[var(--text-secondary)]"
                    }`}
                  >
                    <Store size={20} />
                  </div>
                  <div className="font-semibold text-[var(--text-main)]">
                    Sell
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">
                    Manage Store
                  </div>
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 mt-4 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Create Account"
              )}
              {!loading && (
                <User className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>
          </form>
          <p className="mt-8 text-center text-[var(--text-secondary)] text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[var(--color-burgundy)] font-semibold hover:text-[var(--color-burgundy)]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
