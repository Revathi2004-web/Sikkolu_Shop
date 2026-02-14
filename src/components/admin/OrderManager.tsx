import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusOptions = [
  { value: 'pending', label: '⏳ Pending' },
  { value: 'confirmed', label: '✅ Confirmed' },
  { value: 'payment_pending', label: '💳 Payment Pending' },
  { value: 'paid', label: '💰 Paid' },
  { value: 'shipped', label: '🚚 Shipped' },
  { value: 'delivered', label: '📦 Delivered' },
  { value: 'cancelled', label: '❌ Cancelled' },
  { value: 'return_requested', label: '🔄 Return Requested' },
  { value: 'returned', label: '↩️ Returned' },
];

const OrderManager = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageDialog, setMessageDialog] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: status as any })
      .eq('id', orderId);
    if (error) toast.error('Failed to update');
    else { toast.success(`Status updated to ${status}`); fetchOrders(); }
  };

  const sendMessage = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ admin_message: message })
      .eq('id', orderId);
    if (error) toast.error('Failed to send');
    else { toast.success('Message sent to customer'); setMessageDialog(null); setMessage(''); fetchOrders(); }
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-serif font-bold">📋 Orders ({orders.length})</h2>

      {orders.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No orders yet</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold">{order.customer_name}</div>
                <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
                <div className="text-xs text-muted-foreground mt-1">{order.customer_address}</div>
              </div>
              <div className="text-right">
                <div className="text-primary font-bold">₹{Number(order.total_amount).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">#{order.id.slice(0, 8)}</div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-accent rounded-lg p-2 mb-3 space-y-1">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span>{item.product_name} × {item.quantity}</span>
                  <span>₹{(item.product_price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Cancel/Return reason */}
            {order.cancel_reason && (
              <div className="text-xs bg-destructive/10 text-destructive rounded-lg p-2 mb-2">
                <span className="font-medium">Cancel reason:</span> {order.cancel_reason}
              </div>
            )}
            {order.return_reason && (
              <div className="text-xs bg-accent text-accent-foreground rounded-lg p-2 mb-2">
                <span className="font-medium">Return reason:</span> {order.return_reason}
              </div>
            )}

            {/* Payment screenshot */}
            {order.payment_screenshot_url && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg text-xs mb-2"
                onClick={() => setScreenshotUrl(order.payment_screenshot_url)}
              >
                📸 View Payment Screenshot
              </Button>
            )}

            {/* Status & Actions */}
            <div className="flex gap-2 items-center flex-wrap">
              <Select value={order.status} onValueChange={v => updateStatus(order.id, v)}>
                <SelectTrigger className="w-44 h-9 text-xs rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="rounded-lg text-xs" onClick={() => { setMessageDialog(order.id); setMessage(order.admin_message || ''); }}>
                💬 Message
              </Button>
            </div>

            <div className="text-xs text-muted-foreground mt-2">
              {new Date(order.created_at).toLocaleString()}
            </div>
          </div>
        ))
      )}

      {/* Message Dialog */}
      <Dialog open={!!messageDialog} onOpenChange={() => setMessageDialog(null)}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader><DialogTitle>Send Message to Customer</DialogTitle></DialogHeader>
          <textarea
            placeholder="Type your message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full min-h-[100px] rounded-xl border border-input bg-background px-3 py-2 text-sm"
          />
          <Button className="rounded-xl" onClick={() => messageDialog && sendMessage(messageDialog)}>
            Send Message
          </Button>
        </DialogContent>
      </Dialog>

      {/* Screenshot Viewer */}
      <Dialog open={!!screenshotUrl} onOpenChange={() => setScreenshotUrl(null)}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader><DialogTitle>Payment Screenshot</DialogTitle></DialogHeader>
          {screenshotUrl && <img src={screenshotUrl} alt="Payment" className="w-full rounded-xl" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManager;
