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
  const [type, setType] = useState<'upi' | 'qr' | 'bank' | 'scanner'>('upi');
  const [value, setValue] = useState('');
  const [label, setLabel] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [scannerImage, setScannerImage] = useState('');

  const resetForm = () => {
    setValue(''); setLabel(''); setAccountName(''); setAccountNumber('');
    setIfscCode(''); setBankName(''); setScannerImage(''); setType('upi');
  };

  const handleAdd = () => {
    if (!label) return;
    if (type === 'bank') {
      if (!accountNumber || !ifscCode || !bankName) return;
      addPaymentMethod({
        type, value: `${bankName} - ${accountNumber}`, label,
        bankDetails: { accountName, accountNumber, ifscCode, bankName }
      });
    } else if (type === 'scanner') {
      if (!scannerImage) return;
      addPaymentMethod({ type, value: 'QR Scanner', label, scannerImage });
    } else {
      if (!value) return;
      addPaymentMethod({ type, value, label });
    }
    resetForm();
    setShowAdd(false);
  };

  const handleScannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setScannerImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'upi': return '📱';
      case 'qr': return '📸';
      case 'bank': return '🏦';
      case 'scanner': return '📷';
      default: return '💳';
    }
  };

  const getTypeLabel = (t: string) => {
    switch (t) {
      case 'upi': return 'UPI';
      case 'qr': return 'QR Code';
      case 'bank': return 'Bank Transfer';
      case 'scanner': return 'Scanner/QR Image';
      default: return t;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-serif font-semibold">💳 Payment Methods</h2>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-1" /> Add</Button>
      </div>

      <div className="space-y-2">
        {paymentMethods.map(p => (
          <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{p.label}</div>
              <div className="text-sm text-muted-foreground">{getTypeIcon(p.type)} {getTypeLabel(p.type)}: {p.value}</div>
              {p.type === 'bank' && p.bankDetails && (
                <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  {p.bankDetails.accountName && <div>Name: {p.bankDetails.accountName}</div>}
                  <div>A/C: {p.bankDetails.accountNumber}</div>
                  <div>IFSC: {p.bankDetails.ifscCode}</div>
                  <div>Bank: {p.bankDetails.bankName}</div>
                </div>
              )}
              {p.type === 'scanner' && p.scannerImage && (
                <img src={p.scannerImage} alt="QR" className="w-24 h-24 mt-2 rounded-lg object-contain border border-border" />
              )}
            </div>
            <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => deletePaymentMethod(p.id)}>
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        ))}
        {paymentMethods.length === 0 && <p className="text-center text-muted-foreground py-8">No payment methods</p>}
      </div>

      <Dialog open={showAdd} onOpenChange={(open) => { setShowAdd(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-[90vw] rounded-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Add Payment Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={type} onValueChange={v => setType(v as any)}>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="upi">📱 UPI ID</SelectItem>
                <SelectItem value="qr">📸 QR Code Link</SelectItem>
                <SelectItem value="bank">🏦 Bank Transfer</SelectItem>
                <SelectItem value="scanner">📷 Upload QR/Scanner</SelectItem>
              </SelectContent>
            </Select>

            <Input placeholder="Label (e.g. Main UPI, SBI Account)" value={label} onChange={e => setLabel(e.target.value)} className="h-12 rounded-xl" />

            {type === 'upi' && (
              <Input placeholder="UPI ID (e.g. name@upi)" value={value} onChange={e => setValue(e.target.value)} className="h-12 rounded-xl" />
            )}

            {type === 'qr' && (
              <Input placeholder="QR Code Image URL" value={value} onChange={e => setValue(e.target.value)} className="h-12 rounded-xl" />
            )}

            {type === 'bank' && (
              <div className="space-y-3 bg-accent/50 rounded-xl p-3">
                <Input placeholder="Account Holder Name" value={accountName} onChange={e => setAccountName(e.target.value)} className="h-11 rounded-lg" />
                <Input placeholder="Account Number *" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="h-11 rounded-lg" />
                <Input placeholder="IFSC Code *" value={ifscCode} onChange={e => setIfscCode(e.target.value)} className="h-11 rounded-lg" />
                <Input placeholder="Bank Name *" value={bankName} onChange={e => setBankName(e.target.value)} className="h-11 rounded-lg" />
              </div>
            )}

            {type === 'scanner' && (
              <div className="space-y-3">
                <label className="block">
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors">
                    {scannerImage ? (
                      <img src={scannerImage} alt="Scanner" className="w-32 h-32 mx-auto object-contain rounded-lg" />
                    ) : (
                      <div>
                        <span className="text-3xl">📷</span>
                        <p className="text-sm text-muted-foreground mt-2">Tap to upload QR/Scanner image</p>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleScannerUpload} className="hidden" />
                </label>
              </div>
            )}

            <Button className="w-full h-12 rounded-xl font-semibold" onClick={handleAdd}>Add Payment Method</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManager;
