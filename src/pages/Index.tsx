import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage, langLabels, Lang } from '@/context/LanguageContext';
import logo from '@/assets/logo.png';
import naturalBg from '@/assets/natural-bg.jpg';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${naturalBg})` }}
    >
      {/* Language Selector */}
      <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/80 backdrop-blur rounded-full px-2 py-1">
        <Globe className="w-4 h-4 text-muted-foreground" />
        {(Object.keys(langLabels) as Lang[]).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors touch-manipulation ${
              lang === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {langLabels[l]}
          </button>
        ))}
      </div>

      <div className="text-center mb-12">
        <img src={logo} alt="Sikkolu Specials" className="w-28 h-28 mx-auto mb-4 drop-shadow-lg" loading="lazy" />
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-2">
          Sikkolu <span className="text-primary">Specials</span>
        </h1>
        <p className="text-muted-foreground text-lg">{t.tagline}</p>
      </div>

      <div className="w-full max-w-sm space-y-5">
        <button
          onClick={() => navigate(user ? '/store' : '/auth')}
          className="w-full bg-primary text-primary-foreground rounded-2xl p-8 flex flex-col items-center gap-4 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] touch-manipulation"
        >
          <ShoppingBag className="w-12 h-12" />
          <div>
            <div className="text-2xl font-serif font-bold">{t.customerStore}</div>
            <div className="text-primary-foreground/80 text-sm mt-1">
              {user ? t.customerDesc : t.customerLogin}
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/login')}
          className="w-full bg-card border-2 border-border text-foreground rounded-2xl p-8 flex flex-col items-center gap-4 shadow-md hover:shadow-lg hover:border-primary/40 transition-all active:scale-[0.98] touch-manipulation"
        >
          <Lock className="w-12 h-12 text-primary" />
          <div>
            <div className="text-2xl font-serif font-bold">{t.adminPortal}</div>
            <div className="text-muted-foreground text-sm mt-1">{t.adminDesc}</div>
          </div>
        </button>
      </div>

      <p className="mt-12 text-xs text-muted-foreground">{t.copyright}</p>
    </div>
  );
};

export default Landing;
