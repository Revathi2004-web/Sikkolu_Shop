import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Plus } from 'lucide-react';

const ContactManager = () => {
  const { contacts, addContact, deleteContact } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [phone, setPhone] = useState('');
  const [label, setLabel] = useState('');

  const handleAdd = () => {
    if (!phone || !label) return;
    addContact({ phone, label });
    setPhone(''); setLabel(''); setShowAdd(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-serif font-semibold">📞 Contact Numbers</h2>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-1" /> Add</Button>
      </div>

      <div className="space-y-2">
        {contacts.map(c => (
          <div key={c.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{c.label}</div>
              <div className="text-sm text-muted-foreground">{c.phone}</div>
            </div>
            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteContact(c.id)}>
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        ))}
        {contacts.length === 0 && <p className="text-center text-muted-foreground py-8">No contacts</p>}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Add Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Label (e.g. Main Office)" value={label} onChange={e => setLabel(e.target.value)} className="h-12 rounded-xl" />
            <Input placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="h-12 rounded-xl" />
            <Button className="w-full h-12 rounded-xl font-semibold" onClick={handleAdd}>Add Contact</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactManager;
