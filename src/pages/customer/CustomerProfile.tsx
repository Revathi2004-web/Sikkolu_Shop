import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Phone, MapPin, Save, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  name: string;
  phone: string;
  address: string;
}

const CustomerProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({ name: '', phone: '', address: '' });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, phone, address')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setProfile({ name: data.name || '', phone: data.phone || '', address: data.address || '' });
      }
      if (error) console.error('Error fetching profile:', error);
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!profile.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!profile.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        address: profile.address.trim(),
      })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } else {
      toast.success('Profile updated successfully!');
      setEditing(false);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/store')} className="touch-manipulation">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-xl font-serif font-bold flex-1">My Profile</h1>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1.5 rounded-xl">
            <Pencil className="w-4 h-4" /> Edit
          </Button>
        )}
      </div>

      <div className="max-w-md mx-auto">
        {/* Avatar section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">{profile.name || 'Customer'}</h2>
          <p className="text-sm text-muted-foreground">{profile.phone || 'No phone added'}</p>
        </div>

        {/* Profile fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" /> Full Name
            </label>
            {editing ? (
              <Input
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                className="h-12 rounded-xl"
                placeholder="Enter your name"
              />
            ) : (
              <div className="h-12 rounded-xl border border-border bg-muted/30 flex items-center px-3 text-foreground">
                {profile.name || <span className="text-muted-foreground">Not set</span>}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" /> Phone Number
            </label>
            {editing ? (
              <Input
                type="tel"
                value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                className="h-12 rounded-xl"
                placeholder="Enter your phone number"
              />
            ) : (
              <div className="h-12 rounded-xl border border-border bg-muted/30 flex items-center px-3 text-foreground">
                {profile.phone || <span className="text-muted-foreground">Not set</span>}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" /> Address
            </label>
            {editing ? (
              <Input
                value={profile.address}
                onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                className="h-12 rounded-xl"
                placeholder="Enter your delivery address"
              />
            ) : (
              <div className="min-h-[3rem] rounded-xl border border-border bg-muted/30 flex items-center px-3 text-foreground">
                {profile.address || <span className="text-muted-foreground">Not set</span>}
              </div>
            )}
          </div>

          {editing && (
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-12 rounded-xl font-semibold gap-2"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
