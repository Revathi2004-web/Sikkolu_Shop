import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, Package, CreditCard, Phone, ClipboardList } from 'lucide-react';
import ProductManager from '@/components/admin/ProductManager';
import CategoryManager from '@/components/admin/CategoryManager';
import PaymentManager from '@/components/admin/PaymentManager';
import ContactManager from '@/components/admin/ContactManager';
import OrderManager from '@/components/admin/OrderManager';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const AdminDashboard = () => {
  const { isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [fabOpen, setFabOpen] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  useEffect(() => {
    if (!isAdmin) navigate('/admin/login');
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-serif font-bold">Boss Mode 🔥</h1>
        <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate('/'); }}>
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <Tabs defaultValue="orders" className="px-4 pt-4">
        <TabsList className="w-full grid grid-cols-4 h-12 rounded-xl">
          <TabsTrigger value="orders" className="text-xs gap-1"><ClipboardList className="w-4 h-4" /> Orders</TabsTrigger>
          <TabsTrigger value="inventory" className="text-xs gap-1"><Package className="w-4 h-4" /> Items</TabsTrigger>
          <TabsTrigger value="payments" className="text-xs gap-1"><CreditCard className="w-4 h-4" /> Pay</TabsTrigger>
          <TabsTrigger value="contacts" className="text-xs gap-1"><Phone className="w-4 h-4" /> Contact</TabsTrigger>
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
