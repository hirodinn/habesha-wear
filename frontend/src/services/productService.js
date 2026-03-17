import axios from "axios";

const API_URL = "/api/products";

const productService = {
  fetchFeatured: async (limit = 3, query = "", category = "all") => {
    const params = new URLSearchParams({ limit });
    if (query?.trim()) params.set("q", query.trim());
    if (category && category !== "all") params.set("category", category);
    const response = await axios.get(`${API_URL}/featured?${params}`);
    return response.data;
  },
  fetchProductsPaginated: async (
    page = 1,
    limit = 12,
    excludeFeatured = false,
    query = "",
    category = "all"
  ) => {
    const params = new URLSearchParams({ page, limit });
    if (excludeFeatured) params.set("excludeFeatured", "1");
    if (query?.trim()) params.set("q", query.trim());
    if (category && category !== "all") params.set("category", category);
    const response = await axios.get(`${API_URL}?${params}`);
    return response.data;
  },
  fetchAllProducts: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },
  /** Same categories used for shop filter: unique from all products, sorted. */
  fetchCategories: async () => {
    const all = await productService.fetchAllProducts();
    const list = Array.isArray(all) ? all : [];
    const raw = list.map((p) => (p.category || "").trim()).filter(Boolean);
    return [...new Set(raw)].sort((a, b) => a.localeCompare(b));
  },
  fetchProductById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },
  /** Products owned by the current vendor (requires auth). */
  fetchVendorProducts: async () => {
    const response = await axios.get(`${API_URL}?mine=1`, { withCredentials: true });
    return Array.isArray(response.data) ? response.data : response.data?.products ?? [];
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
