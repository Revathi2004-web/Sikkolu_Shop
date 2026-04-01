import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Plus, Pencil } from 'lucide-react';

const ContactManager = () => {
  const { contacts, addContact, updateContact, deleteContact } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editingContact, setEditingContact] = useState<{ id: string; phone: string; label: string } | null>(null);
  const [phone, setPhone] = useState('');
  const [label, setLabel] = useState('');

  const resetForm = () => {
    setPhone('');
    setLabel('');
    setEditingContact(null);
  };

  const handleAdd = () => {
    if (!phone || !label) return;
    addContact({ phone, label });
    resetForm();
    setShowAdd(false);
  };

  const handleEdit = () => {
    if (!editingContact || !phone || !label) return;
    updateContact(editingContact.id, { phone, label });
    resetForm();
  };

  const openEdit = (c: { id: string; phone: string; label: string }) => {
    setEditingContact(c);
    setPhone(c.phone);
    setLabel(c.label);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-serif font-semibold">📞 Contact Numbers</h2>
        <Button size="sm" variant="outline" className="h-10 rounded-xl" onClick={() => { resetForm(); setShowAdd(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      <div className="space-y-2">
        {contacts.map(c => (
          <div key={c.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">{c.label}</div>
              <div className="text-sm text-muted-foreground">{c.phone}</div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="w-10 h-10 text-primary" onClick={() => openEdit(c)}>
                <Pencil className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="w-10 h-10 text-destructive" onClick={() => deleteContact(c.id)}>
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}
        {contacts.length === 0 && <p className="text-center text-muted-foreground py-8">No contacts</p>}
      </div>

      {/* Add Dialog */}
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

      {/* Edit Dialog */}
      <Dialog open={!!editingContact} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Edit Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Label" value={label} onChange={e => setLabel(e.target.value)} className="h-12 rounded-xl" />
            <Input placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="h-12 rounded-xl" />
            <Button className="w-full h-12 rounded-xl font-semibold" onClick={handleEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactManager;
