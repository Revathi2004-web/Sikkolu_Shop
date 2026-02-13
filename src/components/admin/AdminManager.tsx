import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Plus, Shield } from 'lucide-react';

const AdminManager = () => {
  const { admins, addAdmin, deleteAdmin } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAdd = () => {
    if (!username || !password) return;
    addAdmin({ username, password });
    setUsername(''); setPassword(''); setShowAdd(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-serif font-semibold">👥 Admin Staff</h2>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-1" /> Add</Button>
      </div>

      <div className="space-y-2">
        {admins.map(a => (
          <div key={a.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">{a.username}</div>
              <div className="text-sm text-muted-foreground">••••••••</div>
            </div>
            <Button variant="ghost" size="icon" className="text-destructive flex-shrink-0" onClick={() => deleteAdmin(a.id)}>
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Add Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="h-12 rounded-xl" />
            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="h-12 rounded-xl" />
            <Button className="w-full h-12 rounded-xl font-semibold" onClick={handleAdd}>Add Admin</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManager;
