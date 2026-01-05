import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  Loader2,
} from "lucide-react";
import {
  updateItemQuantity,
  removeItem,
  getCart,
  clearCart,
} from "../../redux/cartSlice";
import { useEffect } from "react";
import { fetchCart, removeCart } from "../../services/cartService";
import orderService from "../../services/orderService";
const Cart = () => {
  const { items: cartItems, loading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      dispatch(getCart());
    }
  }, [user, dispatch]);

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
    try {
      const data = await fetchCart();
      const cart = Array.isArray(data) ? data[0] : data;

      if (!cart || !cart.products || cart.products.length === 0) {
        alert("Your cart is empty!");
        return;
      }

      // Format products for backend: only productId and quantity
      const orderProducts = cart.products.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
      }));

      await orderService.postOrders({
        products: orderProducts,
        totalAmount: calculateTotal(),
      });

      // Clear cart on success
      await removeCart();
      dispatch(clearCart());

      alert("Order placed successfully!");
      navigate("/");
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Checkout failed. Please try again.");
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-(--text-secondary) mb-8 max-w-md">
          Please log in to see your saved items and start shopping our unique
          Habesha collection.
        </p>
        <Link to="/login" className="btn-primary">
          Sign In to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 py-4 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-[var(--bg-card)] rounded-full transition-colors text-[var(--text-secondary)]"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="card-standard p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mb-4 text-sky-600 dark:text-sky-400">
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Items List */}
          <div className="lg:col-span-3 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.productId}
                className="card-standard p-4 flex gap-6 items-center"
              >
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                  {/* Ideally fetch product image here */}
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ShoppingBag size={32} className="opacity-20" />
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-lg truncate">
                    {item.name || "Habesha Product"}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {item.category || "Authentic Wear"}
                  </p>
                  <p className="font-bold text-sky-600 dark:text-sky-400">
                    {item.price || 0} Birr
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-[var(--bg-main)] rounded-xl p-1 border border-[var(--border-color)]">
                  <button
                    onClick={() =>
                      dispatch(
                        updateItemQuantity({
                          productId: item.productId,
                          quantity: Math.max(1, item.quantity - 1),
                        })
                      )
                    }
                    className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-bold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      dispatch(
                        addItemToCart({
                          productId: item.productId,
                          quantity: 1,
                        })
                      )
                    }
                    className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={() => dispatch(removeItem(item.productId))}
                  className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <div className="card-standard p-6 space-y-4 sticky top-24">
              <h2 className="text-xl font-bold border-b border-[var(--border-color)] pb-4">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>{calculateTotal()} Birr</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Shipping</span>
                  <span className="text-green-500 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-[var(--border-color)]">
                  <span>Total</span>
                  <span className="text-purple-600 dark:text-purple-400">
                    {calculateTotal()} Birr
                  </span>
                </div>
              </div>

              <button
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 group mt-4"
                onClick={handleCheckout}
              >
                Proceed to Checkout
                <CreditCard
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
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
