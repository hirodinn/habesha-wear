import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as cartService from "../services/cartService";
import productService from "../services/productService";

export const getCart = createAsyncThunk(
  "cart/get",
  async (_, { rejectWithValue }) => {
    try {
      const data = await cartService.fetchCart();
      const cart = Array.isArray(data) ? data[0] : data;

      if (!cart || !cart.products) return cart;

      // Populate product details for each item
      const populatedProducts = await Promise.all(
        cart.products.map(async (item) => {
          try {
            const productDetails = await productService.fetchProductById(
              item.productId
            );
            return {
              ...item,
              ...productDetails, // Spread details (includes name, price, etc.)
            };
          } catch (err) {
            console.error(
              `Failed to fetch details for product ${item.productId}:`,
              err
            );
            return item;
          }
        })
      );

      return {
        ...cart,
        products: populatedProducts,
      };
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const addItemToCart = createAsyncThunk(
  "cart/addItem",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const cart = await cartService.addToCart(productId, quantity);

      // Populate details
      const populatedProducts = await Promise.all(
        cart.products.map(async (item) => {
          const details = await productService.fetchProductById(item.productId);
          return { ...item, ...details };
        })
      );

      return { ...cart, products: populatedProducts };
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateItemQuantity = createAsyncThunk(
  "cart/updateItem",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const cart = await cartService.updateCartItem(productId, quantity);

      // Populate details
      const populatedProducts = await Promise.all(
        cart.products.map(async (item) => {
          const details = await productService.fetchProductById(item.productId);
          return { ...item, ...details };
        })
      );

      return { ...cart, products: populatedProducts };
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const removeItem = createAsyncThunk(
  "cart/removeItem",
  async (productId, { rejectWithValue }) => {
    try {
      const cart = await cartService.removeFromCart(productId);

      // Populate details
      const populatedProducts = await Promise.all(
        cart.products.map(async (item) => {
          const details = await productService.fetchProductById(item.productId);
          return { ...item, ...details };
        })
      );

      return { ...cart, products: populatedProducts };
    } catch (err) {
      return rejectWithValue(err.response.data);
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
export default cartSlice.reducer;
