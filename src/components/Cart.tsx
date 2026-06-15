import React, { useState } from 'react';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, Tag, Percent, Sparkles } from 'lucide-react';
import { CartItem, Coupon } from '../types';
import { INITIAL_COUPONS } from '../data';
import { formatCurrency } from '../utils';

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: (appliedCoupon: Coupon | null) => void;
  onContinueShopping: () => void;
  isStudentVerified: boolean;
}

export default function Cart({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onContinueShopping,
  isStudentVerified
}: CartProps) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Calculations
  const subtotal = cart.reduce((acc, item) => {
    // Apply default student item discount to base price if verified
    const discountPercent = isStudentVerified ? item.product.studentDiscount : 0;
    const baseWithStudentDiscount = item.product.price * (1 - discountPercent / 100);
    return acc + (baseWithStudentDiscount * item.quantity);
  }, 0);

  // Apply Coupon mechanics
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    const findCoupon = INITIAL_COUPONS.find(c => c.code === code);
    if (!findCoupon) {
      setCouponError('Invalid academic discount code. Please double check characters.');
      setAppliedCoupon(null);
      return;
    }

    if (findCoupon.studentRequired && !isStudentVerified) {
      setCouponError('This coupon requires verified Student ID registration (see top bar).');
      setAppliedCoupon(null);
      return;
    }

    if (subtotal < findCoupon.minPurchase) {
      setCouponError(`Requires a minimum purchase value of $${findCoupon.minPurchase}.`);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(findCoupon);
    setCouponSuccess(`Coupon "${findCoupon.code}" applied successfully! Flat ${findCoupon.discountPercent}% Off.`);
  };

  const couponDiscount = appliedCoupon 
    ? (subtotal * (appliedCoupon.discountPercent / 100)) 
    : 0;

  const total = Math.max(0, subtotal - couponDiscount);

  if (cart.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-205 p-6 space-y-5" id="empty-cart-state">
        <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-blue-500">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Your Academic Cart is Empty</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Browse through our calculus manuals, geometry drafting kits, chemistry visual models, and expand your learning.</p>
        </div>
        <button
          onClick={onContinueShopping}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow"
        >
          Explore Catalog Now
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="active-cart-container">
      
      {/* List content area (2 cols) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="font-black text-lg text-slate-950 dark:text-white">Shopping Cart Summary</h2>
          <button
            onClick={onContinueShopping}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {cart.map((item) => {
            const itemDiscount = isStudentVerified ? item.product.studentDiscount : 0;
            const itemPrice = item.product.price * (1 - itemDiscount / 100);

            return (
              <div 
                key={item.product.id} 
                className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                id={`cart-row-${item.product.id}`}
              >
                {/* Product thumbnail */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-55 shrink-0 border border-slate-100/50">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-1">{item.product.name}</h4>
                    <p className="text-[10px] text-blue-500 font-semibold">{item.product.subcategory}</p>
                    {itemDiscount > 0 && (
                      <span className="inline-block mt-1 bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded dark:bg-emerald-950/20 dark:text-emerald-400">
                        🎓 Verified Student Discount Applied
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex w-full sm:w-auto items-center justify-between sm:space-x-8">
                  {/* Plus Minus count */}
                  <div className="flex items-center space-x-2.5 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-150">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                      className="w-6 h-6 rounded bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="font-bold text-xs font-mono w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                  </div>

                  {/* Pricing and Delete */}
                  <div className="text-right">
                    <p className="font-bold text-xs sm:text-sm text-slate-950 dark:text-white font-mono">
                      {formatCurrency(itemPrice * item.quantity)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      ({formatCurrency(itemPrice)} each)
                    </p>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                    title="Remove item"
                    id={`cart-del-${item.product.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Free delivery banner */}
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 dark:bg-slate-800/40 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-600 dark:text-slate-350">
            🚚 Enjoy <strong>Free Expedited Campus Shipping</strong> (delivered directly to Stanford Academic Boulevard slots in 3-4 days).
          </p>
          <span className="text-[10px] bg-green-500 text-white font-bold px-2.5 py-0.5 rounded-full uppercase">Guaranteed</span>
        </div>
      </div>

      {/* Pricing summary widget (1 col) */}
      <div className="lg:col-span-1 space-y-5">
        <h3 className="font-extrabold text-base text-slate-950 dark:text-white px-1">Order Fee Breakdown</h3>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-801 p-6 rounded-2xl shadow-sm space-y-4">
          
          {/* Coupon input form */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-400">Apply Coupon Code</label>
            <div className="flex space-x-1.5">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="e.g. WELCOME10"
                className="flex-1 bg-slate-50 dark:bg-slate-950 text-xs p-2.5 uppercase text-slate-850 dark:text-slate-200 font-mono rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-lg uppercase hover:bg-blue-600 transition"
              >
                Apply
              </button>
            </div>
            {couponError && <p className="text-[11px] text-red-500 font-medium">{couponError}</p>}
            {couponSuccess && <p className="text-[11px] text-emerald-600 font-medium">{couponSuccess}</p>}
            
            {/* Quick Suggestions for user */}
            <div className="flex gap-2.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-400">Available:</span>
              <button 
                type="button" 
                onClick={() => setCouponCode('WELCOME10')} 
                className="text-[9px] font-mono font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-200 px-2 py-0.5 rounded"
              >
                WELCOME10
              </button>
              {isStudentVerified && (
                <button 
                  type="button" 
                  onClick={() => setCouponCode('STUDENT30')} 
                  className="text-[9px] font-mono font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 px-2 py-0.5 rounded"
                >
                  STUDENT30 (30% textbook)
                </button>
              )}
            </div>
          </form>

          {/* Pricing list */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-350">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">{formatCurrency(subtotal)}</span>
            </div>
            {isStudentVerified && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Student ID Markdown Selection</span>
                <span>Active</span>
              </div>
            )}
            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Coupon Applied ({appliedCoupon.code})</span>
                <span>-{couponCode === 'STUDENT30' ? '30%' : `${appliedCoupon.discountPercent}%`}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-mono font-bold">
                <span>Coupon markdown savings</span>
                <span>-{formatCurrency(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Gate Delivery Fee</span>
              <span className="text-emerald-500 font-bold uppercase font-mono text-[10px]">Free</span>
            </div>
            
            <div className="border-t border-slate-100 dark:border-slate-800 my-2" />

            <div className="flex justify-between text-slate-900 dark:text-white font-extrabold text-sm sm:text-base">
              <span>Payment Total Due</span>
              <span className="font-mono bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <button
            onClick={() => onProceedToCheckout(appliedCoupon)}
            id="proceed-checkout-btn"
            className="w-full mt-4 py-4.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-extrabold uppercase rounded-xl tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Proceed to Secure Pay</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secure gateway notice */}
          <p className="text-[10px] text-slate-400 text-center leading-tight">
            🔐 Secure payments managed via Razorpay simulated gateways. Transparent double security signing with student credentials.
          </p>

        </div>
      </div>

    </div>
  );
}
