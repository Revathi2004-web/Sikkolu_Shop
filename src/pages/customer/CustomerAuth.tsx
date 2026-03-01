import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CustomerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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

    if (isLogin) {
      if (!phone.trim()) {
        toast.error('Phone number is required');
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('phone', phone.trim())
        .maybeSingle();

      if (!profile) {
        toast.error('No account found with this phone number');
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase.functions.invoke('lookup-email', {
        body: { user_id: profile.user_id },
      });

      if (!userData?.email) {
        toast.error('Login failed. Please try again.');
        setLoading(false);
        return;
      }

      const { error } = await signIn(userData.email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Welcome back! 🎉');
        navigate('/store');
      }
    } else {
      // Register
      if (!name.trim()) {
        toast.error('Name is required');
        setLoading(false);
        return;
      }
      if (!phone.trim()) {
        toast.error('Phone number is required');
        setLoading(false);
        return;
      }
      if (!email.trim()) {
        toast.error('Email is required for account verification');
        setLoading(false);
        return;
      }
      const { error, user: newUser } = await signUp(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        // Update profile with phone and name using service-level function
        if (newUser) {
          await supabase.functions.invoke('update-profile', {
            body: { user_id: newUser.id, phone: phone.trim(), name: name.trim() },
          });
        }
        toast.success('Account created! Please check your email to verify, then login.');
        setIsLogin(true);
        setPhone('');
        setPassword('');
      }
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!forgotPhone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    setForgotLoading(true);

    // Look up user by phone
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('phone', forgotPhone.trim())
      .maybeSingle();

    if (!profile) {
      toast.error('No account found with this phone number');
      setForgotLoading(false);
      return;
    }

    // Get email to generate reset link
    const { data: userData } = await supabase.functions.invoke('lookup-email', {
      body: { user_id: profile.user_id },
    });

    if (!userData?.email) {
      toast.error('Could not process request. Please contact support.');
      setForgotLoading(false);
      return;
    }

    // Generate password reset and send link via WhatsApp
    const { error } = await supabase.auth.resetPasswordForEmail(userData.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error('Failed to generate reset link');
      setForgotLoading(false);
      return;
    }

    // Send the reset notification via WhatsApp
    const cleanPhone = forgotPhone.trim().replace(/\s+/g, '').replace('+', '');
    const msg = encodeURIComponent(
      `🔐 Password Reset - Srikakulam Store\n\nHi! A password reset was requested for your account.\n\nPlease check your email (${userData.email}) for the reset link.\n\nIf you didn't request this, please ignore this message.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');

    toast.success('Password reset link sent! Check your WhatsApp & email.');
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
          <Input
            type="tel"
            placeholder="Phone number (e.g. +91 98765 43210)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="h-14 text-lg rounded-xl"
            required
          />
          {!isLogin && (
            <Input
              type="email"
              placeholder="Email (for verification only)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-12 text-sm rounded-xl text-muted-foreground"
              required
            />
          )}
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
            Enter your registered phone number. We'll send a password reset notification via WhatsApp.
          </p>
          <Input
            type="tel"
            placeholder="Phone number (e.g. +91 98765 43210)"
            value={forgotPhone}
            onChange={e => setForgotPhone(e.target.value)}
            className="h-12 rounded-xl"
          />
          <Button className="rounded-xl" onClick={handleForgotPassword} disabled={forgotLoading}>
            {forgotLoading ? 'Processing...' : 'Send Reset Link via WhatsApp'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerAuth;
