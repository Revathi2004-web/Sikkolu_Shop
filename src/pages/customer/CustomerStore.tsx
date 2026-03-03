import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Heart, ArrowLeft, Search, Phone, Package, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductReviews from '@/components/ProductReviews';

const CustomerStore = () => {
  const { products, categories, addToCart, wishlist, toggleWishlist, cart, contacts } = useStore();
  const { signOut } = useAuth();
  const { t } = useLanguage();
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
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-3 py-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate('/')} className="touch-manipulation">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-serif font-bold truncate">Srikakulam <span className="text-primary">Store</span></h1>
          <div className="flex gap-0.5">
            <Button variant="ghost" size="icon" className="w-9 h-9" onClick={() => navigate('/orders')}>
              <Package className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-9 h-9 relative" onClick={() => navigate('/wishlist')}>
              <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'fill-destructive text-destructive' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="w-9 h-9" onClick={() => setShowContact(true)}>
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-9 h-9 relative" onClick={() => navigate('/cart')}>
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="w-9 h-9" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t.searchProducts}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>
      </header>

      {/* Category Chips */}
      <div className="px-3 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        <Badge
          variant={activeCategory === 'All' ? 'default' : 'outline'}
          className="cursor-pointer px-3 py-1.5 text-xs rounded-full whitespace-nowrap touch-manipulation"
          onClick={() => setActiveCategory('All')}
        >
          {t.all}
        </Badge>
        {categories.map(c => (
          <Badge
            key={c.id}
            variant={activeCategory === c.name ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1.5 text-xs rounded-full whitespace-nowrap touch-manipulation"
            onClick={() => setActiveCategory(c.name)}
          >
            {c.emoji} {c.name}
          </Badge>
        ))}
      </div>

      {/* Product Grid - 3 columns */}
      <div className="px-3 grid grid-cols-3 gap-2">
        {filtered.map(p => (
          <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="aspect-square bg-accent flex items-center justify-center relative">
              {p.image ? (
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <span className="text-3xl">🛍️</span>
              )}
              <button
                className="absolute top-1 right-1 w-7 h-7 bg-background/80 backdrop-blur rounded-full flex items-center justify-center touch-manipulation"
                onClick={() => toggleWishlist(p.id)}
              >
                <Heart className={`w-3.5 h-3.5 ${wishlist.includes(p.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
              </button>
            </div>
            <div className="p-2">
              <div className="font-semibold text-xs truncate">{p.name}</div>
              <div className="text-primary font-bold text-sm mt-0.5">₹{p.price.toLocaleString()}</div>
              <div className="mt-1.5">
                <ProductReviews productName={p.name} compact />
              </div>
              <div className="flex gap-1 mt-1.5">
                <Button size="sm" className="flex-1 h-8 text-[10px] rounded-lg font-semibold px-1" onClick={() => { addToCart(p); navigate('/cart'); }}>
                  {t.buyNow}
                </Button>
                <Button size="sm" variant="outline" className="h-8 px-1.5 rounded-lg" onClick={() => addToCart(p)}>
                  <ShoppingCart className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-2">🌟</p>
          <p className="font-serif font-semibold text-lg">{t.comingSoon}</p>
          <p className="text-sm mt-1">{t.comingSoonDesc}</p>
        </div>
      )}

      {/* Contact Dialog */}
      <Dialog open={showContact} onOpenChange={setShowContact}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">{t.contactUs}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {contacts.map(c => (
              <a key={c.id} href={`tel:${c.phone}`} className="block bg-accent rounded-xl p-4 text-center">
                <div className="font-semibold">{c.label}</div>
                <div className="text-primary font-bold text-lg">{c.phone}</div>
              </a>
            ))}
            {contacts.length === 0 && <p className="text-center text-muted-foreground py-4">{t.noContacts}</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerStore;
