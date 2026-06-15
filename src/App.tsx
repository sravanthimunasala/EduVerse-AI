import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Search, 
  Mic, 
  MicOff, 
  Cpu, 
  BookOpen, 
  Compass, 
  User, 
  LayoutDashboard, 
  Mail, 
  ShoppingCart, 
  Heart, 
  Bell, 
  Gift, 
  Camera, 
  Grid, 
  List, 
  Flame, 
  Award, 
  BookMarked,
  ArrowRight, 
  ArrowLeft,
  X, 
  Check, 
  ThumbsUp, 
  MapPin, 
  Eye, 
  Plus, 
  Send,
  Loader2,
  Calendar,
  Layers,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle,
  Clock,
  HelpCircle
} from 'lucide-react';

import { Product, CartItem, Order, SavedAddress, Coupon } from './types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, SAMPLE_ADDRESSES, SAMPLE_REVIEWS } from './data';
import Navigation from './components/Navigation';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Dashboard from './components/Dashboard';
import AIAssistant from './components/AIAssistant';
import { formatCurrency, getStoredData, setStoredData, speakText, STORAGE_KEYS } from './utils';

// Extra used books database for S2S exchange
interface UsedBookListing {
  id: string;
  title: string;
  author: string;
  condition: 'Excellent' | 'Good' | 'Worn';
  price: number;
  sellerName: string;
  sellerContact: string;
  courseCode?: string;
}

const INITIAL_USED_BOOKS: UsedBookListing[] = [
  {
    id: 'u1',
    title: 'Calculus of One Variable (9th Edition)',
    author: 'James Stewart',
    condition: 'Excellent',
    price: 250.00,
    sellerName: 'David K.',
    sellerContact: 'david.k@stanford.edu',
    courseCode: 'MATH51'
  },
  {
    id: 'u2',
    title: 'Concepts of Genetics / Loose Leaf',
    author: 'William S. Klug',
    condition: 'Good',
    price: 180.00,
    sellerName: 'Sarah Liang',
    sellerContact: 's.liang@stanford.edu',
    courseCode: 'BIO101'
  },
  {
    id: 'u3',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen',
    condition: 'Worn',
    price: 350.00,
    sellerName: 'Rohan Gupta',
    sellerContact: 'rgupta@stanford.edu',
    courseCode: 'CS106B'
  }
];

