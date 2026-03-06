import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag, Phone, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
const MOCK_OTP = '123456';

const normalizePhone = (phone: string): string => {
  const digits = phone.replace(/[\s\-\(\)]/g, '');
  if (digits.startsWith('+91')) return digits;
  if (digits.startsWith('91') && digits.length === 12) return '+' + digits;
  if (/^[6-9]\d{9}$/.test(digits)) return '+91' + digits;
  return digits;
};

const isValidIndianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s\-\(\)+91]/g, '').slice(-10);
  return INDIAN_PHONE_REGEX.test(cleaned);
};

const extractDigits = (phone: string): string => {
  return phone.replace(/[\s\-\(\)+]/g, '').slice(-10);
};

const phoneToEmail = (phone: string): string => {
  const normalized = normalizePhone(phone).replace('+', '');
  return `${normalized}@srikakulamstore.app`;
};

// Mock OTP functions
const mockSendOTP = async (phone: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`[Mock] OTP ${MOCK_OTP} sent to ${phone}`);
  return true;
};

const mockVerifyOTP = async (_phone: string, otp: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return otp === MOCK_OTP;
};

const OTPInput = ({ value, onChange, length = 6 }: { value: string; onChange: (val: string) => void; length?: number }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d?$/.test(digit)) return;
    const newVal = value.split('');
    newVal[index] = digit;
    const joined = newVal.join('').slice(0, length);
    onChange(joined);
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    const nextIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className="w-11 h-13 text-center text-xl font-bold rounded-xl border-2 border-input bg-background focus:border-primary focus:ring-2 focus:ring-ring outline-none transition-all"
        />
      ))}
    </div>
  );
};

const CustomerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    const digits = extractDigits(phone);
    if (!INDIAN_PHONE_REGEX.test(digits)) {
      toast.error('Please enter a valid 10-digit Indian mobile number starting with 6-9');
      return;
    }
    setOtpLoading(true);
    const sent = await mockSendOTP(normalizePhone(phone));
    if (sent) {
      setOtpSent(true);
      toast.success(`OTP sent to ${digits.slice(0, 3)}****${digits.slice(-3)}! (Mock: ${MOCK_OTP})`);
    } else {
      toast.error('Failed to send OTP. Please try again.');
    }
    setOtpLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }
    setOtpLoading(true);
    const valid = await mockVerifyOTP(phone, otp);
    if (!valid) {
      toast.error('Invalid OTP. Please try again.');
      setOtpLoading(false);
      return;
    }

    // OTP verified — sign in with generated email + a fixed password for OTP-based users
    const generatedEmail = phoneToEmail(phone);
    const otpPassword = `otp_${extractDigits(phone)}_secure`;

    // Try sign in first
    const { error: signInError } = await signIn(generatedEmail, otpPassword);
    if (!signInError) {
      toast.success('Welcome back! 🎉');
      navigate('/store');
      setOtpLoading(false);
      return;
    }

    // If user doesn't exist, create account then sign in
    const { error: signUpError, user: newUser } = await signUp(generatedEmail, otpPassword);
    if (signUpError && !signUpError.message?.includes('already registered')) {
      toast.error('Something went wrong. Please try again.');
      setOtpLoading(false);
      return;
    }

    if (newUser) {
      const normalizedPhone = normalizePhone(phone);
      await supabase.functions.invoke('update-profile', {
        body: { user_id: newUser.id, phone: normalizedPhone, name: `User ${extractDigits(phone).slice(-4)}` },
      });
    }

    // Sign in after registration
    const { error: finalError } = await signIn(generatedEmail, otpPassword);
    if (finalError) {
      toast.error('Account created. Please verify OTP again to login.');
    } else {
      toast.success('Welcome! 🎉');
      navigate('/store');
    }
    setOtpLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isValidIndianPhone(phone)) {
      toast.error('Please enter a valid Indian phone number (e.g. 9876543210 or +91 98765 43210)');
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      toast.error('Name is required');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    const generatedEmail = phoneToEmail(phone);

    const { error, user: newUser } = await signUp(generatedEmail, password);
    if (error) {
      if (error.message?.includes('already registered')) {
        toast.error('This phone number is already registered. Please login instead.');
      } else {
        toast.error(error.message);
      }
    } else {
      if (newUser) {
        await supabase.functions.invoke('update-profile', {
          body: { user_id: newUser.id, phone: normalizedPhone, name: name.trim() },
        });
        await supabase.auth.signOut();
      }
      toast.success('Account created successfully! Please login with your credentials.');
      setIsLogin(true);
      setPhone('');
      setPassword('');
      setName('');
      setOtpSent(false);
      setOtp('');
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!isValidIndianPhone(forgotPhone)) {
      toast.error('Please enter a valid Indian phone number');
      return;
    }
    setForgotLoading(true);
    const generatedEmail = phoneToEmail(forgotPhone);
    const { error } = await supabase.auth.resetPasswordForEmail(generatedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error('Failed to process reset request. Please try again.');
      setForgotLoading(false);
      return;
    }
    const cleanPhone = normalizePhone(forgotPhone).replace('+', '');
    const msg = encodeURIComponent(
      `🔐 Password Reset - Sikkolu Specials\n\nHi! A password reset was requested for your account.\n\nPlease check the reset link sent to your account.\n\nIf you didn't request this, please ignore this message.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
    toast.success('Password reset initiated! Check WhatsApp for instructions.');
    setForgotOpen(false);
    setForgotPhone('');
    setForgotLoading(false);
  };

  const resetLoginState = () => {
    setOtpSent(false);
    setOtp('');
    setPhone('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground mb-8 touch-manipulation">
        <ArrowLeft className="w-5 h-5" /> {t.back}
      </button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <ShoppingBag className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-serif font-bold mb-1 text-foreground">
          {isLogin ? 'Sikkolu Specials' : t.createAccount}
        </h1>
        <p className="text-muted-foreground mb-8 text-center">
          {isLogin
            ? (otpSent ? 'Enter the OTP sent to your phone' : 'Login with your mobile number')
            : t.registerToShop}
        </p>

        {isLogin ? (
          /* ===== OTP LOGIN FLOW ===== */
          <div className="w-full space-y-5">
            {!otpSent ? (
              <>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="h-14 text-lg rounded-xl pl-12"
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-muted-foreground ml-1 flex items-center gap-1">
                  🇮🇳 Indian numbers only (starts with 6-9)
                </p>
                <Button
                  onClick={handleSendOTP}
                  className="w-full h-14 text-lg rounded-xl font-semibold bg-primary hover:bg-primary/90"
                  disabled={otpLoading}
                >
                  {otpLoading ? 'Sending OTP...' : '📱 Send OTP'}
                </Button>
              </>
            ) : (
              <>
                <div className="bg-accent/50 rounded-xl p-4 text-center">
                  <p className="text-sm text-muted-foreground">OTP sent to</p>
                  <p className="font-semibold text-foreground">+91 {extractDigits(phone)}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2 justify-center">
                    <Shield className="w-4 h-4 text-primary" /> Enter 6-digit OTP
                  </label>
                  <OTPInput value={otp} onChange={setOtp} />
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Mock OTP: <span className="font-mono font-bold text-primary">{MOCK_OTP}</span>
                  </p>
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  className="w-full h-14 text-lg rounded-xl font-semibold bg-primary hover:bg-primary/90"
                  disabled={otpLoading || otp.length !== 6}
                >
                  {otpLoading ? 'Verifying...' : '✅ Verify & Login'}
                </Button>

                <button
                  onClick={resetLoginState}
                  className="w-full text-sm text-muted-foreground hover:text-primary transition-colors touch-manipulation"
                >
                  ← Change phone number
                </button>
              </>
            )}
          </div>
        ) : (
          /* ===== REGISTRATION FLOW ===== */
          <form onSubmit={handleRegisterSubmit} className="w-full space-y-4">
            <Input
              type="text"
              placeholder={t.fullName}
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-14 text-lg rounded-xl"
              required
            />
            <div>
              <Input
                type="tel"
                placeholder={t.phonePlaceholder}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="h-14 text-lg rounded-xl"
                required
              />
              <p className="text-xs text-muted-foreground mt-1 ml-1">{t.phoneHint}</p>
            </div>
            <Input
              type="password"
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-14 text-lg rounded-xl"
              minLength={6}
              required
            />
            <Button type="submit" className="w-full h-14 text-lg rounded-xl font-semibold" disabled={loading}>
              {loading ? t.pleaseWait : t.register}
            </Button>
          </form>
        )}

        {isLogin && !otpSent && (
          <button
            onClick={() => setForgotOpen(true)}
            className="mt-4 text-sm text-muted-foreground hover:text-primary transition-colors touch-manipulation"
          >
            {t.forgotPassword}
          </button>
        )}

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            resetLoginState();
            setPassword('');
            setName('');
          }}
          className="mt-4 text-sm text-primary font-medium touch-manipulation"
        >
          {isLogin ? t.noAccount : t.hasAccount}
        </button>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader><DialogTitle>{t.resetPassword}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t.resetDesc}</p>
          <div>
            <Input
              type="tel"
              placeholder={t.phonePlaceholder}
              value={forgotPhone}
              onChange={e => setForgotPhone(e.target.value)}
              className="h-12 rounded-xl"
            />
            <p className="text-xs text-muted-foreground mt-1 ml-1">{t.phoneHint}</p>
          </div>
          <Button className="rounded-xl" onClick={handleForgotPassword} disabled={forgotLoading}>
            {forgotLoading ? t.processing : t.sendReset}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerAuth;
