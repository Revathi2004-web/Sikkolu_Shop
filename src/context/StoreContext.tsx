import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, Category, PaymentMethod, ContactNumber, CartItem } from '@/types';
import { toast } from 'sonner';

interface StoreContextType {
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  categories: Category[];
  addCategory: (c: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (p: Omit<PaymentMethod, 'id'>) => void;
  deletePaymentMethod: (id: string) => void;
  contacts: ContactNumber[];
  addContact: (c: Omit<ContactNumber, 'id'>) => void;
  updateContact: (id: string, c: Partial<Omit<ContactNumber, 'id'>>) => void;
  deleteContact: (id: string) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const sampleCategories: Category[] = [
  { id: '1', name: 'Fashion', emoji: '👗' },
  { id: '2', name: 'Jewelry', emoji: '💎' },
  { id: '3', name: 'Accessories', emoji: '👜' },
  { id: '4', name: 'Home Decor', emoji: '🏠' },
];

const sampleProducts: Product[] = [
  { id: '1', name: 'Premium Silk Kurta', price: 2999, image: '', category: 'Fashion', stock: 10, description: 'Handcrafted silk kurta' },
  { id: '2', name: 'Gold Plated Earrings', price: 1499, image: '', category: 'Jewelry', stock: 15, description: 'Elegant gold plated earrings' },
  { id: '3', name: 'Embroidered Clutch', price: 999, image: '', category: 'Accessories', stock: 20, description: 'Beautiful embroidered clutch bag' },
  { id: '4', name: 'Handwoven Saree', price: 5999, image: '', category: 'Fashion', stock: 5, description: 'Traditional handwoven saree' },
  { id: '5', name: 'Crystal Pendant', price: 2499, image: '', category: 'Jewelry', stock: 8, description: 'Sparkling crystal pendant' },
  { id: '6', name: 'Brass Diya Set', price: 799, image: '', category: 'Home Decor', stock: 25, description: 'Traditional brass diya set' },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [categories, setCategories] = useState<Category[]>(sampleCategories);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'upi', value: 'sikkolspecials@upi', label: 'Main UPI' },
  ]);
  const [contacts, setContacts] = useState<ContactNumber[]>([
    { id: '1', phone: '+91 98765 43210', label: 'Main Contact' },
  ]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const genId = () => Math.random().toString(36).substr(2, 9);

  const addProduct = (p: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...p, id: genId() }]);
    toast.success('Product added!');
  };
  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Product deleted');
  };
  const addCategory = (c: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...c, id: genId() }]);
    toast.success('Category added!');
  };
  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    toast.success('Category deleted');
  };
  const addPaymentMethod = (p: Omit<PaymentMethod, 'id'>) => {
    setPaymentMethods(prev => [...prev, { ...p, id: genId() } as PaymentMethod]);
    toast.success('Payment method added!');
  };
  const deletePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(p => p.id !== id));
    toast.success('Payment method deleted');
  };
  const addContact = (c: Omit<ContactNumber, 'id'>) => {
    setContacts(prev => [...prev, { ...c, id: genId() }]);
    toast.success('Contact added!');
  };
  const updateContact = (id: string, c: Partial<Omit<ContactNumber, 'id'>>) => {
    setContacts(prev => prev.map(ct => ct.id === id ? { ...ct, ...c } : ct));
    toast.success('Contact updated!');
  };
  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    toast.success('Contact deleted');
  };
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id);
      if (existing) return prev.map(c => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { product, quantity: 1 }];
    });
    toast.success('Added to cart!');
  };
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(c => c.product.id !== productId));
  };
  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(c => c.product.id === productId ? { ...c, quantity: qty } : c));
  };
  const clearCart = () => setCart([]);
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  return (
    <StoreContext.Provider value={{
      products, addProduct, deleteProduct,
      categories, addCategory, deleteCategory,
      paymentMethods, addPaymentMethod, deletePaymentMethod,
      contacts, addContact, updateContact, deleteContact,
      cart, addToCart, removeFromCart, updateCartQty, clearCart,
      wishlist, toggleWishlist,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
