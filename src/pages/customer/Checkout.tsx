import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { orderSchema } from '@/lib/validation';

const Checkout = () => {
  const { cart, clearCart, contacts } = useStore();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [doorNo, setDoorNo] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [loading, setLoading] = useState(false);
  const total = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0);
  const buildAddress = () => [doorNo, street, landmark, state, country].filter(Boolean).join(', ');

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || cart.length === 0) return;
    setLoading(true);
    const address = buildAddress();
    try {
      const parsed = orderSchema.safeParse({ customer_name: name, customer_phone: phone, customer_address: address });
      if (!parsed.success) { toast.error(parsed.error.errors[0].message); setLoading(false); return; }
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ user_id: user.id, customer_name: parsed.data.customer_name, customer_phone: parsed.data.customer_phone, customer_address: parsed.data.customer_address, total_amount: total, status: 'pending' as any })
        .select().single();
      if (orderError) throw orderError;
      const items = cart.map(c => ({ order_id: order.id, product_name: c.product.name, product_price: c.product.price, quantity: c.quantity, product_image: c.product.image || '' }));
      const { error: itemsError } = await supabase.from('order_items').insert(items);
      if (itemsError) throw itemsError;
      await supabase.from('profiles').update({ name: name.trim(), phone: phone.trim(), address: address.trim() }).eq('user_id', user.id);
      const adminPhone = contacts[0]?.phone?.replace(/\s+/g, '') || '';
      if (adminPhone) {
        const msg = encodeURIComponent(`🛍️ New Order!\nFrom: ${name}\nPhone: ${phone}\nTotal: ₹${total.toLocaleString()}\nAddress: ${address}`);
        window.open(`https://wa.me/${adminPhone.replace('+', '')}?text=${msg}`, '_blank');
      }
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
        <p className="text-lg font-serif text-muted-foreground mb-4">{t.cartEmpty}</p>
        <Button onClick={() => navigate('/store')} className="rounded-xl">{t.continueShopping}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/cart')} className="touch-manipulation"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-serif font-bold">{t.checkout}</h1>
      </header>

      <div className="px-4 pt-4">
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <h3 className="font-semibold mb-2">{t.orderSummary}</h3>
          {cart.map(item => (
            <div key={item.product.id} className="flex justify-between text-sm py-1">
              <span className="truncate mr-2">{item.product.name} × {item.quantity}</span>
              <span className="font-medium whitespace-nowrap">₹{(item.product.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-border mt-2 pt-2 flex justify-between font-bold">
            <span>{t.total}</span>
            <span className="text-primary">₹{total.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">{t.fullName}</label>
            <Input placeholder={t.yourFullName} value={name} onChange={e => setName(e.target.value)} className="h-12 rounded-xl mt-1" required />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">{t.phoneNumber}</label>
            <Input placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} className="h-12 rounded-xl mt-1" required />
          </div>
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-sm">{t.deliveryAddress}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t.doorNo}</label>
                <Input placeholder="e.g. 12-3-45" value={doorNo} onChange={e => setDoorNo(e.target.value)} className="h-10 rounded-lg mt-1" required />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t.street}</label>
                <Input placeholder="Street name" value={street} onChange={e => setStreet(e.target.value)} className="h-10 rounded-lg mt-1" required />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t.landmark}</label>
              <Input placeholder="Near..." value={landmark} onChange={e => setLandmark(e.target.value)} className="h-10 rounded-lg mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t.state}</label>
                <Input placeholder="State" value={state} onChange={e => setState(e.target.value)} className="h-10 rounded-lg mt-1" required />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t.country}</label>
                <Input placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} className="h-10 rounded-lg mt-1" required />
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full h-14 text-lg rounded-xl font-semibold" disabled={loading}>
            {loading ? t.placingOrder : t.placeOrder}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
