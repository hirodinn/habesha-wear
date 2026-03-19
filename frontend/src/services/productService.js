import axios from "axios";

const API_URL = "/api/products";

/** Normalize API response to product array (handles both array and { products } shape). */
export const toProductList = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.products)) return data.products;
  return [];
};

const productService = {
  fetchFeatured: async (limit = 3, query = "", category = "all") => {
    const params = new URLSearchParams({ limit });
    if (query?.trim()) params.set("q", query.trim());
    if (category && category !== "all") params.set("category", category);
    const response = await axios.get(`${API_URL}/featured?${params}`);
    const data = response.data;
    return Array.isArray(data) ? data : (data?.products ?? []);
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
    const data = response.data;
    return {
      products: toProductList(data),
      total: typeof data?.total === "number" ? data.total : (Array.isArray(data) ? data.length : 0),
      page: typeof data?.page === "number" ? data.page : page,
      limit: typeof data?.limit === "number" ? data.limit : limit,
      totalPages: typeof data?.totalPages === "number" ? data.totalPages : 1,
    };
  },
  fetchAllProducts: async () => {
    const response = await axios.get(API_URL);
    return toProductList(response.data);
  },
  /** Same categories used for shop filter: unique from all products, sorted. */
  fetchCategories: async () => {
    const list = await productService.fetchAllProducts();
    const raw = list.map((p) => (p && (p.category || "").trim())).filter(Boolean);
    return [...new Set(raw)].sort((a, b) => a.localeCompare(b));
  },
  fetchProductById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },
  /** Products owned by the current vendor (requires auth). */
  fetchVendorProducts: async () => {
    const response = await axios.get(`${API_URL}?mine=1`, { withCredentials: true });
    return toProductList(response.data);
  },
  rateProduct: async (id, value) => {
    const response = await axios.put(
      `${API_URL}/${id}/rating`,
      { value },
      { withCredentials: true }
    );
    return response.data;
  },
  /**
   * Validates cart items against current product stock.
   * @param {Array<{ productId, quantity, name? }>} cartItems
   * @returns {Promise<{ valid: boolean, errors: Array<{ name, requested, available }> }>}
   */
  validateCartStock: async (cartItems) => {
    const errors = [];
    for (const item of cartItems || []) {
      const id = item?.productId;
      const requested = Number(item?.quantity) || 0;
      if (!id || requested <= 0) continue;
      try {
        const product = await productService.fetchProductById(id);
        const available = Number(product?.stock) ?? 0;
        if (requested > available) {
          errors.push({
            name: product?.name || item?.name || "Product",
            requested,
            available,
          });
        }
      } catch {
        errors.push({
          name: item?.name || "Product",
          requested,
          available: 0,
        });
      }
    }
    return { valid: errors.length === 0, errors };
  },
};

export default productService;
