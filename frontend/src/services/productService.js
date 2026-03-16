import axios from "axios";

const API_URL = "/api/products";

const productService = {
  fetchFeatured: async (limit = 3) => {
    const response = await axios.get(`${API_URL}/featured?limit=${limit}`);
    return response.data;
  },
  fetchProductsPaginated: async (page = 1, limit = 12, excludeFeatured = false) => {
    const params = new URLSearchParams({ page, limit });
    if (excludeFeatured) params.set("excludeFeatured", "1");
    const response = await axios.get(`${API_URL}?${params}`);
    return response.data;
  },
  fetchAllProducts: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },
  fetchProductById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },
  rateProduct: async (id, value) => {
    const response = await axios.put(
      `${API_URL}/${id}/rating`,
      { value },
      { withCredentials: true }
    );
    return response.data;
  },
};

export default productService;
