export interface Product {
  product_id: string;
  name: string;
  description: string;
  price: string;
  special?: string;
  tax: string;
  minimum: string;
  rating: number;
  thumb: string;
  image?: string;
  images?: string[];
  options?: ProductOption[];
  href: string;
  manufacturer?: string;
  model?: string;
  stock_status?: string;
  quantity?: number;
}

export interface ProductOption {
  product_option_id: string;
  option_id: string;
  name: string;
  type: string;
  value: string;
  required: boolean;
  product_option_value?: ProductOptionValue[];
}

export interface ProductOptionValue {
  product_option_value_id: string;
  option_value_id: string;
  name: string;
  image: string;
  price: string;
  price_prefix: string;
}

export interface Category {
  category_id: string;
  name: string;
  description?: string;
  image?: string;
  parent_id: string;
  sort_order: string;
  status: string;
  date_added: string;
  date_modified: string;
}

export interface CartItem {
  cart_id: string;
  product_id: string;
  name: string;
  model: string;
  option: any[];
  quantity: string;
  stock: boolean;
  shipping: string;
  price: string;
  total: string;
  image: string;
  href: string;
}

export interface CartTotal {
  title: string;
  text: string;
  value: number;
}

export interface Customer {
  customer_id: string;
  firstname: string;
  lastname: string;
  email: string;
  telephone: string;
}

export interface Order {
  order_id: string;
  firstname: string;
  lastname: string;
  status: string;
  date_added: string;
  total: string;
  currency_code: string;
  currency_value: string;
}

export interface OrderDetails extends Order {
  invoice_no: string;
  products: OrderProduct[];
  totals: CartTotal[];
  histories: OrderHistory[];
}

export interface OrderProduct {
  order_product_id: string;
  product_id: string;
  name: string;
  model: string;
  quantity: string;
  price: string;
  total: string;
  option: any[];
}

export interface OrderHistory {
  date_added: string;
  status: string;
  comment: string;
  notify: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}