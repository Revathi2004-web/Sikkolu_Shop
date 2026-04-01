import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Heart, ArrowLeft, Search, Phone, Package, LogOut, User, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductReviews from '@/components/ProductReviews';
import CustomerAssistant from '@/components/CustomerAssistant';
import BottomSheet from '@/components/ui/bottom-sheet';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { toast } from 'sonner';

const CustomerStore = () => {
  const { products, categories, addToCart, wishlist, toggleWishlist, cart, contacts } = useStore();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showContact, setShowContact] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const handleRefresh = useCallback(async () => {
    await new Promise(r => setTimeout(r, 600));
    toast.success('Refreshed!');
  }, []);

  const { refreshing, pullDistance, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(handleRefresh);

  let filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-3 py-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate('/')} className="touch-manipulation p-1">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-serif font-bold truncate">Sikkolu <span className="text-primary">Specials</span></h1>
          <div className="flex gap-0.5">
            <Button variant="ghost" size="icon" className="w-10 h-10" onClick={() => navigate('/profile')}>
              <User className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-10 h-10" onClick={() => navigate('/orders')}>
              <Package className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-10 h-10 relative" onClick={() => navigate('/wishlist')}>
              <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'fill-destructive text-destructive' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="w-10 h-10" onClick={() => setShowContact(true)}>
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-10 h-10 relative" onClick={() => navigate('/cart')}>
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="w-10 h-10" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.searchProducts}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>
          <Button variant="outline" size="icon" className="w-11 h-11 rounded-xl shrink-0" onClick={() => setShowFilters(true)}>
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div className="flex justify-center py-2 transition-all" style={{ height: pullDistance }}>
          <div className={`w-6 h-6 border-2 border-primary border-t-transparent rounded-full ${refreshing ? 'animate-spin' : ''}`} />
        </div>
      )}

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

      {/* Product Grid */}
      <div
        className="px-3 grid grid-cols-2 sm:grid-cols-3 gap-2"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {filtered.map(p => (
          <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="aspect-square bg-accent flex items-center justify-center relative">
              {p.image ? (
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <span className="text-3xl">🛍️</span>
              )}
              <button
                className="absolute top-1.5 right-1.5 w-8 h-8 bg-background/80 backdrop-blur rounded-full flex items-center justify-center touch-manipulation"
                onClick={() => toggleWishlist(p.id)}
              >
                <Heart className={`w-4 h-4 ${wishlist.includes(p.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
              </button>
            </div>
            <div className="p-2.5">
              <div className="font-semibold text-xs truncate">{p.name}</div>
              <div className="text-primary font-bold text-sm mt-0.5">₹{p.price.toLocaleString()}</div>
              <div className="mt-1.5">
                <ProductReviews productName={p.name} compact />
              </div>
              <div className="flex gap-1 mt-1.5">
                <Button size="sm" className="flex-1 h-9 text-[11px] rounded-lg font-semibold px-1" onClick={() => { addToCart(p); navigate('/cart'); }}>
                  {t.buyNow}
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
          <p className="text-4xl mb-2">🌟</p>
          <p className="font-serif font-semibold text-lg">{t.comingSoon}</p>
          <p className="text-sm mt-1">{t.comingSoonDesc}</p>
        </div>
      )}

      {/* Filter Bottom Sheet */}
      <BottomSheet open={showFilters} onOpenChange={setShowFilters} title="Filters & Sort">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-2">Sort By</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'default' as const, label: 'Default' },
                { key: 'price-asc' as const, label: 'Price ↑' },
                { key: 'price-desc' as const, label: 'Price ↓' },
              ].map(s => (
                <Button
                  key={s.key}
                  variant={sortBy === s.key ? 'default' : 'outline'}
                  className="h-10 rounded-xl text-xs"
                  onClick={() => { setSortBy(s.key); setShowFilters(false); }}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-2">Category</h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={activeCategory === 'All' ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-2 text-xs rounded-xl touch-manipulation"
                onClick={() => { setActiveCategory('All'); setShowFilters(false); }}
              >
                All
              </Badge>
              {categories.map(c => (
                <Badge
                  key={c.id}
                  variant={activeCategory === c.name ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-2 text-xs rounded-xl touch-manipulation"
                  onClick={() => { setActiveCategory(c.name); setShowFilters(false); }}
                >
                  {c.emoji} {c.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>

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

      <CustomerAssistant />
    </div>
  );
};

export default CustomerStore;
