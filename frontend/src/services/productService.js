import axios from "axios";

const API_URL = "/api/products";

const productService = {
  fetchProductById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },
  rateProduct: async (id, value) => {
    const response = await axios.put(`${API_URL}/${id}/rating`, { value });
    return response.data;
  },
};

export default productService;
