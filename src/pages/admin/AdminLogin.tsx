import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { adminLogin } = useStore();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(username, password)) {
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
            placeholder="Secret Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="h-14 text-lg rounded-xl"
            required
          />
          <Input
            type="password"
            placeholder="Secret Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="h-14 text-lg rounded-xl"
            required
          />
          <Button type="submit" className="w-full h-14 text-lg rounded-xl font-semibold">
            Login
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-6">Default: admin / admin123</p>
      </div>
    </div>
  );
};

export default AdminLogin;
