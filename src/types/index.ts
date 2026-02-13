export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export interface PaymentMethod {
  id: string;
  type: 'upi' | 'qr';
  value: string;
  label: string;
}

export interface ContactNumber {
  id: string;
  phone: string;
  label: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
