import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { adminMessageSchema } from '@/lib/validation';

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
  const [bulkMessageDialog, setBulkMessageDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
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
    if (error) {
      toast.error('Failed to update');
    } else {
      toast.success(`Status updated to ${status}`);
      const order = orders.find(o => o.id === orderId);
      if (order?.customer_phone) {
        const phone = order.customer_phone.replace(/\s+/g, '').replace('+', '');
        const statusLabel = statusOptions.find(s => s.value === status)?.label || status;
        const msg = encodeURIComponent(`📦 Order Update - Sikkolu Specials\n\nOrder #${orderId.slice(0, 8)}\nStatus: ${statusLabel}\n\nThank you for shopping with us!`);
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
      }
      fetchOrders();
    }
  };

  const sendMessage = async (orderId: string) => {
    const parsed = adminMessageSchema.safeParse(message);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    const { error } = await supabase
      .from('orders')
      .update({ admin_message: parsed.data })
      .eq('id', orderId);
    if (error) {
      toast.error('Failed to send');
    } else {
      const order = orders.find(o => o.id === orderId);
      if (order?.customer_phone) {
        const phone = order.customer_phone.replace(/\s+/g, '').replace('+', '');
        const msg = encodeURIComponent(`📩 Message from Srikakulam Store:\n\nOrder #${orderId.slice(0, 8)}\n${parsed.data}`);
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
      }
      toast.success('Message sent to customer');
      setMessageDialog(null);
      setMessage('');
      fetchOrders();
    }
  };

  const sendBulkMessage = async () => {
    const parsed = adminMessageSchema.safeParse(message);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    if (selectedOrders.length === 0) {
      toast.error('Select at least one order');
      return;
    }

    // Update admin_message for all selected orders
    for (const orderId of selectedOrders) {
      await supabase
        .from('orders')
        .update({ admin_message: parsed.data })
        .eq('id', orderId);
    }

    // Open WhatsApp for each unique phone
    const uniquePhones = new Set<string>();
    for (const orderId of selectedOrders) {
      const order = orders.find(o => o.id === orderId);
      if (order?.customer_phone) {
        const phone = order.customer_phone.replace(/\s+/g, '').replace('+', '');
        if (!uniquePhones.has(phone)) {
          uniquePhones.add(phone);
          const msg = encodeURIComponent(`📩 Message from Srikakulam Store:\n\n${parsed.data}`);
          window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
        }
      }
    }

    toast.success(`Message sent to ${uniquePhones.size} customer(s)`);
    setBulkMessageDialog(false);
    setMessage('');
    setSelectedOrders([]);
    fetchOrders();
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const selectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.id));
    }
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-serif font-bold">📋 Orders ({orders.length})</h2>
        {orders.length > 0 && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-lg text-xs" onClick={selectAll}>
              {selectedOrders.length === orders.length ? 'Deselect All' : 'Select All'}
            </Button>
            {selectedOrders.length > 0 && (
              <Button size="sm" className="rounded-lg text-xs" onClick={() => { setBulkMessageDialog(true); setMessage(''); }}>
                💬 Message ({selectedOrders.length})
              </Button>
            )}
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No orders yet</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className={`bg-card border rounded-xl p-4 ${selectedOrders.includes(order.id) ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
            <div className="flex items-start gap-2 mb-2">
              <Checkbox
                checked={selectedOrders.includes(order.id)}
                onCheckedChange={() => toggleOrderSelection(order.id)}
                className="mt-1"
              />
              <div className="flex-1 flex justify-between items-start">
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
            </div>

            {/* Items */}
            <div className="bg-accent rounded-lg p-2 mb-3 space-y-1 ml-8">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span>{item.product_name} × {item.quantity}</span>
                  <span>₹{(item.product_price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Cancel/Return reason */}
            {order.cancel_reason && (
              <div className="text-xs bg-destructive/10 text-destructive rounded-lg p-2 mb-2 ml-8">
                <span className="font-medium">Cancel reason:</span> {order.cancel_reason}
              </div>
            )}
            {order.return_reason && (
              <div className="text-xs bg-accent text-accent-foreground rounded-lg p-2 mb-2 ml-8">
                <span className="font-medium">Return reason:</span> {order.return_reason}
              </div>
            )}

            {/* Payment screenshot */}
            {order.payment_screenshot_url && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg text-xs mb-2 ml-8"
                onClick={async () => {
                  const { data } = await supabase.storage
                    .from('payment-screenshots')
                    .createSignedUrl(order.payment_screenshot_url, 3600);
                  if (data?.signedUrl) setScreenshotUrl(data.signedUrl);
                  else toast.error('Failed to load screenshot');
                }}
              >
                📸 View Payment Screenshot
              </Button>
            )}

            {/* Status & Actions */}
            <div className="flex gap-2 items-center flex-wrap ml-8">
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

            <div className="text-xs text-muted-foreground mt-2 ml-8">
              {new Date(order.created_at).toLocaleString()}
            </div>
          </div>
        ))
      )}

      {/* Single Message Dialog */}
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

      {/* Bulk Message Dialog */}
      <Dialog open={bulkMessageDialog} onOpenChange={setBulkMessageDialog}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader><DialogTitle>Send Message to {selectedOrders.length} Customer(s)</DialogTitle></DialogHeader>
          <div className="text-xs text-muted-foreground mb-2">
            Selected: {selectedOrders.map(id => {
              const o = orders.find(o => o.id === id);
              return o?.customer_name;
            }).filter(Boolean).join(', ')}
          </div>
          <textarea
            placeholder="Type your message to all selected customers..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full min-h-[100px] rounded-xl border border-input bg-background px-3 py-2 text-sm"
          />
          <Button className="rounded-xl" onClick={sendBulkMessage}>
            Send to All ({selectedOrders.length})
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