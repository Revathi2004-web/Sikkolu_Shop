import { useState, useEffect, createContext, useContext, ReactNode, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any; user: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const failedAttempts = useRef(0);
  const blockedUntil = useRef<number | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const checkRateLimit = useCallback((): { blocked: boolean; error?: any } => {
    if (blockedUntil.current && Date.now() < blockedUntil.current) {
      const waitSec = Math.ceil((blockedUntil.current - Date.now()) / 1000);
      return { blocked: true, error: { message: `Too many attempts. Please wait ${waitSec} seconds.` } };
    }
    if (blockedUntil.current && Date.now() >= blockedUntil.current) {
      blockedUntil.current = null;
      failedAttempts.current = 0;
    }
    return { blocked: false };
  }, []);

  const recordFailure = useCallback(() => {
    failedAttempts.current += 1;
    if (failedAttempts.current >= MAX_ATTEMPTS) {
      blockedUntil.current = Date.now() + BLOCK_DURATION_MS;
      failedAttempts.current = 0;
    }
  }, []);

  const signUp = async (email: string, password: string) => {
    const rl = checkRateLimit();
    if (rl.blocked) return { error: rl.error, user: null };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) recordFailure();
    else failedAttempts.current = 0;
    return { error, user: data?.user ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const rl = checkRateLimit();
    if (rl.blocked) return { error: rl.error };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) recordFailure();
    else failedAttempts.current = 0;
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, isAdmin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
