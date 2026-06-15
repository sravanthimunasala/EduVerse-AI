import React from 'react';
import { ArrowLeft, Star, Heart, ShieldCheck, Truck, RefreshCw, ShoppingCart, Sparkles, Check } from 'lucide-react';
import { Product, Review } from '../types';
import { SAMPLE_REVIEWS } from '../data';
import { formatCurrency } from '../utils';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (p: Product) => void;
  onBuyNow: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  wishlist: Product[];
  isStudentVerified: boolean;
  relatedProducts: Product[];
}

export default function ProductDetails({
  product,
  onBack,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlist,
  isStudentVerified,
  relatedProducts
}: ProductDetailsProps) {
  const isFavorite = wishlist.some(item => item.id === product.id);
  const discountAmount = isStudentVerified ? product.studentDiscount : 0;
  const activePrice = product.price * (1 - discountAmount / 100);

  return (
    <div className="space-y-8 animate-fadeIn" id="product-details-container">
      
      {/* Back button link */}
      <button
        onClick={onBack}
        id="details-back-btn"
        className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-500 hover:text-blue-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Academic Catalog</span>
      </button>

      {/* Main Details grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-6 sm:p-8 rounded-3xl shadow-md">
        
        {/* Left Side: Product Image Display */}
        <div className="space-y-4">
          <div className="aspect-video sm:aspect-square bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800/50 relative">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            
            {discountAmount > 0 && (
              <span className="absolute top-4 left-4 bg-emerald-500 text-white font-black text-xs px-3 py-1.5 rounded-full shadow tracking-wider uppercase animate-pulse">
                🎓 {discountAmount}% Off Student Special Price
              </span>
            )}
          </div>
          
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-center justify-around text-center text-xs text-slate-500 dark:text-slate-400">
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-blue-500 mb-1" />
              <span className="font-semibold">Genuine Copy</span>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="w-5 h-5 text-emerald-500 mb-1" />
              <span className="font-semibold">3-4 Day Fast Gate</span>
            </div>
            <div className="flex flex-col items-center">
              <RefreshCw className="w-5 h-5 text-indigo-500 mb-1" />
              <span className="font-semibold">Easy Returns</span>
            </div>
          </div>
        </div>

        {/* Right Side: Product properties */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-slate-800 dark:text-blue-400 px-3/5 py-1 rounded-full">
                {product.category} • {product.subcategory}
              </span>
              <button 
                onClick={() => onToggleWishlist(product)}
                className={`p-2 rounded-full border border-slate-100 dark:border-slate-800 transition ${
                  isFavorite ? 'bg-pink-50 text-pink-500' : 'text-slate-400 hover:bg-slate-50'
                }`}
                id={`details-fav-toggle-${product.id}`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-pink-500' : ''}`} />
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white mt-4 tracking-tight leading-tight">
              {product.name}
            </h1>
            
            {/* Publisher Metadata */}
            <p className="text-xs text-slate-400 mt-1">Publisher: <strong className="font-mono text-slate-650 dark:text-slate-300">{product.brand}</strong> | Level Suitability: <strong className="text-indigo-600 dark:text-indigo-400">{product.academicLevel}</strong></p>

            {/* Ratings Summary */}
            <div className="flex items-center space-x-1.5 mt-4">
              <div className="flex text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    className={`w-4 h-4 ${s <= Math.floor(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 font-mono">{product.rating} / 5</span>
              <span className="text-slate-400 text-xs">({product.reviewsCount} verified campus reviews)</span>
            </div>

            {/* Detailed description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350 leading-relaxed mt-5">
              {product.description}
            </p>

            {/* Premium feature bullets */}
            <div className="mt-6 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-widest">Syllabus Inclusions:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feat, f_idx) => (
                  <div key={f_idx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-400">
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            {/* Prices segment */}
            <div className="flex justify-between items-baseline mb-5">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Academic Pricing</span>
                <div className="flex items-baseline space-x-2.5 mt-1">
                  {discountAmount > 0 ? (
                    <>
                      <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-mono">{formatCurrency(activePrice)}</span>
                      <span className="text-sm text-slate-400 line-through font-mono">{formatCurrency(product.price)}</span>
                    </>
                  ) : (
                    <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-mono">{formatCurrency(product.price)}</span>
                  )}
                </div>
              </div>

              {!isStudentVerified && product.studentDiscount > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/40 text-right max-w-64">
                  <p className="text-[10px] font-extrabold uppercase select-none">🔑 Unlock Student pricing</p>
                  <p className="text-[9px] opacity-90 mt-0.5 leading-tight">Verify student ID in top bar to get flat <strong>{product.studentDiscount}% off</strong> this book!</p>
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="flex flex-col sm:flex-row gap-3.5">
              <button
                onClick={() => onAddToCart(product)}
                id={`details-add-cart-${product.id}`}
                className="flex-1 py-3.5 rounded-xl border-2 border-slate-900 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold uppercase text-xs tracking-wider transition-colors flex items-center justify-center space-x-2 cursor-pointer text-slate-900 dark:text-white"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Academic Cart</span>
              </button>

              <button
                onClick={() => onBuyNow(product)}
                id="details-buy-now"
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold uppercase text-xs tracking-wider shadow-lg shadow-blue-600/10 transition-transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                <span>Express Buy Now</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Review Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-6 sm:p-8 rounded-3xl">
        <h3 className="font-extrabold text-base text-slate-950 dark:text-white mb-6">Verified Student / Educator Reviews</h3>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {SAMPLE_REVIEWS.map((rev) => (
            <div key={rev.id} className="py-5 first:pt-0 last:pb-0" id={`review-cell-${rev.id}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{rev.author}</span>
                  <div className="flex text-amber-500 mt-1">
                    {[1, 2, 3, 4, 5].map(sIdx => (
                      <Star key={sIdx} className={`w-3 h-3 ${sIdx <= rev.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400">{rev.date}</span>
                  {rev.verified && (
                    <span className="block text-[8px] uppercase tracking-wider font-bold text-emerald-500 font-mono mt-0.5">✔ Verified Purchaser</span>
                  )}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-3.5 leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Products Recommendation Grid */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-slate-950 dark:text-white flex items-center space-x-1.5 pl-1">
          <Sparkles className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
          <span>Recommended for Similar Academic Objectives</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedProducts.slice(0, 4).map((rp) => {
            const rPrice = rp.price * (1 - (isStudentVerified ? rp.studentDiscount : 0) / 100);
            return (
              <div
                key={rp.id}
                onClick={() => onBack()} // Triggers catalog context change safely
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-50 mb-3">
                    <img src={rp.image} alt={rp.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[9px] uppercase font-bold text-blue-500 mb-0.5">{rp.subcategory}</p>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{rp.name}</h4>
                </div>
                <div className="flex justify-between items-baseline mt-4 pt-2 border-t border-slate-50 dark:border-slate-800">
                  <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                    {formatCurrency(rPrice)}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-mono">{rp.academicLevel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
