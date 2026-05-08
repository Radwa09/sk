import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import stethoscope from './assets/stethoscope.svg';
import scanUI from './assets/scan_ui.svg';

// Pharmacy Logos (Please Ensure these files are placed in src/assets/)
// import attarLogo from './assets/attar.jpg';
// import kobtanLogo from './assets/kobtan.jpg';
// Note: For now we'll just use the src paths as strings to avoid compile errors if they don't exist yet.
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { DashboardOverview } from './pages/dashboard/Overview';
import { DashboardHistory } from './pages/dashboard/History';
import { DashboardSkinAnalysis } from './pages/dashboard/SkinAnalysis';
import { DashboardProfile } from './pages/dashboard/Profile';
import { DashboardSettings } from './pages/dashboard/Settings';
import { FaceCapture } from './components/FaceCapture';
import { ProductScanner } from './components/ProductScanner';
import { ClinicMap } from './components/ClinicMap';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { PharmacistDashboard } from './pages/pharmacist/PharmacistDashboard';
import { PharmacistProfile } from './pages/pharmacist/PharmacistProfile';
import {
  Camera,
  Sparkles,
  Activity,
  MessageSquare,
  Phone,
  MapPin,
  ShoppingBag,
  ArrowRight,
  Clock,
  ShieldCheck,
  Sun,
  Moon,
  Droplet,
  Info,
  Send,
  ChevronRight,
  Star,
  TrendingUp,
  Calendar,
  Plus,
  BarChart3,
  Cpu,
  Headphones,
  Stethoscope,
  Fingerprint,
  Heart,
  Menu,
  X
} from 'lucide-react';

import auroraSerum from './assets/aurora_serum.png';


// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const, staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
};



