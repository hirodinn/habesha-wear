import { useState, useEffect } from "react";
import {
  Star,
  ShoppingCart,
  ShoppingBag,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Tag,
  Sparkles,
  Search,
  X,
  SlidersHorizontal,
  Crown,
  Check,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addItemToCart } from "../../redux/cartSlice";
import productService from "../../services/productService";
import ProductImageCarousel from "./ProductImageCarousel";

const PRODUCTS_PER_PAGE = 12;
const formatNumber = (value) => Number(value || 0).toLocaleString("en-US");

const ProductCard = ({
  product,
  onAddToCart,
  onRate,
  addingToCart,
  ratingLoadingId,
  user,
  variant = "default",
  addedToCartId,
}) => {
  const navigate = useNavigate();
  const ratingAverage = Number(product.ratingAverage || 0);
  const ratingCount = Number(product.ratingCount || 0);

  const handleAdd = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    onAddToCart(product, "normal");
  };

  const isCompact = variant === "compact";

  const handleViewDetails = () => {
    navigate(`/products/${product._id}`);
  };

  const added = addedToCartId === product._id;

  return (
    <div
      onClick={handleViewDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleViewDetails();
        }
      }}
      className={`group overflow-hidden flex flex-col h-full transition-all duration-300 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:shadow-xl hover:shadow-[var(--color-burgundy)]/5 hover:border-[var(--color-burgundy)]/20 ${
        isCompact ? "hover:-translate-y-1" : "hover:-translate-y-0.5"
      }`}
    >
      <div className={`relative overflow-hidden ${isCompact ? "aspect-square" : "aspect-[4/5]"}`}>
        <ProductImageCarousel
          images={product.images}
          alt={product.name}
          className="w-full h-full"
          imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          placeholder={
            <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-secondary)] gap-2 bg-[var(--bg-main)]">
              <ShoppingBag size={isCompact ? 40 : 48} className="opacity-20" />
              <span className="text-sm font-medium opacity-60">No Image</span>
            </div>
          }
        />
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className="bg-white/90 dark:bg-black/70 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-lg text-[var(--text-main)] uppercase tracking-wider flex items-center gap-1">
            <Tag size={10} /> {product.category || "Item"}
          </span>
        </div>
        {(!user || user.role !== "vendor") && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAdd();
            }}
            disabled={addingToCart === product._id || product.stock <= 0}
            className={`absolute bottom-3 right-3 p-3 rounded-xl shadow-lg translate-y-14 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-[var(--color-burgundy)] text-white hover:bg-[var(--color-burgundy-light)]"
            }`}
          >
            {addingToCart === product._id ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              added ? <Check size={20} /> : <ShoppingCart size={20} />
            )}
          </button>
        )}
      </div>

      <div className={`flex flex-col flex-1 bg-[var(--bg-card)] ${isCompact ? "p-3" : "p-4"}`}>
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-display font-bold leading-tight truncate text-[var(--text-main)] text-lg">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 text-[var(--color-burgundy)] shrink-0">
            <Star size={14} fill="currentColor" />
            <span className="text-xs font-semibold">
              {ratingCount > 0 ? ratingAverage.toFixed(1) : "—"}
            </span>
            {ratingCount > 0 && (
              <span className="text-[10px] text-[var(--text-secondary)]">
                ({formatNumber(ratingCount)})
              </span>
            )}
          </div>
        </div>
        {!isCompact && (
          <p className="text-[var(--text-secondary)] text-sm line-clamp-2 mb-3 flex-1">
            {product.description || "No description available."}
          </p>
        )}
        {user?.role === "customer" && (
          <div className="mb-3">
            <p className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Rate this product
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRate(product._id, value);
                  }}
                  disabled={ratingLoadingId === product._id}
                  className="p-0.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-burgundy)]/50 focus:ring-offset-1"
                  title={`Rate ${value} star${value > 1 ? "s" : ""}`}
                  aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                >
                  <Star
                    size={18}
                    className={
                      value <= Math.round(ratingAverage)
                        ? "text-[var(--color-burgundy)]"
                        : "text-[var(--border-color)]"
                    }
                    fill={value <= Math.round(ratingAverage) ? "currentColor" : "none"}
                  />
                </button>
              ))}
              {ratingLoadingId === product._id && (
                <Loader2 size={14} className="ml-1 text-[var(--color-burgundy)] animate-spin" />
              )}
            </div>
          </div>
        )}
        <div className="pt-3 border-t border-[var(--border-color)] flex justify-between items-center mt-auto">
          <span className="font-bold text-[var(--color-burgundy)]">
            {formatNumber(product.price)} Birr
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
              product.stock > 0
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/15 text-red-600 dark:text-red-400"
            }`}
          >
            {product.stock > 0 ? "In stock" : "Sold out"}
          </span>
        </div>
      </div>
    </div>
  );
};

const FeaturedBlock = ({
  product,
  onAddToCart,
  onRate,
  addingToCart,
  ratingLoadingId,
  user,
  size,
  addedToCartId,
}) => {
  const navigate = useNavigate();
  const isLarge = size === "large";

  const handleViewDetails = () => {
    navigate(`/products/${product._id}`);
  };

  const added = addedToCartId === product._id;

  return (
    <div
      onClick={handleViewDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleViewDetails();
        }
      }}
      className={`group relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--color-burgundy)]/10 hover:border-[var(--color-burgundy)]/30 ${
        isLarge ? "min-h-[380px] md:min-h-[420px]" : "min-h-[180px] md:min-h-[200px]"
      }`}
    >
      <ProductImageCarousel
        images={product.images}
        alt={product.name}
        className="absolute inset-0 w-full h-full"
        imageClassName="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        placeholder={
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-main)]">
            <ShoppingBag size={isLarge ? 64 : 40} className="text-[var(--text-secondary)] opacity-30" />
          </div>
        }
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end">
        <span className="inline-flex items-center gap-1.5 text-white/90 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles size={12} /> Top rated
        </span>
        <h3 className="font-display font-bold text-white text-xl md:text-2xl mb-1 line-clamp-2 drop-shadow-sm">
          {product.name}
        </h3>
        <p className="text-white/80 text-sm line-clamp-2 mb-3">
          {product.description}
        </p>
        <div className="flex items-center justify-between gap-3">
          <span className="font-bold text-white text-lg">
            {formatNumber(product.price)} Birr
          </span>
          {(!user || user.role !== "vendor") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product, "featured");
              }}
              disabled={addingToCart === product._id || product.stock <= 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-[var(--color-burgundy)] hover:bg-white/90"
              }`}
            >
              {addingToCart === product._id ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {added ? <Check size={18} /> : <ShoppingCart size={18} />}
                  {added ? "Added to cart" : "Add to cart"}
                </>
              )}
            </button>
          )}
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
  const [addedToCartId, setAddedToCartId] = useState(null);
  const [addedVariant, setAddedVariant] = useState("normal");
  const [ratingLoadingId, setRatingLoadingId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState([]);

  const loadFeatured = async (query = "", category = "all") => {
    setLoadingFeatured(true);
    try {
      const data = await productService.fetchFeatured(3, query, category);
      setFeatured(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching featured:", err);
      setFeatured([]);
    } finally {
      setLoadingFeatured(false);
    }
  };

  const loadPaginated = async (page = 1, query = "", category = "all") => {
    setLoadingPaginated(true);
    setPaginated((prev) => ({ ...prev, products: [] }));
    try {
      const data = await productService.fetchProductsPaginated(
        page,
        PRODUCTS_PER_PAGE,
        true,
        query,
        category
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
    const loadCategories = async () => {
      try {
        const allProducts = await productService.fetchAllProducts();
        const all = (Array.isArray(allProducts) ? allProducts : [])
          .map((p) => (p.category || "").trim())
          .filter(Boolean);
        const unique = [...new Set(all)].sort((a, b) => a.localeCompare(b));
        setCategories(unique);
      } catch (err) {
        console.error("Error loading categories:", err);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    loadFeatured(searchQuery, categoryFilter);
    loadPaginated(1, searchQuery, categoryFilter);
  }, [searchQuery, categoryFilter]);

  const handleAddToCart = async (product, variant = "normal") => {
    if (!user) {
      navigate("/login");
      return;
    }
    setAddingToCart(product._id);
    try {
      await dispatch(addItemToCart({ productId: String(product._id ?? product.id ?? ""), quantity: 1 })).unwrap();
      setAddedToCartId(product._id);
      setAddedVariant(variant);
      setTimeout(() => {
        setAddedToCartId((current) => (current === product._id ? null : current));
      }, 1200);
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
      setFeatured((prev) => prev.map((p) => (p._id === productId ? updated : p)));
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
    loadPaginated(page, searchQuery, categoryFilter);
  };

  return (
    <div className="space-y-16 animate-fade-in">
      <section>
        <div className="relative max-w-2xl mx-auto">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products by name, category or description"
            className="w-full pl-11 pr-12 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] placeholder:text-[var(--text-secondary)] outline-none focus:ring-2 focus:ring-[var(--color-burgundy)]/30 focus:border-[var(--color-burgundy)] transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-main)]"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--text-secondary)] px-2 py-1">
            <SlidersHorizontal size={13} /> Categories:
          </span>
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-all ${
              categoryFilter === "all"
                ? "bg-[var(--color-burgundy)] text-white border-[var(--color-burgundy)] shadow-md shadow-[var(--color-burgundy)]/25"
                : "bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-color)] hover:border-[var(--color-burgundy)]/40 hover:bg-[var(--bg-main)]"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setCategoryFilter(category)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-all ${
                categoryFilter === category
                  ? "bg-[var(--color-burgundy)] text-white border-[var(--color-burgundy)] shadow-md shadow-[var(--color-burgundy)]/25"
                  : "bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-color)] hover:border-[var(--color-burgundy)]/40 hover:bg-[var(--bg-main)]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Top rated: static podium */}
      <section className="relative pt-4 pb-8 md:pt-6 md:pb-10">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[var(--color-burgundy)]/5 blur-[100px] pointer-events-none" />
        <div className="relative container mx-auto px-4">
          <div className="mb-6 md:mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-burgundy)] text-white shadow-lg">
              <Crown className="h-7 w-7" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-main)]">
              Most <span className="text-[var(--color-burgundy)]">Loved</span> Pieces
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-[var(--text-secondary)]">
            {searchQuery || categoryFilter !== "all"
              ? `Filtered${
                  searchQuery ? ` by “${searchQuery}”` : ""
                }${categoryFilter !== "all" ? ` in ${categoryFilter}` : ""}`
              : "Our community's top-rated garments — handpicked excellence."}
          </p>
        </div>
        {loadingFeatured ? (
          <div className="flex justify-center py-24 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            <Loader2 className="w-10 h-10 text-[var(--color-burgundy)] animate-spin" />
          </div>
        ) : featured.length >= 3 ? (
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 md:flex-row md:items-end md:justify-center md:gap-6">
            {[
              { product: featured[1], rank: 2, yOffset: 40, isCenter: false },
              { product: featured[0], rank: 1, yOffset: 0, isCenter: true },
              { product: featured[2], rank: 3, yOffset: 60, isCenter: false },
            ].map(({ product, rank, yOffset, isCenter }) => {
              const ratingAverage = Number(product.ratingAverage || 0);
              const ratingCount = Number(product.ratingCount || 0);
              return (
                <div
                  key={product._id}
                  className="group relative w-full md:w-1/3"
                  style={{ marginBottom: `${yOffset}px` }}
                >
                  {isCenter && (
                    <div className="absolute -inset-2 rounded-3xl bg-[var(--color-burgundy)]/15 blur-xl pointer-events-none" />
                  )}
                  <div
                    onClick={() => navigate(`/products/${product._id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/products/${product._id}`);
                      }
                    }}
                    className={`relative overflow-hidden rounded-2xl border bg-[var(--bg-card)] transition-all duration-300 ${
                        isCenter
                          ? "border-[var(--color-burgundy)]/40 shadow-xl shadow-[var(--color-burgundy)]/10"
                          : "border-[var(--border-color)] shadow-lg hover:border-[var(--color-burgundy)]/30"
                    }`}
                  >
                    {isCenter && (
                      <div className="absolute right-4 top-4 z-10">
                        <Sparkles className="h-5 w-5 text-[var(--color-burgundy)]" />
                      </div>
                    )}
                    <div className={`relative overflow-hidden ${isCenter ? "aspect-[3/4]" : "aspect-[3/3.5]"}`}>
                      <ProductImageCarousel
                        images={product.images}
                        alt={product.name}
                        className="h-full w-full"
                        imageClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        placeholder={
                          <div className="h-full w-full flex items-center justify-center bg-[var(--bg-main)]">
                            <ShoppingBag size={48} className="text-[var(--text-secondary)] opacity-30" />
                          </div>
                        }
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                        {(!user || user.role !== "vendor") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!user) {
                                navigate("/login");
                                return;
                              }
                              handleAddToCart(product, "featured");
                            }}
                            disabled={addingToCart === product._id || product.stock <= 0}
                            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 ${
                              addedToCartId === product._id && addedVariant === "featured"
                                ? "bg-emerald-600 text-white"
                                : "bg-[var(--color-burgundy)] text-white"
                            }`}
                          >
                            {addingToCart === product._id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <>
                                {addedToCartId === product._id && addedVariant === "featured" ? (
                                  <>
                                    <Check size={18} />
                                    Added to cart
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart size={18} />
                                    Add to Cart
                                  </>
                                )}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="relative p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              className={
                                s <= Math.round(ratingAverage)
                                  ? "fill-[var(--color-burgundy)] text-[var(--color-burgundy)]"
                                  : "fill-transparent text-[var(--border-color)]"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-[var(--text-main)]">
                          {ratingCount > 0 ? ratingAverage.toFixed(1) : "—"}
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          ({formatNumber(ratingCount)})
                        </span>
                      </div>
                      <h3 className={`font-display font-bold text-[var(--text-main)] ${isCenter ? "text-xl" : "text-lg"}`}>
                        {product.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">
                        {product.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`font-bold text-[var(--color-burgundy)] ${isCenter ? "text-xl" : "text-lg"}`}>
                          {formatNumber(product.price)} Birr
                        </span>
                        <span className="rounded-full border border-[var(--border-color)] px-2.5 py-0.5 text-[10px] text-[var(--text-secondary)]">
                          {product.category || "Item"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {featured.map((product) => (
              <FeaturedBlock
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onRate={handleRateProduct}
                addingToCart={addingToCart}
                ratingLoadingId={ratingLoadingId}
                user={user}
                size="small"
                addedToCartId={addedVariant === "featured" ? addedToCartId : null}
              />
            ))}
          </div>
        ) : (
          <p className="text-[var(--text-secondary)] py-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center">
            No top-rated products yet. Rate items to see them here.
          </p>
        )}
        </div>
      </section>

      {/* All products: clean grid */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <span className="w-8 h-1 rounded-full bg-[var(--color-burgundy)]" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              All products
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            {searchQuery || categoryFilter !== "all"
              ? `${formatNumber(paginated.total)} matching results`
              : `${formatNumber(paginated.total)} products available`}
          </p>
        </div>
        {loadingPaginated ? (
          <div className="flex justify-center py-24 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            <Loader2 className="w-10 h-10 text-[var(--color-burgundy)] animate-spin" />
          </div>
        ) : paginated.products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              {paginated.products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onRate={handleRateProduct}
                  addingToCart={addingToCart}
                  ratingLoadingId={ratingLoadingId}
                  user={user}
                  variant="default"
                  addedToCartId={addedVariant === "normal" ? addedToCartId : null}
                />
              ))}
            </div>
            {paginated.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={() => goToPage(paginated.page - 1)}
                  disabled={paginated.page <= 1}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-burgundy)] text-white font-medium text-sm hover:bg-[var(--color-burgundy-light)] disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[var(--color-burgundy)]/50 transition-all"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  Page {formatNumber(paginated.page)} of {formatNumber(paginated.totalPages)}
                </span>
                <button
                  onClick={() => goToPage(paginated.page + 1)}
                  disabled={paginated.page >= paginated.totalPages}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-burgundy)] text-white font-medium text-sm hover:bg-[var(--color-burgundy-light)] disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[var(--color-burgundy)]/50 transition-all"
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card-standard p-12 text-center rounded-2xl">
            <ShoppingBag className="w-14 h-14 mx-auto mb-4 text-[var(--text-secondary)] opacity-50" />
            <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">No more products</h3>
            <p className="text-[var(--text-secondary)]">
              {searchQuery || categoryFilter !== "all"
                ? "No products match your search. Try a different keyword."
                : "The rest are in the Top Rated section above."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductGrid;
