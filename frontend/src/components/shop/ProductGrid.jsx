import { useState, useEffect } from "react";
import {
  Star,
  ShoppingCart,
  ShoppingBag,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Tag,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addItemToCart } from "../../redux/cartSlice";
import productService from "../../services/productService";

const PRODUCTS_PER_PAGE = 12;

const ProductCard = ({
  product,
  onAddToCart,
  onRate,
  addingToCart,
  ratingLoadingId,
  user,
  featured = false,
}) => {
  const navigate = useNavigate();
  const ratingAverage = Number(product.ratingAverage || 0);
  const ratingCount = Number(product.ratingCount || 0);

  const handleAdd = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    onAddToCart(product);
  };

  return (
    <div
      className={`card-standard group overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:border-[var(--color-gold)]/30 ${
        featured ? "ring-2 ring-[var(--color-gold)]/40" : ""
      }`}
    >
      <div className="aspect-[4/5] bg-[var(--bg-main)] relative overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-secondary)] gap-2">
            <ShoppingBag size={featured ? 56 : 48} className="opacity-20" />
            <span className="text-sm font-medium opacity-60">No Image</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-[var(--bg-card)]/90 backdrop-blur border border-[var(--border-color)] text-xs font-semibold px-2.5 py-1 rounded-full text-[var(--text-main)] uppercase tracking-wider flex items-center gap-1">
            <Tag size={10} /> {product.category || "Item"}
          </span>
          {featured && (
            <span className="bg-[var(--color-gold)]/90 text-[var(--color-burgundy)] text-xs font-bold px-2.5 py-1 rounded-full uppercase">
              Top Rated
            </span>
          )}
        </div>
        {(!user || user.role !== "vendor") && (
          <button
            onClick={handleAdd}
            disabled={addingToCart === product._id || product.stock <= 0}
            className="absolute bottom-3 right-3 bg-[var(--color-burgundy)] text-white p-3 rounded-full shadow-lg translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[var(--color-burgundy-light)] hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingToCart === product._id ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <ShoppingCart size={20} />
            )}
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 bg-[var(--bg-card)]">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-display font-bold text-lg leading-tight truncate text-[var(--text-main)]">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 text-[var(--color-gold)] shrink-0">
            <Star size={14} fill="currentColor" />
            <span className="text-xs font-semibold">
              {ratingCount > 0 ? ratingAverage.toFixed(1) : "New"}
            </span>
          </div>
        </div>

        {user?.role === "customer" && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onRate(product._id, value)}
                  disabled={ratingLoadingId === product._id}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                  title={`Rate ${value} star${value > 1 ? "s" : ""}`}
                >
                  <Star
                    size={12}
                    className={
                      value <= Math.round(ratingAverage)
                        ? "text-[var(--color-gold)]"
                        : "text-[var(--border-color)]"
                    }
                    fill={
                      value <= Math.round(ratingAverage) ? "currentColor" : "none"
                    }
                  />
                </button>
              ))}
            </div>
            <span className="text-[10px] text-[var(--text-secondary)]">
              ({ratingCount})
            </span>
          </div>
        )}

        <p className="text-[var(--text-secondary)] text-sm line-clamp-2 mb-4 flex-1">
          {product.description || "No description available."}
        </p>

        <div className="pt-3 border-t border-[var(--border-color)] flex justify-between items-center mt-auto">
          <span className="font-bold text-[var(--color-burgundy)]">
            {product.price} Birr
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              product.stock > 0
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/15 text-red-600 dark:text-red-400"
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
          </span>
        </div>
      </div>
    </div>
  );
};

const ProductGrid = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [featured, setFeatured] = useState([]);
  const [paginated, setPaginated] = useState({ products: [], total: 0, page: 1, totalPages: 0 });
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingPaginated, setLoadingPaginated] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);
  const [ratingLoadingId, setRatingLoadingId] = useState(null);

  const loadFeatured = async () => {
    setLoadingFeatured(true);
    try {
      const data = await productService.fetchFeatured(3);
      setFeatured(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching featured:", err);
      setFeatured([]);
    } finally {
      setLoadingFeatured(false);
    }
  };

  const loadPaginated = async (page = 1) => {
    setLoadingPaginated(true);
    try {
      const data = await productService.fetchProductsPaginated(
        page,
        PRODUCTS_PER_PAGE,
        true
      );
      setPaginated({
        products: data.products || [],
        total: data.total || 0,
        page: data.page || 1,
        totalPages: data.totalPages || 0,
      });
    } catch (err) {
      console.error("Error fetching products:", err);
      setPaginated({ products: [], total: 0, page: 1, totalPages: 0 });
    } finally {
      setLoadingPaginated(false);
    }
  };

  useEffect(() => {
    loadFeatured();
  }, []);

  useEffect(() => {
    loadPaginated(1);
  }, []);

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setAddingToCart(product._id);
    try {
      await dispatch(addItemToCart({ productId: product._id, quantity: 1 })).unwrap();
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleRateProduct = async (productId, value) => {
    if (!user || user.role !== "customer") return;
    setRatingLoadingId(productId);
    try {
      const updated = await productService.rateProduct(productId, value);
      setFeatured((prev) =>
        prev.map((p) => (p._id === productId ? updated : p))
      );
      setPaginated((prev) => ({
        ...prev,
        products: prev.products.map((p) => (p._id === productId ? updated : p)),
      }));
    } catch (err) {
      console.error("Error rating product:", err);
    } finally {
      setRatingLoadingId(null);
    }
  };

  const goToPage = (page) => {
    if (page < 1 || page > paginated.totalPages) return;
    loadPaginated(page);
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Featured: Top 3 rated */}
      <section>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--text-main)] mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-gradient-to-b from-[var(--color-gold)] to-[var(--color-burgundy)] rounded-full" />
          Top Rated
        </h2>
        {loadingFeatured ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 text-[var(--color-gold)] animate-spin" />
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onRate={handleRateProduct}
                addingToCart={addingToCart}
                ratingLoadingId={ratingLoadingId}
                user={user}
                featured
              />
            ))}
          </div>
        ) : (
          <p className="text-[var(--text-secondary)] py-8">
            No top-rated products yet. Rate items to see them here.
          </p>
        )}
      </section>

      {/* Rest: Paginated grid */}
      <section>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--text-main)] mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-gradient-to-b from-[var(--color-burgundy)] to-[var(--color-gold)] rounded-full" />
          All Products
        </h2>
        {loadingPaginated ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 text-[var(--color-burgundy)] animate-spin" />
          </div>
        ) : paginated.products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginated.products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onRate={handleRateProduct}
                  addingToCart={addingToCart}
                  ratingLoadingId={ratingLoadingId}
                  user={user}
                />
              ))}
            </div>

            {paginated.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <button
                  onClick={() => goToPage(paginated.page - 1)}
                  disabled={paginated.page <= 1}
                  className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--color-burgundy)]/10 hover:border-[var(--color-gold)]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  Page {paginated.page} of {paginated.totalPages}
                </span>
                <button
                  onClick={() => goToPage(paginated.page + 1)}
                  disabled={paginated.page >= paginated.totalPages}
                  className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--color-burgundy)]/10 hover:border-[var(--color-gold)]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Next page"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card-standard p-12 text-center">
            <ShoppingBag className="w-14 h-14 mx-auto mb-4 text-[var(--text-secondary)] opacity-50" />
            <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">
              No more products
            </h3>
            <p className="text-[var(--text-secondary)]">
              The rest are in the Top Rated section above.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductGrid;
