import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import {
  updateItemQuantity,
  removeItem,
  getCart,
  setItems,
} from "../../redux/cartSlice";
import { showToast } from "../../redux/toastSlice";
import productService from "../../services/productService";
import ProductImageCarousel from "../../components/shop/ProductImageCarousel";
import { useEffect, useState } from "react";

const buildStockErrorMessage = (errors) => {
  if (!errors?.length) return "";
  const lines = errors.map(
    (e) => `• ${e.name}: you have ${e.requested} in cart but only ${e.available} in stock.`
  );
  return "Some items exceed available stock. Please update your cart.\n\n" + lines.join("\n");
};

const Cart = () => {
  const { items: cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [checkingStock, setCheckingStock] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role !== "customer") {
        navigate("/dashboard");
        return;
      }
      dispatch(getCart());
    }
  }, [user, dispatch, navigate]);

  const calculateTotal = () => {
    // Note: Backend cart might not populate product details in the simple items array
    // If the backend populated the productId field, we'd have access to price.
    // In this current MERN setup, we might need to fetch product details or
    // rely on the cart having total price if backend calculated it.
    // For now, I'll assume we might need a more robust population.
    return cartItems.reduce(
      (acc, item) => acc + (item.price || 0) * item.quantity,
      0
    );
  };

  const handleCheckout = async () => {
    if (!cartItems.length) return;
    setCheckingStock(true);
    try {
      const { valid, errors } = await productService.validateCartStock(cartItems);
      if (!valid) {
        dispatch(
          showToast({
            type: "error",
            message: buildStockErrorMessage(errors),
          })
        );
        return;
      }
      navigate("/checkout");
    } catch (err) {
      dispatch(
        showToast({
          type: "error",
          message: "Could not verify stock. Please try again.",
        })
      );
    } finally {
      setCheckingStock(false);
    }
  };

  if (user && user.role !== "customer") {
    return null;
  }
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-[var(--color-burgundy)]/10 border border-[var(--color-burgundy)]/20">
          <ShoppingBag size={40} className="text-[var(--color-burgundy)]" />
        </div>
        <h2 className="font-display text-3xl font-bold mb-4 text-[var(--text-main)]">Your cart is empty</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md">
          Please log in as a customer to see your cart and checkout.
        </p>
        <Link to="/login" className="btn-primary">
          Sign In to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 py-4 animate-fade-in">
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 md:p-7 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--color-burgundy)]/10 via-transparent to-[var(--color-burgundy)]/5" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-[var(--bg-main)] rounded-full transition-colors text-[var(--text-secondary)]"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-1">checkout prep</p>
              <h1 className="font-display text-3xl font-bold text-[var(--text-main)]">Your Cart</h1>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--text-secondary)]">Items</p>
            <p className="text-2xl font-bold text-[var(--text-main)]">{cartItems.length}</p>
          </div>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="card-standard p-12 text-center flex flex-col items-center border-[var(--color-burgundy)]/10">
          <div className="w-16 h-16 bg-[var(--color-burgundy)]/10 rounded-full flex items-center justify-center mb-4 text-[var(--color-burgundy)]">
            <ShoppingBag size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Your cart feels lonely</h3>
          <p className="text-(--text-secondary) mb-6">
            Explore our latest arrivals and add some culture to your wardrobe.
          </p>
          <Link to="/" className="btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.productId}
                className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-5 flex flex-col sm:flex-row gap-5 sm:items-center hover:shadow-lg transition-all"
              >
                <div className="w-full sm:w-28 h-48 sm:h-28 bg-[var(--bg-main)] rounded-xl overflow-hidden flex-shrink-0 border border-[var(--border-color)]">
                  <ProductImageCarousel
                    images={item.images}
                    alt={item.name || "Product"}
                    className="w-full h-full"
                    imageClassName="w-full h-full object-cover"
                    placeholder={
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
                        <ShoppingBag size={32} className="opacity-40" />
                      </div>
                    }
                  />
                </div>

                <div className="flex-1 space-y-2 min-w-0">
                  <h3 className="font-display font-bold text-xl truncate">
                    {item.name || "Habesha Product"}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wider">
                    {item.category || "Authentic Wear"}
                  </p>
                  <p className="font-bold text-[var(--color-burgundy)]">
                    {Number(item.price || 0).toLocaleString("en-US")} Birr
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-3 bg-[var(--bg-main)] rounded-xl p-1 border border-[var(--border-color)]">
                    <button
                      onClick={() => {
                        const newQuantity = Math.max(1, item.quantity - 1);
                        if (newQuantity === item.quantity) return;

                        const updatedItems = cartItems.map((cartItem) =>
                          cartItem.productId === item.productId
                            ? { ...cartItem, quantity: newQuantity }
                            : cartItem
                        );
                        dispatch(setItems(updatedItems));

                        dispatch(
                          updateItemQuantity({
                            productId: item.productId,
                            quantity: newQuantity,
                          })
                        );
                      }}
                      className="p-1.5 hover:bg-[var(--bg-card)] rounded-lg transition-colors text-[var(--text-main)]"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        const newQuantity = item.quantity + 1;

                        const updatedItems = cartItems.map((cartItem) =>
                          cartItem.productId === item.productId
                            ? { ...cartItem, quantity: newQuantity }
                            : cartItem
                        );
                        dispatch(setItems(updatedItems));

                        dispatch(
                          updateItemQuantity({
                            productId: item.productId,
                            quantity: newQuantity,
                          })
                        );
                      }}
                      className="p-1.5 hover:bg-[var(--bg-card)] rounded-lg transition-colors text-[var(--text-main)]"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const productId = String(item.productId ?? "");
                      const nextItems = cartItems.filter(
                        (i) => String(i.productId ?? "") !== productId
                      );
                      dispatch(setItems(nextItems));
                      dispatch(removeItem(productId)).catch(() => {
                        dispatch(getCart());
                      });
                    }}
                    className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-5 sticky top-24">
              <h2 className="text-xl font-display font-bold border-b border-[var(--border-color)] pb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>{Number(calculateTotal()).toLocaleString("en-US")} Birr</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Shipping</span>
                  <span className="text-green-500 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-[var(--border-color)]">
                  <span>Total</span>
                  <span className="text-[var(--color-burgundy)]">
                    {Number(calculateTotal()).toLocaleString("en-US")} Birr
                  </span>
                </div>
              </div>

              <button
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 group mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || checkingStock}
              >
                {checkingStock ? (
                  "Checking stock..."
                ) : (
                  <>
                    Proceed to Checkout
                    <CreditCard
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-[var(--text-secondary)]">
                Secure payment powered by Gebeta. <br />
                Ethiopian quality, global standards.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
