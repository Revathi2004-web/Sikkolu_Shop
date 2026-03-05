import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, Package, CreditCard, Phone, ClipboardList, Settings, Users, Bell } from 'lucide-react';
import ProductManager from '@/components/admin/ProductManager';
import CategoryManager from '@/components/admin/CategoryManager';
import PaymentManager from '@/components/admin/PaymentManager';
import ContactManager from '@/components/admin/ContactManager';
import OrderManager from '@/components/admin/OrderManager';
import CustomerManager from '@/components/admin/CustomerManager';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [fabOpen, setFabOpen] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/admin/login');
  }, [isAdmin, loading, navigate]);

  // Realtime new order notifications
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel('admin-new-orders-alert')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const order = payload.new as any;
        setNewOrderCount(prev => prev + 1);
        toast.info(`🛍️ New order from ${order.customer_name || 'Customer'}! ₹${Number(order.total_amount).toLocaleString()}`, {
          duration: 8000,
          action: {
            label: 'View',
            onClick: () => setActiveTab('orders'),
          },
        });
        // Auto-send WhatsApp alert to admin
        // Uses the first contact number from StoreContext (handled via OrderManager)
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  // Also listen for new customer registrations
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

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-serif font-bold">Boss Mode 🔥</h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => { setNewOrderCount(0); setActiveTab('orders'); }}
          >
            <Bell className="w-5 h-5" />
            {newOrderCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
                {newOrderCount}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate('/'); }}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); if (v === 'orders') setNewOrderCount(0); }} className="px-2 sm:px-4 pt-4">
        <TabsList className="w-full grid grid-cols-6 h-12 rounded-xl overflow-x-auto">
          <TabsTrigger value="orders" className="text-[10px] sm:text-xs gap-1 px-1 relative">
            <ClipboardList className="w-4 h-4" /> <span className="hidden sm:inline">Orders</span>
            {newOrderCount > 0 && activeTab !== 'orders' && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[8px] rounded-full flex items-center justify-center font-bold">
                {newOrderCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="inventory" className="text-[10px] sm:text-xs gap-1 px-1"><Package className="w-4 h-4" /> <span className="hidden sm:inline">Items</span></TabsTrigger>
          <TabsTrigger value="payments" className="text-[10px] sm:text-xs gap-1 px-1"><CreditCard className="w-4 h-4" /> <span className="hidden sm:inline">Pay</span></TabsTrigger>
          <TabsTrigger value="contacts" className="text-[10px] sm:text-xs gap-1 px-1"><Phone className="w-4 h-4" /> <span className="hidden sm:inline">Contact</span></TabsTrigger>
          <TabsTrigger value="customers" className="text-[10px] sm:text-xs gap-1 px-1"><Users className="w-4 h-4" /> <span className="hidden sm:inline">Users</span></TabsTrigger>
          <TabsTrigger value="settings" className="text-[10px] sm:text-xs gap-1 px-1"><Settings className="w-4 h-4" /> <span className="hidden sm:inline">Admin</span></TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4">
          <OrderManager />
        </TabsContent>

        <TabsContent value="inventory" className="mt-4 space-y-6">
          <ProductManager showAdd={showAddProduct} setShowAdd={setShowAddProduct} />
          <CategoryManager showAdd={showAddCategory} setShowAdd={setShowAddCategory} />
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <PaymentManager />
        </TabsContent>

        <TabsContent value="contacts" className="mt-4">
          <ContactManager />
        </TabsContent>

        <TabsContent value="customers" className="mt-4">
          <CustomerManager />
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-6">
          {/* Security Info */}
          <div>
            <h2 className="text-lg font-serif font-semibold mb-3">🛡️ Security</h2>
            <div className="bg-card border border-border rounded-xl p-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Role-Based Access Control (RBAC) enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Row Level Security (RLS) on all tables</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Rate-limited login (5 attempts / 5 min block)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Signed URLs for payment screenshots</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Real-time order & customer notifications</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Dialog open={fabOpen} onOpenChange={setFabOpen}>
          <Button
            size="lg"
            className="w-16 h-16 rounded-full shadow-xl text-2xl"
            onClick={() => setFabOpen(true)}
          >
            <Plus className="w-7 h-7" />
          </Button>
          <DialogContent className="max-w-[90vw] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">Quick Add</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Button variant="outline" className="h-20 flex-col gap-2 rounded-xl" onClick={() => { setFabOpen(false); setShowAddProduct(true); }}>
                <Package className="w-6 h-6" />
                Product
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 rounded-xl" onClick={() => { setFabOpen(false); setShowAddCategory(true); }}>
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
