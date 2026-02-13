import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';

interface Props {
  showAdd: boolean;
  setShowAdd: (v: boolean) => void;
}

const CategoryManager = ({ showAdd, setShowAdd }: Props) => {
  const { categories, addCategory, deleteCategory } = useStore();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📂');

  const handleAdd = () => {
    if (!name) return;
    addCategory({ name, emoji });
    setName(''); setEmoji('📂');
    setShowAdd(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-serif font-semibold">📂 Categories ({categories.length})</h2>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>+ Add</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <div key={c.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-xl">{c.emoji}</span>
            <span className="font-medium">{c.name}</span>
            <Button variant="ghost" size="icon" className="text-destructive w-8 h-8 ml-1" onClick={() => deleteCategory(c.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Category Name" value={name} onChange={e => setName(e.target.value)} className="h-12 rounded-xl" />
            <Input placeholder="Emoji (e.g. 👗)" value={emoji} onChange={e => setEmoji(e.target.value)} className="h-12 rounded-xl" />
            <Button className="w-full h-12 rounded-xl font-semibold" onClick={handleAdd}>Add Category</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManager;