export default function App() {
  // Navigation & Global States
  const [currentTab, setCurrentTab] = useState<string>(() => getStoredData('eduverse_current_tab', 'home'));
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => getStoredData(STORAGE_KEYS.THEME, false));
  const [isStudentVerified, setIsStudentVerified] = useState<boolean>(() => getStoredData('eduverse_student_verified', true));
  const [notifications, setNotifications] = useState<string[]>(() => getStoredData(STORAGE_KEYS.NOTIFICATIONS, [
    '🎓 Welcome to EduVerse AI! Access code STUDENT30 active.',
    '✨ Verify your Student ID campus mail to claim safe 30% textbook discount rates.',
    '🚀 Hyperlocal delivery is monitoring local Palo Alto academic suppliers.'
  ]));
  const [eduPoints, setEduPoints] = useState<number>(() => getStoredData('eduverse_edupoints_balance', 450));
  
  // Catalog & Filters
  const [products, setProducts] = useState<Product[]>(() => {
    const custom = getStoredData<Product[]>(STORAGE_KEYS.STUDENT_STOCKS, []);
    return custom.length > 0 ? [...INITIAL_PRODUCTS, ...custom] : INITIAL_PRODUCTS;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [sortBy, setSortBy] = useState<string>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // E-commerce Cart States
  const [cart, setCart] = useState<CartItem[]>(() => getStoredData(STORAGE_KEYS.CART, []));
  const [wishlist, setWishlist] = useState<Product[]>(() => getStoredData(STORAGE_KEYS.WISHLIST, []));
  const [orders, setOrders] = useState<Order[]>(() => getStoredData(STORAGE_KEYS.ORDERS, []));
  const [activePromo, setActivePromo] = useState<Coupon | null>(null);

  // Book Exchange S2S state
  const [usedBooks, setUsedBooks] = useState<UsedBookListing[]>(() => getStoredData('eduverse_used_books_exchange', INITIAL_USED_BOOKS));
  const [showUsedBookForm, setShowUsedBookForm] = useState(false);
  const [newUsedTitle, setNewUsedTitle] = useState('');
  const [newUsedAuthor, setNewUsedAuthor] = useState('');
  const [newUsedPrice, setNewUsedPrice] = useState(150);
  const [newUsedCondition, setNewUsedCondition] = useState<'Excellent' | 'Good' | 'Worn'>('Excellent');
  const [newUsedSeller, setNewUsedSeller] = useState('');
  const [newUsedContact, setNewUsedContact] = useState('');
  const [newUsedCourse, setNewUsedCourse] = useState('');

  // AI Voice Assistant State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState('Voice Commerce Assistant is Listening... Try spelling a command like "Go to shop", "Buy Biology", or "Search calculus"');

  // Semester Shopping Assistant State
  const [selectedUni, setSelectedUni] = useState('Stanford University');
  const [selectedCourseGroup, setSelectedCourseGroup] = useState('Computer Science');
  const [selectedSemester, setSelectedSemester] = useState('Fall 2026');
  const [courseEssentialsList, setCourseEssentialsList] = useState<Product[]>([]);
  const [isCourseCompiled, setIsCourseCompiled] = useState(false);

  // Smart Book Scanner simulation
  const [scannerFile, setScannerFile] = useState<File | null>(null);
  const [scannerPreview, setScannerPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerResult, setScannerResult] = useState<{
    detectedTitle?: string;
    description?: string;
    recommendedProduct?: Product;
    confidence?: number;
  } | null>(null);

  // Admin Custom Addition states
  const [adminName, setAdminName] = useState('');
  const [adminPrice, setAdminPrice] = useState(199.00);
  const [adminCategory, setAdminCategory] = useState<'books' | 'stationery' | 'accessories' | 'digital'>('books');
  const [adminSub, setAdminSub] = useState('General');
  const [adminStock, setAdminStock] = useState(30);
  const [adminLevel, setAdminLevel] = useState<'School' | 'College' | 'University' | 'Teacher' | 'All'>('University');

  // Rewards catalog
  const rewardsList = [
    { id: 'rev1', title: '1-Month Unlimited AI Mentor Access', cost: 150, image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=150', description: 'Unlock instant high-fidelity answers to all math & biology proofs.' },
    { id: 'rev2', title: 'AP Chemistry Online Crash Course Code', cost: 250, image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=150', description: 'Interactive diagnostic videos and masterclasses for exams.' },
    { id: 'rev3', title: 'Shatter-proof Layout Drawing Ruler Set', cost: 100, image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=150', description: 'Premium engineering draft gear shipped to campus lockers.' },
  ];

  // Map representation - Palo Alto Hyperlocal Stores
  const hyperlocalStores = [
    { name: 'Stanford Campus Bookstore', distance: '0.4 miles away', address: 'Lasuen Mall, Stanford', speed: '25 min Direct Express delivery drop' },
    { name: 'Palo Alto Technical Ink & Stationery', distance: '1.2 miles away', address: 'University Ave, Palo Alto', speed: 'Same-Day pickup window' },
    { name: 'Science & Bio Research Supply Lab', distance: '2.5 miles away', address: 'El Camino Real, Palo Alto', speed: 'Immediate courier delivery door-lock' }
  ];

  // Tracking Active Order (for details view or live timeline popup)
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // Contact Support Ticket Form state
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [ticketState, setTicketState] = useState<'idle' | 'submitting' | 'success'>('idle');

  // Synchronizers
  useEffect(() => {
    setStoredData('eduverse_current_tab', currentTab);
  }, [currentTab]);

  useEffect(() => {
    setStoredData('eduverse_student_verified', isStudentVerified);
  }, [isStudentVerified]);

  useEffect(() => {
    setStoredData('eduverse_edupoints_balance', eduPoints);
  }, [eduPoints]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.CART, cart);
  }, [cart]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.WISHLIST, wishlist);
  }, [wishlist]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  useEffect(() => {
    setStoredData('eduverse_used_books_exchange', usedBooks);
  }, [usedBooks]);

  // Handle dark mode toggle class manipulation
  useEffect(() => {
    setStoredData(STORAGE_KEYS.THEME, darkMode);
  }, [darkMode]);

  // Voice Commerce Recognition Engine
  const startVoiceCommerce = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech Recognition is not natively supported in this browser environment. Try using Google Chrome.');
      return;
    }

    if (isVoiceActive) {
      setIsVoiceActive(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsVoiceActive(true);
      setVoiceTranscript('');
      setSpeechFeedback('Listening... Say "Go to shop", "Buy Biology", "Add AP Biology to cart", or "Search Calculus"...');
    };

    recognition.onresult = (event: any) => {
      const transcriptStr = event.results[0][0].transcript;
      const transcriptClean = transcriptStr.toLowerCase();
      setVoiceTranscript(transcriptStr);
      processVoiceCommand(transcriptClean);
    };

    recognition.onerror = (err: any) => {
      console.error('Speech synthesis/mic code failure:', err);
      setIsVoiceActive(false);
    };

    recognition.onend = () => {
      setIsVoiceActive(false);
    };

    recognition.start();
  };

  const processVoiceCommand = (command: string) => {
    // 1. Navigation Commands
    if (command.includes('go to shop') || command.includes('open shop') || command.includes('browse shop')) {
      setCurrentTab('shop');
      speakVoiceFeedback('Aesthetic catalog of academic courses and draft gear is open.');
    } else if (command.includes('go to mentor') || command.includes('open mentor') || command.includes('academic mentor')) {
      setCurrentTab('mentor');
      speakVoiceFeedback('AI tutor mentor has loaded. What concept can I deconstruct for you today?');
    } else if (command.includes('go to planner') || command.includes('open planner')) {
      setCurrentTab('planner');
      speakVoiceFeedback('Your personalized scholastic calendar planner is configured.');
    } else if (command.includes('go to rewards') || command.includes('open rewards') || command.includes('go to points')) {
      setCurrentTab('rewards');
      speakVoiceFeedback('Claims hub loaded. Check your points ledger.');
    } else if (command.includes('go to cart') || command.includes('open cart')) {
      setCurrentTab('cart');
      speakVoiceFeedback('Academic cart items listed.');
    } else if (command.includes('go to exchange') || command.includes('book exchange')) {
      setCurrentTab('exchange');
      speakVoiceFeedback('S2S student book marketplace is loaded.');
    } else if (command.includes('go to dashboard') || command.includes('my dashboard')) {
      setCurrentTab('dashboard');
      speakVoiceFeedback('Stanford regional student dashboard is customized.');
    } else if (command.includes('go to contact') || command.includes('help')) {
      setCurrentTab('contact');
      speakVoiceFeedback('Help center is ready.');
    } 
    
    // 2. Search commands of catalog
    else if (command.includes('search for') || command.includes('look for') || command.includes('search')) {
      const parts = command.split(/search for|search|look for/);
      if (parts.length > 1) {
        const query = parts[1].trim();
        setSearchQuery(query);
        setCurrentTab('shop');
        speakVoiceFeedback(`Filtering catalog items for title: "${query}".`);
      }
    } 

    // 3. Purchase / Cart addition commands
    else if (command.includes('buy') || command.includes('add') || command.includes('add to cart')) {
      // Find matching items from catalogue
      let matchProduct: Product | undefined;
      if (command.includes('calculus') || command.includes('math')) {
        matchProduct = products.find(p => p.id === 'b1');
      } else if (command.includes('physics') || command.includes('engineers')) {
        matchProduct = products.find(p => p.id === 'b2');
      } else if (command.includes('biology') || command.includes('ap chemistry')) {
        matchProduct = products.find(p => p.id === 'b3');
      } else if (command.includes('drafting kit') || command.includes('drawing')) {
        matchProduct = products.find(p => p.id === 's1');
      } else if (command.includes('fineliner') || command.includes('pen') || command.includes('marker')) {
        matchProduct = products.find(p => p.id === 's2');
      } else if (command.includes('simulation') || command.includes('interactive lab')) {
        matchProduct = products.find(p => p.id === 'd2');
      } else if (command.includes('classroom pass') || command.includes('annual pass')) {
        matchProduct = products.find(p => p.id === 'd1');
      }

      if (matchProduct) {
        handleAddToCart(matchProduct);
        speakVoiceFeedback(`Excellent scholastic choice! Added ${matchProduct.name} to your Academic Cart.`);
      } else {
        speakVoiceFeedback('I could not precisely match that product. You can try saying "Add calculus" or "Buy physics".');
      }
    } else {
      speakVoiceFeedback(`Processed speech: "${command}". For help, try saying: "Go to shop" or "Buy advanced calculus".`);
    }
  };

  const speakVoiceFeedback = (text: string) => {
    setSpeechFeedback(text);
    setIsSpeaking(true);
    speakText(text, false, () => {
      setIsSpeaking(false);
    });
  };

  // Safe Text-To-Speech Reader trigger
  const handleTTS = (text: string) => {
    setIsSpeaking(prev => !prev);
    speakText(text, isSpeaking, () => setIsSpeaking(false));
  };

  // E-commerce Cart Handlers
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx !== -1) {
        const fresh = [...prev];
        fresh[idx] = { ...fresh[idx], quantity: fresh[idx].quantity + quantity };
        return fresh;
      }
      return [...prev, { product, quantity }];
    });

    // Notify with micro feedback log
    triggerNotification(`Shopping Cart updated: +${quantity}x ${product.name}`);
  };

  const handleUpdateCartQty = (pId: string, qty: number) => {
    setCart(prev => prev.map(item => item.product.id === pId ? { ...item, quantity: qty } : item));
  };

  const handleRemoveCartItem = (pId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== pId));
    triggerNotification(`Removed item from Cart ledger.`);
  };

  const handleProceedToCheckout = (promoCou: Coupon | null) => {
    setActivePromo(promoCou);
    setCurrentTab('checkout');
  };

  const handleOrderCompletion = (completedOrder: Order) => {
    setOrders(prev => [completedOrder, ...prev]);
    setCart([]); // Clear cart
    setActivePromo(null);
    setCurrentTab('dashboard'); // Redirect to profile to track
    
    // Earn scholastic eduPoints: 10 points per dollar spent!
    const pointsGained = Math.round(completedOrder.total * 10);
    setEduPoints(prev => prev + pointsGained);

    triggerNotification(`🏛️ Academic order authorized! Gained +${pointsGained} EduPoints Scholar Rewards.`);
    alert(`Order authorised successfully! You have earned +${pointsGained} EduPoints! Track your shipment live in the status terminal.`);
  };

  // Tab change validator
  const triggerNotification = (notif: string) => {
    setNotifications(prev => [notif, ...prev.slice(0, 8)]);
  };

  // CLAIM STUDENT STATUS verification simulation
  const handleVerifyStudentStatus = () => {
    setIsStudentVerified(true);
    triggerNotification('🎓 Scholar membership active! Plat 30% textbook markdown enabled.');
    alert('Student ID verified using campus directory database! Stanford scholastic pricing (30% off physical books & up to 60% courses) is active.');
  };

  // Semester Shopping Assistant database generator
  const compileSemesterBooksList = () => {
    setIsCourseCompiled(true);
    // Select products logically targeting Course details
    let courseItems: Product[] = [];
    if (selectedCourseGroup === 'Computer Science') {
      courseItems = products.filter(p => p.id === 'c1' || p.id === 's1' || p.id === 'd1');
    } else if (selectedCourseGroup === 'Molecular Biology & Genetics') {
      courseItems = products.filter(p => p.id === 'b3' || p.id === 's2' || p.id === 'd1');
    } else if (selectedCourseGroup === 'Physics & Astronomy') {
      courseItems = products.filter(p => p.id === 'b2' || p.id === 'd2' || p.id === 's1');
    } else if (selectedCourseGroup === 'Applied Math & Logic') {
      courseItems = products.filter(p => p.id === 'b1' || p.id === 's1' || p.id === 'c1');
    } else {
      // General Fallback mixes
      courseItems = products.filter(p => p.id === 'b1' || p.id === 's2' || p.id === 'd1');
    }
    setCourseEssentialsList(courseItems);
    triggerNotification(`Semester list compiled for: ${selectedUni} (Group Science)`);
  };

  const addAllSemesterBooksToCart = () => {
    if (courseEssentialsList.length === 0) return;
    courseEssentialsList.forEach(item => {
      handleAddToCart(item, 1);
    });
    alert(`Added all ${courseEssentialsList.length} course essential books and materials to your academic cart! Quick checkout options active.`);
    setCurrentTab('cart');
  };

  // Smart Product Scanner Simulation
  const handleScannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScannerFile(file);
    setScannerPreview(URL.createObjectURL(file));
    setScannerResult(null);
    setIsScanning(true);

    // Simulate sophisticated academic OCR layout recognition
    setTimeout(() => {
      setIsScanning(false);
      // Determine match product based on random or filename seed
      const matchP = products[Math.floor(Math.random() * products.length)];
      setScannerResult({
        detectedTitle: `${matchP.name} (Matched with campus syllabus guides)`,
        description: `EduVerse AI scanned layout features. We recognized keywords mapping to ${matchP.subcategory} & course syllabus requirements.`,
        recommendedProduct: matchP,
        confidence: 94.8
      });
      triggerNotification(`Scanner successfully resolved book matching: ${matchP.name}`);
    }, 2000);
  };

  // used Book post form
  const handlePostUsedBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsedTitle.trim() || !newUsedAuthor.trim() || !newUsedSeller.trim() || !newUsedContact.trim()) {
      alert('Please fill out all required fields for student used book exchange.');
      return;
    }

    const newListing: UsedBookListing = {
      id: 'ulist_' + Math.floor(Math.random() * 89999 + 10000),
      title: newUsedTitle,
      author: newUsedAuthor,
      condition: newUsedCondition,
      price: Number(newUsedPrice) || 12.00,
      sellerName: newUsedSeller,
      sellerContact: newUsedContact,
      courseCode: newUsedCourse.toUpperCase()
    };

    setUsedBooks(prev => [newListing, ...prev]);
    setNewUsedTitle('');
    setNewUsedAuthor('');
    setNewUsedSeller('');
    setNewUsedContact('');
    setNewUsedCourse('');
    setShowUsedBookForm(false);
    triggerNotification(`Created used listing: ${newListing.title}`);
    alert('Your textbook listing has been uploaded to the S2S peer board! Nearby campus researchers will see your email contact.');
  };

  // Help Desk support request submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactSubject.trim() || !contactMessage.trim()) return;

    setTicketState('submitting');
    setTimeout(() => {
      setTicketState('success');
      setContactSubject('');
      setContactMessage('');
      triggerNotification(`Support Ticket registered successfully.`);
    }, 1500);
  };

  // Admin Custom Inventoy Addition
  const handleAdminAddInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminSub.trim()) return;

    const newPr: Product = {
      id: 'custom_' + Math.floor(Math.random() * 89999 + 10000),
      name: adminName,
      category: adminCategory,
      subcategory: adminSub,
      price: Number(adminPrice),
      originalPrice: Number(adminPrice) * 1.3,
      description: 'Custom curriculum item registered dynamically via Admin Dashboard interface.',
      rating: 4.8,
      reviewsCount: 1,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
      features: ['University accredited specification guide', 'Student discount ready'],
      stock: Number(adminStock),
      studentDiscount: 20,
      academicLevel: adminLevel,
      brand: 'Stanford Campus Outpost',
      deliveryDays: 3
    };

    setProducts(prev => [newPr, ...prev]);
    // Save to custom storage list
    const currentCustoms = getStoredData<Product[]>(STORAGE_KEYS.STUDENT_STOCKS, []);
    setStoredData(STORAGE_KEYS.STUDENT_STOCKS, [...currentCustoms, newPr]);

    setAdminName('');
    setAdminSub('');
    setAdminStock(30);
    alert(`Success! Successfully added "${newPr.name}" to the active EduVerse AI store catalog.`);
  };

  // Redeem rewards code
  const redeemRewardItem = (reward: any) => {
    if (eduPoints < reward.cost) {
      alert(`Insufficient EduPoints balance. You need ${reward.cost} points, but currently have ${eduPoints} points.`);
      return;
    }

    setEduPoints(prev => prev - reward.cost);
    triggerNotification(`Redeemed scholar reward: ${reward.title}`);
    alert(`Congratulations! You have successfully redeemed "${reward.title}". Access codes will dispatch to your sravanthi.m@stanford.edu dashboard immediately.`);
  };

  // AI-Powered search suggestions generator as query types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setAiSuggestions([]);
      return;
    }

    const triggerSuggestions = async () => {
      try {
        const response = await fetch('/api/ai/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery })
        });
        const data = await response.json();
        if (data.suggestions) {
          setAiSuggestions(data.suggestions);
        }
      } catch (err) {
        console.error('Error fetching AI suggestions:', err);
      }
    };

    const delayDebounce = setTimeout(() => {
      triggerSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Wishlist toggler handles active changes
  const toggleWishlistItem = (product: Product) => {
    setWishlist(prev => {
      const idx = prev.findIndex(p => p.id === product.id);
      if (idx !== -1) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  return (
    <div className={darkMode ? 'dark text-slate-100' : 'text-slate-900 bg-slate-50'}>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 pb-20 xl:pb-0">
        
        {/* Navigation sticky */}
        <Navigation 
          currentTab={currentTab}
          setCurrentTab={(tabId) => {
            setCurrentTab(tabId);
            setSelectedProduct(null); // Clear detail view when changing tab
          }}
          cart={cart}
          wishlist={wishlist}
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(!darkMode)}
          isStudentVerified={isStudentVerified}
          verifyStudent={handleVerifyStudentStatus}
          notifications={notifications}
          clearNotifications={() => setNotifications([])}
          eduPoints={eduPoints}
        />

        {/* Global Voice COMMERCE floating panel */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-3.5 px-4 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isVoiceActive ? 'bg-red-500' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isVoiceActive ? 'bg-red-650' : 'bg-emerald-500'}`}></span>
              </span>
              <p className="text-xs font-mono truncate max-w-xl">
                <strong>Voice Commerce:</strong> {speechFeedback}
              </p>
            </div>
            
            <div className="flex items-center space-x-3 shrink-0">
              {voiceTranscript && (
                <span className="text-[10px] bg-indigo-950/60 text-indigo-300 font-mono py-1 px-3.5 rounded-full border border-indigo-500/20 max-w-xs truncate">
                  "{voiceTranscript}"
                </span>
              )}
              <button
                onClick={startVoiceCommerce}
                className={`py-1.5 px-3.5 rounded-full font-button text-[11px] font-bold uppercase transition flex items-center space-x-2 shadow cursor-pointer ${
                  isVoiceActive 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-white hover:bg-slate-50 text-indigo-900 font-semibold'
                }`}
              >
                {isVoiceActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-blue-600" />}
                <span>{isVoiceActive ? 'Stop Mic' : 'Activate Voice Assist'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Frame Shell */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* PAGE DETAILS RENDER DETECTOR */}
          {selectedProduct ? (
            <div className="space-y-8 animate-fadeIn" id="product-detail-layout">
              {/* Breadcrumb row */}
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="flex items-center space-x-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go back to store</span>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
                {/* Images */}
                <div className="space-y-4">
                  <div className="w-full h-80 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Hyperlocal quick badge */}
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/40 rounded-xl">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 font-bold px-2 py-0.5 rounded font-mono uppercase">Hyperlocal Campus Delivery</span>
                    <p className="text-xs text-slate-800 dark:text-slate-300 mt-2 font-medium">🚀 Same-Day Delivery is active for regional Stanford Residence Dorms.</p>
                  </div>
                </div>

                {/* Info and Actions */}
                <div className="space-y-6 text-left">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-550 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-850 px-2.5 py-1 rounded-full uppercase tracking-tight font-button">
                      {selectedProduct.subcategory}
                    </span>
                    <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white mt-3 leading-snug">
                      {selectedProduct.name}
                    </h1>
                    <p className="text-xs text-slate-400 mt-1.5 font-mono">Published by {selectedProduct.brand} | Course Level: {selectedProduct.academicLevel}</p>
                  </div>

                  {/* Rating summary */}
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded flex items-center space-x-1">
                      <span>★</span>
                      <span>{selectedProduct.rating}</span>
                    </div>
                    <span className="text-slate-400">({selectedProduct.reviewsCount} verified Stanford purchases)</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-body">
                    {selectedProduct.description}
                  </p>

                  <div className="border-t border-b border-slate-100 dark:border-slate-800 py-4.5 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Academics Price</span>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <span className="font-mono text-xl sm:text-2xl font-black text-rose-500">
                          {formatCurrency(selectedProduct.price * (1 - (isStudentVerified ? selectedProduct.studentDiscount / 100 : 0)))}
                        </span>
                        {isStudentVerified && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatCurrency(selectedProduct.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {isStudentVerified && (
                      <div className="text-right">
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded dark:bg-emerald-950/20 dark:text-emerald-400 font-button">
                          🎓 Scholar Rate Applied (-{selectedProduct.studentDiscount}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bullet points highlights */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-slate-400">Accreditation Bulletins</h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-350">
                      {selectedProduct.features.map((ft, fidx) => (
                        <li key={fidx} className="flex items-center space-x-2">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{ft}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Buy Add controls */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleAddToCart(selectedProduct, 1)}
                      className="flex-1 py-3 bg-indigo-50 hover:bg-indigo-100 text-blue-700 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-indigo-300 font-button text-xs font-bold uppercase rounded-xl transition"
                    >
                      Add to Scholar Cart
                    </button>
                    <button
                      onClick={() => {
                        handleAddToCart(selectedProduct, 1);
                        setCurrentTab('cart');
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:opacity-95 text-white font-button text-xs font-black uppercase rounded-xl shadow transition"
                    >
                      Instant Purchase
                    </button>
                    <button
                      onClick={() => toggleWishlistItem(selectedProduct)}
                      className={`p-3 rounded-xl border ${wishlist.some(wl => wl.id === selectedProduct.id) ? 'text-pink-500 border-pink-200 bg-pink-50/20' : 'text-slate-400 hover:text-pink-400'}`}
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Related materials list */}
              <div className="space-y-4">
                <h3 className="font-heading text-lg font-bold">Related Academic Materials & Bundles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {products.filter(p => p.id !== selectedProduct.id).slice(0, 4).map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedProduct(item)}
                      className="bg-white dark:bg-slate-900 p-4 border rounded-2xl cursor-pointer hover:shadow-lg transition text-left"
                    >
                      <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-50 mb-3">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] text-blue-500 font-bold">{item.subcategory}</span>
                      <h4 className="font-bold text-xs mt-1 truncate">{item.name}</h4>
                      <p className="font-mono text-slate-800 dark:text-slate-100 font-bold text-xs mt-1.5">{formatCurrency(item.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Routing Tabs Control */}

              {/* VIEW 1: HOME PAGE */}
              {currentTab === 'home' && (
                <div className="space-y-12 animate-fadeIn" id="home-view-box">
                  
                  {/* Apple inspired futuristic design banner */}
                  <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-12 relative overflow-hidden shadow-2xl border border-indigo-900/30">
                    <div className="absolute top-0 right-0 p-4 opacity-15 pointer-events-none">
                      <Cpu className="w-96 h-96 animate-spin text-indigo-500" />
                    </div>

                    <div className="max-w-2xl text-left space-y-6 relative z-10">
                      <span className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 font-mono text-[11px] py-1.5 px-4 rounded-full font-bold uppercase tracking-widest border border-indigo-550/30">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                        <span>EduVerse Academic Hub</span>
                      </span>

                      <h1 className="font-heading font-extrabold text-3xl sm:text-5xl leading-tight tracking-tight text-white">
                        Where Learning Meets <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-300 bg-clip-text text-transparent">Smart Shopping</span>
                      </h1>
                      
                      <p className="font-body text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                        The ultimate high-fidelity textbook, course subscription, and scholastic draft-gear center for university researchers, high schoolers, and teachers.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 pt-3">
                        <button
                          onClick={() => setCurrentTab('shop')}
                          className="px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:brightness-105 font-button text-xs font-black uppercase text-white rounded-xl shadow-lg transition"
                        >
                          Explore Academic Gear
                        </button>
                        <button
                          onClick={() => setCurrentTab('mentor')}
                          className="px-6 py-3.5 bg-slate-950/75 hover:bg-slate-950 text-indigo-300 font-button text-xs font-semibold uppercase rounded-xl border border-indigo-500/20 transition flex items-center justify-center space-x-2"
                        >
                          <Cpu className="w-4 h-4 text-blue-500" />
                          <span>Launch Academic Mentor</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* AI Smart Search with real suggestion feedback list */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md text-left max-w-4xl mx-auto -mt-10 relative z-20">
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search books, geometrical drafting gear, interactive digital simulation blocks..."
                          className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 border focus:border-indigo-500 text-left placeholder-slate-400"
                        />
                        {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Display AI Smart Suggestions dynamically! */}
                      {aiSuggestions.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border animate-slideDown">
                          <p className="text-[10px] font-bold text-indigo-550 dark:text-indigo-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 animate-pulse" />
                            <span>AI-Generated Seed Queries</span>
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {aiSuggestions.map((sug, suIdx) => (
                              <button
                                key={suIdx}
                                onClick={() => {
                                  setSearchQuery(sug);
                                  setCurrentTab('shop');
                                }}
                                className="text-xs bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-650 px-3.5 py-1 rounded-lg border font-mono font-medium"
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Highlight Categories */}
                  <div className="space-y-4 text-left">
                    <h3 className="font-heading text-xl font-bold">Featured Academic Sections</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { id: 'books', name: 'Syllabus Textbooks', count: 'Advanced materials & analysis', icon: '📚', bg: 'bg-blue-50/50 dark:bg-blue-950/20' },
                        { id: 'stationery', name: 'Geometrical Stationery', count: 'Drafting gear & calibrators', icon: '✏️', bg: 'bg-purple-50/50 dark:bg-purple-950/20' },
                        { id: 'digital', name: 'Virtual Simulations', count: 'Syllabus software keys', icon: '💻', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20' },
                        { id: 'courses', name: 'Masterclasses', count: 'Diagnotic exam preps', icon: '🎓', bg: 'bg-amber-50/50 dark:bg-amber-900/10' }
                      ].map(cat => (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setCurrentTab('shop');
                          }}
                          className={`p-6 rounded-2xl cursor-pointer hover:shadow-md transition text-left border border-slate-100 dark:border-slate-800 ${cat.bg}`}
                        >
                          <span className="text-3xl">{cat.icon}</span>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-4">{cat.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-1">{cat.count}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trending Books list */}
                  <div className="space-y-4 text-left">
                    <div className="flex justify-between items-center">
                      <h3 className="font-heading text-xl font-bold flex items-center space-x-2">
                        <Flame className="w-5 h-5 text-indigo-500 animate-pulse" />
                        <span>Trending Campus Textbook Releases</span>
                      </h3>
                      <button onClick={() => setCurrentTab('shop')} className="text-xs text-blue-600 hover:underline">View All</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {products.filter(p => p.category === 'books').map(book => (
                        <div
                          key={book.id}
                          className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border hover:shadow-lg transition flex flex-col justify-between"
                        >
                          <div className="w-full h-44 overflow-hidden relative bg-slate-50">
                            <img src={book.image} alt={book.name} className="w-full h-full object-cover" />
                            <span className="absolute top-2.5 left-2.5 bg-indigo-650 bg-blue-600 text-white font-mono font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase">
                              {book.subcategory}
                            </span>
                          </div>
                          
                          <div className="p-5 flex-1 flex flex-col justify-between text-left">
                            <div>
                              <span className="text-[10px] text-slate-400">Accredited: {book.brand}</span>
                              <h4 className="font-bold text-xs sm:text-sm mt-1.5 line-clamp-1 text-slate-900 dark:text-white">{book.name}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{book.description}</p>
                            </div>

                            <div className="pt-4 mt-4 border-t flex justify-between items-center">
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase leading-none block">From</span>
                                <span className="font-mono text-sm font-black text-rose-500">{formatCurrency(book.price)}</span>
                              </div>
                              <button
                                onClick={() => setSelectedProduct(book)}
                                className="px-3.5 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase transition"
                              >
                                View Specs
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best selling stationery card details */}
                  <div className="space-y-4 text-left">
                    <h3 className="font-heading text-xl font-bold">Best-Selling Geometrical Stationery</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {products.filter(p => p.category === 'stationery').map(stat => (
                        <div
                          key={stat.id}
                          className="bg-white dark:bg-slate-900 border rounded-2xl p-5 flex space-x-4 items-center cursor-pointer hover:shadow hover:border-indigo-500/20 transition"
                          onClick={() => setSelectedProduct(stat)}
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                            <img src={stat.image} alt={stat.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <span className="text-[9px] text-blue-500 font-bold uppercase tracking-tight">{stat.subcategory}</span>
                            <h4 className="font-bold text-xs truncate text-slate-900 dark:text-white mt-0.5">{stat.name}</h4>
                            <p className="font-mono text-xs font-black text-slate-800 dark:text-slate-100 mt-1">{formatCurrency(stat.price)}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Student coupon promos ledger banner */}
                  <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-650 p-6 sm:p-8 rounded-3xl text-white flex flex-col sm:flex-row justify-between items-center gap-6 text-left">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 text-emerald-100 py-1 px-3.5 rounded-full border border-white/10">Active Campus Promotions</span>
                      <h3 className="font-heading text-lg sm:text-xl font-extrabold text-white">Save an Extra 30% with Scholarship Passes</h3>
                      <p className="text-xs text-emerald-100 leading-relaxed max-w-xl">Clip code STUDENT30 at checkout to unlock direct physical manual reductions. Exclusive to registered Stanford portal graduates.</p>
                    </div>
                    <button
                      onClick={() => handleVerifyStudentStatus()}
                      className="px-5 py-3 bg-white text-emerald-900 hover:bg-slate-50 font-button text-xs font-bold uppercase tracking-wider rounded-xl transition shadow"
                    >
                      {isStudentVerified ? '🏛️ Code Linked successfully' : 'Verify Student ID'}
                    </button>
                  </div>

                  {/* AI Mentor preview block */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border text-left grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
                    <div className="md:col-span-3 space-y-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-slate-850 text-indigo-700 dark:text-indigo-400 text-xs font-mono font-bold">
                        <Cpu className="w-3.5 h-3.5 animate-pulse" />
                        <span>AI Cognitive Assistant active</span>
                      </span>

                      <h3 className="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        24/7 Academic Doubt Solving Engine
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                        Solve thermodynamic integrations, calculus proofs, physics free-body vector formulas, or molecular structures. Supported by continuous server-side Gemini 3.5 Flash layers.
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentTab('mentor')}
                          className="px-4 py-2.5 bg-slate-900 hover:bg-blue-600 font-button text-xs font-bold uppercase text-white rounded-xl transition"
                        >
                          Query Doubt Solver
                        </button>
                        <button
                          onClick={() => setCurrentTab('planner')}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 text-xs font-bold uppercase rounded-xl transition"
                        >
                          Generate Calendar Plan
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[11px] font-mono font-bold text-slate-450 uppercase">Active Tutor Sandbox</span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        "Find the derivative of x^x using log laws..."
                      </p>
                      <button
                        onClick={() => {
                          setCurrentTab('mentor');
                        }}
                        className="w-full py-1.5 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-lg border text-center font-mono"
                      >
                        Run solution trace
                      </button>
                    </div>
                  </div>

                  {/* Partner Universities Section */}
                  <div className="space-y-4 text-center">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Governing Academic Directories</p>
                    <div className="flex justify-center flex-wrap gap-6 sm:gap-12 opacity-65 grayscale hover:grayscale-0 transition-all">
                      <span className="font-serif font-black text-slate-500 text-xs sm:text-sm">STANFORD UNIVERSITY</span>
                      <span className="font-serif font-black text-slate-500 text-xs sm:text-sm">MIT RESEARCH</span>
                      <span className="font-serif font-black text-slate-500 text-xs sm:text-sm">UC BERKELEY</span>
                      <span className="font-serif font-black text-slate-500 text-xs sm:text-sm">OXFORD ADVISORY</span>
                    </div>
                  </div>

                  {/* Testimonies block */}
                  <div className="space-y-4 text-left">
                    <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Testimonials</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {SAMPLE_REVIEWS.map(rev => (
                        <div key={rev.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 space-y-3">
                          <div className="flex items-center space-x-1.5 text-amber-500">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <span key={i}>★</span>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500 leading-normal">"{rev.comment}"</p>
                          <div className="pt-2 border-t flex justify-between items-center text-[10px] text-slate-400">
                            <strong>{rev.author}</strong>
                            <span>{rev.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* VIEW 2: PRODUCT CATALOG */}
              {currentTab === 'shop' && (
                <div className="space-y-8 animate-fadeIn" id="shop-view-box">
                  <div className="text-left">
                    <h1 className="font-heading font-extrabold text-2xl text-slate-950 dark:text-white">Syllabus Store Catalog</h1>
                    <p className="text-xs text-slate-400 mt-1">Academics, draft equipment, and interactive laboratory modules checked to Stanford Residence Regions.</p>
                  </div>

                  {/* Semester Shopping Assistant Integration on Shop Page too! */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-slate-900 border border-blue-200 dark:border-slate-800 p-5 rounded-3xl text-left grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="md:col-span-1">
                      <span className="text-[10px] bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded uppercase font-mono">Curriculum Module</span>
                      <h4 className="font-bold text-xs sm:text-sm mt-1.5 text-slate-900 dark:text-white">Semester Shopping Assistant</h4>
                      <p className="text-[10px] text-slate-450 mt-1">Select course and auto-compile textbook kits.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:col-span-2">
                      <select 
                        value={selectedUni} 
                        onChange={(e) => {setSelectedUni(e.target.value); setIsCourseCompiled(false);}}
                        className="text-xs p-2 bg-white dark:bg-slate-950 border rounded-lg focus:outline-none"
                      >
                        <option>Stanford University</option>
                        <option>MIT Core Labs</option>
                        <option>UC Berkeley Courseware</option>
                        <option>Harvard Outpost</option>
                      </select>
                      <select 
                        value={selectedCourseGroup} 
                        onChange={(e) => {setSelectedCourseGroup(e.target.value); setIsCourseCompiled(false);}}
                        className="text-xs p-2 bg-white dark:bg-slate-950 border rounded-lg focus:outline-none"
                      >
                        <option>Computer Science</option>
                        <option>Molecular Biology & Genetics</option>
                        <option>Physics & Astronomy</option>
                        <option>Applied Math & Logic</option>
                      </select>
                      <select 
                        value={selectedSemester} 
                        onChange={(e) => {setSelectedSemester(e.target.value); setIsCourseCompiled(false);}}
                        className="text-xs p-2 bg-white dark:bg-slate-950 border rounded-lg focus:outline-none"
                      >
                        <option>Fall 2026</option>
                        <option>Winter 2026</option>
                        <option>Spring 2027</option>
                      </select>
                    </div>

                    <div className="md:col-span-1 flex flex-col gap-1.5">
                      <button
                        onClick={compileSemesterBooksList}
                        className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase transition"
                      >
                        Autofill Materials List
                      </button>
                      {isCourseCompiled && (
                        <button
                          onClick={addAllSemesterBooksToCart}
                          className="py-1 bg-emerald-500 hover:bg-emerald-650 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider block"
                        >
                          Add Bundle to Cart
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Compiled essentials banner matches course group selection */}
                  {isCourseCompiled && courseEssentialsList.length > 0 && (
                    <div className="p-4 bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-2xl text-left animate-fadeIn">
                      <p className="text-xs font-bold text-emerald-600 flex items-center space-x-1.5 uppercase tracking-wide">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Resolved course essentials list ({selectedCourseGroup}):</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                        {courseEssentialsList.map(item => (
                          <div key={item.id} className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 border flex items-center justify-between text-xs font-mono">
                            <span className="truncate max-w-[70%]">{item.name}</span>
                            <span className="font-bold text-rose-500">{formatCurrency(item.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* OCR Smart scanner simulation widget */}
                  <div className="bg-slate-900 text-white p-5 rounded-3xl text-left flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="space-y-1 md:max-w-xl">
                      <span className="text-[9px] uppercase font-bold tracking-widest bg-white/10 text-emerald-300 py-1 px-3.5 rounded-full border border-white/5 font-mono">Smart Book Scanner</span>
                      <h4 className="font-heading text-base font-extrabold text-white mt-1.5">Upload textbook cover or homework sheets</h4>
                      <p className="text-xs text-slate-350 leading-relaxed">Drop an image to trigger advanced OCR. Our AI identifies formulas or subject taxonomy and references textbook catalogs instantly.</p>
                    </div>

                    <div className="shrink-0 flex items-center space-x-3">
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="books-ocr-scanner-file" 
                        onChange={handleScannerUpload} 
                        className="hidden" 
                      />
                      <label 
                        style={{ cursor: 'pointer' }}
                        htmlFor="books-ocr-scanner-file"
                        className="px-4.5 py-3 bg-white hover:bg-slate-50 text-slate-900 font-button text-xs font-bold uppercase rounded-xl transition flex items-center space-x-2"
                      >
                        <Camera className="w-4 h-4 text-indigo-600 animate-pulse" />
                        <span>Select Cover Image</span>
                      </label>
                    </div>
                  </div>

                  {/* Scanner result panel */}
                  {isScanning && (
                    <div className="p-6 bg-slate-900 text-white rounded-2xl flex items-center justify-center space-x-3">
                      <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                      <span className="text-xs font-mono font-bold tracking-wide">AI scanner model is extracting metadata matrices...</span>
                    </div>
                  )}

                  {scannerResult && (
                    <div className="p-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-indigo-500 rounded-3xl text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slideDown">
                      <div className="space-y-1 max-w-lg">
                        <span className="text-[9px] uppercase font-bold tracking-wider bg-indigo-50 text-indigo-750 px-2 py-0.5 rounded font-mono">OCR Resolve Match Confirmed (Confidence {scannerResult.confidence}%)</span>
                        <h4 className="font-heading text-sm font-black text-indigo-650 dark:text-indigo-400 mt-1">{scannerResult.detectedTitle}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{scannerResult.description}</p>
                      </div>

                      {scannerResult.recommendedProduct && (
                        <button
                          onClick={() => setSelectedProduct(scannerResult.recommendedProduct!)}
                          className="px-4.5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-bold uppercase transition block shrink-0"
                        >
                          Examine matches specs
                        </button>
                      )}
                    </div>
                  )}

                  {/* Core Filters Panel */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border text-left grid grid-cols-1 md:grid-cols-5 gap-4">
                    
                    {/* Category Filter */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Store Segment</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none"
                      >
                        <option value="all">Deatils (All Segments)</option>
                        <option value="books">📚 Syllabus Textbooks</option>
                        <option value="stationery">✏️ Geometrical Stationery</option>
                        <option value="digital">💻 Virtual Simulations</option>
                        <option value="courses">🎓 Video Masterclasses</option>
                      </select>
                    </div>

                    {/* Academic Level */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Course Grade</label>
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none"
                      >
                        <option value="all">Syllabus Grade (All)</option>
                        <option value="School">School Level AP Prep</option>
                        <option value="College">College Lower Division</option>
                        <option value="University">University Graduate Tracks</option>
                        <option value="Teacher">Teacher organizers</option>
                      </select>
                    </div>

                    {/* Max Price Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <span>Max budget</span>
                        <span className="font-mono text-slate-900 dark:text-white font-bold">${maxPrice}</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Sort by */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Order Criteria</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none"
                      >
                        <option value="rating">Top Accreditations (Rating)</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="stock">High Stock limits</option>
                      </select>
                    </div>

                    {/* Grid view mode toggles */}
                    <div className="flex items-end justify-between sm:justify-start gap-2 h-full">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg border ${viewMode === 'grid' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'text-slate-400'}`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg border ${viewMode === 'list' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'text-slate-400'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                  {/* Render catalog products */}
                  {products.length === 0 ? (
                    <div className="py-12 bg-white rounded-2xl text-center">
                      <p className="text-xs text-slate-400">No active products match that set. Reset standard configurations.</p>
                    </div>
                  ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                      {products
                        .filter(p => {
                          const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
                          const matchesLvl = selectedLevel === 'all' || p.academicLevel === selectedLevel;
                          const matchesPrice = p.price <= maxPrice;
                          const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                p.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
                          return matchesCat && matchesLvl && matchesPrice && matchesSearch;
                        })
                        .sort((a, b) => {
                          if (sortBy === 'rating') return b.rating - a.rating;
                          if (sortBy === 'price-asc') return a.price - b.price;
                          if (sortBy === 'price-desc') return b.price - a.price;
                          if (sortBy === 'stock') return b.stock - a.stock;
                          return 0;
                        })
                        .map(item => {
                          const itemDiscount = isStudentVerified ? item.studentDiscount : 0;
                          const actualPrice = item.price * (1 - itemDiscount / 100);

                          if (viewMode === 'list') {
                            return (
                              <div
                                key={item.id}
                                className="bg-white dark:bg-slate-900 border p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left"
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <span className="text-[9px] uppercase font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded">{item.subcategory}</span>
                                    <h4 className="font-bold text-xs sm:text-base mt-1 text-slate-900 dark:text-white">{item.name}</h4>
                                    <p className="text-xs text-slate-400 leading-normal line-clamp-1">{item.description}</p>
                                  </div>
                                </div>

                                <div className="text-right sm:shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                                  <div className="font-mono font-bold text-sm text-slate-950 dark:text-white">
                                    {formatCurrency(actualPrice)}
                                  </div>
                                  <button
                                    onClick={() => setSelectedProduct(item)}
                                    className="py-1.5 px-3.5 bg-slate-950 hover:bg-blue-600 text-white rounded text-[10px] font-bold uppercase transition"
                                  >
                                    View Specs
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={item.id}
                              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border hover:shadow-md transition flex flex-col justify-between text-left relative group translate-y-0 hover:-translate-y-1"
                              id={`shop-card-${item.id}`}
                            >
                              {/* Thumbnail cover */}
                              <div className="w-full h-44 overflow-hidden bg-slate-50 relative">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 duration-300 transition-transform" />
                                <span className="absolute top-2.5 left-2.5 bg-white/95 dark:bg-slate-900/95 shadow text-[9px] font-mono font-extrabold px-2.5 py-0.5 rounded-full uppercase text-slate-800 dark:text-slate-200">
                                  {item.subcategory}
                                </span>
                              </div>

                              <div className="p-5 flex-1 flex flex-col justify-between">
                                <div className="space-y-1.5">
                                  <span className="text-[10px] text-slate-400 font-mono">Curator: {item.brand}</span>
                                  <h4 className="font-heading text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1 h-5">{item.name}</h4>
                                  <p className="text-[11px] text-slate-500 leading-normal line-clamp-2 h-9">{item.description}</p>
                                </div>

                                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                                  <div>
                                    <span className="text-[8px] text-slate-400 uppercase leading-none block">Syllabus Price</span>
                                    <span className="font-mono text-sm font-black text-rose-500 block">{formatCurrency(actualPrice)}</span>
                                  </div>

                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => handleAddToCart(item, 1)}
                                      className="p-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-blue-700 dark:bg-slate-800 dark:text-blue-300 rounded-lg text-[10px] font-bold uppercase transition"
                                    >
                                      Add
                                    </button>
                                    <button
                                      onClick={() => setSelectedProduct(item)}
                                      className="p-1 px-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase transition hover:bg-blue-600"
                                    >
                                      Specs
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                </div>
              )}

              {/* VIEW 3: CATEGORIES ONLY */}
              {currentTab === 'categories' && (
                <div className="space-y-8 animate-fadeIn" id="categories-view-box">
                  <div className="text-left">
                    <h1 className="font-heading font-extrabold text-2xl text-slate-950 dark:text-white">Academic Categorizations Map</h1>
                    <p className="text-xs text-slate-400 mt-1">Structured subdivisions aligning textbook outlines, drawing portfolios, chemistry and algorithms simulations.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    {[
                      { title: '📚 Core Syllabus Curriculums', count: 'MATH51, BIO101, AP physics manuals', desc: 'Accredited physical textbooks matching University Board standards with 30% verified discounts.', link: 'books' },
                      { title: '📐 Geometrical Drawing Tools', count: 'Carbon drafting kits, triangular rules, triangular layouts', desc: 'Ergonomic geometry and writing packages that do not bleed through Cream sheets core material.', link: 'stationery' },
                      { title: '🔬 Digital WebGL Simulations', count: '3D vector fluid, particles simulation, algebra software', desc: 'Cloud simulators featuring lifetime diagnostic forums support and quick-swap activations.', link: 'digital' },
                      { title: '🎖️ Video Masterclass Guides', count: 'Data structures, algorithm complexity keys, SAT verbal', desc: 'Certificate of completion modules designed under Ivy League guidance for software interview readiness.', link: 'courses' }
                    ].map((seg, sIdx) => (
                      <div key={sIdx} className="bg-white dark:bg-slate-900 border p-6 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
                        <div className="space-y-2">
                          <h3 className="font-heading font-extrabold text-base text-indigo-650 dark:text-indigo-400">{seg.title}</h3>
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-mono py-1 px-3.5 rounded-full">{seg.count}</span>
                          <p className="text-xs text-slate-500 leading-normal">{seg.desc}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedCategory(seg.link);
                            setCurrentTab('shop');
                          }}
                          className="w-full text-center py-2.5 bg-slate-905 bg-slate-50 hover:bg-indigo-50 border rounded-xl text-xs font-semibold hover:text-indigo-600 transition uppercase"
                        >
                          Access mapped resources
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW 4: AI ACADEMIC MENTOR */}
              {currentTab === 'mentor' && (
                <div className="space-y-6 animate-fadeIn" id="mentor-view-box">
                  <div className="text-left">
                    <h1 className="font-heading font-extrabold text-2xl text-slate-950 dark:text-white">EduVerse AI Academic Mentor</h1>
                    <p className="text-xs text-slate-400 mt-1 font-mono">24/7 deconstructed theory trace solver, exam planning matrix, and syllabus summarizers.</p>
                  </div>
                  
                  {/* Reuse AIAssistant suite perfectly */}
                  <AIAssistant 
                    academicLevel="University"
                    isStudentVerified={isStudentVerified}
                    onSpeak={handleTTS}
                  />
                </div>
              )}

              {/* VIEW 5: STUDY PLANNER */}
              {currentTab === 'planner' && (
                <div className="space-y-6 animate-fadeIn" id="planner-view-box">
                  <div className="text-left">
                    <h1 className="font-heading font-extrabold text-2xl text-slate-950 dark:text-white">Scholastic Study Planner Program</h1>
                    <p className="text-xs text-slate-405 mt-1">Draft beautifully scheduled day-by-day objectives, milestones, and diagnostic recommendations.</p>
                  </div>

                  {/* Render dynamic study planner direct interface */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
                    
                    <div className="lg:col-span-1 p-5 bg-white dark:bg-slate-900 border rounded-3xl space-y-4">
                      <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wide">Planner Inputs</h4>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Target Subject Syllabus</label>
                        <select 
                          value={selectedCourseGroup} 
                          onChange={(e) => setSelectedCourseGroup(e.target.value)}
                          className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none"
                        >
                          <option>Computer Science</option>
                          <option>Molecular Biology & Genetics</option>
                          <option>Physics & Astronomy</option>
                          <option>Applied Math & Logic</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Study Hours Available</label>
                        <select className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none">
                          <option>2 Hours — Balanced schedule</option>
                          <option>4 Hours — Deep research</option>
                          <option>6 Hours — Exam preparation</option>
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          alert('Initializing dynamic planner sequence... This syncs text matrices using server-side Gemini 3.5 Flash.');
                          setCurrentTab('mentor');
                        }}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase transition"
                      >
                        Draft study plan calendar
                      </button>
                    </div>

                    {/* Standard High-Accreditation Syllabus calendar timeline */}
                    <div className="lg:col-span-3 bg-white dark:bg-slate-900 border p-6 rounded-3xl space-y-5">
                      <h3 className="font-bold text-sm sm:text-base flex items-center space-x-2 border-b pb-3 text-slate-900 dark:text-white">
                        <Calendar className="w-4.5 h-4.5 text-blue-500" />
                        <span>Interactive Academic Calendar Timeline (4-Day Cycle)</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {[
                          { day: 'Day 1', focus: 'Nomenclature', obj: 'Read AP chemistry proofs & note parameters down.', book: 'AP Biology Guide (b3)' },
                          { day: 'Day 2', focus: 'Vector Practice', obj: 'Isolate coordinates under physical constraints.', book: 'Physics for Scientists (b2)' },
                          { day: 'Day 3', focus: 'Mock diagnostic', obj: 'Timed SAT analytical layout workbook.', book: 'Masterclass: CS DS&A (c1)' },
                          { day: 'Day 4', focus: 'Exhaustive Review', obj: 'Simulate WebGL particles flow tests.', book: 'Calculus Analytica (b1)' }
                        ].map((d, dIdx) => (
                          <div key={dIdx} className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-xl space-y-2 text-left">
                            <span className="text-[9px] bg-indigo-50 dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded font-mono block w-fit">{d.day}</span>
                            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-1">{d.focus}</h4>
                            <p className="text-[11px] text-slate-500 leading-normal">{d.obj}</p>
                            <span className="text-[9px] text-blue-500 font-semibold uppercase leading-none block pt-1 border-t">Recom: {d.book}</span>
                          </div>
                        ))}
                      </div>

                      {/* Educational strategies memo */}
                      <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-slate-800/40 border border-amber-200/50 text-xs text-slate-655 text-slate-600 leading-relaxed">
                        💡 <strong>Scholar Tips:</strong> Space your retrieval sequences dynamically across a 3 to 4 day cycle. Studying above 90 minutes without breaks triggers focus fatigue. Use our <strong>Fineliner calibrated set</strong> (s2) to highlight chemical structures.
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* VIEW 6: REWARDS SYSTEM */}
              {currentTab === 'rewards' && (
                <div className="space-y-8 animate-fadeIn" id="rewards-view-box">
                  <div className="text-left">
                    <h1 className="font-heading font-extrabold text-2xl text-slate-950 dark:text-white">EduPoints Scholar Rewards System</h1>
                    <p className="text-xs text-slate-400 mt-1 font-mono">Earn rewards automatically as you study. Every dollar spent on the platform gains +10 EduPoints.</p>
                  </div>

                  {/* Balance ledger card */}
                  <div className="p-6 bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 rounded-3xl text-white text-left shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none">
                      <Sparkles className="w-64 h-64 -mr-10 -mb-10 text-white animate-spin" />
                    </div>

                    <div className="space-y-4">
                      <span className="text-[10px] bg-white/20 text-white font-bold px-3 py-1 rounded-full uppercase border border-white/10 font-mono">Verified Scholar Balance</span>
                      <h2 className="font-heading text-3xl sm:text-4xl font-extrabold">{eduPoints} EduPoints</h2>
                      <p className="text-xs text-amber-50 max-w-sm">Use your active points ledger below to redeem direct crash course credentials, simulation software passes, or engineering dividers.</p>
                    </div>
                  </div>

                  {/* Redeemable items list */}
                  <div className="space-y-4 text-left">
                    <h3 className="font-heading text-lg font-bold">Redeemable Rewards</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {rewardsList.map(reward => (
                        <div key={reward.id} className="bg-white dark:bg-slate-900 border rounded-3xl p-5 flex flex-col justify-between text-left space-y-4">
                          <div className="space-y-2">
                            <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-50">
                              <img src={reward.image} alt={reward.title} className="w-full h-full object-cover" />
                            </div>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{reward.title}</h4>
                            <p className="text-xs text-slate-450 leading-normal">{reward.description}</p>
                          </div>

                          <div className="pt-3 border-t flex justify-between items-center">
                            <span className="text-xs font-extrabold text-amber-500 font-button">{reward.cost} pts</span>
                            <button
                              onClick={() => redeemRewardItem(reward)}
                              className="px-3.5 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase transition"
                            >
                              Claim Code
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* VIEW 7: BOOK EXCHANGE MARKETPLACE */}
              {currentTab === 'exchange' && (
                <div className="space-y-8 animate-fadeIn" id="exchange-view-box">
                  <div className="text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h1 className="font-heading font-extrabold text-2xl text-slate-950 dark:text-white">Peer Book Exchange Marketplace</h1>
                      <p className="text-xs text-slate-400 mt-1">Student-to-student marketplace. Buy, trade or sell pre-owned textbooks directly on campus.</p>
                    </div>
                    <button
                      onClick={() => setShowUsedBookForm(!showUsedBookForm)}
                      className="px-4.5 py-2.5 bg-gradient-to-r from-blue-650 to-indigo-650 bg-blue-600 text-white rounded-xl text-xs font-semibold uppercase transition shadow"
                    >
                      {showUsedBookForm ? 'Cancel Listing' : 'Post Textbook For Sale'}
                    </button>
                  </div>

                  {/* Post textbook listing form */}
                  {showUsedBookForm && (
                    <form onSubmit={handlePostUsedBook} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border text-left max-w-2xl mx-auto space-y-4 animate-slideDown">
                      <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-white pb-2 border-b">Used book specifications</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Textbook title*</label>
                          <input
                            type="text"
                            placeholder="e.g. Introduction to Algorithms"
                            value={newUsedTitle}
                            onChange={(e) => setNewUsedTitle(e.target.value)}
                            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Author publication*</label>
                          <input
                            type="text"
                            placeholder="e.g. Thomas Cormen"
                            value={newUsedAuthor}
                            onChange={(e) => setNewUsedAuthor(e.target.value)}
                            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Book Condition*</label>
                          <select
                            value={newUsedCondition}
                            onChange={(e) => setNewUsedCondition(e.target.value as any)}
                            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none"
                          >
                            <option>Excellent</option>
                            <option>Good</option>
                            <option>Worn</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Selling Price ($)*</label>
                          <input
                            type="number"
                            min="5"
                            value={newUsedPrice}
                            onChange={(e) => setNewUsedPrice(Number(e.target.value))}
                            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Course Catalog ID</label>
                          <input
                            type="text"
                            placeholder="e.g. CS106B"
                            value={newUsedCourse}
                            onChange={(e) => setNewUsedCourse(e.target.value)}
                            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Seller full Name*</label>
                          <input
                            type="text"
                            placeholder="David K."
                            value={newUsedSeller}
                            onChange={(e) => setNewUsedSeller(e.target.value)}
                            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Stanford Campus email contact*</label>
                          <input
                            type="email"
                            placeholder="david.k@stanford.edu"
                            value={newUsedContact}
                            onChange={(e) => setNewUsedContact(e.target.value)}
                            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none font-mono"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold uppercase transition"
                      >
                        Publish listing to Board
                      </button>
                    </form>
                  )}

                  {/* Render used books listings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
                    {usedBooks.map((book) => (
                      <div
                        key={book.id}
                        className="bg-white dark:bg-slate-900 border p-5 rounded-3xl flex flex-col justify-between text-left space-y-4 hover:shadow-lg transition relative"
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-mono bg-blue-10/10 bg-indigo-50 text-indigo-750 px-2 py-0.5 rounded">
                              Condition: {book.condition}
                            </span>
                            {book.courseCode && (
                              <span className="text-[9px] font-mono bg-slate-100 text-slate-650 px-2 rounded">
                                {book.courseCode}
                              </span>
                            )}
                          </div>
                          
                          <h4 className="font-heading text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2 h-10">{book.title}</h4>
                          <p className="text-xs text-slate-400 font-mono">By {book.author}</p>
                        </div>

                        <div className="pt-3 border-t text-xs space-y-2">
                          <div className="flex justify-between items-baseline text-xs">
                            <span className="text-slate-450">Agreed Sum</span>
                            <span className="font-mono font-black text-rose-500 text-sm">${book.price}</span>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-955 dark:bg-slate-950 p-2 rounded-lg text-[10px] text-slate-550 flex flex-col font-mono">
                            <span>Seller: {book.sellerName}</span>
                            <span className="truncate">Contact: {book.sellerContact}</span>
                          </div>

                          <button
                            onClick={() => {
                              alert(`Initializing safe checkout transaction framework for S2S pre-owned "${book.title}". Stanford campus code credentials verified.`);
                              triggerNotification(`Purchased pre-owned book: ${book.title}`);
                              setUsedBooks(prev => prev.filter(p => p.id !== book.id));
                            }}
                            className="w-full text-center py-1.5 bg-slate-900 text-white rounded hover:bg-emerald-600 text-[10px] font-bold transition uppercase"
                          >
                            Buy Used Textbook
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* VIEW 8: WISHLIST ONLY */}
              {currentTab === 'wishlist' && (
                <div className="space-y-6 animate-fadeIn" id="wishlist-view-box">
                  <div className="text-left">
                    <h1 className="font-heading font-extrabold text-2xl text-slate-950 dark:text-white">Aesthetic Syllabus Watchlist</h1>
                    <p className="text-xs text-slate-400 mt-1">Keep track of accredited tools preps and physics volumes. Discount alert trackers active.</p>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="py-20 bg-white dark:bg-slate-900 rounded-3xl border text-center p-6 space-y-4">
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">No materials are current monitors. Browse calculus guidelines files to add selections.</p>
                      <button
                        onClick={() => setCurrentTab('shop')}
                        className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold uppercase rounded-lg shadow"
                      >
                        Explore Campus materials
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                      {wishlist.map(item => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 p-4 border rounded-3xl flex flex-col justify-between text-left">
                          <div className="w-full h-36 rounded-md overflow-hidden bg-slate-50 mb-3">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover animate-scale" />
                          </div>
                          <span className="text-[10px] text-blue-500 font-bold">{item.subcategory}</span>
                          <h4 className="font-bold text-xs mt-1 truncate">{item.name}</h4>
                          <span className="font-mono text-slate-800 font-bold text-xs mt-1 block">${item.price}</span>
                          <div className="flex gap-1.5 mt-4">
                            <button
                              onClick={() => {
                                handleAddToCart(item);
                                toggleWishlistItem(item);
                              }}
                              className="flex-1 py-1 px-2.5 bg-blue-650 bg-blue-600 text-white rounded text-[10px] font-bold uppercase"
                            >
                              Move to Cart
                            </button>
                            <button
                              onClick={() => toggleWishlistItem(item)}
                              className="p-1 px-2 border rounded"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 9: REVOLUTIONARY CART */}
              {currentTab === 'cart' && (
                <div className="animate-fadeIn" id="cart-view-box">
                  <Cart 
                    cart={cart}
                    onUpdateQuantity={handleUpdateCartQty}
                    onRemoveItem={handleRemoveCartItem}
                    onProceedToCheckout={handleProceedToCheckout}
                    onContinueShopping={() => setCurrentTab('shop')}
                    isStudentVerified={isStudentVerified}
                  />
                </div>
              )}

              {/* VIEW 10: CHECKOUT */}
              {currentTab === 'checkout' && (
                <div className="animate-fadeIn" id="checkout-view-box">
                  <Checkout 
                    cart={cart}
                    appliedCoupon={activePromo}
                    onOrderSuccess={handleOrderCompletion}
                    onCancel={() => setCurrentTab('cart')}
                    isStudentVerified={isStudentVerified}
                  />
                </div>
              )}

              {/* VIEW 11: USER DASHBOARD */}
              {currentTab === 'dashboard' && (
                <div className="space-y-8 animate-fadeIn" id="dashboard-view-box">
                  
                  {/* Order logistics status tracker direct popup overlay if active */}
                  {activeTrackingOrder && (
                    <div className="bg-white dark:bg-slate-900 border-2 border-indigo-600/30 rounded-3xl p-6 text-left space-y-4 animate-slideDown">
                      <div className="flex justify-between items-center font-button border-b pb-3">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Active Stanford Dispatch Tracker</h4>
                          <p className="text-[11px] text-slate-400 font-mono">Order Index Reference: {activeTrackingOrder.id}</p>
                        </div>
                        <button 
                          onClick={() => setActiveTrackingOrder(null)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          ✕ Close Status Frame
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
                        {activeTrackingOrder.trackingTimeline.map((step, sIdx) => (
                          <div key={sIdx} className="p-3.5 rounded-xl bg-slate-50 border text-left">
                            <span className="text-[9px] bg-indigo-50 text-indigo-750 font-bold py-0.5 px-2 rounded leading-none block w-fit">{step.time}</span>
                            <h5 className="font-bold text-xs mt-2 text-slate-800">{step.title}</h5>
                            <p className="text-[10px] text-slate-500 mt-1">{step.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hyperlocal Palo Alto Courier map visual simulation */}
                  <div className="bg-white dark:bg-slate-900 border rounded-3xl p-6 text-left space-y-4">
                    <h3 className="font-heading text-sm sm:text-base font-extrabold text-slate-950 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                      <MapPin className="w-4.5 h-4.5 text-blue-500" />
                      <span>Hyperlocal Campus Bookstore Couriers Map</span>
                    </h3>
                    <p className="text-xs text-slate-500 leading-normal">Our dispatch nodes verify physical items inventory directly inside Palo Alto blocks to dispatch orders under the Same-Day Campus speedway protocol.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {hyperlocalStores.map((store, sidx) => (
                        <div key={sidx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border text-left flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] uppercase font-bold tracking-widest bg-emerald-50 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded font-mono">Verified Node</span>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-2">{store.name}</h4>
                            <p className="text-[11px] text-slate-400 mt-1">Location: {store.address} ({store.distance})</p>
                          </div>
                          <span className="text-[10px] text-indigo-600 font-semibold block pt-3 mt-3 border-t">{store.speed}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Original Dashboard */}
                  <Dashboard 
                    orders={orders}
                    wishlist={wishlist}
                    addresses={SAMPLE_ADDRESSES}
                    isStudentVerified={isStudentVerified}
                    onVerifyStudent={handleVerifyStudentStatus}
                    onTrackOrder={(order) => setActiveTrackingOrder(order)}
                    setCurrentTab={setCurrentTab}
                  />

                </div>
              )}

              {/* VIEW 12: ADMIN DASHBOARD */}
              {currentTab === 'admin' && (
                <div className="space-y-8 animate-fadeIn" id="admin-view-box">
                  <div className="text-left">
                    <h1 className="font-heading font-extrabold text-2xl text-slate-950 dark:text-white font-logo">Administration Management Portal</h1>
                    <p className="text-xs text-slate-400 mt-1">Configure active university items catalogs, publish student coupons, or examine live campus sales metrics.</p>
                  </div>

                  {/* Add book form */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Add product form */}
                    <div className="lg:col-span-1 bg-white dark:bg-slate-900 border p-6 rounded-3xl text-left space-y-4">
                      <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-white pb-2 border-b">Add Catalogue Item</h3>
                      
                      <form onSubmit={handleAdminAddInventory} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Product title Name*</label>
                          <input
                            type="text"
                            placeholder="e.g. Advanced Fluid Dynamics"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Category type*</label>
                            <select
                              value={adminCategory}
                              onChange={(e) => setAdminCategory(e.target.value as any)}
                              className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none"
                            >
                              <option value="books">📚 Books</option>
                              <option value="stationery">✏️ Stationery</option>
                              <option value="accessories">🎒 Educational Accessories</option>
                              <option value="digital">💻 Digital Resources</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Subcategory tag*</label>
                            <input
                              type="text"
                              placeholder="e.g. Aerodynamics"
                              value={adminSub}
                              onChange={(e) => setAdminSub(e.target.value)}
                              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Value price ($)*</label>
                            <input
                              type="number"
                              step="0.01"
                              value={adminPrice}
                              onChange={(e) => setAdminPrice(Number(e.target.value))}
                              className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Stock Count*</label>
                            <input
                              type="number"
                              value={adminStock}
                              onChange={(e) => setAdminStock(Number(e.target.value))}
                              className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Target Grade*</label>
                            <select
                              value={adminLevel}
                              onChange={(e) => setAdminLevel(e.target.value as any)}
                              className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none"
                            >
                              <option>School</option>
                              <option>College</option>
                              <option>University</option>
                              <option>Teacher</option>
                              <option>All</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold uppercase transition"
                        >
                          Append item to Store
                        </button>
                      </form>
                    </div>

                    {/* Stats metrics */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Interactive charts simulation */}
                      <div className="bg-white dark:bg-slate-900 border p-6 rounded-3xl text-left space-y-4">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Active Campus Revenue & Discount Distribution Logs</h3>
                        <p className="text-xs text-slate-450 leading-normal">System telemetry registers Stanford regions checkout volume. Points indices are monitored under active SSL signing loops.</p>
                        
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-xl font-mono text-xs space-y-2">
                          <div className="flex justify-between font-bold text-[11px] uppercase text-indigo-600">
                            <span>Diagnostic segment</span>
                            <span>Accrued value index</span>
                          </div>
                          <hr className="opacity-50" />
                          <div className="flex justify-between py-1">
                            <span>Syllabus Textbooks</span>
                            <span className="text-emerald-500 font-bold">₹1,24,450.50 (Accredited)</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>Geometrical Stationery sets</span>
                            <span className="text-emerald-500 font-bold">₹48,220.00</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>WebGL Simulation licenses</span>
                            <span className="text-emerald-500 font-bold">₹1,18,900.00</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>Active couponSTUDENT30 clipped count</span>
                            <span className="text-blue-500 font-bold">242 scholars redeemed</span>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* VIEW 13: CONTACT & HELP CENTER */}
              {currentTab === 'contact' && (
                <div className="space-y-8 animate-fadeIn" id="contact-view-box">
                  <div className="text-left">
                    <h1 className="font-heading font-extrabold text-2xl text-slate-950 dark:text-white">Academic Help Center & Ticket Desk</h1>
                    <p className="text-xs text-slate-400 mt-1">Submit support inquiries to regional campus bookstore operations managers or logistics dispatch.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    
                    {/* Ticketer */}
                    <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border text-left space-y-4">
                      <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-white pb-2 border-b">Register Support ticket</h3>
                      
                      {ticketState === 'success' ? (
                        <div className="p-6 bg-emerald-50 text-emerald-800 rounded-2xl flex flex-col items-center space-y-3 text-center">
                          <CheckCircle className="w-8 h-8 text-emerald-500" />
                          <h4 className="font-bold text-xs sm:text-sm">Ticket submitted successfully!</h4>
                          <p className="text-xs">University dispatch has registered coordinate parameters. We will reply to sravanthi.m@stanford.edu within 4 hours.</p>
                          <button
                            onClick={() => setTicketState('idle')}
                            className="text-xs text-blue-600 font-bold underline hover:no-underline"
                          >
                            Open another inquiry
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Syllabus Subject Area</label>
                            <input
                              type="text"
                              placeholder="e.g. Calculus billing / Geometrical set layout damage"
                              value={contactSubject}
                              onChange={(e) => setContactSubject(e.target.value)}
                              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-lg focus:outline-none"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Syllabus Details message*</label>
                            <textarea
                              rows={4}
                              placeholder="Describe your inquiry with detail coordinates. Mention order index if applicable."
                              value={contactMessage}
                              onChange={(e) => setContactMessage(e.target.value)}
                              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-lg focus:outline-none font-body"
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            className="px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase hover:bg-blue-600 transition"
                          >
                            Submit Ticket
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Support card details */}
                    <div className="md:col-span-1 bg-slate-900 text-white p-6 rounded-3xl text-left space-y-4">
                      <h3 className="font-heading text-sm sm:text-base font-bold text-white">Direct Academic Hotlines</h3>
                      <p className="text-xs text-slate-350 leading-relaxed">For immediate delivery escalations or corporate educational purchase agreements, contact Palo Alto support directly.</p>
                      
                      <div className="space-y-3 text-[11px] font-mono leading-normal">
                        <p>📞 Phone: +1 (555) 432-8765 ext 200</p>
                        <p>✉️ Mail: support-desk@eduverse.ai</p>
                        <p>📍 Desk: Stanford Outpost Building 100, Lasuen Mall Office 4D</p>
                      </div>

                      <hr className="opacity-20" />

                      <p className="text-[9px] text-slate-400">EduVerse AI is governed under the Stanford University Academic Union and California Digital Service Guidelines. Same-Day Campus deliveries are secured using sealed courier packages.</p>
                    </div>

                  </div>
                </div>
              )}

            </>
          )}

        </main>

        {/* Dynamic ambient page footer */}
        <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-10 text-slate-500 dark:text-slate-450 text-left transition-colors duration-300 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3.5">
              <span className="font-logo font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-650 bg-clip-text text-transparent">EduVerse AI</span>
              <p className="text-[11px] leading-relaxed">Futuristic, premium AI-powered educational e-commerce platform specifically designed for academic institutions, students, teachers, and grads.</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-button text-xs font-bold uppercase text-slate-800 dark:text-slate-200">Catalog Sections</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><button onClick={() => { setSelectedCategory('books'); setCurrentTab('shop'); }} className="hover:underline text-left">Accredited Textbooks</button></li>
                <li><button onClick={() => { setSelectedCategory('stationery'); setCurrentTab('shop'); }} className="hover:underline text-left">Drafting Geometrical sets</button></li>
                <li><button onClick={() => { setSelectedCategory('digital'); setCurrentTab('shop'); }} className="hover:underline text-left">3D fluid simulators</button></li>
                <li><button onClick={() => { setSelectedCategory('courses'); setCurrentTab('shop'); }} className="hover:underline text-left">Syllabus Masterclasses</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-button text-xs font-bold uppercase text-slate-800 dark:text-slate-200">AI Assistants</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><button onClick={() => setCurrentTab('mentor')} className="hover:underline text-left">24/7 Doubt-solving Mentor</button></li>
                <li><button onClick={() => setCurrentTab('planner')} className="hover:underline text-left">Interactive Study calendars</button></li>
                <li><button onClick={() => setCurrentTab('rewards')} className="hover:underline text-left">EduPoints Scholar ledger</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-button text-xs font-bold uppercase text-slate-800 dark:text-slate-200">Stanford Regulations</h4>
              <p className="text-[11px] leading-relaxed">Administered by regional campus advisors. Delivery coordinates are scanned automatically to resolve Same-Day Express dispatch.</p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 mt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px]">
            <p>© 2026 EduVerse AI Corporation. All Stanford campus rights reserved.</p>
            <p className="font-mono">Secure SSL Payload Signing Active • Sanbox Environment Version 2.4.0</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
