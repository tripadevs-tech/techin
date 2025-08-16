import { create } from 'zustand';
import { CartItem, CartTotal } from '@/types/api';
import apiService from '@/services/apiService';

interface CartState {
  items: CartItem[];
  totals: CartTotal[];
  isLoading: boolean;
  isVisible: boolean;
  itemCount: number;
  totalAmount: number;
  loadCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number, options?: Record<string, string>) => Promise<{ success: boolean; message?: string }>;
  updateQuantity: (cartId: string, quantity: number) => Promise<void>;
  removeItem: (cartId: string) => Promise<void>;
  clearCart: () => void;
  showCart: () => void;
  hideCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totals: [],
  isLoading: false,
  isVisible: false,
  itemCount: 0,
  totalAmount: 0,

  loadCart: async () => {
    set({ isLoading: true });
    try {
      const cartData = await apiService.getCart();
      const itemCount = cartData.products.reduce((sum, item) => sum + parseInt(item.quantity), 0);
      const totalAmount = cartData.totals.find(total => total.title === 'Total')?.value || 0;
      
      set({ 
        items: cartData.products, 
        totals: cartData.totals,
        itemCount,
        totalAmount,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to load cart:', error);
      set({ isLoading: false });
    }
  },

  addToCart: async (productId: string, quantity = 1, options) => {
    try {
      const response = await apiService.addToCart(productId, quantity, options);
      
      if (response.success) {
        await get().loadCart();
        return { success: true, message: response.message || 'Product added to cart' };
      } else {
        return { success: false, message: response.message || 'Failed to add to cart' };
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  updateQuantity: async (cartId: string, quantity: number) => {
    try {
      await apiService.updateCart({ [cartId]: quantity });
      await get().loadCart();
    } catch (error) {
      console.error('Update quantity error:', error);
    }
  },

  removeItem: async (cartId: string) => {
    try {
      await apiService.removeFromCart(cartId);
      await get().loadCart();
    } catch (error) {
      console.error('Remove item error:', error);
    }
  },

  clearCart: () => {
    set({ items: [], totals: [], itemCount: 0, totalAmount: 0 });
  },

  showCart: () => set({ isVisible: true }),
  hideCart: () => set({ isVisible: false }),
  toggleCart: () => set((state) => ({ isVisible: !state.isVisible })),
}));