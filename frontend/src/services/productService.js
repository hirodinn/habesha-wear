import axios from "axios";

const API_URL = "/api/products";

const productService = {
  fetchProductById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },
};

export default productService;
