import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-2">
          Sikkolu <span className="text-primary">Specials</span>
        </h1>
        <p className="text-muted-foreground text-lg">Premium Boutique Shopping</p>
      </div>

      <div className="w-full max-w-sm space-y-5">
        <button
          onClick={() => navigate('/store')}
          className="w-full bg-primary text-primary-foreground rounded-2xl p-8 flex flex-col items-center gap-4 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] touch-manipulation"
        >
          <ShoppingBag className="w-12 h-12" />
          <div>
            <div className="text-2xl font-serif font-bold">🛍️ Customer Store</div>
            <div className="text-primary-foreground/80 text-sm mt-1">Browse & shop our collection</div>
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/login')}
          className="w-full bg-card border-2 border-border text-foreground rounded-2xl p-8 flex flex-col items-center gap-4 shadow-md hover:shadow-lg hover:border-primary/40 transition-all active:scale-[0.98] touch-manipulation"
        >
          <Lock className="w-12 h-12 text-primary" />
          <div>
            <div className="text-2xl font-serif font-bold">🔐 Admin Portal</div>
            <div className="text-muted-foreground text-sm mt-1">Manage your business</div>
          </div>
        </button>
      </div>

      <p className="mt-12 text-xs text-muted-foreground">© 2026 Sikkolu Specials</p>
    </div>
  );
};

export default Landing;
