import React from 'react';
import { User, Package, Heart, CreditCard, Gift, Download, MapPin, Compass, ExternalLink, RefreshCw } from 'lucide-react';
import { Order, Product, SavedAddress, Coupon } from '../types';
import { INITIAL_COUPONS } from '../data';
import { formatCurrency } from '../utils';

interface DashboardProps {
  orders: Order[];
  wishlist: Product[];
  addresses: SavedAddress[];
  isStudentVerified: boolean;
  onVerifyStudent: () => void;
  onTrackOrder: (order: Order) => void;
  setCurrentTab: (tab: string) => void;
}

export default function Dashboard({
  orders,
  wishlist,
  addresses,
  isStudentVerified,
  onVerifyStudent,
  onTrackOrder,
  setCurrentTab
}: DashboardProps) {

  // Gather owned digital subscription products if bought in any order
  const digitalAssets = orders.flatMap(o => o.items)
    .filter(item => item.product.category === 'digital')
    .map(item => item.product);

  const UNIQUE_COUPONS: Coupon[] = INITIAL_COUPONS;

  return (
    <div className="space-y-8 animate-fadeIn" id="user-dashboard-base">
      
      {/* Header Profile Hero Card */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 rounded-3xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
        
        {/* Background visual graphics */}
        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none">
          <Compass className="w-96 h-96 -mr-20 -mb-20 rotate-12" />
        </div>

        <div className="flex items-center space-x-5 z-10">
          <div className="w-16 h-16 rounded-2xl bg-white text-blue-600 flex items-center justify-center font-black text-2xl shadow-xl">
            SM
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-lg sm:text-xl">Sravanthi Munasala</h2>
              <span className="text-[9px] uppercase font-bold tracking-widest bg-emerald-500 text-white px-2 py-0.5 rounded-full">Scholar account</span>
            </div>
            <p className="text-xs text-blue-100 mt-1">sravanthi.m@stanford.edu | California Campus Region</p>
          </div>
        </div>

        <div className="z-10 bg-white/10 backdrop-blur border border-white/20 p-4 rounded-2xl text-right">
          <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-100">Student verification state</p>
          <div className="flex items-center space-x-2 justify-end mt-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isStudentVerified ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="font-bold text-xs">{isStudentVerified ? 'ACTIVE (Student pricing applied)' : 'NOT VERIFIED'}</span>
          </div>
          {!isStudentVerified && (
            <button
              onClick={onVerifyStudent}
              className="mt-3 text-xs bg-white text-blue-700 hover:bg-slate-50 font-bold px-3.5 py-1.5 rounded-xl transition"
            >
              Verify Active Student ID
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Core Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column (2/3): recent orders, active library */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Orders Timeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-950 dark:text-white uppercase tracking-wider flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Package className="w-4.5 h-4.5 text-blue-500" />
              <span>Campus Order Logistics Logs</span>
            </h3>

            {orders.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <p className="text-xs text-slate-400">You haven't placed any academic orders from this session.</p>
                <button
                  onClick={() => setCurrentTab('catalog')}
                  className="px-4 py-2 bg-slate-950 dark:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase hover:bg-blue-600 transition"
                >
                  Purchase textbooks and tools
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((order) => (
                  <div key={order.id} className="py-4.5 first:pt-2 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-mono">{order.id}</span>
                        <span className="text-[10px] bg-indigo-50 text-blue-600 font-bold px-2 py-0.5 rounded dark:bg-slate-800 dark:text-indigo-400">
                          {order.status === 'processing' ? 'Logistics Clearing' : order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-450 mt-1">Placed on: {order.date} | Item count: {order.items.length}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm line-clamp-1">To: {order.address.street}, {order.address.city}</p>
                    </div>

                    <div className="text-left sm:text-right w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                      <span className="font-mono font-bold text-sm text-slate-950 dark:text-white">{formatCurrency(order.total)}</span>
                      <button
                        onClick={() => onTrackOrder(order)}
                        id={`dashboard-track-btn-${order.id}`}
                        className="mt-2 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-lg transition uppercase flex items-center space-x-1.5"
                      >
                        <RefreshCw className="w-3 h-3 text-slate-450" />
                        <span>Track Status (3-4d Deliver)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Academic Digital Library */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-950 dark:text-white uppercase tracking-wider flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Download className="w-4.5 h-4.5 text-indigo-500" />
              <span>Digital Key Library & Video Lessons</span>
            </h3>

            {digitalAssets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-slate-450">Digital materials or subscription masterclasses will register here instanstly after buyouts. Access code simulation active.</p>
                <div className="flex gap-2.5 justify-center mt-3">
                  <button 
                    onClick={() => setCurrentTab('catalog')} 
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    Examine Digital simulator software guides
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {digitalAssets.map((asset, aIdx) => (
                  <div key={aIdx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded">
                        Active Download
                      </span>
                      <h4 className="font-bold text-xs text-slate-950 dark:text-white mt-1.5">{asset.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">Syllabus: {asset.brand}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-emerald-500 font-bold">KEY-EDU-7BC{asset.id.toUpperCase()}</span>
                      
                      <button
                        onClick={() => alert(`Starting simulated download for ${asset.name}. This installer matches standard macOS, Windows & Linux requirements.`)}
                        className="p-1 px-2 bg-slate-900 text-white rounded hover:bg-blue-600 text-[10px] font-bold transition uppercase flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Launch installer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right column (1/3): wishlist, coupons summary */}
        <div className="space-y-6">
          
          {/* Wishlist Sidebar summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-801 rounded-3xl p-5">
            <h3 className="font-extrabold text-sm text-slate-950 dark:text-white uppercase tracking-wider flex items-center space-x-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Heart className="w-4 h-4 text-pink-500" />
              <span>Syllabus Watchlist</span>
            </h3>

            {wishlist.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No textbooks watchlisted. Clicks the heart icon in the store catalog to monitor price dips!</p>
            ) : (
              <div className="space-y-3 pt-2">
                {wishlist.map((wl) => (
                  <div key={wl.id} className="flex space-x-3 items-center text-xs justify-between group">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-50 shrink-0">
                        <img src={wl.image} alt={wl.name} className="w-full h-full object-cover animate-scale" />
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-44">{wl.name}</span>
                    </div>
                    <button
                      onClick={() => setCurrentTab('catalog')}
                      className="text-[10px] text-blue-600 dark:text-blue-400 group-hover:underline"
                    >
                      Buy Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Academic Coupons Portfolio */}
          <div className="bg-white dark:bg-slate-900 border border-slate-205 rounded-3xl p-5">
            <h3 className="font-extrabold text-sm text-slate-950 dark:text-white uppercase tracking-wider flex items-center space-x-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Gift className="w-4 h-4 text-emerald-500" />
              <span>Campus Scholarship Credits</span>
            </h3>

            <div className="space-y-3.5 pt-2">
              {UNIQUE_COUPONS.map((cp) => (
                <div key={cp.code} className="p-3 rounded-xl bg-gradient-to-tr from-slate-50 to-slate-100/50 dark:from-slate-950 dark:to-slate-900 border border-slate-150 dark:border-slate-800 space-y-1.5 relative overflow-hidden">
                  <div className="flex justify-between items-center z-10 relative">
                    <span className="font-mono text-xs font-black text-rose-500">{cp.code}</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded font-mono">
                      -{cp.discountPercent}% Off All
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">{cp.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
