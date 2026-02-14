import { useNavigate } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';


const Cart = () => {
  const { cart, updateCartQty, removeFromCart, clearCart, paymentMethods } = useStore();
  const navigate = useNavigate();

  const total = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/store')} className="touch-manipulation">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-serif font-bold">Your Cart</h1>
      </header>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ShoppingBag className="w-16 h-16 mb-4" />
          <p className="text-lg font-serif">Your cart is empty</p>
          <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate('/store')}>Continue Shopping</Button>
        </div>
      ) : (
        <div className="px-4 pt-4">
          <div className="space-y-3 mb-6">
            {cart.map(item => (
              <div key={item.product.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.product.image ? (
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🛍️</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{item.product.name}</div>
                  <div className="text-primary font-bold">₹{item.product.price.toLocaleString()}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <button className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center touch-manipulation" onClick={() => updateCartQty(item.product.id, item.quantity - 1)}>
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold">{item.quantity}</span>
                    <button className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center touch-manipulation" onClick={() => updateCartQty(item.product.id, item.quantity + 1)}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive flex-shrink-0" onClick={() => removeFromCart(item.product.id)}>
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>

          {/* Payment Methods */}
          {paymentMethods.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Payment Options</h3>
              {paymentMethods.map(pm => (
                <div key={pm.id} className="bg-accent rounded-xl p-3 mb-2 text-sm">
                  <span className="font-medium">{pm.label}:</span> {pm.value}
                </div>
              ))}
            </div>
          )}

          {/* Total & Checkout */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground">Total</span>
              <span className="text-2xl font-serif font-bold text-primary">₹{total.toLocaleString()}</span>
            </div>
            <Button className="w-full h-14 text-lg rounded-xl font-semibold" onClick={handleCheckout}>
              Place Order 🎉
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
