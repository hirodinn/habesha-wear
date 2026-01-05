import { Route, Routes, Navigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadUser } from "./redux/userAction";
import Layout from "./components/common/Layout";
import Dashboard from "./pages/dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Cart from "./pages/shop/Cart";
import { ArrowRight } from "lucide-react";

import ProductGrid from "./components/shop/ProductGrid";

const Home = () => (
  <div className="space-y-16 py-8 pt-1">
    <div className="container mx-auto">
      <ProductGrid isPublic={true} />
    </div>
  </div>
);

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <Layout>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
