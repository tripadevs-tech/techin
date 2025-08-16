import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer } from '@/types/api';
import apiService from '@/services/apiService';

interface AuthState {
  isAuthenticated: boolean;
  customer: Customer | null;
  sessionToken: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: {
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
    password: string;
  }) => Promise<{ success: boolean; message?: string; errors?: Record<string, string> }>;
  logout: () => Promise<void>;
  loadCustomer: () => Promise<void>;
  setSessionToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      customer: null,
      sessionToken: null,

      setSessionToken: (token: string | null) => {
        set({ sessionToken: token });
        apiService.setSessionToken(token);
      },

      login: async (email: string, password: string) => {
        try {
          const response = await apiService.login(email, password);
          
          if (response.success && response.data?.token) {
            const { setSessionToken, loadCustomer } = get();
            setSessionToken(response.data.token);
            await loadCustomer();
            set({ isAuthenticated: true });
            return { success: true };
          } else {
            return { 
              success: false, 
              message: response.message || 'Login failed' 
            };
          }
        } catch (error) {
          console.error('Login error:', error);
          return { 
            success: false, 
            message: 'Network error. Please try again.' 
          };
        }
      },

      register: async (userData) => {
        try {
          const response = await apiService.register(userData);
          
          if (response.success) {
            return { success: true };
          } else {
            return { 
              success: false, 
              message: response.message,
              errors: response.errors 
            };
          }
        } catch (error) {
          console.error('Registration error:', error);
          return { 
            success: false, 
            message: 'Network error. Please try again.' 
          };
        }
      },

      logout: async () => {
        try {
          await apiService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            isAuthenticated: false, 
            customer: null, 
            sessionToken: null 
          });
          apiService.setSessionToken(null);
        }
      },

      loadCustomer: async () => {
        try {
          const response = await apiService.getAccount();
          if (response.success && response.data) {
            set({ customer: response.data, isAuthenticated: true });
          }
        } catch (error) {
          console.error('Load customer error:', error);
          set({ isAuthenticated: false, customer: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        sessionToken: state.sessionToken,
        customer: state.customer,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);