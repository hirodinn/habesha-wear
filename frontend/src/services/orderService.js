import axios from "axios";

const orderService = {
  getOrders: async () => {
    const response = await axios.get("/api/orders");
    return response.data;
  },
  postOrders: async (order) => {
    let verifiedOrder = [];
    for (let or of order.products) {
      const product = await axios.put(`/api/products/${or.productId}`, {
        stock: or.quantity,
      });
      console.log("product: ", product);
      if (product) verifiedOrder.push(or);
    }
    order.products = verifiedOrder;
    const response = await axios.post("/api/orders", {
      ...order,
    });
    return response.data;
  },
};

export default orderService;
