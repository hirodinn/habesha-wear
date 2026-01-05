import axios from "axios";

const API_URL = "/api/carts";

export const fetchCart = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  // Check if cart exists first, if not create one via POST
  // In this backend implementation, POST creates a new cart (or should handle updates)
  // But wait, the backend carts.js POST route:
  // router.post("/", ...) creates a new Cart(obj)
  // router.put("/", ...) updates an existing cart

  // It's safer to try GET first
  let cart;
  try {
    const carts = await fetchCart();
    cart = Array.isArray(carts) ? carts[0] : carts;
    console.log("cart", cart);
  } catch (err) {
    // If error, might be 404 or something else
  }

  if (!cart) {
    // Create new cart
    const response = await axios.post(API_URL, {
      products: [{ productId, quantity }],
    });
    return response.data;
  } else {
    // Update existing cart
    const existingProductIndex = cart.products.findIndex(
      (p) => p.productId === productId
    );
    let updatedProducts = [...cart.products];
    if (existingProductIndex > -1) {
      updatedProducts[existingProductIndex].quantity += quantity;
    } else {
      updatedProducts.push({ productId, quantity });
    }

    console.log(updatedProducts);

    const response = await axios.put(API_URL, {
      products: updatedProducts,
    });

    return response.data;
  }
};

export const updateCartItem = async (productId, quantity) => {
  const carts = await fetchCart();
  const cart = Array.isArray(carts) ? carts[0] : carts;

  if (!cart) return null;

  const updatedProducts = cart.products.map((p) =>
    p.productId === productId ? { ...p, quantity } : p
  );

  const response = await axios.put(API_URL, {
    products: updatedProducts,
  });
  return response.data;
};

export const removeCart = async () => {
  const response = await axios.delete(API_URL);
  return response.data;
};

export const removeFromCart = async (productId) => {
  const carts = await fetchCart();
  const cart = Array.isArray(carts) ? carts[0] : carts;

  if (!cart) return null;

  const updatedProducts = cart.products.filter(
    (p) => p.productId !== productId
  );

  const response = await axios.put(API_URL, {
    products: updatedProducts,
  });
  return response.data;
};
