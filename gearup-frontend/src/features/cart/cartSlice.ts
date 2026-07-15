import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartGearItem {
  id: string;
  name: string;
  brand: string;
  pricePerDay: number;
  availableQuantity: number;
  images?: string[];
  providerId: string;
}

export interface CartItem {
  gearItem: CartGearItem;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  startDate: string | null;
  endDate: string | null;
}

const loadCartFromStorage = (): CartState => {
  try {
    const serialized = sessionStorage.getItem("gearup_cart");
    if (serialized === null) {
      return { items: [], startDate: null, endDate: null };
    }
    return JSON.parse(serialized);
  } catch {
    return { items: [], startDate: null, endDate: null };
  }
};

const initialState: CartState = loadCartFromStorage();

const saveCartToStorage = (state: CartState) => {
  try {
    const serialized = JSON.stringify(state);
    sessionStorage.setItem("gearup_cart", serialized);
  } catch {
    console.error("Could not save cart state");
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (i) => i.gearItem.id === action.payload.gearItem.id
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      saveCartToStorage(state);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (i) => i.gearItem.id !== action.payload
      );
      saveCartToStorage(state);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (i) => i.gearItem.id === action.payload.id
      );
      if (item) {
        item.quantity = action.payload.quantity;
      }
      saveCartToStorage(state);
    },
    setDates: (
      state,
      action: PayloadAction<{ startDate: string | null; endDate: string | null }>
    ) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
      saveCartToStorage(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.startDate = null;
      state.endDate = null;
      saveCartToStorage(state);
    },
  },
});

export const { addItem, removeItem, updateQuantity, setDates, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
