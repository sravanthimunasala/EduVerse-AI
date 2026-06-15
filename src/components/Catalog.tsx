import React, { useState, useEffect } from 'react';
import { Search, Grid, List, Filter, ShoppingCart, Heart, Star, Check, Sparkles, Mic, Volume2 } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils';

interface CatalogProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  wishlist: Product[];
  isStudentVerified: boolean;
  academicLevelFilter: 'School' | 'College' | 'University' | 'Teacher' | 'All';
  setAcademicLevelFilter: (lvl: 'School' | 'College' | 'University' | 'Teacher' | 'All') => void;
}

export default function Catalog({
  products,
  onProductClick,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  isStudentVerified,
  academicLevelFilter,
  setAcademicLevelFilter
}: CatalogProps) {
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number>(500);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // AI suggestions list fetched from backend
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Auto search suggestion on keyword seed triggers
  useEffect(() => {
    if (!searchTerm.trim()) {
      setAiSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/ai/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchTerm })
        });
        if (response.ok) {
          const data = await response.json();
          setAiSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.error('Failed to grab suggestions', err);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const listenVoiceSearch = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported on this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.lang = 'en-US';

    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setSearchTerm(text);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  // Unique Brands in local products
  const brands = ['all', ...Array.from(new Set(products.map(p => p.brand)))];

  // Filtering Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesPrice = p.price <= priceRange;
    const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;
    const matchesRating = p.rating >= minRating;
    const matchesLevel = academicLevelFilter === 'All' || p.academicLevel === academicLevelFilter || p.academicLevel === 'All';

    return matchesSearch && matchesCategory && matchesPrice && matchesBrand && matchesRating && matchesLevel;
  });

  return (
    <div className="space-y-6" id="product-catalog-root">
      
      {/* Header Search Ribbon */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-2xl">
        <div className="relative">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search calculus textbooks, lesson organisers, virtual simulation codes..."
                className="w-full text-xs sm:text-sm pl-11 pr-12 py-3.5 bg-white dark:bg-slate-950/40 text-slate-950 dark:text-slate-100 placeholder-slate-400 rounded-xl border border-slate-150 dark:border-slate-850 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                id="catalog-search-field"
              />
              
              {/* Voice button right aligned */}
              <button
                onClick={listenVoiceSearch}
                className={`absolute right-4 top-3 p-1 rounded-md transition ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-blue-500'
                }`}
                title="Voice Search"
                id="voice-search-mic"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
            
            {/* Academic Level dropdown tags */}
            <div className="hidden sm:flex items-center space-x-1.5 shrink-0 bg-white dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
              {(['All', 'School', 'College', 'University', 'Teacher'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setAcademicLevelFilter(lvl)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider transition ${
                    academicLevelFilter === lvl 
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* AI Search Suggestions display list */}
          {aiSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-950/95 border border-slate-200/60 dark:border-slate-800/60 rounded-xl shadow-xl p-3 z-40 transition-all">
              <div className="flex items-center space-x-1 px-2.5 pb-2 border-b border-slate-150 dark:border-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">EduCart Smart AI Suggestions</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2">
                {aiSuggestions.map((sug, sIndex) => (
                  <button
                    key={sIndex}
                    onClick={() => {
                      setSearchTerm(sug);
                      setAiSuggestions([]);
                    }}
                    className="text-left text-xs text-slate-700 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-900 px-3 py-2 rounded-lg transition"
                  >
                    🔍 {sug}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid Layout - Sidebar Filters left, Product flow right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800/80 p-5 rounded-2xl shrink-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Filter className="w-4 h-4 text-slate-400" />
              <span>Refine Catalog</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold font-mono">
              {filteredProducts.length} items
            </span>
          </div>

          {/* Category filter pills */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Category</label>
            <div className="flex flex-col space-y-1">
              {[
                { id: 'all', name: 'All Educational Materials' },
                { id: 'books', name: 'Books' },
                { id: 'stationery', name: 'Stationery' },
                { id: 'accessories', name: 'Educational Accessories' },
                { id: 'digital', name: 'Digital Resources' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg transition font-medium flex items-center justify-between ${
                    selectedCategory === cat.id
                      ? 'bg-blue-50/80 text-blue-600 dark:bg-slate-800 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                  }`}
                >
                  <span>{cat.name}</span>
                  {selectedCategory === cat.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
              <label>Max Price Cap</label>
              <span className="text-blue-600 dark:text-blue-400 font-mono font-bold text-xs">{formatCurrency(priceRange)}</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-800 accent-blue-600"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>₹50</span>
              <span>₹250</span>
              <span>₹500 limit</span>
            </div>
          </div>

          {/* Brand/Publisher Filter */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Publisher & Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-250 border border-slate-200 dark:border-slate-800 focus:outline-none"
            >
              <option value="all">All Brands</option>
              {brands.filter(b => b !== 'all').map((b, bIdx) => (
                <option key={bIdx} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Rating filter radio */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Minimum Ratings</label>
            <div className="space-y-1">
              {[0, 4.5, 4.7, 4.9].map(r => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md flex items-center space-x-1.5 transition ${
                    minRating === r 
                      ? 'bg-amber-500/10 text-amber-500 font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50/50'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${minRating === r ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                  <span>{r === 0 ? 'Any academic ratings' : `${r}★ and above`}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Clear Filter trigger */}
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setPriceRange(200);
              setSelectedBrand('all');
              setMinRating(0);
              setAcademicLevelFilter('All');
            }}
            className="w-full text-xs py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold uppercase tracking-wider rounded-lg text-slate-700 dark:text-slate-300 transition"
          >
            Clear Filters
          </button>

        </div>

        {/* Product flow right */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Controls toolbar */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 px-5 py-3.5 rounded-2xl">
            <span className="text-xs text-slate-500 font-medium">
              Academic level filter: <strong className="text-blue-600 dark:text-blue-400">{academicLevelFilter}</strong>, Showing <strong className="text-slate-900 dark:text-white font-bold">{filteredProducts.length}</strong> items.
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'grid' 
                    ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400' 
                    : 'text-slate-400 hover:bg-slate-50'
                }`}
                title="Grid layout"
                id="catalog-grid-toggle"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'list' 
                    ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400' 
                    : 'text-slate-400 hover:bg-slate-50'
                }`}
                title="List layout"
                id="catalog-list-toggle"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product grid container */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 p-6">
              <p className="text-slate-400 text-sm">No items found matching active filter. Try search other phrases!</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setPriceRange(200);
                  setSelectedBrand('all');
                  setMinRating(0);
                  setAcademicLevelFilter('All');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 uppercase"
              >
                Reset Search Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => {
                const discountAmount = isStudentVerified ? p.studentDiscount : 0;
                const activePrice = p.price * (1 - discountAmount / 100);
                const isFavorite = wishlist.find(item => item.id === p.id);

                return (
                  <div
                    key={p.id}
                    id={`product-card-${p.id}`}
                    className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60 flex flex-col hover:shadow-xl hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300 relative"
                  >
                    {/* Badge */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col space-y-1">
                      <span className="bg-blue-600 text-[9px] font-black uppercase tracking-wider text-white px-2.5 py-1 rounded-full shadow">
                        {p.academicLevel === 'All' ? 'All Curriculas' : p.academicLevel}
                      </span>
                      {discountAmount > 0 && (
                        <span className="bg-emerald-500 text-[9px] font-black uppercase tracking-wider text-white px-2.5 py-1 rounded-full shadow animate-pulse">
                          -{discountAmount}% Student Sale
                        </span>
                      )}
                    </div>

                    {/* Favorite heart */}
                    <button
                      onClick={() => onToggleWishlist(p)}
                      className="absolute top-3 right-3 z-10 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 p-2 rounded-full shadow text-slate-400 hover:text-pink-500 transition-colors"
                      id={`fav-btn-${p.id}`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-pink-500 text-pink-500 animate-scale' : ''}`} />
                    </button>

                    {/* Image Area */}
                    <div 
                      onClick={() => onProductClick(p)}
                      className="aspect-video w-full overflow-hidden bg-slate-50 cursor-pointer relative"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-1 right-1 bg-slate-900/80 text-[10px] text-white font-mono px-2 py-0.5 rounded">
                        Fast {p.deliveryDays}d delivery
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-4 flex-1 flex flex-col">
                      <p className="text-[10px] uppercase font-bold text-blue-500 mb-1">{p.subcategory}</p>
                      <h4 
                        onClick={() => onProductClick(p)}
                        className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 hover:text-blue-500 cursor-pointer"
                        title={p.name}
                      >
                        {p.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 flex-1">{p.description}</p>

                      {/* Ratings */}
                      <div className="flex items-center space-x-1 mt-3.5 mb-1.5">
                        <div className="flex text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                        </div>
                        <span className="text-xs font-bold font-mono text-slate-850 dark:text-slate-200">{p.rating}</span>
                        <span className="text-[10px] text-slate-400">({p.reviewsCount} reviews)</span>
                      </div>

                      {/* Brand name */}
                      <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">{p.brand}</span>

                      {/* Prices banner */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          {discountAmount > 0 ? (
                            <div className="flex items-baseline space-x-1.5">
                              <span className="text-base font-black text-slate-950 dark:text-white font-mono">{formatCurrency(activePrice)}</span>
                              <span className="text-xs text-slate-400 line-through font-mono">{formatCurrency(p.price)}</span>
                            </div>
                          ) : (
                            <span className="text-base font-black text-slate-950 dark:text-white font-mono">{formatCurrency(p.price)}</span>
                          )}
                          <p className="text-[9px] text-slate-400">Instant tracking enabled</p>
                        </div>

                        <button
                          onClick={() => onAddToCart(p)}
                          id={`add-cart-btn-${p.id}`}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-500 text-white transition-all text-xs font-bold uppercase select-none flex items-center space-x-1"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((p) => {
                const discountAmount = isStudentVerified ? p.studentDiscount : 0;
                const activePrice = p.price * (1 - discountAmount / 100);
                const isFavorite = wishlist.find(item => item.id === p.id);

                return (
                  <div
                    key={p.id}
                    id={`product-card-list-${p.id}`}
                    className="flex flex-col sm:flex-row bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60 hover:shadow-lg transition-all"
                  >
                    <div className="sm:w-48 aspect-video sm:aspect-square shrink-0 relative bg-slate-100">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 bg-blue-600 text-[8px] font-bold text-white px-2 py-0.5 roundeduppercase">
                        {p.academicLevel}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <p className="text-[10px] uppercase font-bold text-blue-500">{p.subcategory}</p>
                          <button onClick={() => onToggleWishlist(p)} className="text-slate-400 hover:text-pink-500">
                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-pink-500 text-pink-500' : ''}`} />
                          </button>
                        </div>
                        <h4 
                          onClick={() => onProductClick(p)}
                          className="font-black text-base text-slate-950 dark:text-white hover:text-blue-500 cursor-pointer mt-1"
                        >
                          {p.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{p.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <span className="text-base font-black text-slate-900 dark:text-white font-mono">{formatCurrency(activePrice)}</span>
                            {discountAmount > 0 && <span className="text-xs text-slate-400 line-through font-mono ml-2">{formatCurrency(p.price)}</span>}
                          </div>
                          <span className="text-xs text-slate-400 flex items-center space-x-1">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{p.rating} / 5</span>
                          </span>
                        </div>

                        <button
                          onClick={() => onAddToCart(p)}
                          className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold uppercase rounded-lg hover:bg-blue-600 transition"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
