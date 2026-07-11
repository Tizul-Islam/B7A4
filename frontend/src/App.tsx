import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Layers,
  Shield,
  ShoppingBag,
  Star,
  User,
  Trash,
  Edit,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  LogOut,
  Search,
  ChevronRight,
  ArrowRight,
  FileText,
  Activity,
  PlusCircle,
  Check
} from 'lucide-react';
import { api } from './api';

// Toast Notification Type
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

function App() {
  // Navigation State
  const [view, setView] = useState<'home' | 'catalog' | 'details' | 'auth' | 'dashboard' | 'success' | 'cancel'>('home');
  const [selectedGearId, setSelectedGearId] = useState<string | null>(null);
  
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('gearup_token'));
  const [loadingUser, setLoadingUser] = useState(true);

  // Auth Form State
  const [isRegistering, setIsRegistering] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState<'CUSTOMER' | 'PROVIDER'>('CUSTOMER');
  const [authPhone, setAuthPhone] = useState('');
  const [authAddress, setAuthAddress] = useState('');
  
  // Data State
  const [categories, setCategories] = useState<any[]>([]);
  const [gears, setGears] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [conditionFilter, setConditionFilter] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<number>(500);

  // Detail & Booking State
  const [gearDetail, setGearDetail] = useState<any>(null);
  const [gearReviews, setGearReviews] = useState<any[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rentalQuantity, setRentalQuantity] = useState(1);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Dashboard Stats/Data State
  const [dashboardTab, setDashboardTab] = useState<string>('');
  const [customerRentals, setCustomerRentals] = useState<any[]>([]);
  const [providerOrders, setProviderOrders] = useState<any[]>([]);
  const [providerInventory, setProviderInventory] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminRentals, setAdminRentals] = useState<any[]>([]);

  // Modals & Forms State
  const [showAddGearModal, setShowAddGearModal] = useState(false);
  const [showEditGearModal, setShowEditGearModal] = useState(false);
  const [editingGear, setEditingGear] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<any>(null);
  const [reviewGearId, setReviewGearId] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  // Stripe Session State
  const [successSessionId, setSuccessSessionId] = useState<string | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [verifiedPaymentInfo, setVerifiedPaymentInfo] = useState<any>(null);

  // Global Toasts State
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Check login status on mount/token change
  useEffect(() => {
    const checkUser = async () => {
      if (token) {
        try {
          const profile = await api.auth.getMe();
          setUser(profile.data);
          // Auto set default tabs for dashboards
          if (profile.data.role === 'CUSTOMER') setDashboardTab('rentals');
          else if (profile.data.role === 'PROVIDER') setDashboardTab('inventory');
          else if (profile.data.role === 'ADMIN') setDashboardTab('stats');
        } catch (err: any) {
          showToast('Session expired. Please log in again.', 'error');
          handleLogout();
        }
      }
      setLoadingUser(false);
    };

    checkUser();
  }, [token]);

  // Load Categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.categories.list();
        setCategories(res.data || []);
      } catch (err: any) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

  // Load Catalog Gears on filters change
  useEffect(() => {
    const loadGears = async () => {
      if (view !== 'catalog' && view !== 'home') return;
      try {
        const params: any = {};
        if (selectedCategory) params.categoryId = selectedCategory;
        if (searchQuery) params.search = searchQuery;
        if (conditionFilter) params.condition = conditionFilter;
        if (priceFilter) params.maxPrice = priceFilter;

        const res = await api.gear.list(params);
        setGears(res.data || []);
      } catch (err: any) {
        console.error('Failed to load gears', err);
      }
    };

    loadGears();
  }, [view, selectedCategory, searchQuery, conditionFilter, priceFilter]);

  // Load selected gear detail
  useEffect(() => {
    const loadGearDetail = async () => {
      if (view !== 'details' || !selectedGearId) return;
      try {
        const res = await api.gear.getById(selectedGearId);
        setGearDetail(res.data);
        const reviewsRes = await api.gear.getReviews(selectedGearId);
        setGearReviews(reviewsRes.data || []);
      } catch (err: any) {
        showToast('Failed to load gear details.', 'error');
        setView('catalog');
      }
    };
    loadGearDetail();
  }, [view, selectedGearId]);

  // Catch Stripe Payment Success/Cancel URLs
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessId = params.get('session_id');
    const path = window.location.pathname;

    if (sessId && path.includes('/success')) {
      setSuccessSessionId(sessId);
      setView('success');
      window.history.replaceState({}, document.title, '/');
    } else if (path.includes('/cancel')) {
      setView('cancel');
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  // Process payment verification on success page loading
  useEffect(() => {
    const verifyPayment = async () => {
      if (view === 'success' && successSessionId && token) {
        setVerifyingPayment(true);
        try {
          const res = await api.payments.verify(successSessionId);
          setVerifiedPaymentInfo(res.data);
          showToast('Payment verified successfully!', 'success');
        } catch (err: any) {
          console.error(err);
          showToast(err.message || 'Payment verification failed.', 'error');
        } finally {
          setVerifyingPayment(false);
        }
      }
    };
    verifyPayment();
  }, [view, successSessionId, token]);

  // Load Dashboard Data depending on active tab
  useEffect(() => {
    if (view !== 'dashboard' || !user) return;

    const loadDashboardData = async () => {
      try {
        if (user.role === 'CUSTOMER') {
          if (dashboardTab === 'rentals') {
            const res = await api.rentals.list();
            setCustomerRentals(res.data || []);
          }
        } else if (user.role === 'PROVIDER') {
          if (dashboardTab === 'inventory') {
            // Providers load their inventory
            const res = await api.gear.list();
            // Filter by provider ID
            const providerItems = res.data.filter((item: any) => item.providerId === user.id);
            setProviderInventory(providerItems);
          } else if (dashboardTab === 'orders') {
            const res = await api.rentals.providerList();
            setProviderOrders(res.data || []);
          }
        } else if (user.role === 'ADMIN') {
          if (dashboardTab === 'stats') {
            const res = await api.admin.stats();
            setAdminStats(res.data);
          } else if (dashboardTab === 'categories') {
            const res = await api.categories.list();
            setCategories(res.data || []);
          } else if (dashboardTab === 'users') {
            const res = await api.admin.users();
            setAdminUsers(res.data || []);
          } else if (dashboardTab === 'rentals') {
            const res = await api.admin.rentals();
            setAdminRentals(res.data || []);
          }
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to load dashboard data.', 'error');
      }
    };

    loadDashboardData();
  }, [view, dashboardTab, user]);

  // Auth Operations
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        const payload: any = {
          email: authEmail,
          password: authPassword,
          name: authName,
          role: authRole,
        };
        if (authPhone) payload.phone = authPhone;
        if (authAddress) payload.address = authAddress;

        await api.auth.register(payload);
        showToast('Registration successful! Please log in.', 'success');
        setIsRegistering(false);
      } else {
        const res = await api.auth.login({ email: authEmail, password: authPassword });
        const loginToken = res.data.accessToken;
        localStorage.setItem('gearup_token', loginToken);
        setToken(loginToken);
        showToast('Logged in successfully!', 'success');
        setView('home');
        // Clear login fields
        setAuthEmail('');
        setAuthPassword('');
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication failed', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gearup_token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully.', 'success');
    setView('home');
  };

  // Booking Calculations
  const bookingDurationDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }, [startDate, endDate]);

  const bookingTotalAmount = useMemo(() => {
    if (!gearDetail || bookingDurationDays <= 0) return 0;
    return Number(gearDetail.pricePerDay) * rentalQuantity * bookingDurationDays;
  }, [gearDetail, bookingDurationDays, rentalQuantity]);

  const formatISO = (dateStr: string, isStart: boolean) => {
    if (!dateStr) return '';
    
    // Parse the local YYYY-MM-DD input correctly by splitting
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date();
    dateObj.setFullYear(year, month - 1, day);

    const today = new Date();
    const isSameDay = 
      dateObj.getFullYear() === today.getFullYear() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getDate() === today.getDate();

    if (isStart && isSameDay) {
      // If start date is today, return exactly now to satisfy past date check
      return new Date().toISOString();
    }

    // Set time to standard 12:00:00 local/UTC time
    dateObj.setHours(12, 0, 0, 0);
    return dateObj.toISOString();
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      showToast('Please login to place rental orders.', 'error');
      setView('auth');
      return;
    }
    if (bookingDurationDays <= 0) {
      showToast('Please select a valid date range (at least 1 day).', 'error');
      return;
    }
    setSubmittingBooking(true);
    try {
      await api.rentals.create({
        startDate: formatISO(startDate, true),
        endDate: formatISO(endDate, false),
        items: [{ gearItemId: gearDetail.id, quantity: rentalQuantity }]
      });
      showToast('Rental order placed successfully! Awaiting provider confirmation.', 'success');
      setView('dashboard');
      setDashboardTab('rentals');
    } catch (err: any) {
      showToast(err.message || 'Booking failed.', 'error');
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Customer Operations
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.rentals.cancel(orderId);
      showToast('Order cancelled successfully.', 'success');
      // Refresh rentals
      const res = await api.rentals.list();
      setCustomerRentals(res.data || []);
    } catch (err: any) {
      showToast(err.message || 'Cancellation failed.', 'error');
    }
  };

  const handlePayNow = async (orderId: string) => {
    try {
      const res = await api.payments.create(orderId);
      if (res.data?.checkoutUrl) {
        showToast('Redirecting to Stripe Checkout...', 'success');
        window.location.href = res.data.checkoutUrl;
      } else {
        showToast('Payment redirect URL not returned by server.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Payment initiation failed.', 'error');
    }
  };

  const handleOpenReviewModal = (order: any, gearId: string) => {
    setReviewOrder(order);
    setReviewGearId(gearId);
    setReviewRating(5);
    setReviewComment('');
    setShowReviewModal(true);
  };

  const handleSubmittingReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.reviews.create({
        rentalOrderId: reviewOrder.id,
        gearItemId: reviewGearId,
        rating: reviewRating,
        comment: reviewComment,
      });
      showToast('Review submitted successfully! Thank you.', 'success');
      setShowReviewModal(false);
      // Refresh dashboard rentals to hide review button if completed
      const res = await api.rentals.list();
      setCustomerRentals(res.data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review.', 'error');
    }
  };

  // Provider Operations
  const handleProviderStatusChange = async (orderId: string, status: 'CONFIRMED' | 'PICKED_UP' | 'RETURNED') => {
    try {
      await api.rentals.providerUpdateStatus(orderId, status);
      showToast(`Order status updated to ${status}.`, 'success');
      // Refresh orders
      const res = await api.rentals.providerList();
      setProviderOrders(res.data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status.', 'error');
    }
  };

  const handleAddGearSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const categoryName = formData.get('categoryName') as string;
    
    // Find category ID matching name
    const category = categories.find((c) => c.name === categoryName);
    if (!category) {
      showToast('Please select a valid category', 'error');
      return;
    }

    const payload = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      brand: formData.get('brand') as string,
      pricePerDay: Number(formData.get('pricePerDay')),
      stockQuantity: Number(formData.get('stockQuantity')),
      condition: formData.get('condition') as 'NEW' | 'GOOD' | 'FAIR',
      categoryId: category.id,
      images: [formData.get('imageUrl') as string || '']
    };

    try {
      await api.gear.providerCreate(payload);
      showToast('Gear item listed successfully!', 'success');
      setShowAddGearModal(false);
      // Refresh provider inventory
      const res = await api.gear.list();
      setProviderInventory(res.data.filter((item: any) => item.providerId === user.id));
    } catch (err: any) {
      showToast(err.message || 'Failed to add gear.', 'error');
    }
  };

  const handleOpenEditModal = (gear: any) => {
    setEditingGear(gear);
    setShowEditGearModal(true);
  };

  const handleEditGearSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const categoryName = formData.get('categoryName') as string;
    const category = categories.find((c) => c.name === categoryName);
    
    if (!category) {
      showToast('Please select a valid category', 'error');
      return;
    }

    const payload = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      brand: formData.get('brand') as string,
      pricePerDay: Number(formData.get('pricePerDay')),
      stockQuantity: Number(formData.get('stockQuantity')),
      condition: formData.get('condition') as 'NEW' | 'GOOD' | 'FAIR',
      categoryId: category.id,
      images: [formData.get('imageUrl') as string || '']
    };

    try {
      await api.gear.providerUpdate(editingGear.id, payload);
      showToast('Gear item updated successfully!', 'success');
      setShowEditGearModal(false);
      setEditingGear(null);
      // Refresh inventory
      const res = await api.gear.list();
      setProviderInventory(res.data.filter((item: any) => item.providerId === user.id));
    } catch (err: any) {
      showToast(err.message || 'Failed to update gear.', 'error');
    }
  };

  const handleDeleteGear = async (gearId: string) => {
    if (!window.confirm('Are you sure you want to delete this gear item?')) return;
    try {
      await api.gear.providerDelete(gearId);
      showToast('Gear item deleted successfully.', 'success');
      // Refresh inventory
      const res = await api.gear.list();
      setProviderInventory(res.data.filter((item: any) => item.providerId === user.id));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete gear.', 'error');
    }
  };

  // Admin Operations
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to change user status to ${nextStatus}?`)) return;
    try {
      await api.admin.updateUserStatus(userId, nextStatus);
      showToast(`User status updated to ${nextStatus}.`, 'success');
      // Refresh user list
      const res = await api.admin.users();
      setAdminUsers(res.data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to update user status.', 'error');
    }
  };

  const handleAddCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    try {
      await api.categories.create({ name, description });
      showToast('Category created successfully.', 'success');
      e.currentTarget.reset();
      // Refresh categories list
      const res = await api.categories.list();
      setCategories(res.data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to create category.', 'error');
    }
  };

  const handleAdminDeleteCategory = async (catId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.categories.delete(catId);
      showToast('Category deleted successfully.', 'success');
      // Refresh categories
      const res = await api.categories.list();
      setCategories(res.data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category.', 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification HUD */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Premium Navbar */}
      <nav className="navbar">
        <a className="nav-brand" onClick={() => setView('home')}>
          Gear<span>Up</span>
        </a>

        <ul className="nav-links">
          <li>
            <a className={`nav-link ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')}>
              Home
            </a>
          </li>
          <li>
            <a className={`nav-link ${view === 'catalog' ? 'active' : ''}`} onClick={() => setView('catalog')}>
              Browse Gear
            </a>
          </li>
          {user && (
            <li>
              <a className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
                Dashboard ({user.role})
              </a>
            </li>
          )}
        </ul>

        <div className="nav-user">
          {loadingUser ? (
            <div className="spinner" style={{ width: 16, height: 16 }}></div>
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Hello, <strong style={{ color: '#fff' }}>{user.name}</strong>
              </span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                <LogOut size={14} /> Log Out
              </button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => { setIsRegistering(false); setView('auth'); }}>
              <User size={14} /> Log In / Register
            </button>
          )}
        </div>
      </nav>

      {/* Main Container */}
      <main className="main-content">
        
        {/* VIEW: HOME */}
        {view === 'home' && (
          <div>
            {/* Hero Section */}
            <section className="hero-section">
              <div className="hero-glow"></div>
              <h1 className="hero-title">
                Rent, Don’t Buy.<br />
                <span>Explore the Outdoors</span> with GearUp
              </h1>
              <p className="hero-subtitle">
                Premium sports and outdoor equipment rentals at a fraction of the retail cost. Browse tents, cycles, water gears, and head out on your adventure today.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button className="btn btn-primary" onClick={() => setView('catalog')}>
                  Browse Inventory <ChevronRight size={18} />
                </button>
                {!user && (
                  <button className="btn btn-secondary" onClick={() => { setIsRegistering(true); setView('auth'); }}>
                    Start RENTING now <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </section>

            {/* Quick Categories Section */}
            <section className="categories-container" style={{ marginTop: '2rem' }}>
              <div className="section-header">
                <div>
                  <h2 className="section-title">Rent By Category</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Explore gears tailored for your next expedition</p>
                </div>
              </div>
              
              <div className="category-list">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="category-card glass-panel"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setView('catalog');
                    }}
                  >
                    <div className="category-icon">
                      <Compass size={24} />
                    </div>
                    <h3>{cat.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cat.description || 'Outdoor essentials'}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Core Idea Intro Cards */}
            <section style={{ marginBottom: '4rem', marginTop: '2rem' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '2.5rem', fontSize: '2rem' }}>Platform Features</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                
                <div className="glass-panel" style={{ padding: '2.5rem' }}>
                  <div className="category-icon" style={{ marginBottom: '1.5rem', background: 'var(--accent-teal-glow)' }}>
                    <ShoppingBag size={24} />
                  </div>
                  <h3>Flexible Rentals</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                    Select specific rental date ranges. Providers handle the preparation, pricing, and handover. No need to store bulky tents at home.
                  </p>
                </div>

                <div className="glass-panel" style={{ padding: '2.5rem' }}>
                  <div className="category-icon" style={{ marginBottom: '1.5rem', background: 'var(--accent-orange-glow)', color: 'var(--accent-orange)' }}>
                    <DollarSign size={24} />
                  </div>
                  <h3>Provider Marketplace</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                    Have outdoor equipment lying around? Register as a Provider, list your gear, adjust daily prices, and make passive income securely.
                  </p>
                </div>

                <div className="glass-panel" style={{ padding: '2.5rem' }}>
                  <div className="category-icon" style={{ marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                    <Shield size={24} />
                  </div>
                  <h3>Secure Payments</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                    Integrated Stripe Checkout handles customer payments directly. Rental amounts are securely held until pickup and returns are successfully closed.
                  </p>
                </div>

              </div>
            </section>
          </div>
        )}

        {/* VIEW: CATALOG */}
        {view === 'catalog' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h1>Explore Equipment Catalog</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Find top quality hiking, camping, cycling, and climbing gears from local providers</p>
            </div>

            <div className="catalog-layout">
              {/* Sidebar Filters */}
              <aside className="filter-sidebar glass-panel">
                <div className="filter-section">
                  <h3 className="filter-title">Search</h3>
                  <div className="search-input-wrapper">
                    <Search className="search-icon-svg" size={18} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search equipment..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="filter-section">
                  <h3 className="filter-title">Category</h3>
                  <select
                    className="form-control"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-section">
                  <h3 className="filter-title">Condition</h3>
                  <select
                    className="form-control"
                    value={conditionFilter}
                    onChange={(e) => setConditionFilter(e.target.value)}
                  >
                    <option value="">Any Condition</option>
                    <option value="NEW">New (Unused)</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair (Shows use)</option>
                  </select>
                </div>

                <div className="filter-section">
                  <h3 className="filter-title">Max Price Per Day: ${priceFilter}</h3>
                  <input
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    style={{ width: '100%', accentColor: 'var(--accent-teal)' }}
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(Number(e.target.value))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    <span>$5</span>
                    <span>$500</span>
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setSelectedCategory('');
                    setSearchQuery('');
                    setConditionFilter('');
                    setPriceFilter(500);
                  }}
                >
                  Reset Filters
                </button>
              </aside>

              {/* Gear Grid */}
              <div style={{ flex: 1 }}>
                {gears.length === 0 ? (
                  <div className="empty-state glass-panel">
                    <ShoppingBag className="empty-state-icon" />
                    <h3>No Equipment Found</h3>
                    <p style={{ marginTop: '0.5rem' }}>Try adjusting your filters or search queries.</p>
                  </div>
                ) : (
                  <div className="gear-grid">
                    {gears.map((g) => (
                      <div key={g.id} className="gear-card glass-panel" style={{ cursor: 'pointer' }} onClick={() => { setSelectedGearId(g.id); setView('details'); }}>
                        <div className="gear-image-container">
                          {g.images && g.images[0] ? (
                            <img src={g.images[0]} alt={g.name} className="gear-img" onError={(e) => {
                              // If broken link, hide image
                              (e.target as HTMLElement).style.display = 'none';
                            }} />
                          ) : null}
                          <div className="gear-placeholder-img">
                            <Compass size={36} />
                          </div>
                          <span className={`badge gear-condition-badge ${g.condition === 'NEW' ? 'badge-success' : g.condition === 'GOOD' ? 'badge-info' : 'badge-warning'}`}>
                            {g.condition}
                          </span>
                        </div>

                        <div className="gear-body">
                          <span className="gear-brand">{g.brand}</span>
                          <h3 className="gear-name">{g.name}</h3>
                          <p className="gear-desc">{g.description}</p>
                          
                          <div className="gear-footer">
                            <div className="gear-price">
                              ${Number(g.pricePerDay).toFixed(2)}<span> / day</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: g.availableQuantity > 0 ? '#6ee7b7' : '#fca5a5' }}>
                              {g.availableQuantity > 0 ? `${g.availableQuantity} available` : 'Out of stock'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: GEAR DETAILS */}
        {view === 'details' && gearDetail && (
          <div>
            <button className="btn btn-secondary btn-sm" style={{ marginBottom: '2rem' }} onClick={() => setView('catalog')}>
              ← Back to Catalog
            </button>

            <div className="details-layout">
              {/* Product Gallery & Details */}
              <div>
                <div className="details-gallery">
                  {gearDetail.images && gearDetail.images[0] ? (
                    <img src={gearDetail.images[0]} alt={gearDetail.name} className="details-main-img" />
                  ) : (
                    <div className="details-main-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'var(--text-muted)' }}>
                      <Compass size={96} />
                    </div>
                  )}
                </div>

                <div className="details-info">
                  <div className="details-title-row">
                    <span className="gear-brand" style={{ fontSize: '0.95rem' }}>{gearDetail.brand}</span>
                    <h1>{gearDetail.name}</h1>
                    <div className="details-meta-items">
                      <span className={`badge ${gearDetail.condition === 'NEW' ? 'badge-success' : gearDetail.condition === 'GOOD' ? 'badge-info' : 'badge-warning'}`}>
                        Condition: {gearDetail.condition}
                      </span>
                      <span>•</span>
                      <span style={{ color: 'var(--text-secondary)' }}>Category: <strong>{gearDetail.category?.name || 'General'}</strong></span>
                      <span>•</span>
                      <span style={{ color: gearDetail.availableQuantity > 0 ? '#6ee7b7' : '#fca5a5' }}>
                        {gearDetail.availableQuantity > 0 ? `${gearDetail.availableQuantity} units available` : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  <p className="details-desc">{gearDetail.description}</p>
                  
                  {/* Reviews Section */}
                  <div className="reviews-section">
                    <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Star size={22} style={{ fill: '#f59e0b', color: '#f59e0b' }} /> Reviews ({gearReviews.length})
                    </h2>
                    {gearReviews.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)' }}>No reviews yet for this equipment. Be the first to rent and write one!</p>
                    ) : (
                      <div>
                        {gearReviews.map((rev) => (
                          <div key={rev.id} className="review-item glass-panel">
                            <div className="review-header">
                              <span className="reviewer-name">{rev.customer?.name || 'Jane Doe'}</span>
                              <div className="review-rating">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={14} style={{ fill: i < rev.rating ? '#f59e0b' : 'none', color: '#f59e0b' }} />
                                ))}
                              </div>
                            </div>
                            <p className="review-comment">"{rev.comment}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Panel */}
              <aside>
                <div className="booking-panel glass-panel">
                  <div className="booking-price">
                    ${Number(gearDetail.pricePerDay).toFixed(2)} <span>/ day</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      min={new Date().toISOString().split('T')[0]}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      min={startDate || new Date().toISOString().split('T')[0]}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      max={gearDetail.availableQuantity || 1}
                      value={rentalQuantity}
                      onChange={(e) => setRentalQuantity(Math.min(Number(e.target.value), gearDetail.availableQuantity))}
                    />
                  </div>

                  {bookingDurationDays > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <div className="booking-summary-row">
                        <span>Daily Rate</span>
                        <span>${Number(gearDetail.pricePerDay).toFixed(2)}</span>
                      </div>
                      <div className="booking-summary-row">
                        <span>Duration</span>
                        <span>{bookingDurationDays} days</span>
                      </div>
                      <div className="booking-summary-row">
                        <span>Quantity</span>
                        <span>{rentalQuantity}x</span>
                      </div>
                      <div className="booking-total-row">
                        <span>Total Cost</span>
                        <span>${bookingTotalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1rem' }}
                    onClick={handlePlaceOrder}
                    disabled={submittingBooking || gearDetail.availableQuantity === 0}
                  >
                    {submittingBooking ? (
                      <span className="spinner" style={{ width: 16, height: 16 }}></span>
                    ) : (
                      'Request Rental Order'
                    )}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        )}

        {/* VIEW: AUTHENTICATION */}
        {view === 'auth' && (
          <div className="auth-wrapper glass-panel">
            <div className="auth-header">
              <h2 className="auth-title">{isRegistering ? 'Create GearUp Account' : 'Welcome Back'}</h2>
              <p className="auth-subtitle">
                {isRegistering ? 'Join as a Customer or Provider to rent or lend gear' : 'Access your outdoor rentals dashboard'}
              </p>
            </div>

            <form onSubmit={handleAuth}>
              {isRegistering && (
                <>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="Jane Doe"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Register As</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="role"
                          checked={authRole === 'CUSTOMER'}
                          onChange={() => setAuthRole('CUSTOMER')}
                        />
                        Customer (Rent gear)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="role"
                          checked={authRole === 'PROVIDER'}
                          onChange={() => setAuthRole('PROVIDER')}
                        />
                        Provider (Lend/Sell inventory)
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  placeholder="jane@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>

              {isRegistering && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+88017..."
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Dhaka, Bangladesh"
                      value={authAddress}
                      onChange={(e) => setAuthAddress(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                {isRegistering ? 'Sign Up' : 'Log In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
              {isRegistering ? (
                <p style={{ color: 'var(--text-secondary)' }}>
                  Already have an account?{' '}
                  <a style={{ color: 'var(--accent-teal)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setIsRegistering(false)}>
                    Log In
                  </a>
                </p>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>
                  Don’t have an account?{' '}
                  <a style={{ color: 'var(--accent-teal)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setIsRegistering(true)}>
                    Sign Up
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        {/* VIEW: DASHBOARD */}
        {view === 'dashboard' && user && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h1>Platform Control Panel</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Logged in as: <strong>{user.name} ({user.role})</strong></p>
            </div>

            <div className="dashboard-layout">
              {/* Dashboard Navigation */}
              <aside className="dashboard-sidebar">
                
                {/* Customer Menu */}
                {user.role === 'CUSTOMER' && (
                  <>
                    <div
                      className={`sidebar-nav-item ${dashboardTab === 'rentals' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('rentals')}
                    >
                      <ShoppingBag size={18} /> Active Rentals
                    </div>
                  </>
                )}

                {/* Provider Menu */}
                {user.role === 'PROVIDER' && (
                  <>
                    <div
                      className={`sidebar-nav-item ${dashboardTab === 'inventory' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('inventory')}
                    >
                      <Layers size={18} /> My Gear Inventory
                    </div>
                    <div
                      className={`sidebar-nav-item ${dashboardTab === 'orders' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('orders')}
                    >
                      <FileText size={18} /> Customer Rental Orders
                    </div>
                  </>
                )}

                {/* Admin Menu */}
                {user.role === 'ADMIN' && (
                  <>
                    <div
                      className={`sidebar-nav-item ${dashboardTab === 'stats' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('stats')}
                    >
                      <Activity size={18} /> Platform Stats
                    </div>
                    <div
                      className={`sidebar-nav-item ${dashboardTab === 'categories' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('categories')}
                    >
                      <Compass size={18} /> Categories
                    </div>
                    <div
                      className={`sidebar-nav-item ${dashboardTab === 'users' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('users')}
                    >
                      <User size={18} /> User Moderation
                    </div>
                    <div
                      className={`sidebar-nav-item ${dashboardTab === 'rentals' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('rentals')}
                    >
                      <ShoppingBag size={18} /> All Platform Rentals
                    </div>
                  </>
                )}
              </aside>

              {/* Dashboard Content Container */}
              <div className="glass-panel" style={{ flex: 1, padding: '2rem', minHeight: '400px' }}>
                
                {/* CUSTOMER TAB: RENTALS */}
                {user.role === 'CUSTOMER' && dashboardTab === 'rentals' && (
                  <div>
                    <h2 style={{ marginBottom: '1.5rem' }}>Active Rental Orders</h2>
                    {customerRentals.length === 0 ? (
                      <div className="empty-state">
                        <ShoppingBag className="empty-state-icon" />
                        <p>You haven't rented any equipment yet.</p>
                        <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }} onClick={() => setView('catalog')}>
                          Browse Catalog
                        </button>
                      </div>
                    ) : (
                      <div className="table-container">
                        <table className="dashboard-table">
                          <thead>
                            <tr>
                              <th>Equipment</th>
                              <th>Dates</th>
                              <th>Total Price</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerRentals.map((order) => {
                              const item = order.items?.[0];
                              const gear = item?.gearItem;
                              return (
                                <tr key={order.id}>
                                  <td>
                                    <div>
                                      <strong>{gear?.name || 'Outdoor Gear'}</strong>
                                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Brand: {gear?.brand || 'N/A'}</div>
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                      <Calendar size={14} style={{ color: 'var(--accent-teal)' }} />
                                      <span>{new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}</span>
                                    </div>
                                  </td>
                                  <td>
                                    <strong>${Number(order.totalAmount).toFixed(2)}</strong>
                                  </td>
                                  <td>
                                    <span className={`badge ${
                                      order.status === 'PLACED' ? 'badge-warning' :
                                      order.status === 'CONFIRMED' ? 'badge-info' :
                                      order.status === 'PAID' ? 'badge-success' :
                                      order.status === 'PICKED_UP' ? 'badge-success' :
                                      order.status === 'RETURNED' ? 'badge-info' : 'badge-danger'
                                    }`}>
                                      {order.status}
                                    </span>
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                      {order.status === 'PLACED' && (
                                        <button className="btn btn-danger btn-sm" onClick={() => handleCancelOrder(order.id)}>
                                          Cancel
                                        </button>
                                      )}
                                      {order.status === 'CONFIRMED' && (
                                        <button className="btn btn-primary btn-sm" onClick={() => handlePayNow(order.id)}>
                                          Pay Now (Stripe)
                                        </button>
                                      )}
                                      {order.status === 'RETURNED' && (
                                        <button
                                          className="btn btn-secondary btn-sm"
                                          onClick={() => handleOpenReviewModal(order, gear?.id)}
                                        >
                                          Write Review
                                        </button>
                                      )}
                                      {order.status !== 'PLACED' && order.status !== 'CONFIRMED' && order.status !== 'RETURNED' && (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No pending action</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* PROVIDER TAB: INVENTORY */}
                {user.role === 'PROVIDER' && dashboardTab === 'inventory' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h2>My Gear Listings</h2>
                      <button className="btn btn-primary btn-sm" onClick={() => setShowAddGearModal(true)}>
                        <PlusCircle size={16} /> Add Gear
                      </button>
                    </div>

                    {providerInventory.length === 0 ? (
                      <div className="empty-state">
                        <Layers className="empty-state-icon" />
                        <p>No gear registered in your inventory yet.</p>
                      </div>
                    ) : (
                      <div className="table-container">
                        <table className="dashboard-table">
                          <thead>
                            <tr>
                              <th>Gear Name</th>
                              <th>Brand</th>
                              <th>Daily Price</th>
                              <th>Stock</th>
                              <th>Condition</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {providerInventory.map((gear) => (
                              <tr key={gear.id}>
                                <td><strong>{gear.name}</strong></td>
                                <td>{gear.brand}</td>
                                <td><strong>${Number(gear.pricePerDay).toFixed(2)}</strong></td>
                                <td>{gear.availableQuantity} / {gear.stockQuantity}</td>
                                <td>
                                  <span className={`badge ${
                                    gear.condition === 'NEW' ? 'badge-success' : gear.condition === 'GOOD' ? 'badge-info' : 'badge-warning'
                                  }`}>
                                    {gear.condition}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEditModal(gear)}>
                                      <Edit size={12} /> Edit
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteGear(gear.id)}>
                                      <Trash size={12} /> Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* PROVIDER TAB: ORDERS */}
                {user.role === 'PROVIDER' && dashboardTab === 'orders' && (
                  <div>
                    <h2 style={{ marginBottom: '1.5rem' }}>Customer Rental Orders</h2>
                    {providerOrders.length === 0 ? (
                      <div className="empty-state">
                        <FileText className="empty-state-icon" />
                        <p>No customer orders placed for your gears yet.</p>
                      </div>
                    ) : (
                      <div className="table-container">
                        <table className="dashboard-table">
                          <thead>
                            <tr>
                              <th>Customer</th>
                              <th>Rental Item</th>
                              <th>Rental Period</th>
                              <th>Order Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {providerOrders.map((order) => {
                              const item = order.items?.[0];
                              const gear = item?.gearItem;
                              return (
                                <tr key={order.id}>
                                  <td>
                                    <div>
                                      <strong>{order.customer?.name || 'Customer'}</strong>
                                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email: {order.customer?.email}</div>
                                    </div>
                                  </td>
                                  <td>
                                    <div>
                                      <strong>{gear?.name || 'Gear Item'}</strong>
                                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Qty: {item?.quantity || 1}</div>
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ fontSize: '0.85rem' }}>
                                      {new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}
                                    </div>
                                  </td>
                                  <td>
                                    <span className={`badge ${
                                      order.status === 'PLACED' ? 'badge-warning' :
                                      order.status === 'CONFIRMED' ? 'badge-info' :
                                      order.status === 'PAID' ? 'badge-success' :
                                      order.status === 'PICKED_UP' ? 'badge-success' :
                                      order.status === 'RETURNED' ? 'badge-info' : 'badge-danger'
                                    }`}>
                                      {order.status}
                                    </span>
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                      {order.status === 'PLACED' && (
                                        <button
                                          className="btn btn-primary btn-sm"
                                          onClick={() => handleProviderStatusChange(order.id, 'CONFIRMED')}
                                        >
                                          Confirm Order
                                        </button>
                                      )}
                                      {order.status === 'PAID' && (
                                        <button
                                          className="btn btn-accent btn-sm"
                                          onClick={() => handleProviderStatusChange(order.id, 'PICKED_UP')}
                                        >
                                          Hand Over (Picked Up)
                                        </button>
                                      )}
                                      {order.status === 'PICKED_UP' && (
                                        <button
                                          className="btn btn-primary btn-sm"
                                          onClick={() => handleProviderStatusChange(order.id, 'RETURNED')}
                                        >
                                          Confirm Return
                                        </button>
                                      )}
                                      {order.status !== 'PLACED' && order.status !== 'PAID' && order.status !== 'PICKED_UP' && (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Locked status</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* ADMIN TAB: STATS */}
                {user.role === 'ADMIN' && dashboardTab === 'stats' && adminStats && (
                  <div>
                    <h2 style={{ marginBottom: '1.5rem' }}>Platform Stats</h2>
                    <div className="stats-grid">
                      <div className="stats-card glass-panel">
                        <span className="stats-label">Total Revenue</span>
                        <div className="stats-val" style={{ color: '#10b981' }}>${Number(adminStats.totalRevenue || 0).toFixed(2)}</div>
                        <span className="stats-desc">Aggregated sales via Stripe Checkout</span>
                      </div>
                      
                      <div className="stats-card glass-panel">
                        <span className="stats-label">Total Users</span>
                        <div className="stats-val">{adminStats.totalUsers || 0}</div>
                        <span className="stats-desc">Customers and Providers registered</span>
                      </div>

                      <div className="stats-card glass-panel">
                        <span className="stats-label">Total Gears</span>
                        <div className="stats-val">{adminStats.totalGearItems || 0}</div>
                        <span className="stats-desc">Inventory equipment catalog listings</span>
                      </div>

                      <div className="stats-card glass-panel">
                        <span className="stats-label">Total Rentals</span>
                        <div className="stats-val">{adminStats.totalRentals || 0}</div>
                        <span className="stats-desc">Historical bookings placed</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ADMIN TAB: CATEGORIES */}
                {user.role === 'ADMIN' && dashboardTab === 'categories' && (
                  <div>
                    <h2 style={{ marginBottom: '1.5rem' }}>Category Management</h2>
                    
                    {/* Add Category Form */}
                    <form onSubmit={handleAddCategorySubmit} className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Create New Category</h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Category Name</label>
                          <input type="text" name="name" className="form-control" placeholder="Water Sports" required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <input type="text" name="description" className="form-control" placeholder="Kayaks, surfboards, etc." />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary btn-sm">Create Category</button>
                    </form>

                    <div className="table-container">
                      <table className="dashboard-table">
                        <thead>
                          <tr>
                            <th>Category Name</th>
                            <th>Description</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((cat) => (
                            <tr key={cat.id}>
                              <td><strong>{cat.name}</strong></td>
                              <td style={{ color: 'var(--text-secondary)' }}>{cat.description || 'N/A'}</td>
                              <td>
                                <button className="btn btn-danger btn-sm" onClick={() => handleAdminDeleteCategory(cat.id)}>
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ADMIN TAB: USERS */}
                {user.role === 'ADMIN' && dashboardTab === 'users' && (
                  <div>
                    <h2 style={{ marginBottom: '1.5rem' }}>User Control Panel</h2>
                    <div className="table-container">
                      <table className="dashboard-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Account Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminUsers.map((u) => (
                            <tr key={u.id}>
                              <td><strong>{u.name}</strong></td>
                              <td>{u.email}</td>
                              <td>
                                <span className={`badge ${u.role === 'PROVIDER' ? 'badge-info' : u.role === 'ADMIN' ? 'badge-danger' : 'badge-success'}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${u.activeStatus === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                                  {u.activeStatus}
                                </span>
                              </td>
                              <td>
                                {u.role !== 'ADMIN' ? (
                                  <button
                                    className={`btn btn-sm ${u.activeStatus === 'ACTIVE' ? 'btn-danger' : 'btn-primary'}`}
                                    onClick={() => handleToggleUserStatus(u.id, u.activeStatus)}
                                  >
                                    {u.activeStatus === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                  </button>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Owner</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ADMIN TAB: RENTALS */}
                {user.role === 'ADMIN' && dashboardTab === 'rentals' && (
                  <div>
                    <h2 style={{ marginBottom: '1.5rem' }}>All Platform Rentals</h2>
                    {adminRentals.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)' }}>No rentals recorded on platform yet.</p>
                    ) : (
                      <div className="table-container">
                        <table className="dashboard-table">
                          <thead>
                            <tr>
                              <th>Customer</th>
                              <th>Total Amount</th>
                              <th>Dates</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {adminRentals.map((order) => (
                              <tr key={order.id}>
                                <td>
                                  <div>
                                    <strong>{order.customer?.name}</strong>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.customer?.email}</div>
                                  </div>
                                </td>
                                <td><strong>${Number(order.totalAmount).toFixed(2)}</strong></td>
                                <td>
                                  <div style={{ fontSize: '0.85rem' }}>
                                    {new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}
                                  </div>
                                </td>
                                <td>
                                  <span className={`badge ${
                                    order.status === 'PLACED' ? 'badge-warning' :
                                    order.status === 'CONFIRMED' ? 'badge-info' :
                                    order.status === 'PAID' ? 'badge-success' :
                                    order.status === 'PICKED_UP' ? 'badge-success' :
                                    order.status === 'RETURNED' ? 'badge-info' : 'badge-danger'
                                  }`}>
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* VIEW: STRIPE SUCCESS PAGE */}
        {view === 'success' && (
          <div className="stripe-status-card glass-panel">
            <div className="status-icon-glow success">
              <Check size={40} />
            </div>
            {verifyingPayment ? (
              <div>
                <h2>Verifying Payment...</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Please wait while we verify your Stripe checkout session.</p>
                <div className="spinner" style={{ marginTop: '1.5rem' }}></div>
              </div>
            ) : (
              <div>
                <h2>Payment Successful!</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '2rem' }}>
                  Thank you! Your payment was verified, and your order status is now marked as <strong>PAID</strong>. You can proceed to pick up the gear at the specified time.
                </p>
                {verifiedPaymentInfo && (
                  <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', textAlign: 'left', fontSize: '0.9rem' }}>
                    <div style={{ margin: '0.25rem 0' }}>Order ID: <strong>{verifiedPaymentInfo.rentalOrderId}</strong></div>
                    <div style={{ margin: '0.25rem 0' }}>Transaction: <strong>{verifiedPaymentInfo.transactionId}</strong></div>
                    <div style={{ margin: '0.25rem 0' }}>Amount: <strong>${Number(verifiedPaymentInfo.amount).toFixed(2)}</strong></div>
                  </div>
                )}
                <button className="btn btn-primary" onClick={() => { setView('dashboard'); setDashboardTab('rentals'); }}>
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW: STRIPE CANCEL PAGE */}
        {view === 'cancel' && (
          <div className="stripe-status-card glass-panel">
            <div className="status-icon-glow cancel">
              <AlertCircle size={40} />
            </div>
            <h2>Checkout Cancelled</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '2rem' }}>
              Your transaction was cancelled and no charges were made. You can pay again at any time from your Customer dashboard.
            </p>
            <button className="btn btn-secondary" onClick={() => { setView('dashboard'); setDashboardTab('rentals'); }}>
              Back to My Rentals
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '2rem', background: 'rgba(11, 15, 25, 0.8)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4rem' }}>
        <p>© 2026 GearUp Rental Marketplace. All rights reserved. Rent, Don't Buy.</p>
      </footer>

      {/* MODAL: ADD GEAR ITEM (PROVIDER) */}
      {showAddGearModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>List New Gear Item</h3>
              <button className="modal-close" onClick={() => setShowAddGearModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddGearSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input type="text" name="name" className="form-control" required placeholder="4-Person Waterproof Tent" />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input type="text" name="brand" className="form-control" required placeholder="Quechua" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" rows={3} className="form-control" required placeholder="High quality waterproof hiking tent..."></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price Per Day ($)</label>
                  <input type="number" name="pricePerDay" className="form-control" required min="1" step="0.5" placeholder="15" />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input type="number" name="stockQuantity" className="form-control" required min="1" placeholder="3" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select name="condition" className="form-control" required>
                    <option value="NEW">New</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select name="categoryName" className="form-control" required>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input type="url" name="imageUrl" className="form-control" placeholder="https://unsplash.com/..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddGearModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">List Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT GEAR ITEM (PROVIDER) */}
      {showEditGearModal && editingGear && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>Edit Gear Item</h3>
              <button className="modal-close" onClick={() => { setShowEditGearModal(false); setEditingGear(null); }}>&times;</button>
            </div>
            <form onSubmit={handleEditGearSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input type="text" name="name" className="form-control" defaultValue={editingGear.name} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input type="text" name="brand" className="form-control" defaultValue={editingGear.brand} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" rows={3} className="form-control" defaultValue={editingGear.description} required></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price Per Day ($)</label>
                  <input type="number" name="pricePerDay" className="form-control" defaultValue={editingGear.pricePerDay} required min="1" step="0.5" />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input type="number" name="stockQuantity" className="form-control" defaultValue={editingGear.stockQuantity} required min="1" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select name="condition" className="form-control" defaultValue={editingGear.condition} required>
                    <option value="NEW">New</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select name="categoryName" className="form-control" defaultValue={editingGear.category?.name} required>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input type="url" name="imageUrl" className="form-control" defaultValue={editingGear.images?.[0] || ''} placeholder="https://unsplash.com/..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setShowEditGearModal(false); setEditingGear(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Update Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT REVIEW (CUSTOMER) */}
      {showReviewModal && reviewOrder && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>Write Review for Gear</h3>
              <button className="modal-close" onClick={() => setShowReviewModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmittingReview}>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div className="stars-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= reviewRating ? 'selected' : ''}
                      onClick={() => setReviewRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Review Comment</label>
                <textarea
                  className="form-control"
                  rows={4}
                  required
                  placeholder="Share your experience with this equipment. Was it clean? Did it perform well?"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
