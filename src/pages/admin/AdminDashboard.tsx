import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, Package, CreditCard, Phone, ClipboardList, Settings, Users } from 'lucide-react';
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

const AdminDashboard = () => {
  const { isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [fabOpen, setFabOpen] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/admin/login');
  }, [isAdmin, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-serif font-bold">Boss Mode 🔥</h1>
        <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate('/'); }}>
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <Tabs defaultValue="orders" className="px-2 sm:px-4 pt-4">
        <TabsList className="w-full grid grid-cols-6 h-12 rounded-xl overflow-x-auto">
          <TabsTrigger value="orders" className="text-[10px] sm:text-xs gap-1 px-1"><ClipboardList className="w-4 h-4" /> <span className="hidden sm:inline">Orders</span></TabsTrigger>
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
          {/* Admin Credentials */}
          <div>
            <h2 className="text-lg font-serif font-semibold mb-3">🔐 Admin Credentials</h2>
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div>
                <div className="text-xs text-muted-foreground">Username</div>
                <div className="font-semibold font-mono text-sm">Srikakulamadmin</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Password</div>
                <div className="font-semibold font-mono text-sm">Sikkoluadmin@123</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">⚠️ Keep these credentials secure.</p>
            </div>
          </div>

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
                <span>Email verification required for customers</span>
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
