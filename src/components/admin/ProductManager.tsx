import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, ImagePlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  showAdd: boolean;
  setShowAdd: (v: boolean) => void;
}

const ProductManager = ({ showAdd, setShowAdd }: Props) => {
  const { products, addProduct, deleteProduct, categories } = useStore();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [imageMode, setImageMode] = useState<'link' | 'upload'>('link');

  const handleAdd = () => {
    if (!name || !price || !category) return;
    addProduct({ name, price: Number(price), category, stock: Number(stock) || 0, image, description: '' });
    setName(''); setPrice(''); setCategory(''); setStock(''); setImage('');
    setShowAdd(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-serif font-semibold">📦 Products ({products.length})</h2>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>+ Add</Button>
      </div>

      <div className="space-y-2">
        {products.map(p => (
          <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-accent flex items-center justify-center overflow-hidden flex-shrink-0">
              {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-2xl">📦</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{p.name}</div>
              <div className="text-sm text-muted-foreground">₹{p.price.toLocaleString()} • {p.category} • Stock: {p.stock}</div>
            </div>
            <Button variant="ghost" size="icon" className="text-destructive flex-shrink-0" onClick={() => deleteProduct(p.id)}>
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        ))}
        {products.length === 0 && <p className="text-center text-muted-foreground py-8">No products yet</p>}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Add Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} className="h-12 rounded-xl" />
            <Input placeholder="Price (₹)" type="number" value={price} onChange={e => setPrice(e.target.value)} className="h-12 rounded-xl" />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select Category" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.emoji} {c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Stock Quantity" type="number" value={stock} onChange={e => setStock(e.target.value)} className="h-12 rounded-xl" />

            <div className="space-y-2">
              <div className="flex gap-2">
                <Button variant={imageMode === 'link' ? 'default' : 'outline'} size="sm" onClick={() => setImageMode('link')}>Paste Link</Button>
                <Button variant={imageMode === 'upload' ? 'default' : 'outline'} size="sm" onClick={() => setImageMode('upload')}>Upload Photo</Button>
              </div>
              {imageMode === 'link' ? (
                <Input placeholder="Image URL" value={image} onChange={e => setImage(e.target.value)} className="h-12 rounded-xl" />
              ) : (
                <label className="flex items-center justify-center gap-2 h-20 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                  <ImagePlus className="w-6 h-6 text-muted-foreground" />
                  <span className="text-muted-foreground">{image ? 'Photo selected' : 'Tap to upload'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              )}
              {image && <img src={image} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />}
            </div>

            <Button className="w-full h-12 rounded-xl font-semibold" onClick={handleAdd}>Add Product</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManager;
