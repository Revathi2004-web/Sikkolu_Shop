import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo.png';
import naturalBg from '@/assets/natural-bg.jpg';

const translations = {
  en: {
    tagline: 'Experience the Soul of Srikakulam',
    customerStore: '🛍️ Customer Store',
    customerDesc: 'Browse & shop our collection',
    customerLogin: 'Login to start shopping',
    adminPortal: '🔐 Admin Portal',
    adminDesc: 'Manage your business',
    copyright: '© 2026 Srikakulam Store',
  },
  te: {
    tagline: 'శ్రీకాకుళం ఆత్మను అనుభవించండి',
    customerStore: '🛍️ కస్టమర్ స్టోర్',
    customerDesc: 'మా కలెక్షన్ బ్రౌజ్ చేయండి',
    customerLogin: 'షాపింగ్ ప్రారంభించడానికి లాగిన్ అవ్వండి',
    adminPortal: '🔐 అడ్మిన్ పోర్టల్',
    adminDesc: 'మీ వ్యాపారాన్ని నిర్వహించండి',
    copyright: '© 2026 శ్రీకాకుళం స్టోర్',
  },
  hi: {
    tagline: 'श्रीकाकुलम की आत्मा का अनुभव करें',
    customerStore: '🛍️ कस्टमर स्टोर',
    customerDesc: 'हमारा कलेक्शन ब्राउज़ करें',
    customerLogin: 'शॉपिंग शुरू करने के लिए लॉगिन करें',
    adminPortal: '🔐 एडमिन पोर्टल',
    adminDesc: 'अपना व्यवसाय प्रबंधित करें',
    copyright: '© 2026 श्रीकाकुलम स्टोर',
  },
};

type Lang = keyof typeof translations;

const langLabels: Record<Lang, string> = { en: 'EN', te: 'తె', hi: 'हि' };

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lang, setLang] = useState<Lang>('en');
  const t = translations[lang];

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
        <img src={logo} alt="Srikakulam Store" className="w-28 h-28 mx-auto mb-4 drop-shadow-lg" />
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-2">
          Srikakulam <span className="text-primary">Store</span>
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