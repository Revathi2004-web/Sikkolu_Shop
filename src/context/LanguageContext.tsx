import { createContext, useContext, useState, ReactNode } from 'react';

const translations = {
  en: {
    // Landing
    tagline: 'Experience the Soul of Srikakulam',
    customerStore: '🛍️ Customer Store',
    customerDesc: 'Browse & shop our collection',
    customerLogin: 'Login to start shopping',
    adminPortal: '🔐 Admin Portal',
    adminDesc: 'Manage your business',
    copyright: '© 2026 Srikakulam Specials',
    // Auth
    welcomeBack: 'Welcome Back',
    createAccount: 'Create Account',
    loginWithPhone: 'Login with your phone number',
    registerToShop: 'Register to start shopping',
    fullName: 'Full Name',
    phonePlaceholder: 'Phone number (e.g. 9876543210)',
    phoneHint: '🇮🇳 Indian numbers only (+91)',
    passwordPlaceholder: 'Password (min 6 characters)',
    login: 'Login',
    register: 'Register',
    pleaseWait: 'Please wait...',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account? Register",
    hasAccount: 'Already have an account? Login',
    resetPassword: 'Reset Password',
    resetDesc: 'Enter your registered Indian phone number to reset your password.',
    sendReset: 'Send Reset Link via WhatsApp',
    processing: 'Processing...',
    // Store
    searchProducts: 'Search products...',
    all: 'All',
    buyNow: 'Buy Now',
    noProductsFound: 'No products found',
    comingSoon: '🌟 Coming Soon!',
    comingSoonDesc: 'New products will be added here soon. Stay tuned!',
    contactUs: '📞 Contact Us',
    noContacts: 'No contacts available',
    // Cart
    yourCart: 'Your Cart',
    cartEmpty: 'Your cart is empty',
    continueShopping: 'Continue Shopping',
    paymentOptions: 'Payment Options',
    total: 'Total',
    placeOrder: 'Place Order 🎉',
    // Checkout
    checkout: 'Checkout',
    orderSummary: 'Order Summary',
    yourFullName: 'Your full name',
    phoneNumber: 'Phone Number',
    deliveryAddress: '📍 Delivery Address',
    doorNo: 'Door No.',
    street: 'Street',
    landmark: 'Landmark',
    state: 'State',
    country: 'Country',
    placingOrder: 'Placing Order...',
    // Orders
    myOrders: 'My Orders',
    noOrders: 'No orders yet',
    startShopping: 'Start Shopping',
    cancelOrder: 'Cancel',
    returnOrder: 'Return',
    uploadPayment: 'Upload Payment',
    // Wishlist
    myWishlist: 'My Wishlist',
    wishlistEmpty: 'Your wishlist is empty',
    wishlistHint: 'Tap the heart icon on products to save them',
    browseProducts: 'Browse Products',
    back: 'Back',
  },
  te: {
    tagline: 'శ్రీకాకుళం స్పెషల్స్ ఆత్మను అనుభవించండి',
    customerStore: '🛍️ కస్టమర్ స్టోర్',
    customerDesc: 'మా కలెక్షన్ బ్రౌజ్ చేయండి',
    customerLogin: 'షాపింగ్ ప్రారంభించడానికి లాగిన్ అవ్వండి',
    adminPortal: '🔐 అడ్మిన్ పోర్టల్',
    adminDesc: 'మీ వ్యాపారాన్ని నిర్వహించండి',
    copyright: '© 2026 శ్రీకాకుళం స్పెషల్స్',
    welcomeBack: 'మళ్ళీ స్వాగతం',
    createAccount: 'ఖాతా సృష్టించండి',
    loginWithPhone: 'మీ ఫోన్ నంబర్‌తో లాగిన్ అవ్వండి',
    registerToShop: 'షాపింగ్ ప్రారంభించడానికి రిజిస్టర్ చేయండి',
    fullName: 'పూర్తి పేరు',
    phonePlaceholder: 'ఫోన్ నంబర్ (ఉదా. 9876543210)',
    phoneHint: '🇮🇳 భారతీయ నంబర్లు మాత్రమే (+91)',
    passwordPlaceholder: 'పాస్‌వర్డ్ (కనీసం 6 అక్షరాలు)',
    login: 'లాగిన్',
    register: 'రిజిస్టర్',
    pleaseWait: 'దయచేసి వేచి ఉండండి...',
    forgotPassword: 'పాస్‌వర్డ్ మర్చిపోయారా?',
    noAccount: 'ఖాతా లేదా? రిజిస్టర్ చేయండి',
    hasAccount: 'ఖాతా ఉందా? లాగిన్ అవ్వండి',
    resetPassword: 'పాస్‌వర్డ్ రీసెట్',
    resetDesc: 'మీ నమోదిత ఫోన్ నంబర్ ఎంటర్ చేయండి.',
    sendReset: 'WhatsApp ద్వారా రీసెట్ లింక్ పంపండి',
    processing: 'ప్రాసెసింగ్...',
    searchProducts: 'ఉత్పత్తులు శోధించండి...',
    all: 'అన్ని',
    buyNow: 'కొనండి',
    noProductsFound: 'ఉత్పత్తులు కనుగొనబడలేదు',
    comingSoon: '🌟 త్వరలో వస్తోంది!',
    comingSoonDesc: 'కొత్త ఉత్పత్తులు త్వరలో జోడించబడతాయి.',
    contactUs: '📞 సంప్రదించండి',
    noContacts: 'సంప్రదింపులు లేవు',
    yourCart: 'మీ కార్ట్',
    cartEmpty: 'మీ కార్ట్ ఖాళీగా ఉంది',
    continueShopping: 'షాపింగ్ కొనసాగించండి',
    paymentOptions: 'చెల్లింపు ఎంపికలు',
    total: 'మొత్తం',
    placeOrder: 'ఆర్డర్ చేయండి 🎉',
    checkout: 'చెకౌట్',
    orderSummary: 'ఆర్డర్ సారాంశం',
    yourFullName: 'మీ పూర్తి పేరు',
    phoneNumber: 'ఫోన్ నంబర్',
    deliveryAddress: '📍 డెలివరీ చిరునామా',
    doorNo: 'డోర్ నం.',
    street: 'వీధి',
    landmark: 'ల్యాండ్‌మార్క్',
    state: 'రాష్ట్రం',
    country: 'దేశం',
    placingOrder: 'ఆర్డర్ చేస్తోంది...',
    myOrders: 'నా ఆర్డర్లు',
    noOrders: 'ఆర్డర్లు లేవు',
    startShopping: 'షాపింగ్ ప్రారంభించండి',
    cancelOrder: 'రద్దు',
    returnOrder: 'రిటర్న్',
    uploadPayment: 'చెల్లింపు అప్‌లోడ్',
    myWishlist: 'నా విష్‌లిస్ట్',
    wishlistEmpty: 'మీ విష్‌లిస్ట్ ఖాళీగా ఉంది',
    wishlistHint: 'ఉత్పత్తులపై హార్ట్ ఐకాన్ నొక్కండి',
    browseProducts: 'ఉత్పత్తులు బ్రౌజ్ చేయండి',
    back: 'వెనుకకు',
  },
  hi: {
    tagline: 'श्रीकाकुलम स्पेशल्स का अनुभव करें',
    customerStore: '🛍️ कस्टमर स्टोर',
    customerDesc: 'हमारा कलेक्शन ब्राउज़ करें',
    customerLogin: 'शॉपिंग शुरू करने के लिए लॉगिन करें',
    adminPortal: '🔐 एडमिन पोर्टल',
    adminDesc: 'अपना व्यवसाय प्रबंधित करें',
    copyright: '© 2026 सिक्कोलू स्पेशल्स',
    welcomeBack: 'वापसी पर स्वागत',
    createAccount: 'खाता बनाएं',
    loginWithPhone: 'अपने फ़ोन नंबर से लॉगिन करें',
    registerToShop: 'शॉपिंग शुरू करने के लिए रजिस्टर करें',
    fullName: 'पूरा नाम',
    phonePlaceholder: 'फ़ोन नंबर (उदा. 9876543210)',
    phoneHint: '🇮🇳 केवल भारतीय नंबर (+91)',
    passwordPlaceholder: 'पासवर्ड (कम से कम 6 अक्षर)',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    pleaseWait: 'कृपया प्रतीक्षा करें...',
    forgotPassword: 'पासवर्ड भूल गए?',
    noAccount: 'खाता नहीं है? रजिस्टर करें',
    hasAccount: 'पहले से खाता है? लॉगिन करें',
    resetPassword: 'पासवर्ड रीसेट',
    resetDesc: 'अपना पंजीकृत फ़ोन नंबर दर्ज करें।',
    sendReset: 'WhatsApp से रीसेट लिंक भेजें',
    processing: 'प्रोसेसिंग...',
    searchProducts: 'उत्पाद खोजें...',
    all: 'सभी',
    buyNow: 'खरीदें',
    noProductsFound: 'कोई उत्पाद नहीं मिला',
    comingSoon: '🌟 जल्द आ रहा है!',
    comingSoonDesc: 'नए उत्पाद जल्द यहाँ जोड़े जाएंगे।',
    contactUs: '📞 संपर्क करें',
    noContacts: 'कोई संपर्क उपलब्ध नहीं',
    yourCart: 'आपकी कार्ट',
    cartEmpty: 'आपकी कार्ट खाली है',
    continueShopping: 'शॉपिंग जारी रखें',
    paymentOptions: 'भुगतान विकल्प',
    total: 'कुल',
    placeOrder: 'ऑर्डर करें 🎉',
    checkout: 'चेकआउट',
    orderSummary: 'ऑर्डर सारांश',
    yourFullName: 'आपका पूरा नाम',
    phoneNumber: 'फ़ोन नंबर',
    deliveryAddress: '📍 डिलीवरी पता',
    doorNo: 'दरवाज़ा नं.',
    street: 'गली',
    landmark: 'लैंडमार्क',
    state: 'राज्य',
    country: 'देश',
    placingOrder: 'ऑर्डर कर रहे हैं...',
    myOrders: 'मेरे ऑर्डर',
    noOrders: 'कोई ऑर्डर नहीं',
    startShopping: 'शॉपिंग शुरू करें',
    cancelOrder: 'रद्द करें',
    returnOrder: 'वापसी',
    uploadPayment: 'भुगतान अपलोड',
    myWishlist: 'मेरी विशलिस्ट',
    wishlistEmpty: 'आपकी विशलिस्ट खाली है',
    wishlistHint: 'उत्पादों पर हार्ट आइकन दबाएं',
    browseProducts: 'उत्पाद ब्राउज़ करें',
    back: 'वापस',
  },
};

export type Lang = keyof typeof translations;
type TranslationKeys = keyof typeof translations.en;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Record<TranslationKeys, string>;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const langLabels: Record<Lang, string> = { en: 'EN', te: 'తె', hi: 'हि' };

export { langLabels };

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('app-lang');
    return (saved as Lang) || 'en';
  });

  const handleSetLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('app-lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
