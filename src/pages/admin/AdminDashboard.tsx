import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, Package, CreditCard, Phone, ClipboardList, Settings, Users, Bell, Plus } from 'lucide-react';
import ProductManager from '@/components/admin/ProductManager';
import CategoryManager from '@/components/admin/CategoryManager';
import PaymentManager from '@/components/admin/PaymentManager';
import ContactManager from '@/components/admin/ContactManager';
import OrderManager from '@/components/admin/OrderManager';
import CustomerManager from '@/components/admin/CustomerManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

const tabs = [
  { key: 'orders', label: 'Orders', icon: ClipboardList },
  { key: 'inventory', label: 'Items', icon: Package },
  { key: 'payments', label: 'Pay', icon: CreditCard },
  { key: 'contacts', label: 'Contact', icon: Phone },
  { key: 'customers', label: 'Users', icon: Users },
  { key: 'settings', label: 'Admin', icon: Settings },
];

const AdminDashboard = () => {
  const { isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [fabOpen, setFabOpen] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [activeTab, setActiveTab] = useState('orders');

  const handleRefresh = useCallback(async () => {
    await new Promise(r => setTimeout(r, 600));
    toast.success('Refreshed!');
  }, []);

  const { refreshing, pullDistance, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(handleRefresh);

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/admin/login');
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel('admin-new-orders-alert')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const order = payload.new as any;
        setNewOrderCount(prev => prev + 1);
        toast.info(`🛍️ New order from ${order.customer_name || 'Customer'}! ₹${Number(order.total_amount).toLocaleString()}`, {
          duration: 8000,
          action: { label: 'View', onClick: () => setActiveTab('orders') },
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel('admin-new-customers-alert')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        const profile = payload.new as any;
        if (profile.name) {
          toast.info(`👤 New customer registered: ${profile.name}`, { duration: 5000 });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!isAdmin) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'orders': return <OrderManager />;
      case 'inventory': return (
        <div className="space-y-6">
          <ProductManager showAdd={showAddProduct} setShowAdd={setShowAddProduct} />
          <CategoryManager showAdd={showAddCategory} setShowAdd={setShowAddCategory} />
        </div>
      );
      case 'payments': return <PaymentManager />;
      case 'contacts': return <ContactManager />;
      case 'customers': return <CustomerManager />;
      case 'settings': return (
        <div>
          <h2 className="text-lg font-serif font-semibold mb-3">🛡️ Security</h2>
          <div className="bg-card border border-border rounded-xl p-4 space-y-2 text-sm">
            {['Role-Based Access Control (RBAC) enabled', 'Row Level Security (RLS) on all tables', 'Rate-limited login (5 attempts / 5 min block)', 'Signed URLs for payment screenshots', 'Real-time order & customer notifications'].map(item => (
              <div key={item} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-serif font-bold">Boss Mode 🔥</h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="relative w-10 h-10"
            onClick={() => { setNewOrderCount(0); setActiveTab('orders'); }}
          >
            <Bell className="w-5 h-5" />
            {newOrderCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
                {newOrderCount}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10" onClick={() => { signOut(); navigate('/'); }}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div className="flex justify-center py-2 transition-all" style={{ height: pullDistance }}>
          <div className={`w-6 h-6 border-2 border-primary border-t-transparent rounded-full ${refreshing ? 'animate-spin' : ''}`} />
        </div>
      )}

      {/* Content Area */}
      <div
        className="px-3 sm:px-4 pt-4 overflow-y-auto"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {renderContent()}
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t border-border safe-area-bottom">
        <div className="grid grid-cols-6 h-16">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                className={`flex flex-col items-center justify-center gap-0.5 touch-manipulation transition-colors relative ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => { setActiveTab(tab.key); if (tab.key === 'orders') setNewOrderCount(0); }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {tab.key === 'orders' && newOrderCount > 0 && (
                  <span className="absolute top-1.5 right-1/4 w-4 h-4 bg-destructive text-destructive-foreground text-[8px] rounded-full flex items-center justify-center font-bold">
                    {newOrderCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <Dialog open={fabOpen} onOpenChange={setFabOpen}>
          <Button
            size="lg"
            className="w-14 h-14 rounded-full shadow-xl text-2xl"
            onClick={() => setFabOpen(true)}
          >
            <Plus className="w-6 h-6" />
          </Button>
          <DialogContent className="max-w-[90vw] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">Quick Add</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Button variant="outline" className="h-20 flex-col gap-2 rounded-xl" onClick={() => { setFabOpen(false); setShowAddProduct(true); setActiveTab('inventory'); }}>
                <Package className="w-6 h-6" />
                Product
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 rounded-xl" onClick={() => { setFabOpen(false); setShowAddCategory(true); setActiveTab('inventory'); }}>
                📂
                Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
