import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const Checkout = () => {
  const { cart, clearCart } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || cart.length === 0) return;
    setLoading(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_address: address.trim(),
          total_amount: total,
          status: 'pending' as any,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const items = cart.map(c => ({
        order_id: order.id,
        product_name: c.product.name,
        product_price: c.product.price,
        quantity: c.quantity,
        product_image: c.product.image || '',
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(items);
      if (itemsError) throw itemsError;

      // Update profile
      await supabase.from('profiles').update({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      }).eq('user_id', user.id);

      clearCart();
      toast.success('Order placed! Waiting for admin confirmation 🎉');
      navigate('/orders');
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-lg font-serif text-muted-foreground mb-4">Your cart is empty</p>
        <Button onClick={() => navigate('/store')} className="rounded-xl">Go to Store</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/cart')} className="touch-manipulation">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-serif font-bold">Checkout</h1>
      </header>

      <div className="px-4 pt-4">
        {/* Order Summary */}
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          {cart.map(item => (
            <div key={item.product.id} className="flex justify-between text-sm py-1">
              <span>{item.product.name} × {item.quantity}</span>
              <span className="font-medium">₹{(item.product.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-border mt-2 pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">₹{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Delivery Details Form */}
        <form onSubmit={handlePlaceOrder} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
            <Input
              placeholder="Your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-12 rounded-xl mt-1"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
            <Input
              placeholder="+91 98765 43210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="h-12 rounded-xl mt-1"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Delivery Address</label>
            <textarea
              placeholder="Full delivery address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full min-h-[100px] rounded-xl border border-input bg-background px-3 py-2 text-base mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>
          <Button type="submit" className="w-full h-14 text-lg rounded-xl font-semibold" disabled={loading}>
            {loading ? 'Placing Order...' : 'Place Order 🎉'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
