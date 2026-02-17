import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo.png';
import naturalBg from '@/assets/natural-bg.jpg';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${naturalBg})` }}
    >
      <div className="text-center mb-12">
        <img src={logo} alt="Srikakulam Store" className="w-28 h-28 mx-auto mb-4 drop-shadow-lg" />
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-2">
          Srikakulam <span className="text-primary">Store</span>
        </h1>
        <p className="text-muted-foreground text-lg">Premium Boutique Shopping</p>
      </div>

      <div className="w-full max-w-sm space-y-5">
        <button
          onClick={() => navigate(user ? '/store' : '/auth')}
          className="w-full bg-primary text-primary-foreground rounded-2xl p-8 flex flex-col items-center gap-4 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] touch-manipulation"
        >
          <ShoppingBag className="w-12 h-12" />
          <div>
            <div className="text-2xl font-serif font-bold">🛍️ Customer Store</div>
            <div className="text-primary-foreground/80 text-sm mt-1">
              {user ? 'Browse & shop our collection' : 'Login to start shopping'}
            </div>
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

      <p className="mt-12 text-xs text-muted-foreground">© 2026 Srikakulam Store</p>
    </div>
  );
};

export default Landing;
