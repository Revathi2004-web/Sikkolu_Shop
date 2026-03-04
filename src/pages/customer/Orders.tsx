import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/context/StoreContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Upload, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { reasonSchema } from '@/lib/validation';

const statusLabels: Record<string, { label: string; color: string; emoji: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', emoji: '⏳' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', emoji: '✅' },
  payment_pending: { label: 'Pay Now', color: 'bg-orange-100 text-orange-800', emoji: '💳' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800', emoji: '💰' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800', emoji: '🚚' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', emoji: '📦' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', emoji: '❌' },
  return_requested: { label: 'Return Requested', color: 'bg-orange-100 text-orange-800', emoji: '🔄' },
  returned: { label: 'Returned', color: 'bg-gray-100 text-gray-800', emoji: '↩️' },
};

const Orders = () => {
  const { user } = useAuth();
  const { contacts } = useStore();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState<string | null>(null);
  const [returnDialog, setReturnDialog] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [uploadDialog, setUploadDialog] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    // Realtime subscription
    const channel = supabase
      .channel('customer-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleCancel = async (orderId: string) => {
    const parsed = reasonSchema.safeParse(cancelReason);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' as any, cancel_reason: parsed.data })
      .eq('id', orderId);
    if (error) toast.error('Failed to cancel');
    else { toast.success('Order cancelled'); setCancelDialog(null); setCancelReason(''); fetchOrders(); }
  };

  const handleReturnRequest = async (orderId: string) => {
    const parsed = reasonSchema.safeParse(returnReason);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    const { error } = await supabase
      .from('orders')
      .update({ status: 'return_requested' as any, return_reason: parsed.data })
      .eq('id', orderId);
    if (error) toast.error('Failed to request return');
    else { toast.success('Return requested'); setReturnDialog(null); setReturnReason(''); fetchOrders(); }
  };

  const handleUploadScreenshot = async (orderId: string, file: File) => {
    if (!user) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      toast.error('File too large. Max 5MB allowed.');
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, GIF, and WebP images are allowed.');
      return;
    }

    setUploading(true);
    const ext = file.type.split('/')[1];
    const filePath = `${user.id}/${orderId}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('payment-screenshots')
      .upload(filePath, file);

    if (uploadError) {
      toast.error('Upload failed');
      setUploading(false);
      return;
    }

    // Store only the file path, not a public URL
    await supabase
      .from('orders')
      .update({ payment_screenshot_url: filePath, status: 'paid' as any })
      .eq('id', orderId);

    // Notify admin via WhatsApp about payment
    const adminPhone = contacts[0]?.phone?.replace(/\s+/g, '').replace('+', '') || '';
    if (adminPhone) {
      const order = orders.find(o => o.id === orderId);
      const msg = encodeURIComponent(`💳 Payment Received!\n\nOrder #${orderId.slice(0, 8)}\nCustomer: ${order?.customer_name || 'Unknown'}\nAmount: ₹${Number(order?.total_amount || 0).toLocaleString()}\n\nPayment screenshot uploaded.`);
      window.open(`https://wa.me/${adminPhone}?text=${msg}`, '_blank');
    }

    toast.success('Payment screenshot uploaded! 🎉');
    setUploadDialog(null);
    setUploading(false);
    fetchOrders();
  };

  const canCancel = (status: string) => ['pending', 'confirmed'].includes(status);
  const canReturn = (order: any) => {
    if (order.status !== 'delivered') return false;
    const daysDiff = (Date.now() - new Date(order.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };
  const needsPayment = (status: string) => status === 'confirmed' || status === 'payment_pending';

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/store')} className="touch-manipulation">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-serif font-bold">{t.myOrders}</h1>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Package className="w-16 h-16 mb-4" />
          <p className="text-lg font-serif">{t.noOrders}</p>
          <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate('/store')}>{t.startShopping}</Button>
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-4">
          {orders.map(order => {
            const st = statusLabels[order.status] || statusLabels.pending;
            return (
              <div key={order.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8)}</div>
                    <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${st.color}`}>
                    {st.emoji} {st.label}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1 mb-3">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate mr-2">{item.product_name} × {item.quantity}</span>
                      <span className="whitespace-nowrap">₹{(item.product_price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-2 flex justify-between font-bold text-sm">
                  <span>{t.total}</span>
                  <span className="text-primary">₹{Number(order.total_amount).toLocaleString()}</span>
                </div>

                {/* Admin message */}
                {order.admin_message && (
                  <div className="mt-3 bg-accent rounded-lg p-3 text-sm">
                    <span className="font-medium">Admin:</span> {order.admin_message}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {needsPayment(order.status) && (
                    <Button size="sm" className="rounded-lg text-xs" onClick={() => setUploadDialog(order.id)}>
                      <Upload className="w-3 h-3 mr-1" /> {t.uploadPayment}
                    </Button>
                  )}
                  {canCancel(order.status) && (
                    <Button size="sm" variant="outline" className="rounded-lg text-xs text-destructive" onClick={() => setCancelDialog(order.id)}>
                      <X className="w-3 h-3 mr-1" /> {t.cancelOrder}
                    </Button>
                  )}
                  {canReturn(order) && (
                    <Button size="sm" variant="outline" className="rounded-lg text-xs" onClick={() => setReturnDialog(order.id)}>
                      <RotateCcw className="w-3 h-3 mr-1" /> {t.returnOrder}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Dialog */}
      <Dialog open={!!cancelDialog} onOpenChange={(open) => { if (!open) { setCancelDialog(null); setCancelReason(''); } }}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader><DialogTitle>Cancel Order</DialogTitle></DialogHeader>
          <textarea
            placeholder="Reason for cancellation"
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm"
          />
          <Button variant="destructive" className="rounded-xl" onClick={() => cancelDialog && handleCancel(cancelDialog)}>
            Confirm Cancel
          </Button>
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={!!returnDialog} onOpenChange={(open) => { if (!open) { setReturnDialog(null); setReturnReason(''); } }}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader><DialogTitle>Request Return</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Returns accepted within 7 days of delivery.</p>
          <textarea
            placeholder="Reason for return"
            value={returnReason}
            onChange={e => setReturnReason(e.target.value)}
            className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm"
            required
          />
          <Button className="rounded-xl" onClick={() => returnDialog && handleReturnRequest(returnDialog)}>
            Submit Return Request
          </Button>
        </DialogContent>
      </Dialog>

      {/* Upload Payment Screenshot Dialog */}
      <Dialog open={!!uploadDialog} onOpenChange={() => setUploadDialog(null)}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader><DialogTitle>Upload Payment Screenshot</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Upload a screenshot of your payment confirmation.</p>
          <Input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file && uploadDialog) handleUploadScreenshot(uploadDialog, file);
            }}
            className="rounded-xl"
          />
          {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
