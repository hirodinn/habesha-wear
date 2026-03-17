import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Smartphone, Wallet } from "lucide-react";
import { clearCart } from "../../redux/cartSlice";
import { fetchCart, removeCart } from "../../services/cartService";
import orderService from "../../services/orderService";

const Checkout = () => {
  const { items: cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [message, setMessage] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("chapa");

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0),
    [cartItems]
  );
  const shipping = deliveryMethod === "express" ? 250 : 0;
  const total = subtotal + shipping;

  const formatNumber = (value) => Number(value || 0).toLocaleString("en-US");

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isPlacingOrder) return;

    setIsPlacingOrder(true);
    setMessage("");

    try {
      const data = await fetchCart();
      const cart = Array.isArray(data) ? data[0] : data;

      if (!cart || !cart.products || cart.products.length === 0) {
        setMessage("Your cart is empty.");
        setIsPlacingOrder(false);
        return;
      }

      const orderProducts = cart.products.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
      }));

      await orderService.postOrders({
        products: orderProducts,
        totalAmount: total,
      });

      await removeCart();
      dispatch(clearCart());
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!user) {
    return (
      <div className="card-standard p-12 text-center">
        <h2 className="text-2xl font-bold text-[var(--text-main)] mb-3">Please login first</h2>
        <p className="text-[var(--text-secondary)] mb-6">You must login to continue checkout.</p>
        <Link to="/login" className="btn-primary">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-[var(--border-color)] pb-4">
        <h1 className="text-5xl font-display font-bold text-[var(--text-main)] tracking-tight">CHECKOUT</h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-7 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-[var(--text-main)]">Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="input-field" placeholder="First name" required />
              <input className="input-field" placeholder="Last name" required />
              <input className="input-field" placeholder="Phone number" required />
              <input className="input-field" placeholder="Email" type="email" required />
              <input className="input-field md:col-span-2" placeholder="Address" required />
              <input className="input-field" placeholder="City" required />
              <input className="input-field" placeholder="Zip / Postal code" required />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-[var(--text-main)]">Delivery</h2>
            <label className="flex items-center justify-between border border-[var(--border-color)] rounded-xl p-4 cursor-pointer">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryMethod === "standard"}
                  onChange={() => setDeliveryMethod("standard")}
                />
                <div>
                  <p className="font-semibold text-[var(--text-main)]">Standard Delivery</p>
                  <p className="text-xs text-[var(--text-secondary)]">Delivery within 5-7 days</p>
                </div>
              </div>
              <span className="text-sm font-semibold">Free</span>
            </label>
            <label className="flex items-center justify-between border border-[var(--border-color)] rounded-xl p-4 cursor-pointer">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryMethod === "express"}
                  onChange={() => setDeliveryMethod("express")}
                />
                <div>
                  <p className="font-semibold text-[var(--text-main)]">Express Shipping</p>
                  <p className="text-xs text-[var(--text-secondary)]">Delivery within 1-3 days</p>
                </div>
              </div>
              <span className="text-sm font-semibold">250 Birr</span>
            </label>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-[var(--text-main)]">Payment</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("chapa")}
                className={`rounded-xl border p-4 text-left transition-all ${
                  paymentMethod === "chapa"
                    ? "border-[var(--color-burgundy)] bg-[var(--color-burgundy)]/10"
                    : "border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--color-burgundy)]/40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center text-[var(--color-burgundy)]">
                    <Wallet size={18} />
                  </div>
                  {paymentMethod === "chapa" && (
                    <span className="text-xs font-semibold text-[var(--color-burgundy)]">Selected</span>
                  )}
                </div>
                <p className="font-semibold text-[var(--text-main)]">Chapa</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Pay via Chapa gateway</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("telebirr")}
                className={`rounded-xl border p-4 text-left transition-all ${
                  paymentMethod === "telebirr"
                    ? "border-[var(--color-burgundy)] bg-[var(--color-burgundy)]/10"
                    : "border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--color-burgundy)]/40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center text-[var(--color-burgundy)]">
                    <Smartphone size={18} />
                  </div>
                  {paymentMethod === "telebirr" && (
                    <span className="text-xs font-semibold text-[var(--color-burgundy)]">Selected</span>
                  )}
                </div>
                <p className="font-semibold text-[var(--text-main)]">Telebirr</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Pay via Telebirr wallet</p>
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Payment gateway integration will be implemented in the next step.
            </p>
          </section>

          {message && <p className="text-sm text-red-500">{message}</p>}

          <button className="w-full py-3 rounded-xl bg-[var(--color-burgundy)] text-white font-semibold hover:bg-[var(--color-burgundy-light)] transition-all">
            {isPlacingOrder ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Processing...
              </span>
            ) : (
              "PAY AND PLACE ORDER"
            )}
          </button>
        </div>

        <aside className="xl:col-span-5 border border-[var(--border-color)] rounded-2xl p-5 h-fit bg-[var(--bg-card)]">
          <h2 className="text-2xl font-display font-semibold mb-4">Shopping Bag ({cartItems.length})</h2>
          <div className="space-y-4 max-h-[340px] overflow-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex items-start gap-3 border-b border-[var(--border-color)] pb-3">
                <div className="w-14 h-20 rounded-md border border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-secondary)] text-xs">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name || "Product"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "IMG"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--text-main)] truncate">{item.name || "Product"}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">{formatNumber((item.price || 0) * item.quantity)} Birr</p>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--border-color)] space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Subtotal</span>
              <span>{formatNumber(subtotal)} Birr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Shipping</span>
              <span>{shipping === 0 ? "Free" : `${formatNumber(shipping)} Birr`}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[var(--border-color)] text-xl font-bold">
              <span>Total</span>
              <span>{formatNumber(total)} Birr</span>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default Checkout;
