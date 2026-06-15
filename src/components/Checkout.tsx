import React, { useState } from 'react';
import { ShieldCheck, MapPin, CreditCard, ChevronRight, Sparkles, Loader2, CheckCircle2, ShoppingBag } from 'lucide-react';
import { CartItem, SavedAddress, Coupon, Order, TrackingStep } from '../types';
import { SAMPLE_ADDRESSES } from '../data';
import { formatCurrency } from '../utils';

interface CheckoutProps {
  cart: CartItem[];
  appliedCoupon: Coupon | null;
  onOrderSuccess: (order: Order) => void;
  onCancel: () => void;
  isStudentVerified: boolean;
}

export default function Checkout({
  cart,
  appliedCoupon,
  onOrderSuccess,
  onCancel,
  isStudentVerified
}: CheckoutProps) {
  const [selectedAddressId, setSelectedAddressId] = useState(SAMPLE_ADDRESSES[0].id);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet' | 'cod'>('card');
  const [isLoading, setIsLoading] = useState(false);
  const [addressList, setAddressList] = useState<SavedAddress[]>(SAMPLE_ADDRESSES);

  // New Address helper states
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newZip, setNewZip] = useState('');

  // Cost formulas
  const subtotal = cart.reduce((acc, item) => {
    const itemDiscount = isStudentVerified ? item.product.studentDiscount : 0;
    const baseWithStuDisp = item.product.price * (1 - itemDiscount / 100);
    return acc + (baseWithStuDisp * item.quantity);
  }, 0);

  const couponDiscount = appliedCoupon ? (subtotal * (appliedCoupon.discountPercent / 100)) : 0;
  const deliveryFee = 0; // Free academic delivery
  const total = Math.max(0, subtotal - couponDiscount);

  const activeAddress = addressList.find(a => a.id === selectedAddressId) || addressList[0];

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim() || !newCity.trim() || !newZip.trim()) return;

    const newAddr: SavedAddress = {
      id: Math.random().toString(),
      name: 'Sravanthi Munasala (Saved Extra)',
      street: newStreet,
      city: newCity,
      state: 'CA',
      zipCode: newZip,
      phone: '+1 (555) 432-8765',
      isDefault: false
    };

    setAddressList(prev => [...prev, newAddr]);
    setSelectedAddressId(newAddr.id);
    setNewStreet('');
    setNewCity('');
    setNewZip('');
    setShowNewAddressForm(false);
  };

  const handleSimulatedPayment = async () => {
    setIsLoading(true);
    
    try {
      // Direct integration calls to Razorpay simulated signature server routing
      const res = await fetch('/api/checkout/simulate-rzp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          address: activeAddress
        })
      });

      const data = await res.json();
      
      // Build 3-4 day tracking timelines accurately
      const timelineSteps: TrackingStep[] = [
        {
          status: 'order_placed',
          title: 'Academic Order Registered',
          description: `Order successfully authenticated with payment ID ${data.orderId || 'rzp_9901'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          completed: true,
          current: false
        },
        {
          status: 'processing',
          title: 'Stanford Logistics Hub Clearing',
          description: 'Validating student catalog stock and dispatch schedule',
          time: 'Est. Delivery Today',
          completed: true,
          current: true
        },
        {
          status: 'shipped',
          title: 'Dispatched via Campus Lane',
          description: 'Shipped under seal with tracking tags',
          time: 'Pending route activation',
          completed: false,
          current: false
        },
        {
          status: 'delivered',
          title: 'Secured at Campus Drop Slot',
          description: 'Safe drop verification with photo notification',
          time: 'Estimating 3-4 days remaining',
          completed: false,
          current: false
        }
      ];

      const freshOrder: Order = {
        id: 'EDU-' + Math.floor(Math.random() * 89999 + 10000),
        items: cart,
        address: activeAddress,
        paymentMethod,
        status: 'processing',
        trackingTimeline: timelineSteps,
        subtotal,
        discount: couponDiscount,
        total,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };

      // Mock delay representing secure signature validation
      setTimeout(() => {
        setIsLoading(false);
        onOrderSuccess(freshOrder);
      }, 1500);

    } catch (err) {
      console.error(err);
      setIsLoading(false);
      alert('Secure gate signing timed out. Order registered via server COD fallback.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="checkout-root-box">
      
      {/* Checkout Forms Column */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="font-black text-xl text-slate-950 dark:text-white">Secure Academic Checkout</h2>

        {/* STEP 1: Address Selection */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>Step 1: Campus Delivery Address</span>
            </h3>
            <button
              onClick={() => setShowNewAddressForm(!showNewAddressForm)}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              {showNewAddressForm ? 'Cancel Form' : '+ Add New'}
            </button>
          </div>

          {showNewAddressForm ? (
            <form onSubmit={handleAddNewAddress} className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border animate-fadeIn">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Add Delivery Location (CA only)</h4>
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Street and Room/Suite No."
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Zip Code"
                  value={newZip}
                  onChange={(e) => setNewZip(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-blue-600 text-white text-[11px] font-bold uppercase rounded-lg hover:bg-blue-700 font-mono tracking-wider transition"
              >
                Save Location
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addressList.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    selectedAddressId === addr.id
                      ? 'border-blue-600 bg-blue-50/20 dark:bg-slate-850 dark:border-blue-500'
                      : 'border-slate-150 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">{addr.name}</span>
                      {addr.id === 'addr1' && (
                        <span className="text-[8px] bg-indigo-100 text-blue-600 font-bold px-1.5 py-0.5 rounded uppercase font-mono">Default</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">{addr.street}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{addr.city}, {addr.state} {addr.zipCode}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-mono">{addr.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* STEP 2: Payment Provider Selection */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <CreditCard className="w-4 h-4 text-purple-500" />
            <span>Step 2: Payment Gateway Selection</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'card', name: 'Credit/Debit Card', subtitle: 'Visa/MC' },
              { id: 'upi', name: 'UPI/Instant barcode', subtitle: 'Academic Wallets' },
              { id: 'wallet', name: 'Apple / Google Pay', subtitle: 'Stored Creds' },
              { id: 'cod', name: 'Cash on Deliver', subtitle: 'Direct Drop Lockers' }
            ].map(pm => (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id as any)}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between h-20 transition ${
                  paymentMethod === pm.id
                    ? 'border-purple-600 bg-purple-50/20 dark:bg-slate-850 dark:border-purple-400'
                    : 'border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                  {paymentMethod === pm.id && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{pm.name}</p>
                  <p className="text-[9px] text-slate-400 font-mono">{pm.subtitle}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              By selecting <strong>UPI or Card</strong>, our backend secures signatures with standard Razorpay mock accounts in sandboxed test blocks to safe-key transaction indices. Genuinely safe.
            </p>
          </div>
        </div>

      </div>

      {/* Review cost & checkout trigger (1 col) */}
      <div className="lg:col-span-1 space-y-4">
        <h3 className="font-extrabold text-base text-slate-950 dark:text-white px-1">Order Authorization</h3>

        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-2xl shadow-md space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Cart Segment Check</h4>
          
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-slate-50 dark:border-slate-800/40">
                <div className="max-w-[70%]">
                  <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{item.product.name}</p>
                  <p className="text-[9px] text-slate-400 font-mono">Qty: {item.quantity}</p>
                </div>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                  {formatCurrency(item.product.price * (1 - (isStudentVerified ? item.product.studentDiscount : 0) / 100) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Money sums */}
          <div className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-350 font-medium">
            <div className="flex justify-between">
              <span>Academic Subtotal</span>
              <span className="font-mono text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600">
                <span>Academic Coupon Discount</span>
                <span className="font-mono">-{formatCurrency(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Expedited Delivery</span>
              <span className="text-emerald-500 uppercase font-mono text-[10px]">Free (3-4 Days)</span>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 my-2" />
            <div className="flex justify-between font-extrabold text-base text-slate-950 dark:text-white">
              <span>Total Payment</span>
              <span className="font-mono bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-indigo-400">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Express Payment Submit Button */}
          <button
            onClick={handleSimulatedPayment}
            disabled={isLoading || cart.length === 0}
            id="pay-and-confirm-submit-btn"
            className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-blue-600 hover:opacity-95 text-white text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center space-x-2.5 shadow cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authorizing with Razorpay...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
                <span>Authorize & Pay {formatCurrency(total)}</span>
              </>
            )}
          </button>

          <button
            onClick={onCancel}
            className="w-full text-center text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase py-1 uppercase"
          >
            Go Back
          </button>

          <div className="flex items-center space-x-2 justify-center text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Stanford Academic Trust Verified</span>
          </div>

        </div>
      </div>

    </div>
  );
}
