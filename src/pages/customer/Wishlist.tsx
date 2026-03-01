import { useNavigate } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from 'lucide-react';

const Wishlist = () => {
  const { products, wishlist, toggleWishlist, addToCart } = useStore();
  const navigate = useNavigate();

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/store')} className="touch-manipulation">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-serif font-bold">My Wishlist</h1>
        <Heart className="w-5 h-5 text-destructive fill-destructive ml-auto" />
      </header>

      {wishlistProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Heart className="w-16 h-16 mb-4" />
          <p className="text-lg font-serif">Your wishlist is empty</p>
          <p className="text-sm mt-1">Tap the heart icon on products to save them</p>
          <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate('/store')}>
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-3">
          {wishlistProducts.map(p => (
            <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🛍️</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{p.name}</div>
                <div className="text-primary font-bold">₹{p.price.toLocaleString()}</div>
                {p.description && <div className="text-xs text-muted-foreground truncate">{p.description}</div>}
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Button size="sm" className="h-9 px-3 rounded-lg" onClick={() => { addToCart(p); navigate('/cart'); }}>
                  <ShoppingCart className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-9 px-3 text-destructive" onClick={() => toggleWishlist(p.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
