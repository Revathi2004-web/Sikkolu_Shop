import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Heart, ArrowLeft, Search, Phone, Package, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductReviews from '@/components/ProductReviews';

const CustomerStore = () => {
  const { products, categories, addToCart, wishlist, toggleWishlist, cart, contacts } = useStore();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showContact, setShowContact] = useState(false);

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate('/')} className="touch-manipulation">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-serif font-bold">Sikkolu <span className="text-primary">Specials</span></h1>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
              <Package className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowContact(true)}>
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/cart')}>
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>
      </header>

      {/* Category Chips */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        <Badge
          variant={activeCategory === 'All' ? 'default' : 'outline'}
          className="cursor-pointer px-4 py-2 text-sm rounded-full whitespace-nowrap touch-manipulation"
          onClick={() => setActiveCategory('All')}
        >
          All
        </Badge>
        {categories.map(c => (
          <Badge
            key={c.id}
            variant={activeCategory === c.name ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2 text-sm rounded-full whitespace-nowrap touch-manipulation"
            onClick={() => setActiveCategory(c.name)}
          >
            {c.emoji} {c.name}
          </Badge>
        ))}
      </div>

      {/* Product Grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {filtered.map(p => (
          <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="aspect-square bg-accent flex items-center justify-center relative">
              {p.image ? (
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">🛍️</span>
              )}
              <button
                className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur rounded-full flex items-center justify-center touch-manipulation"
                onClick={() => toggleWishlist(p.id)}
              >
                <Heart className={`w-4 h-4 ${wishlist.includes(p.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
              </button>
            </div>
            <div className="p-3">
              <div className="font-semibold text-sm truncate">{p.name}</div>
              <div className="text-primary font-bold mt-1">₹{p.price.toLocaleString()}</div>
              <div className="mt-2">
                <ProductReviews productName={p.name} />
              </div>
              <div className="flex gap-1 mt-2">
                <Button size="sm" className="flex-1 h-9 text-xs rounded-lg font-semibold" onClick={() => { addToCart(p); navigate('/cart'); }}>
                  Buy Now
                </Button>
                <Button size="sm" variant="outline" className="h-9 px-2 rounded-lg" onClick={() => addToCart(p)}>
                  <ShoppingCart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-2">🔍</p>
          <p>No products found</p>
        </div>
      )}

      {/* Contact Dialog */}
      <Dialog open={showContact} onOpenChange={setShowContact}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">📞 Contact Us</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {contacts.map(c => (
              <a key={c.id} href={`tel:${c.phone}`} className="block bg-accent rounded-xl p-4 text-center">
                <div className="font-semibold">{c.label}</div>
                <div className="text-primary font-bold text-lg">{c.phone}</div>
              </a>
            ))}
            {contacts.length === 0 && <p className="text-center text-muted-foreground py-4">No contacts available</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerStore;
