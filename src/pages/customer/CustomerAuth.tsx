import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const INDIAN_PHONE_REGEX = /^(\+91|91)?[6-9]\d{9}$/;

const normalizePhone = (phone: string): string => {
  const digits = phone.replace(/[\s\-\(\)]/g, '');
  if (digits.startsWith('+91')) return digits;
  if (digits.startsWith('91') && digits.length === 12) return '+' + digits;
  if (/^[6-9]\d{9}$/.test(digits)) return '+91' + digits;
  return digits;
};

const isValidIndianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return INDIAN_PHONE_REGEX.test(cleaned);
};

const phoneToEmail = (phone: string): string => {
  const normalized = normalizePhone(phone).replace('+', '');
  return `${normalized}@srikakulamstore.app`;
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
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isValidIndianPhone(phone)) {
      toast.error('Please enter a valid Indian phone number (e.g. 9876543210 or +91 98765 43210)');
      setLoading(false);
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    const generatedEmail = phoneToEmail(phone);

    if (isLogin) {
      const { error } = await signIn(generatedEmail, password);
      if (error) {
        toast.error('Invalid phone number or password');
      } else {
        toast.success('Welcome back! 🎉');
        navigate('/store');
      }
    } else {
      if (!name.trim()) {
        toast.error('Name is required');
        setLoading(false);
        return;
      }

      const { error, user: newUser } = await signUp(generatedEmail, password);
      if (error) {
        if (error.message?.includes('already registered')) {
          toast.error('This phone number is already registered. Please login instead.');
        } else {
          toast.error(error.message);
        }
      } else {
        if (newUser) {
          await supabase.functions.invoke('update-profile', {
            body: { user_id: newUser.id, phone: normalizedPhone, name: name.trim() },
          });
        }
        toast.success('Account created successfully! You can now login.');
        setIsLogin(true);
        setPhone('');
        setPassword('');
        setName('');
      }
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!isValidIndianPhone(forgotPhone)) {
      toast.error('Please enter a valid Indian phone number');
      return;
    }
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
      `🔐 Password Reset - Srikakulam Store\n\nHi! A password reset was requested for your account.\n\nPlease check the reset link sent to your account.\n\nIf you didn't request this, please ignore this message.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');

    toast.success('Password reset initiated! Check WhatsApp for instructions.');
    setForgotOpen(false);
    setForgotPhone('');
    setForgotLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground mb-8 touch-manipulation">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        <div className="bg-accent w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-serif font-bold mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isLogin ? 'Login with your phone number' : 'Register to start shopping'}
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {!isLogin && (
            <Input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-14 text-lg rounded-xl"
              required
            />
          )}
          <div>
            <Input
              type="tel"
              placeholder="Phone number (e.g. 9876543210)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="h-14 text-lg rounded-xl"
              required
            />
            <p className="text-xs text-muted-foreground mt-1 ml-1">🇮🇳 Indian numbers only (+91)</p>
          </div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="h-14 text-lg rounded-xl"
            minLength={6}
            required
          />
          <Button type="submit" className="w-full h-14 text-lg rounded-xl font-semibold" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </Button>
        </form>

        {isLogin && (
          <button
            onClick={() => setForgotOpen(true)}
            className="mt-4 text-sm text-muted-foreground hover:text-primary transition-colors touch-manipulation"
          >
            Forgot Password?
          </button>
        )}

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-sm text-primary font-medium touch-manipulation"
        >
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </button>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader><DialogTitle>Reset Password</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Enter your registered Indian phone number to reset your password.
          </p>
          <div>
            <Input
              type="tel"
              placeholder="Phone number (e.g. 9876543210)"
              value={forgotPhone}
              onChange={e => setForgotPhone(e.target.value)}
              className="h-12 rounded-xl"
            />
            <p className="text-xs text-muted-foreground mt-1 ml-1">🇮🇳 Indian numbers only (+91)</p>
          </div>
          <Button className="rounded-xl" onClick={handleForgotPassword} disabled={forgotLoading}>
            {forgotLoading ? 'Processing...' : 'Send Reset Link via WhatsApp'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerAuth;
