import axios from "axios";

const withCreds = { withCredentials: true };

const orderService = {
  getOrders: async () => {
    const response = await axios.get("/api/orders", withCreds);
    return response.data;
  },
  postOrders: async (order) => {
    const products = Array.isArray(order.products) ? order.products : [];
    for (const item of products) {
      const productId = typeof item.productId === "object" ? (item.productId?._id ?? item.productId?.id) : item.productId;
      if (!productId) continue;
      await axios.put(
        `/api/products/${productId}`,
        { stock: Number(item.quantity) || 1 },
        withCreds
      );
    }
    const payload = {
      products: products.map((p) => ({
        productId: typeof p.productId === "object" ? String(p.productId?._id ?? p.productId?.id ?? "") : String(p.productId ?? ""),
        quantity: Number(p.quantity) || 1,
      })).filter((p) => p.productId),
      totalAmount: Number(order.totalAmount) || 0,
      shippingAddress: order.shippingAddress || {},
      deliveryMethod: order.deliveryMethod || "standard",
      paymentMethod: order.paymentMethod || "chapa",
    };
    const response = await axios.post("/api/orders", payload, withCreds);
    return response.data;
  },
};

export default orderService;
