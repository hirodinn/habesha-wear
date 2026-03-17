import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Star,
  Loader2,
  ShoppingCart,
  ArrowLeft,
  Package,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import productService from "../../services/productService";
import { addItemToCart } from "../../redux/cartSlice";

const formatNumber = (value) => Number(value || 0).toLocaleString("en-US");

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingMessage, setRatingMessage] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await productService.fetchProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setAddingToCart(true);
    try {
      await dispatch(addItemToCart({ productId: product._id, quantity: 1 })).unwrap();
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleRate = async (value) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "customer") {
      setRatingMessage("Only customers can rate products.");
      return;
    }

    setRatingLoading(true);
    setRatingMessage("");
    try {
      const updated = await productService.rateProduct(product._id, value);
      setProduct(updated);
      setRatingMessage("Rating saved.");
    } catch (err) {
      setRatingMessage(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-burgundy)]" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto card-standard p-10 text-center space-y-4">
        <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
        <h2 className="text-2xl font-bold text-[var(--text-main)]">Unable to load product</h2>
        <p className="text-[var(--text-secondary)]">{error || "Product not found"}</p>
        <Link to="/" className="btn-primary inline-flex">
          Back to products
        </Link>
      </div>
    );
  }

  const ratingAverage = Number(product.ratingAverage || 0);
  const ratingCount = Number(product.ratingCount || 0);
  const images = product.images?.length ? product.images : [null];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-1">
            Product Details
          </p>
          <h2 className="text-xl font-display font-bold text-[var(--text-main)]">
            Explore and rate this item
          </h2>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)]"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)] aspect-square">
            {images[selectedImage] ? (
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
                <Package size={56} className="opacity-30" />
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`rounded-lg overflow-hidden border ${
                    selectedImage === idx
                      ? "border-[var(--color-burgundy)]"
                      : "border-[var(--border-color)]"
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-16 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl font-display font-bold text-[var(--text-main)]">
              {product.name}
            </h1>
            <p className="text-[var(--text-secondary)] mt-3">{product.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[var(--color-burgundy)]">
              <Star size={16} fill="currentColor" />
              <span className="font-semibold">
                {ratingCount > 0 ? ratingAverage.toFixed(1) : "No ratings"}
              </span>
            </div>
            {ratingCount > 0 && (
              <span className="text-sm text-[var(--text-secondary)]">
                ({formatNumber(ratingCount)} ratings)
              </span>
            )}
          </div>

          <div className="text-2xl font-bold text-[var(--color-burgundy)]">
            {formatNumber(product.price)} Birr
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Rate this product
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleRate(value)}
                  disabled={ratingLoading}
                  className="p-1 disabled:opacity-50"
                  title={`Rate ${value} star${value > 1 ? "s" : ""}`}
                >
                  {(() => {
                    const fillRatio = Math.max(
                      0,
                      Math.min(1, ratingAverage - (value - 1))
                    );
                    return (
                      <span className="relative block w-[22px] h-[22px]">
                        <Star
                          size={22}
                          className="absolute inset-0 text-[var(--border-color)]"
                          fill="none"
                        />
                        <span
                          className="absolute inset-0 overflow-hidden"
                          style={{ width: `${fillRatio * 100}%` }}
                        >
                          <Star
                            size={22}
                            className="text-[var(--color-burgundy)]"
                            fill="currentColor"
                          />
                        </span>
                      </span>
                    );
                  })()}
                </button>
              ))}
              {ratingLoading && <Loader2 size={16} className="ml-1 animate-spin" />}
            </div>
            {ratingMessage && (
              <p className="text-xs mt-2 text-[var(--text-secondary)]">{ratingMessage}</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={
                addingToCart ||
                product.stock <= 0 ||
                (user && user.role !== "customer")
              }
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
            >
              {addingToCart ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ShoppingCart size={18} />
              )}
              Add to cart
            </button>

            <span
              className={`text-xs font-semibold px-3 py-1 rounded-lg ${
                product.stock > 0
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/15 text-red-600 dark:text-red-400"
              }`}
            >
              {product.stock > 0
                ? `${formatNumber(product.stock)} in stock`
                : "Sold out"}
            </span>
          </div>

          {user?.role !== "customer" && (
            <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
              <CheckCircle2 size={14} /> Login as customer to purchase and rate products
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
