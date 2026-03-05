import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users } from 'lucide-react';

interface CustomerProfile {
  user_id: string;
  name: string;
  phone: string;
  address: string;
  created_at: string;
}

const CustomerManager = () => {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('user_id, name, phone, address, created_at')
      .order('created_at', { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
    // Realtime subscription for new registrations
    const channel = supabase
      .channel('admin-customers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchCustomers())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-serif font-semibold">Registered Customers ({customers.length})</h2>
      </div>

      {customers.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No customers registered yet</p>
      ) : (
        <div className="space-y-2">
          {customers.map(c => (
            <div key={c.user_id} className="bg-card border border-border rounded-xl p-4">
              <div className="font-semibold">{c.name || 'No name'}</div>
              <div className="text-sm text-muted-foreground">📱 {c.phone || 'No phone'}</div>
              {c.address && <div className="text-sm text-muted-foreground">📍 {c.address}</div>}
              <div className="text-xs text-muted-foreground mt-1">
                Joined: {new Date(c.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerManager;
