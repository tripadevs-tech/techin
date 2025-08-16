import { 
  Product, 
  Category, 
  CartItem, 
  CartTotal, 
  Customer, 
  Order, 
  OrderDetails,
  ApiResponse 
} from '@/types/api';

class ApiService {
  private baseUrl: string;
  private apiKey: string;
  private sessionToken: string | null = null;

  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost/techin/index.php?route=api/mobile/';
    this.apiKey = process.env.API_KEY || 'TECHTENT-AUG-2025-frobenius';
  }

  setSessionToken(token: string | null) {
    this.sessionToken = token;
  }

  getSessionToken() {
    return this.sessionToken;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers: Record<string, string> = {};
      
      // Only add Content-Type for JSON requests
      if (options.body && typeof options.body === 'string') {
        headers['Content-Type'] = 'application/json';
      }
      
      // Add API key header
      if (this.apiKey) {
        'X-API-Key': this.apiKey,
      }

      // Add session cookie if available
      if (this.sessionToken) {
        headers['Cookie'] = `OCSESSID=${this.sessionToken}`;
      }

      // Merge with provided headers
      Object.assign(headers, options.headers);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ token: string }>> {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const response = await this.makeRequest<any>('login', {
      method: 'POST',
      body: formData,
    });

    if (response.success && response.token) {
      this.setSessionToken(response.token);
      return { success: true, data: { token: response.token } };
    } else {
      return { success: false, message: response.message || 'Login failed' };
    }
  }

  async register(userData: {
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
    password: string;
  }): Promise<{ success: boolean; message?: string; errors?: Record<string, string> }> {
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await this.makeRequest<any>('register', {
      method: 'POST',
      body: formData,
    });

    return {
      success: response.success || false,
      message: response.message,
      errors: response.errors,
    };
  }

  async logout(): Promise<ApiResponse<any>> {
    const response = await this.makeRequest<any>('logout');
    this.setSessionToken(null);
    return { success: true };
  }

  async getAccount(): Promise<ApiResponse<Customer>> {
    const response = await this.makeRequest<any>('account');
    return {
      success: response.success || false,
      data: response.data,
      message: response.message,
    };
  }

  // Products
  async getProducts(params?: {
    category_id?: number;
    manufacturer_id?: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Product[]>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `products${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await this.makeRequest<any>(endpoint);
    
    if (Array.isArray(response)) {
      return { success: true, data: response };
    } else {
      return { success: false, data: [], message: 'Failed to load products' };
    }
  }

  async getProduct(productId: string): Promise<ApiResponse<Product>> {
    return this.makeRequest<ApiResponse<Product>>(`product?product_id=${productId}`);
  }

  async searchProducts(query: string, page: number = 1, limit: number = 20): Promise<ApiResponse<Product[]>> {
    return this.makeRequest<ApiResponse<Product[]>>(`search?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  // Categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await this.makeRequest<any>('categories');
    return {
      success: response.success || false,
      data: response.data || [],
      message: response.message,
    };
  }

  async getCategory(categoryId: string): Promise<ApiResponse<Category>> {
    return this.makeRequest<ApiResponse<Category>>(`category?category_id=${categoryId}`);
  }

  // Cart
  async getCart(): Promise<{ products: CartItem[]; totals: CartTotal[] }> {
    const response = await this.makeRequest<any>('cart');
    return {
      products: response.products || [],
      totals: response.totals || [],
    };
  }

  async addToCart(productId: string, quantity: number = 1, options?: Record<string, string>): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('product_id', productId);
    formData.append('quantity', quantity.toString());
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(`option[${key}]`, value);
      });
    }

    const response = await this.makeRequest<any>('cart_add', {
      method: 'POST',
      body: formData,
    });

    return {
      success: !!response.success,
      message: response.success || response.error,
    };
  }

  async updateCart(quantities: Record<string, number>): Promise<ApiResponse<any>> {
    const formData = new FormData();
    Object.entries(quantities).forEach(([cartId, quantity]) => {
      formData.append(`quantity[${cartId}]`, quantity.toString());
    });

    const response = await this.makeRequest<any>('cart_update', {
      method: 'POST',
      body: formData,
    });

    return { success: !!response.success, message: response.success || response.error };
  }

  async removeFromCart(cartId: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('key', cartId);

    const response = await this.makeRequest<any>('cart_remove', {
      method: 'POST',
      body: formData,
    });

    return { success: !!response.success, message: response.success || response.error };
  }

  // Wishlist
  async getWishlist(): Promise<{ products: Product[] }> {
    const response = await this.makeRequest<any>('wishlist');
    return {
      products: response.products || [],
    };
  }

  async addToWishlist(productId: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('product_id', productId);

    const response = await this.makeRequest<any>('wishlist_add', {
      method: 'POST',
      body: formData,
    });

    return { success: !!response.success, message: response.success || response.error };
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('product_id', productId);

    const response = await this.makeRequest<any>('wishlist_remove', {
      method: 'POST',
      body: formData,
    });

    return { success: !!response.success, message: response.success || response.error };
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    const response = await this.makeRequest<any>('orders');
    return Array.isArray(response) ? response : [];
  }

  async getOrderDetails(orderId: string): Promise<OrderDetails> {
    return this.makeRequest<OrderDetails>(`order_info?order_id=${orderId}`);
  }

  // Checkout
  async getPaymentMethods(): Promise<any> {
    const response = await this.makeRequest<any>('payment_methods');
    return response.payment_methods || {};
  }

  async getShippingMethods(): Promise<any> {
    const response = await this.makeRequest<any>('shipping_methods');
    return response.shipping_methods || {};
  }

  async createOrder(orderData: any): Promise<{ order_id: string }> {
    const formData = new FormData();
    Object.entries(orderData).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    const response = await this.makeRequest<any>('order_create', {
      method: 'POST',
      body: formData,
    });

    return { order_id: response.order_id };
  }
}

export default new ApiService();