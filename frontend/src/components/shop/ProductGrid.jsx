import { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  ShoppingCart,
  Filter,
  Tag,
  Star,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addItemToCart } from "../../redux/cartSlice";

const ProductGrid = ({ isPublic = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setAddingToCart(product._id);
    try {
      await dispatch(
        addItemToCart({ productId: product._id, quantity: 1 })
      ).unwrap();
      // Optionally show a toast/notification here
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setAddingToCart(null);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Search & Filter */}
      <div className="sticky top-0 z-40 flex flex-col md:flex-row gap-6 items-center justify-between card-standard p-6 bg-(--bg-card)/80 backdrop-blur-lg shadow-md -mx-2 px-8">
        <div>
          <h2 className="text-2xl font-bold text-(--text-main) mb-1">
            {isPublic ? "Latest Collection" : "Shop Collection"}
          </h2>
          <p className="text-(--text-secondary) text-sm">
            {isPublic
              ? "Browse our unique cultural artifacts"
              : "Discover unique Habesha fashion artifacts"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl pl-12 pr-4 py-2.5 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all text-(--text-main) placeholder-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative min-w-[180px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl pl-10 pr-8 py-2.5 appearance-none text-(--text-main) focus:outline-none focus:border-sky-500/50 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="clothing">Clothing</option>
              <option value="footwear">Footwear</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="card-standard group overflow-hidden flex flex-col h-full hover:shadow-lg dark:hover:shadow-purple-900/10"
          >
            <div className="aspect-4/5 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
              {product.images && product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-(--text-secondary) gap-2">
                  <ShoppingBag size={48} className="opacity-20" />
                  <span className="text-sm font-medium opacity-50">
                    No Image
                  </span>
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-white/80 dark:bg-black/80 backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full text-(--text-main) shadow-sm border border-white/20 uppercase tracking-wider flex items-center gap-1">
                  <Tag size={10} /> {product.category || "Item"}
                </span>
              </div>

              {(!user || user.role !== "vendor") && (
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={addingToCart === product._id || product.stock <= 0}
                  className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-lg translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-sky-600 hover:text-white hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart === product._id ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <ShoppingCart size={20} />
                  )}
                </button>
              )}
            </div>

            <div className="p-5 flex flex-col flex-1 bg-(--bg-card)">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-display font-bold text-lg leading-tight truncate pr-2 text-(--text-main)">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 text-yellow-500 text-xs">
                  <Star size={12} fill="currentColor" />
                  <span>4.8</span>
                </div>
              </div>

              <p className="text-(--text-secondary) text-sm line-clamp-2 mb-4 flex-1">
                {product.description || "No description available."}
              </p>

              <div className="pt-4 border-t border-(--border-color) flex justify-between items-center mt-auto">
                <span className="text-xl font-bold text-(--text-main)">
                  {product.price} Birr
                </span>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-md ${
                    product.stock > 0
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} In Stock` : "Sold Out"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-24 card-standard mx-auto max-w-2xl bg-(--bg-card)">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-(--text-secondary) opacity-50" />
          <h3 className="text-xl font-bold text-(--text-main) mb-2">
            No products found
          </h3>
          <p className="text-(--text-secondary)">Try adjusting your filters.</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