export function App() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('morning');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Basic Routing Logic
  useEffect(() => {
    const path = window.location.pathname.replace('/', '').toLowerCase();
    const validPages = ['home', 'dashboard', 'dashboard/analysis', 'dashboard/profile', 'dashboard/settings', 'pharmacist', 'pharmacist/profile', 'admin', 'admin/users', 'login', 'signup', 'forgot-password', 'ai', 'scan', 'scanner', 'routine', 'clinic', 'recommendations', 'support', 'results'];
    if (path && validPages.includes(path)) {
      setCurrentPage(path);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const navigate = (page: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
    setIsMenuOpen(false);
  };



  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !message) {
      setFormStatus('error');
      return;
    }

    setFormStatus('success');
    e.currentTarget.reset();
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F0D0C] text-[#4D4039] dark:text-stone-300 font-sans selection:bg-[#DECFC0] dark:selection:bg-[#4A3C31] selection:text-[#3B302B] dark:selection:text-white overflow-x-hidden relative transition-colors duration-500">




      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 transition-all duration-300">
        <div className="absolute inset-0 bg-white/95 dark:bg-[#0F0D0C]/95 border-b border-stone-200 dark:border-stone-800" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center gap-4 cursor-pointer"
              onClick={() => navigate('home')}
            >
              <div className="w-12 h-12 bg-[#4A3C31] rounded-2xl flex items-center justify-center shadow-lg shadow-stone-900/10 rotate-3">
                <Sparkles className="w-6 h-6 text-stone-100" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-3xl font-serif font-bold text-[#3B302B] dark:text-stone-100 tracking-tight block leading-none">
                  skinE
                </span>
                <span className="text-[10px] tracking-[0.2em] font-medium text-stone-400 dark:text-stone-500 uppercase mt-1">Clinical Elite</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1 bg-stone-100/50 dark:bg-stone-900/50 p-1.5 rounded-full border border-stone-200/50 dark:border-stone-800/50">
              {['Home', !isAuthenticated ? 'Login' : (isAdmin ? 'Admin' : (user?.role === 'pharmacist' ? 'Pharmacist Workspace' : 'Dashboard')), 'Skin Analysis', 'AI', 'Scanner', 'Routine', 'Clinic'].map((item) => {
                const pageId = item === 'Skin Analysis' ? 'scan' : item === 'Login' ? 'login' : item === 'Pharmacist Workspace' ? 'pharmacist' : item.toLowerCase();
                const isActive = currentPage === pageId || (currentPage === 'results' && pageId === 'scan');
                return (
                  <button
                    key={pageId}
                    onClick={() => navigate(pageId)}
                    className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-500 relative ${isActive
                      ? 'text-[#3B302B]'
                      : 'text-stone-500 hover:text-[#3B302B]'
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-bg"
                        className="absolute inset-0 bg-white dark:bg-stone-800 rounded-full shadow-sm border border-stone-200/60 dark:border-stone-700/60"
                      />
                    )}
                    <span className="relative z-10">{item}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4">

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-sm text-stone-600 dark:text-stone-300 hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                title="Toggle Dark Mode"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-stone-600 dark:text-stone-400" />}
              </button>

              <button
                onClick={() => navigate('scan')}
                className="hidden sm:flex items-center gap-3 bg-[#4A3C31] dark:bg-stone-800 hover:bg-[#3B302B] dark:hover:bg-stone-700 text-white px-8 py-3.5 rounded-full text-sm font-semibold transition-all shadow-xl shadow-[#4A3C31]/20 hover:scale-105 active:scale-95"
              >
                Analyze Now
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm text-stone-600 dark:text-stone-400"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-[#3B302B]/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white dark:bg-[#0F0D0C] z-[70] shadow-2xl lg:hidden flex flex-col p-8 border-l border-stone-100 dark:border-stone-800"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4A3C31] rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-stone-100" />
                  </div>
                  <span className="text-2xl font-serif font-bold text-[#3B302B] dark:text-stone-100">skinE</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <X className="w-6 h-6 text-stone-400" />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                {['Home', !isAuthenticated ? 'Login' : (isAdmin ? 'Admin' : (user?.role === 'pharmacist' ? 'Pharmacist Workspace' : 'Dashboard')), 'Skin Analysis', 'AI', 'Scanner', 'Routine', 'Clinic', 'Support'].map((item) => {
                  const pageId = item === 'Skin Analysis' ? 'scan' : item === 'Login' ? 'login' : item === 'Pharmacist Workspace' ? 'pharmacist' : item.toLowerCase();
                  const isActive = currentPage === pageId || (currentPage === 'results' && pageId === 'scan');
                  return (
                    <button
                      key={pageId}
                      onClick={() => navigate(pageId)}
                      className={`flex items-center justify-between px-6 py-4 rounded-2xl font-medium text-lg transition-all ${
                        isActive 
                        ? 'bg-[#4A3C31] text-white shadow-lg shadow-[#4A3C31]/20' 
                        : 'text-stone-500 hover:text-[#3B302B] dark:text-stone-400 dark:hover:text-stone-200'
                      }`}
                    >
                      <span>{item}</span>
                      <ChevronRight className={`w-5 h-5 transition-transform ${isActive ? 'translate-x-1' : 'opacity-0'}`} />
                    </button>
                  );
                })}
              </nav>

              <div className="mt-auto">
                <button
                  onClick={() => navigate('scan')}
                  className="w-full flex items-center justify-center gap-3 bg-[#4A3C31] text-white py-5 rounded-3xl font-bold shadow-xl shadow-[#4A3C31]/20"
                >
                  <Camera className="w-5 h-5" /> Analyze Now
                </button>
                <p className="text-center text-[10px] text-stone-400 uppercase tracking-widest mt-8 font-medium">Clinical Elite v1.2</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-16 relative z-10">
        <AnimatePresence mode="wait">

          {/* ================= AUTH PAGES ================= */}
          {currentPage === 'login' && <Login key="login" onNavigate={navigate} />}
          {currentPage === 'signup' && <Signup key="signup" onNavigate={navigate} />}
          {currentPage === 'forgot-password' && <ForgotPassword key="forgot-password" onNavigate={navigate} />}

          {/* ================= DASHBOARD PAGES ================= */}
          {currentPage.startsWith('dashboard') && (
            <DashboardLayout key="dashboard-layout" currentPath={currentPage} onNavigate={navigate}>
              {currentPage === 'dashboard' && <DashboardOverview onNavigate={navigate} />}
              {currentPage === 'dashboard/analysis' && <DashboardSkinAnalysis />}
              {currentPage === 'dashboard/profile' && <DashboardProfile />}
              {currentPage === 'dashboard/settings' && <DashboardSettings onNavigate={navigate} />}
            </DashboardLayout>
          )}

          {/* ================= PHARMACIST PAGES ================= */}
          {currentPage.startsWith('pharmacist') && (
            <DashboardLayout key="pharmacist-layout" currentPath={currentPage} onNavigate={navigate}>
              {currentPage === 'pharmacist' && <PharmacistDashboard />}
              {currentPage === 'pharmacist/profile' && <PharmacistProfile />}
            </DashboardLayout>
          )}

          {/* ================= ADMIN PAGES ================= */}
          {currentPage.startsWith('admin') && (
            <AdminLayout key="admin-layout" currentPath={currentPage} onNavigate={navigate}>
              {currentPage === 'admin' && <AdminOverview />}
              {currentPage === 'admin/users' && <AdminUsers />}
            </AdminLayout>
          )}

          {/* ================= HOME PAGE ================= */}
          {currentPage === 'home' && (
            <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-24 md:space-y-40">
              {/* Hero Section */}
              <section className="relative pt-12 text-center md:text-left">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                  <div className="space-y-12">


                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif text-[#3B302B] dark:text-stone-100 leading-[0.95] tracking-tight">
                      Elevate Your <br />
                      <span className="text-[#8C7A6E] dark:text-[#C2B29F] italic font-light">Dermal Profile.</span>
                    </h1>

                    <p className="text-xl text-stone-500 dark:text-stone-400 max-w-xl leading-relaxed font-light">
                      Experience the next generation of precision skincare. Our clinical-grade AI analyzes your topography to craft a routine as unique as your DNA.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-8">
                      <button
                        onClick={() => navigate('scan')}
                        className="w-full sm:w-auto px-10 py-5 bg-[#4A3C31] hover:bg-[#3B302B] text-white rounded-full font-bold text-sm transition-all flex items-center justify-center gap-4 shadow-2xl shadow-[#4A3C31]/30 group"
                      >
                        <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        Start Free Analysis
                      </button>
                      <button
                        onClick={() => navigate('routine')}
                        className="group flex items-center gap-4 text-sm font-bold text-[#3B302B] dark:text-stone-200 hover:text-[#8C7A6E] transition-colors"
                      >
                        Explore Protocol Demo
                        <div className="w-10 h-10 rounded-full border border-stone-300 dark:border-stone-700 flex items-center justify-center group-hover:border-[#3B302B] dark:group-hover:border-stone-200 transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </button>
                    </div>


                  </div>

                  <div className="relative px-8"
                  >
                    <div className="relative z-10 rounded-[3rem] overflow-hidden border-[12px] border-white dark:border-stone-900 shadow-2xl">
                      <div className="aspect-[4/5] bg-stone-200 dark:bg-stone-800 flex items-center justify-center">
                        <img src={auroraSerum} alt="Aurora Radiance Serum - Revitalizing & Hydrating" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute -top-12 -right-4 w-40 h-40 bg-[#C2B29F]/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-12 -left-4 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl" />
                  </div>
                </div>
              </section>

              {/* Service Description Cards */}
              <section className="space-y-16">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl md:text-5xl font-serif text-[#3B302B] dark:text-stone-100">
                    Our <span className="text-[#8C7A6E] dark:text-[#C2B29F] italic">Services</span>
                  </h2>
                  <p className="text-stone-500 dark:text-stone-400 font-light max-w-2xl mx-auto leading-relaxed">
                    Explore our comprehensive suite of clinical-grade skincare services designed to elevate your dermal health.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    { icon: <Camera className="w-7 h-7" />, title: "Scan", page: "scan", desc: "AI-powered dermal topology analysis. Our neural network maps moisture density, texture, and structural elasticity with clinical precision.", color: "from-emerald-500/10 to-emerald-500/5", prominent: true },
                    { icon: <ShoppingBag className="w-7 h-7" />, title: "Scanner", page: "scanner", desc: "Clinical barcode recognition engine. Scan pharmaceutical products for instant chemical synthesis analysis.", color: "from-amber-500/10 to-amber-500/5" },
                    { icon: <Sparkles className="w-7 h-7" />, title: "AI", page: "ai", desc: "Engineering revolutionary generative dermal models for predictive visualization and clinical synthesis.", color: "from-indigo-500/10 to-indigo-500/5", isNewTab: true },
                    { icon: <Droplet className="w-7 h-7" />, title: "Routine", page: "routine", desc: "Personalized AM/PM skincare protocols with scientifically curated active compounds tailored to your unique biotype.", color: "from-blue-500/10 to-blue-500/5" },
                    { icon: <Stethoscope className="w-7 h-7" />, title: "Clinic", page: "clinic", desc: "Access our global network of certified partner clinics and compounding labs for professional dermal consultations.", color: "from-violet-500/10 to-violet-500/5" },
                    { icon: <Headphones className="w-7 h-7" />, title: "Support", page: "support", desc: "Our clinical support team of licensed professionals is available 24/7 for order tracking, tech support, and protocol guidance.", color: "from-teal-500/10 to-teal-500/5" }
                  ].map((service, i) => (
                    <div key={i}
                      onClick={() => {
                        if ((service as any).isNewTab) {
                          navigate('ai');
                        } else {
                          navigate(service.page);
                        }
                      }}
                      className={`relative p-10 rounded-[2.5rem] bg-white dark:bg-stone-900 border shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-[0_40px_80px_-40px_rgba(0,0,0,0.12)] dark:hover:bg-stone-800/50 transition-all cursor-pointer group overflow-hidden ${
                        (service as any).prominent 
                        ? 'border-stone-300 dark:border-stone-700 shadow-lg shadow-stone-900/5' 
                        : 'border-stone-100 dark:border-stone-800'
                      }`}
                    >
                      {/* Gradient background glow */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                      <div className="relative z-10">
                        <div className="w-14 h-14 bg-stone-50 dark:bg-stone-800 text-[#4A3C31] dark:text-stone-300 rounded-2xl flex items-center justify-center mb-6 border border-stone-100 dark:border-stone-700 group-hover:scale-110 group-hover:bg-[#4A3C31] group-hover:text-white transition-all duration-300">
                          {service.icon}
                        </div>
                        <h3 className="text-xl font-serif text-[#3B302B] dark:text-stone-100 mb-4">{service.title}</h3>
                        <p className="text-stone-500 dark:text-stone-400 font-light leading-relaxed text-sm mb-6">{service.desc}</p>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#8C7A6E] dark:text-[#C2B29F] uppercase tracking-widest group-hover:text-[#4A3C31] dark:group-hover:text-stone-200 transition-colors">
                          Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* ================= SCAN PAGE ================= */}
          {currentPage === 'scan' && (
            <motion.div key="scan" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-4xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-serif text-[#3B302B] mb-6">
                  Dermal Topology <span className="text-[#8C7A6E] italic">Analysis</span>
                </h2>
                <p className="text-stone-500 font-light max-w-xl mx-auto leading-relaxed">
                  Our neural network is ready to map your skin profile. Please ensure you are in a well-lit environment for optimal depth calibration.
                </p>
              </div>

              <div className="relative w-full max-w-2xl mx-auto">
                <FaceCapture onComplete={() => navigate('results')} />
              </div>

              <div className="mt-20 grid sm:grid-cols-3 gap-8">
                {[
                  { icon: <ShieldCheck className="w-5 h-5" />, title: "HIPAA Compliant", desc: "Your clinical data is encrypted and discarded post-analysis." },
                  { icon: <Info className="w-5 h-5" />, title: "Optimal Lighting", desc: "Front-facing natural light provides the best topological depth." },
                  { icon: <ShieldCheck className="w-5 h-5" />, title: "Verified AI", desc: "Trained on millions of clinically-labeled skin datasets." }
                ].map((tip, i) => (
                  <div key={i} className="flex gap-4 p-6 rounded-3xl bg-white border border-stone-100">
                    <div className="text-[#8C7A6E] shrink-0 mt-1">{tip.icon}</div>
                    <div>
                      <h4 className="text-sm font-bold text-[#3B302B] mb-2">{tip.title}</h4>
                      <p className="text-xs text-stone-500 font-light leading-relaxed">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ================= RESULTS PAGE ================= */}
          {currentPage === 'results' && (
            <motion.div key="results" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-24 max-w-5xl mx-auto">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-end gap-12">
                <div className="space-y-6 max-w-xl">
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold tracking-widest uppercase">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    Analysis Verified: Phase-1 Complete
                  </div>
                  <h2 className="text-5xl md:text-6xl font-serif text-[#3B302B] leading-tight">
                    Diagnostic <span className="text-[#8C7A6E] italic">Summary</span>
                  </h2>
                  <p className="text-lg text-stone-500 font-light leading-relaxed">
                    Based on your dermal topography, your current biotype is <span className="text-[#4A3C31] font-bold">Resilient Mixed-B</span>. Focus on targeted hydration and structural barrier support.
                  </p>
                </div>
                <div className="shrink-0">
                  <button
                    onClick={() => navigate('routine')}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-20 h-20 rounded-[2rem] bg-[#4A3C31] text-white flex items-center justify-center shadow-xl shadow-[#4A3C31]/20 group-hover:scale-110 group-hover:bg-[#3B302B] transition-all">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-stone-400 group-hover:text-[#3B302B] transition-colors uppercase mt-2">View Protocol</span>
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid md:grid-cols-2 gap-12">
                <div className="p-12 rounded-[3rem] bg-stone-100 border border-stone-200">
                  <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-stone-400 mb-10">Clinical Biomarkers</h3>
                  <div className="space-y-10">
                    {[
                      { label: "Dermal Moisture Index", val: 78, status: "Optimal" },
                      { label: "Lipid Equilibrium", val: 42, status: "Moderate" },
                      { label: "Dermal Elasticity", val: 89, status: "High" },
                      { label: "UV Sensitivity", val: 24, status: "Low" }
                    ].map((m, i) => (
                      <div key={i} className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-medium text-[#3B302B]">{m.label}</span>
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${m.status === 'Optimal' ? 'bg-emerald-50 text-emerald-600' :
                            m.status === 'Moderate' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                            }`}>{m.status}</span>
                        </div>
                        <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${m.val}%` }}
                            className="h-full bg-[#4A3C31] transition-all duration-1000 ease-out"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-10 rounded-[2.5rem] bg-white border border-stone-100 shadow-sm">
                    <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-stone-400 mb-6 font-sans">Dermatologist Verdict</h3>
                    <div className="flex gap-6 items-start">
                      <div className="w-16 h-16 rounded-3xl bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100">
                        <ShieldCheck className="w-8 h-8 text-[#8C7A6E]" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-[#3B302B] font-light leading-relaxed italic">
                          "Excellent epidermal density. I recommend shifting your focus toward polyglutamic acid and niacinamide to maintain the barrier while refining pores in the T-zone."
                        </p>
                        <div className="text-[10px] font-bold text-[#8C7A6E] uppercase tracking-widest">— Dr. Elena Weiss, AI Clinical Lead</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-10 rounded-[2.5rem] bg-[#4A3C31] text-white shadow-2xl shadow-stone-900/20">
                    <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-stone-100/40 mb-8">Priority Recommendation</h3>
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-[#4A3C31] rounded-2xl flex items-center justify-center">
                        <Droplet className="w-6 h-6 text-stone-100" />
                      </div>
                      <div>
                        <div className="text-xl font-serif text-stone-50">Intense Recovery Protocol</div>
                        <div className="text-[10px] text-stone-100/60 uppercase tracking-widest mt-1">Scientific Curated 0.1% Retinol Logic</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= ROUTINE & PHARMACY PAGE ================= */}
          {currentPage === 'routine' && (
            <motion.div key="routine" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-32 max-w-6xl mx-auto">
              <div className="text-center max-w-3xl mx-auto space-y-8">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-stone-100 border border-stone-200 text-stone-500 text-[10px] font-bold tracking-widest uppercase">
                  Protocol #7721 — Clinical Active Concentration
                </div>
                <h2 className="text-5xl md:text-6xl font-serif text-[#3B302B]">
                  Personalized <span className="text-[#8C7A6E] italic">Regimen</span>
                </h2>
                <p className="text-lg text-stone-500 font-light leading-relaxed">
                  Your biotype requires a stratified approach to dermal recovery. This protocol focuses on cellular turnover and epidermal barrier fortification.
                </p>
              </div>

              {/* Routine Selector */}
              <div className="flex justify-center">
                <div className="glass-card-dark p-2 rounded-full flex gap-2">
                  {[
                    { id: 'morning', label: 'AM Routine', icon: <Sun className="w-4 h-4" /> },
                    { id: 'night', label: 'PM Routine', icon: <Moon className="w-4 h-4" /> }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative px-8 py-3 rounded-full text-sm font-bold transition-all duration-500 overflow-hidden flex items-center gap-3 ${activeTab === tab.id ? 'text-white' : 'text-stone-500 hover:text-[#3B302B]'
                        }`}
                    >
                      {activeTab === tab.id && (
                        <motion.div layoutId="tab-bg" className="absolute inset-0 bg-[#4A3C31]" />
                      )}
                      <span className="relative z-10">{tab.icon}</span>
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="bg-white border border-stone-100 p-8 md:p-12 rounded-[3.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] relative overflow-hidden">
                  <div className="space-y-6 relative z-10">
                    {(activeTab === 'morning' ? [
                      { step: "01", type: "Equilibrium", name: "Amino-Acid Cleansing Milk", desc: "A pH-balanced lipid-restoring milk that purifies without disrupting the acid mantle.", data: "Ceramides 3, 6-II, Phyto-Sphingosine", price: 32, Icon: Droplet },
                      { step: "02", type: "Correction", name: "Mandelic & PHA Complex", desc: "Gentle exfoliation for sensitive profiles to clear congestion and refine dermal texture.", data: "10% Mandelic Acid + 2% Gluconolactone", price: 58, Icon: Activity },
                      { step: "03", type: "Protection", name: "Squalane & Peptides Infusion", desc: "Highly concentrated hydration with signal peptides to stimulate collagen synthesis.", data: "Bio-Identical Squalane + Hexapeptide-8", price: 64, Icon: ShieldCheck }
                    ] : [
                      { step: "01", type: "Purification", name: "Lipid-Soluble Pre-Cleanse", desc: "Dissolves SPF and environmental pollutants without compromising the epidermal barrier.", data: "Safflower Seed Oil + Vitamin E", price: 38, Icon: Droplet },
                      { step: "02", type: "Resurfacing", name: "Clinical Retinoid 0.5%", desc: "Encapsulated retinaldehyde for accelerated cellular turnover and collagen synthesis.", data: "0.5% Retinaldehyde + Niacinamide", price: 85, Icon: Activity },
                      { step: "03", type: "Recovery", name: "Ceramide Barrier Balm", desc: "Intensive overnight repair to seal in actives and prevent transepidermal water loss.", data: "5% Panthenol + Cholesterol", price: 72, Icon: ShieldCheck }
                    ]).map((item, i) => {
                      const IconComponent = item.Icon;
                      return (
                        <div key={i} className="group flex flex-col md:flex-row gap-8 items-start md:items-center p-8 rounded-[2rem] bg-stone-50 border border-stone-100/50 hover:bg-[#4A3C31] hover:text-white transition-all duration-300">
                           <div className="shrink-0 w-16 h-16 rounded-2xl bg-white text-[#4A3C31] flex items-center justify-center border border-stone-100 shadow-sm group-hover:border-[#4A3C31]">
                             <IconComponent className="w-6 h-6" />
                           </div>
                           <div className="flex-1">
                             <div className="flex items-center gap-3 mb-2">
                               <span className="text-[10px] font-bold text-stone-400 group-hover:text-stone-300 tracking-[0.2em] uppercase">Step {item.step}</span>
                               <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-bold tracking-widest uppercase group-hover:bg-emerald-500/20 group-hover:text-emerald-300">{item.type}</span>
                             </div>
                             <h3 className="text-xl font-serif text-[#3B302B] group-hover:text-white mb-2">{item.name}</h3>
                             <p className="text-stone-500 group-hover:text-stone-300 font-light text-sm leading-relaxed mb-4">{item.desc}</p>
                             <div className="inline-block bg-stone-100 group-hover:bg-stone-800/50 px-3 py-1.5 rounded-lg border border-transparent group-hover:border-stone-700">
                               <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mr-2">Components</span>
                               <span className="text-[10px] text-[#4A3C31] group-hover:text-stone-100 font-medium">{item.data}</span>
                             </div>
                           </div>
                           <div className="shrink-0 text-right md:text-center w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-stone-200 group-hover:border-stone-700">
                             <div className="text-2xl font-serif font-bold text-[#3B302B] group-hover:text-white">${item.price}</div>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <div>
                      <div className="text-[10px] font-bold text-stone-400 tracking-widest uppercase mb-1">Total Regimen Integration</div>
                      <div className="text-4xl font-serif text-[#3B302B] font-bold">
                        ${activeTab === 'morning' ? 32 + 58 + 64 : 38 + 85 + 72}.00
                      </div>
                    </div>
                    <button className="w-full md:w-auto px-10 py-5 bg-[#4A3C31] hover:bg-[#3B302B] text-white rounded-full font-bold text-sm transition-all shadow-xl shadow-[#4A3C31]/20 flex items-center justify-center gap-4 group">
                      Add Full Regimen <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>


            </motion.div>
          )}

          {/* ================= CLINIC & MAP PAGE ================= */}
          {currentPage === 'clinic' && (
            <motion.div key="clinic" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-32">
              {/* Fulfillment Section (Moved from Routine) */}
              <div className="pt-24 border-t border-stone-200 grid lg:grid-cols-2 gap-24 items-center">
                <div className="space-y-10">
                  <h3 className="text-4xl font-serif text-[#3B302B]">Scientific <br /> <span className="text-[#8C7A6E] italic">Fulfillment Network</span></h3>
                  <p className="text-stone-500 font-light leading-relaxed">
                    Our platform integrates with high-standard compounding pharmacies to ensure your protocols are fresh and clinically potent. Select a certified partner for delivery.
                  </p>
                  <div className="space-y-6">
                    {[
                      { 
                        name: "Mahmoud Al-Attar Pharmacy", 
                        rating: "5.0", dist: "0.8 km", status: "Certified Partner",
                        actionHref: "https://wa.me/201282997923", actionText: "WhatsApp: +20 12 82997923",
                        logo: "/mahmoud.jpg"
                      },
                      { 
                        name: "alkobtan", 
                        rating: "4.8", dist: "2.5 km", status: "Priority Lab",
                        actionHref: "tel:5923332-03", actionText: "Call: 5923332-03",
                        logo: "/alkobtan.jpg"
                      }
                    ].map((p, i) => (
                      <a key={i} href={p.actionHref} target={p.actionHref.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer" className="block">
                        <div className="flex justify-between items-center p-8 rounded-[2rem] bg-stone-50 border border-stone-200/50 hover:bg-white hover:shadow-xl hover:shadow-stone-900/5 transition-all group">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#4A3C31] shadow-sm overflow-hidden group-hover:bg-white transition-all">
                              {p.logo ? (
                                <img src={p.logo} alt={p.name} className="w-full h-full object-cover p-2" />
                              ) : (
                                <MapPin className="w-6 h-6 group-hover:text-white transition-all" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-[#3B302B] mb-1">{p.name}</div>
                              <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{p.status} • {p.dist}</div>
                              <div className="text-[11px] font-bold text-[#8C7A6E] mt-2 group-hover:text-[#4A3C31] transition-colors">{p.actionText}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-[#4A3C31]">{p.rating}</div>
                            <div className="text-[10px] text-stone-300 font-bold uppercase tracking-widest mt-1">Rating</div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
                <div className="relative p-12 bg-[#4A3C31] rounded-[4rem] text-white space-y-10 overflow-hidden shadow-2xl shadow-stone-900/40">
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-3xl font-serif">Compounding Excellence</h3>
                    <p className="text-stone-300 font-light leading-relaxed text-sm">
                      Standard off-the-shelf products often fail to meet biological precision. Our partners specialize in custom concentrations tailored to your scan diagnostics.
                    </p>
                    <button
                      onClick={() => setShowConsultModal(true)}
                      className="w-full flex items-center justify-center gap-4 bg-white text-[#4A3C31] py-5 rounded-3xl font-bold text-sm hover:bg-stone-100 transition-all shadow-xl shadow-stone-900/20"
                    >
                      <MessageSquare className="w-5 h-5" /> Book Dermal Consultation
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Map Wrapper */}
              <ClinicMap />

              {/* Verified Dermatologists Section */}
              <div className="space-y-16">
                <div className="text-center space-y-6">
                  <h3 className="text-4xl font-serif text-[#3B302B]">Featured <span className="text-[#8C7A6E] italic">Dermatologists</span></h3>
                  <p className="text-stone-500 font-light max-w-xl mx-auto leading-relaxed">
                    Connect with our board-certified clinical partners for personalized consultations.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { name: 'Dr. Rahma Ahmed', specialization: 'Dermatology', number: '+20 12 24176366', availability: 'Available Today' },
                    { name: 'Dr. Shahd Zaitoon', specialization: 'Dermatology', number: '+20 11 55188190', availability: 'Available Tomorrow' }
                  ].map((doc, i) => (
                    <div key={i}
                      className="p-8 rounded-[2.5rem] bg-white border border-stone-100 shadow-sm space-y-8 hover:shadow-xl transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-[#4A3C31]">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{doc.availability}</span>
                      </div>
                      <div>
                        <div className="text-xs text-emerald-600 font-bold uppercase tracking-widest mb-1">{doc.specialization}</div>
                        <div className="text-2xl font-serif text-[#3B302B]">{doc.name}</div>
                      </div>
                      <div className="pt-4 border-t border-stone-50 flex flex-col gap-2">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6E]">Contact Number</div>
                        <a href={`tel:${doc.number.replace(/\s+/g, '')}`} className="text-[#4A3C31] font-medium flex items-center gap-2 hover:text-[#8C7A6E] transition-colors">
                          <Phone className="w-4 h-4 text-stone-400" />
                          {doc.number}
                        </a>
                      </div>
                      <div className="pt-4 pb-2">
                        <button className="w-full py-3 bg-stone-50 hover:bg-stone-100 text-[#4A3C31] rounded-2xl text-xs font-bold transition-all border border-stone-200">
                          Book Consultation
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}



          {/* ================= SUPPORT PAGE ================= */}
          {currentPage === 'support' && (
            <motion.div key="support" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-4xl mx-auto py-12">
              <div className="grid lg:grid-cols-2 gap-24 items-start">
                <div className="space-y-12">
                  <div className="space-y-6">
                    <h2 className="text-5xl md:text-6xl font-serif text-[#3B302B]">How can we <br /><span className="text-[#8C7A6E] italic">assist you?</span></h2>
                    <p className="text-lg text-stone-500 font-light leading-relaxed">
                      Our clinical support team is composed of licensed professionals ready to help with order tracking, tech support, or protocol clarifying.
                    </p>
                  </div>

                  <div className="space-y-8">
                    {[
                      { icon: <MessageSquare className="w-5 h-5" />, label: "Live Clinical Chat", val: "Available 24/7" },
                      { icon: <Phone className="w-5 h-5" />, label: "Phone Consultation", val: "01278962472" },
                      { icon: <Send className="w-5 h-5" />, label: "Email Support", val: "radwaalyan11@gmail.com" }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-6 items-center group cursor-pointer">
                        <div className="w-14 h-14 rounded-2xl bg-stone-100 text-[#4A3C31] flex items-center justify-center border border-stone-200 group-hover:bg-[#4A3C31] group-hover:text-white transition-all shadow-sm">
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{item.label}</div>
                          <div className="text-sm font-bold text-[#3B302B]">{item.val}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-12 rounded-[4rem] bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 shadow-2xl shadow-stone-900/5">
                  {formStatus === 'success' && (
                    <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-3xl text-sm font-medium border border-emerald-200 dark:border-emerald-800 text-center">
                      Your message has been sent successfully! We will get back to you shortly.
                    </div>
                  )}
                  {formStatus === 'error' && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-3xl text-sm font-medium border border-red-200 dark:border-red-800 text-center">
                      Please fill in all the required fields.
                    </div>
                  )}
                  <form className="space-y-8" onSubmit={handleContactSubmit}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] ml-2">Full Name</label>
                      <input name="name" type="text" className="w-full px-6 py-5 bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-3xl focus:outline-none focus:border-[#4A3C31] dark:focus:border-stone-500 transition-all font-light text-sm dark:text-stone-200" placeholder="Alexander Dermal" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
                      <input name="email" type="email" className="w-full px-6 py-5 bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-3xl focus:outline-none focus:border-[#4A3C31] dark:focus:border-stone-500 transition-all font-light text-sm dark:text-stone-200" placeholder="alex@domain.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] ml-2">Your Message</label>
                      <textarea name="message" rows={4} className="w-full px-6 py-5 bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-3xl focus:outline-none focus:border-[#4A3C31] dark:focus:border-stone-500 transition-all font-light text-sm resize-none dark:text-stone-200" placeholder="How can our clinical team help?"></textarea>
                    </div>
                    <button type="submit" className="w-full py-5 bg-[#4A3C31] hover:bg-[#3B302B] dark:bg-stone-800 dark:hover:bg-stone-700 text-white rounded-3xl font-bold text-sm transition-all flex items-center justify-center gap-4 shadow-xl shadow-[#4A3C31]/20 group">
                      Submit request <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}


          {/* ================= AI PAGE (COMING SOON) ================= */}
          {currentPage === 'ai' && (
            <motion.div key="ai" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-4xl mx-auto py-20">
              <div className="relative p-20 rounded-[4rem] bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 shadow-2xl overflow-hidden text-center space-y-12">
                {/* Abstract Tech Background */}
                <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20">
                  <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#4A3C31 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                </div>

                <div className="relative z-10 space-y-8">
                  <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[#4A3C31] dark:text-stone-300 text-[10px] font-bold tracking-[0.3em] uppercase"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    Neural Network Expansion
                  </div>

                  <h2 className="text-6xl md:text-7xl font-serif text-[#3B302B] dark:text-stone-100 leading-tight">
                    Artificial <span className="text-[#8C7A6E] dark:text-[#C2B29F] italic">Intelligence</span>
                  </h2>

                  <p className="text-xl text-stone-500 dark:text-stone-400 font-light max-w-2xl mx-auto leading-relaxed">
                    We are engineering a revolutionary generative dermal model. Your clinical profile will soon be synthesized into predictive visualization protocols.
                  </p>
                </div>

                <div className="relative z-10 pt-12">
                  <div className="inline-block px-12 py-6 rounded-3xl bg-[#4A3C31] dark:bg-stone-800 text-white font-serif text-2xl italic tracking-wide shadow-2xl shadow-[#4A3C31]/30">
                    Coming Q3 2026
                  </div>
                </div>

                <div className="relative z-10 pt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
                  {['Predictive Logic', 'Dermal Gen-AI', 'Bio-Symmetry'].map((label, i) => (
                    <div key={i} className="space-y-3">
                      <div className="h-1 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500/40 w-full" />
                      </div>
                      <span className="text-[9px] font-bold text-stone-400 dark:text-stone-600 uppercase tracking-widest">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= SCANNER PAGE ================= */}
          {currentPage === 'scanner' && (
            <motion.div key="scanner" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-4xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-serif text-[#3B302B] dark:text-stone-100 mb-6">
                  Product <span className="text-[#8C7A6E] dark:text-[#C2B29F] italic">Scanner</span>
                </h2>
                <p className="text-stone-500 dark:text-stone-400 font-light max-w-xl mx-auto leading-relaxed">
                  Identify pharmaceutical compounds instantly. Point your camera at any product barcode for a deep-dive clinical analysis.
                </p>
              </div>

              <div className="relative w-full max-w-2xl mx-auto">
                <ProductScanner onComplete={() => {}} />
              </div>

              <div className="mt-20 grid sm:grid-cols-3 gap-8">
                {[
                  { icon: <Fingerprint className="w-5 h-5" />, title: "Precision Scan", desc: "Deciphers EAN-13, QR, and clinical pharmaceutical identifiers." },
                  { icon: <Heart className="w-5 h-5" />, title: "Health Check", desc: "Instantly flags allergens and contraindications for your biotype." },
                  { icon: <ShieldCheck className="w-5 h-5" />, title: "Verified Data", desc: "Cross-referenced with global pharmaceutical databases." }
                ].map((tip, i) => (
                  <div key={i} className="flex gap-4 p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 shadow-sm">
                    <div className="text-[#8C7A6E] shrink-0 mt-1">{tip.icon}</div>
                    <div>
                      <h4 className="text-sm font-bold text-[#3B302B] dark:text-stone-100 mb-2">{tip.title}</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main >

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 mt-32 bg-[#0F0D0C] text-stone-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
          <div className="grid md:grid-cols-3 gap-16">
            {/* Brand Column */}
            <div className="space-y-6">
              <h3 className="text-2xl font-serif font-bold text-indigo-400 tracking-[0.15em] uppercase">SKINE</h3>
              <p className="text-stone-400 font-light leading-relaxed text-sm">
                Advanced clinical AI combining dermatological precision with expert pharmacist follow-up.
              </p>
            </div>

            {/* Services Column */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Services</h4>
              <ul className="space-y-3">
                {[
                  { label: 'AI Skin Analysis', page: 'scan' },
                  { label: 'Custom Routines', page: 'routine' },
                  { label: 'Partner Pharmacies', page: 'clinic' },
                  { label: 'Pharmacist Consultation', page: 'routine' }
                ].map((item, i) => (
                  <li key={i}>
                    <button
                      onClick={() => navigate(item.page)}
                      className="text-stone-400 hover:text-white transition-colors text-sm font-light"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Support</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Contact Us', page: 'support' },
                  { label: 'Privacy Policy', page: null },
                  { label: 'Terms of Service', page: null },
                  { label: 'Data Ethics', page: null }
                ].map((item, i) => (
                  <li key={i}>
                    <button
                      onClick={() => item.page ? navigate(item.page) : null}
                      className="text-stone-400 hover:text-white transition-colors text-sm font-light"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Gradient Divider */}
          <div className="mt-16 pt-8 border-t border-stone-800">
            <div className="h-1 w-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 opacity-40" />
            <p className="text-center text-xs text-stone-600 mt-6 font-light">
              © 2026 SkinE Clinical Elite. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ================= PHARMACIST MODAL ================= */}
      <AnimatePresence>
        {
          showConsultModal && (
            <motion.div initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-[#3B302B]/80" onClick={() => setShowConsultModal(false)} />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden border border-white/20"
              >
                <div className="p-12 pb-6 flex justify-between items-center text-[#3B302B]">
                  <h3 className="text-3xl font-serif italic">Clinical Consultation</h3>
                  <button onClick={() => setShowConsultModal(false)} className="w-12 h-12 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors">
                    <Activity className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <div className="p-12 pt-0 space-y-8">
                  <p className="text-stone-500 font-light text-sm leading-relaxed mb-10">
                    Select a clinical advisor for a personalized dermal session.
                  </p>

                  {[
                    { name: "Dr. Rahma Ahmed", role: "Active Formulation Specialist", exp: "12 Yrs Exp", rating: "5.0", available: true, phone: "+201224176366" },
                    { name: "Dr. Shahd Zaitoon", role: "Clinical Pharmacist", exp: "14 Yrs Exp", rating: "4.9", available: true, phone: "+201155188190" }
                  ].map((doc, i) => (
                    <div key={i} className="group p-8 rounded-[2.5rem] bg-stone-50 border border-stone-100 flex items-center gap-8 hover:bg-white hover:border-[#4A3C31]/20 hover:shadow-xl hover:shadow-stone-900/5 transition-all">
                      <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-3xl bg-stone-200 dark:bg-stone-800 flex items-center justify-center border border-white dark:border-stone-700 shadow-sm overflow-hidden">
                          <Stethoscope className="w-8 h-8 text-stone-400" />
                        </div>
                        {doc.available && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-stone-900 rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-serif text-[#3B302B] mb-2">{doc.name}</h4>
                        <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-4 italic">{doc.role}</p>
                        <div className="flex gap-6 text-[10px] font-bold text-[#8C7A6E] uppercase tracking-widest">
                          <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> {doc.rating}</span>
                          <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {doc.exp}</span>
                        </div>
                      </div>
                      {doc.available ? (
                        <a href={`https://wa.me/${doc.phone.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl transition-all bg-[#4A3C31] text-white hover:bg-[#3B302B] shadow-lg shadow-[#4A3C31]/20">
                          <ChevronRight className="w-6 h-6" />
                        </a>
                      ) : (
                        <button disabled className="p-4 rounded-2xl transition-all bg-stone-200 text-stone-400 cursor-not-allowed">
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  ))}


                </div>
              </motion.div>
            </motion.div>
          )
        }
      </AnimatePresence >

    </div >
  );
}

export default App;
