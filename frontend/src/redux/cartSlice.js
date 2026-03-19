import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as cartService from "../services/cartService";
import productService from "../services/productService";

const getProductId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return String(value._id || value.id || "");
  return "";
};

const mapCartItems = (products = []) =>
  products.map((item) => {
    const details =
      item && typeof item.productId === "object"
        ? item.productId
        : item;

    return {
      ...details,
      productId: getProductId(item?.productId),
      quantity: Number(item?.quantity || 1),
    };
  });

export const getCart = createAsyncThunk(
  "cart/get",
  async (_, { rejectWithValue }) => {
    try {
      const data = await cartService.fetchCart();
      const cart = Array.isArray(data) ? data[0] : data;

      if (!cart || !Array.isArray(cart.products) || cart.products.length === 0) {
        return { ...(cart || {}), products: [] };
      }

      const populatedProducts = mapCartItems(cart.products);

      return {
        ...cart,
        products: populatedProducts,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch cart" });
    }
  }
);

export const addItemToCart = createAsyncThunk(
  "cart/addItem",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const id = String(productId ?? "").trim() || getProductId(productId);
      if (!id) return rejectWithValue({ message: "Product ID is required" });

      const cart = await cartService.addToCart(id, quantity);
      if (!cart || !Array.isArray(cart.products)) {
        return { ...(cart || {}), products: [] };
      }

      const populatedProducts = await Promise.all(
        cart.products.map(async (item) => {
          const itemId = getProductId(item.productId);
          if (item?.productId && typeof item.productId === "object") {
            return {
              ...item.productId,
              productId: itemId,
              quantity: Number(item.quantity || 1),
            };
          }
          try {
            const details = await productService.fetchProductById(itemId);
            return { ...details, productId: itemId, quantity: Number(item.quantity || 1) };
          } catch {
            return { productId: itemId, quantity: Number(item.quantity || 1), name: "", images: [], price: 0, category: "" };
          }
        })
      );

      return { ...cart, products: populatedProducts };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to add item to cart" });
    }
  }
);

export const updateItemQuantity = createAsyncThunk(
  "cart/updateItem",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const cart = await cartService.updateCartItem(productId, quantity);

      const populatedProducts = mapCartItems(cart.products || []);

      return { ...cart, products: populatedProducts };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to update cart item" });
    }
  }
);

export const removeItem = createAsyncThunk(
  "cart/removeItem",
  async (productId, { rejectWithValue }) => {
    try {
      const cart = await cartService.removeFromCart(productId);

      const populatedProducts = mapCartItems(cart.products || []);

      return { ...cart, products: populatedProducts };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to remove cart item" });
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCart: (state) => {
      state.items = [];
    },
    setItems: (state, action) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Cart
      .addCase(getCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.products || [];
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add/Update/Remove actions update the entire items array from response
      .addMatcher(
        (action) =>
          [
            addItemToCart.fulfilled,
            updateItemQuantity.fulfilled,
            removeItem.fulfilled,
          ].includes(action.type),
        (state, action) => {
          state.loading = false;
          state.items = action.payload?.products || [];
        }
      )
      .addMatcher(
        (action) =>
          [
            addItemToCart.pending,
            updateItemQuantity.pending,
            removeItem.pending,
          ].includes(action.type),
        (state) => {
          state.loading = true;
        }
      )
      .addMatcher(
        (action) =>
          [
            addItemToCart.rejected,
            updateItemQuantity.rejected,
            removeItem.rejected,
          ].includes(action.type),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearCart } = cartSlice.actions;
export const { setItems } = cartSlice.actions;
export default cartSlice.reducer;
