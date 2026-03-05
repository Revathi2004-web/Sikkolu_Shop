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
  type: 'upi' | 'qr' | 'bank' | 'scanner';
  value: string;
  label: string;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
  scannerImage?: string;
}

export interface ContactNumber {
  id: string;
  phone: string;
  label: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
