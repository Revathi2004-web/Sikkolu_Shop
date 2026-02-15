import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (!error) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground mb-8 touch-manipulation">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        <div className="bg-accent w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-serif font-bold mb-2">Admin Portal</h1>
        <p className="text-muted-foreground mb-8">Enter your credentials</p>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <Input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="h-14 text-lg rounded-xl"
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="h-14 text-lg rounded-xl"
            required
          />
          <Button type="submit" className="w-full h-14 text-lg rounded-xl font-semibold" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-6">Sign in with your admin account</p>
      </div>
    </div>
  );
};

export default AdminLogin;
