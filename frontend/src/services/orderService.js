import axios from "axios";

const orderService = {
  getOrders: async () => {
    const response = await axios.get("/api/orders");
    return response.data;
  },
  postOrders: async (order) => {
    const response = await axios.post("/api/orders", {
      ...order,
    });
    return response.data;
  },
};

export default orderService;
