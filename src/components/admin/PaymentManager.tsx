import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PaymentManager = () => {
  const { paymentMethods, addPaymentMethod, deletePaymentMethod } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [type, setType] = useState<'upi' | 'qr'>('upi');
  const [value, setValue] = useState('');
  const [label, setLabel] = useState('');

  const handleAdd = () => {
    if (!value || !label) return;
    addPaymentMethod({ type, value, label });
    setValue(''); setLabel(''); setShowAdd(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-serif font-semibold">💳 Payment Methods</h2>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-1" /> Add</Button>
      </div>

      <div className="space-y-2">
        {paymentMethods.map(p => (
          <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{p.label}</div>
              <div className="text-sm text-muted-foreground">{p.type === 'upi' ? '📱 UPI' : '📸 QR'}: {p.value}</div>
            </div>
            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deletePaymentMethod(p.id)}>
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        ))}
        {paymentMethods.length === 0 && <p className="text-center text-muted-foreground py-8">No payment methods</p>}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Add Payment Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={type} onValueChange={v => setType(v as 'upi' | 'qr')}>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="upi">📱 UPI ID</SelectItem>
                <SelectItem value="qr">📸 QR Code Link</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Label (e.g. Main UPI)" value={label} onChange={e => setLabel(e.target.value)} className="h-12 rounded-xl" />
            <Input placeholder={type === 'upi' ? 'UPI ID (e.g. name@upi)' : 'QR Code Image URL'} value={value} onChange={e => setValue(e.target.value)} className="h-12 rounded-xl" />
            <Button className="w-full h-12 rounded-xl font-semibold" onClick={handleAdd}>Add Payment Method</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManager;
