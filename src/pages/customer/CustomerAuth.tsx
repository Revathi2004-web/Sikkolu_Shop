import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

const CustomerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      // Login with phone: look up email from profiles
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

      // Get email from auth user via a lookup - we need to find the email
      // We'll use a different approach: store email in profile or use edge function
      // For now, let's look up via the admin API through an edge function
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
      // Register with email + phone
      if (!phone.trim()) {
        toast.error('Phone number is required');
        setLoading(false);
        return;
      }
      if (!email.trim()) {
        toast.error('Email is required');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        setTimeout(async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('profiles').update({ phone: phone.trim() }).eq('user_id', user.id);
          }
        }, 1000);
        toast.success('Account created! Please check your email to verify, then login.');
        setIsLogin(true);
      }
    }
    setLoading(false);
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
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
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

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-6 text-sm text-primary font-medium touch-manipulation"
        >
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default CustomerAuth;
