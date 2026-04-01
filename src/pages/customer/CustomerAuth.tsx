import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag, Phone, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const normalizePhone = (phone: string): string => {
  const digits = phone.replace(/[\s\-\(\)]/g, '');
  if (digits.startsWith('+91')) return digits;
  if (digits.startsWith('91') && digits.length === 12) return '+' + digits;
  if (digits.length === 10) return '+91' + digits;
  return digits;
};

const extractDigits = (phone: string): string => {
  return phone.replace(/[\s\-\(\)+]/g, '').slice(-10);
};

const phoneToEmail = (phone: string): string => {
  const normalized = normalizePhone(phone).replace('+', '');
  return `${normalized}@srikakulamspecials.app`;
};

const CustomerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const validatePhone = (phone: string): boolean => {
    const digits = extractDigits(phone);
    if (digits.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(phone)) return;
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const generatedEmail = phoneToEmail(phone);
    const { error } = await signIn(generatedEmail, password);
    if (error) {
      if (error.message?.includes('Invalid login')) {
        toast.error('Invalid phone number or password. Please try again.');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Welcome back! 🎉');
      navigate('/store');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!validatePhone(phone)) return;
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const normalizedPhone = normalizePhone(phone);
    const generatedEmail = phoneToEmail(phone);

    const { error, user: newUser } = await signUp(generatedEmail, password);
    if (error) {
      if (error.message?.includes('already registered')) {
        toast.error('This phone number is already registered. Please login instead.');
      } else {
        toast.error(error.message);
      }
    } else {
      // Prevent auto-login after registration
      await supabase.auth.signOut();
      if (newUser) {
        await supabase.functions.invoke('update-profile', {
          body: { user_id: newUser.id, phone: normalizedPhone, name: name.trim() },
        });
      }
      toast.success('Account created successfully! Please login with your credentials.');
      setIsLogin(true);
      setPhone('');
      setPassword('');
      setName('');
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!validatePhone(forgotPhone)) return;
    setForgotLoading(true);
    const generatedEmail = phoneToEmail(forgotPhone);
    const { error } = await supabase.auth.resetPasswordForEmail(generatedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error('Failed to process reset request. Please try again.');
      setForgotLoading(false);
      return;
    }
    const cleanPhone = normalizePhone(forgotPhone).replace('+', '');
    const msg = encodeURIComponent(
      `🔐 Password Reset - Srikakulam Specials\n\nHi! A password reset was requested for your account.\n\nPlease check the reset link sent to your account.\n\nIf you didn't request this, please ignore this message.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
    toast.success('Password reset initiated! Check WhatsApp for instructions.');
    setForgotOpen(false);
    setForgotPhone('');
    setForgotLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-4 sm:px-6 py-6 sm:py-8">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground mb-6 touch-manipulation">
        <ArrowLeft className="w-5 h-5" /> {t.back}
      </button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <ShoppingBag className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-1 text-foreground">
          {isLogin ? 'Srikakulam Specials' : t.createAccount}
        </h1>
        <p className="text-muted-foreground mb-6 sm:mb-8 text-center text-sm sm:text-base">
          {isLogin ? t.loginWithPhone : t.registerToShop}
        </p>

        {isLogin ? (
          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="tel"
                placeholder={t.phonePlaceholder}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="h-12 sm:h-14 text-base sm:text-lg rounded-xl pl-11"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-12 sm:h-14 text-base sm:text-lg rounded-xl pl-11"
                minLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 sm:h-14 text-base sm:text-lg rounded-xl font-semibold" disabled={loading}>
              {loading ? t.pleaseWait : t.login}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="w-full space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t.fullName}
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-12 sm:h-14 text-base sm:text-lg rounded-xl pl-11"
                required
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="tel"
                placeholder={t.phonePlaceholder}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="h-12 sm:h-14 text-base sm:text-lg rounded-xl pl-11"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-12 sm:h-14 text-base sm:text-lg rounded-xl pl-11"
                minLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 sm:h-14 text-base sm:text-lg rounded-xl font-semibold" disabled={loading}>
              {loading ? t.pleaseWait : t.register}
            </Button>
          </form>
        )}

        {isLogin && (
          <button
            onClick={() => setForgotOpen(true)}
            className="mt-4 text-sm text-muted-foreground hover:text-primary transition-colors touch-manipulation"
          >
            {t.forgotPassword}
          </button>
        )}

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setPhone('');
            setPassword('');
            setName('');
          }}
          className="mt-4 text-sm text-primary font-medium touch-manipulation"
        >
          {isLogin ? t.noAccount : t.hasAccount}
        </button>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader><DialogTitle>{t.resetPassword}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t.resetDesc}</p>
          <div>
            <Input
              type="tel"
              placeholder={t.phonePlaceholder}
              value={forgotPhone}
              onChange={e => setForgotPhone(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
          <Button className="rounded-xl" onClick={handleForgotPassword} disabled={forgotLoading}>
            {forgotLoading ? t.processing : t.sendReset}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerAuth;
