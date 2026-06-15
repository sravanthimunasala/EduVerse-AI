import React, { useState } from 'react';
import { 
  Compass, 
  BookOpen, 
  Cpu, 
  Calendar, 
  Gift, 
  Users, 
  ShoppingCart, 
  Heart, 
  Bell, 
  User, 
  LayoutDashboard, 
  Mail, 
  Sun, 
  Moon, 
  Sparkles, 
  LogOut, 
  CheckCircle,
  Menu,
  X
} from 'lucide-react';
import { CartItem, Product } from '../types';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  cart: CartItem[];
  wishlist: Product[];
  darkMode: boolean;
  toggleDarkMode: () => void;
  isStudentVerified: boolean;
  verifyStudent: () => void;
  notifications: string[];
  clearNotifications: () => void;
  eduPoints: number;
}

export default function Navigation({
  currentTab,
  setCurrentTab,
  cart,
  wishlist,
  darkMode,
  toggleDarkMode,
  isStudentVerified,
  verifyStudent,
  notifications,
  clearNotifications,
  eduPoints
}: NavigationProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Group tabs for a clean navigation structure
  const primaryTabs = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'shop', label: 'Shop', icon: BookOpen },
    { id: 'categories', label: 'Categories', icon: BookOpen },
    { id: 'mentor', label: 'AI Mentor', icon: Cpu, highlight: true },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
    { id: 'exchange', label: 'Book Exchange', icon: Users },
    { id: 'rewards', label: 'Rewards Hub', icon: Gift },
  ];

  const secondaryTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: User },
    { id: 'admin', label: 'Admin Hub', icon: LayoutDashboard },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setShowMobileMenu(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 transition-colors duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Brand */}
          <div 
            onClick={() => handleTabClick('home')} 
            className="flex items-center space-x-2 cursor-pointer group shrink-0"
            id="nav-logo"
          >
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <span className="font-logo font-bold text-xl tracking-tight bg-gradient-to-r from-blue-650 via-indigo-650 to-purple-650 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              EduVerse <span className="text-emerald-500 font-extrabold dark:text-emerald-400">AI</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden xl:flex items-center space-x-1">
            {primaryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              
              if (tab.highlight) {
                return (
                  <button
                    key={tab.id}
                    id={`tab-btn-${tab.id}`}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-button text-xs leading-none tracking-wide transition-all duration-200 shrink-0 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/10 font-bold'
                        : 'bg-indigo-50 hover:bg-indigo-100/80 text-blue-700 dark:bg-indigo-950/25 dark:hover:bg-indigo-950/45 dark:text-indigo-300 font-semibold'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 animate-pulse" />
                    <span>{tab.label}</span>
                    <span className="bg-emerald-500 text-[8px] text-white px-1 py-0.5 rounded-full uppercase scale-90 font-bold tracking-widest leading-none">AI</span>
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all duration-200 shrink-0 ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-slate-800/80 font-bold border-b-2 border-blue-500'
                      : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            {/* Quick dropdown for other tabs */}
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2" />
            
            {secondaryTabs.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all duration-200 shrink-0 ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50/50 dark:text-indigo-400 dark:bg-slate-800/80 font-bold'
                      : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-55'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right Area: Rewards badge, verification badge, icons */}
          <div className="flex items-center space-x-2">
            
            {/* EduPoints Badge */}
            <div 
              onClick={() => handleTabClick('rewards')}
              className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-bold font-button cursor-pointer hover:scale-105 transition-transform"
              title="Your EduPoints Balance"
            >
              <Sparkles className="w-3 h-3 text-amber-500 animate-spin" />
              <span>{eduPoints} pts</span>
            </div>

            {/* Student ID Badge */}
            <button
              onClick={verifyStudent}
              id="student-verify-badge"
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r rounded-full text-[11px] font-semibold tracking-wide transition-all ${
                isStudentVerified
                  ? 'from-emerald-50 to-emerald-100 text-emerald-800 dark:from-emerald-950/20 dark:to-emerald-900/40 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/40'
                  : 'from-amber-50 to-amber-100 text-amber-800 dark:from-amber-950/10 dark:to-amber-900/20 dark:text-amber-400 border border-amber-250 dark:border-amber-900/40 hover:brightness-95'
              }`}
            >
              <CheckCircle className={`w-3.5 h-3.5 ${isStudentVerified ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span>{isStudentVerified ? 'Student Off Active' : 'Claim Student Rate'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-full text-slate-550 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-800 transition-all duration-200"
              title="Toggle Theme"
              id="theme-toggler"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => handleTabClick('wishlist')}
              className="relative p-1.5 rounded-full text-slate-550 hover:text-pink-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-pink-400 dark:hover:bg-slate-800 transition-all duration-200"
              title="My Wishlist"
              id="nav-wishlist-btn"
            >
              <Heart className="w-4.5 h-4.5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-pink-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-bounce">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Notifications Logs */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  setShowProfileDropdown(false);
                }}
                className="relative p-1.5 rounded-full text-slate-550 hover:text-emerald-550 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-slate-800 transition-all duration-200"
                title="System Notifications"
                id="nav-notif-btn"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50 text-slate-800 dark:text-slate-100 animate-slideUp">
                  <div className="flex justify-between items-center px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-xs font-button">Active Notifications ({notifications.length})</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => {
                          clearNotifications();
                          setShowNotifDropdown(false);
                        }} 
                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold uppercase"
                      >
                        Dismiss All
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/40">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-450">
                        No current alerts or rewards updates.
                      </div>
                    ) : (
                      notifications.map((notif, index) => (
                        <div key={index} className="p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/45 flex space-x-2">
                          <div className="w-1.5 h-1.5 bg-indigo-505 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                          <p className="leading-relaxed text-slate-600 dark:text-slate-300 text-[11px]">{notif}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Summary */}
            <button
              onClick={() => handleTabClick('cart')}
              className="relative flex items-center p-1.5 rounded-full text-slate-550 hover:text-purple-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-purple-400 dark:hover:bg-slate-800 transition-all duration-200"
              title="Academic Cart"
              id="nav-cart-btn"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              {totalCartCount > 0 && (
                <span className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-[9px] font-bold w-4 h-4 flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Account dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifDropdown(false);
                }}
                className="flex items-center p-0.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
                id="nav-profile-btn"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-550 via-indigo-550 to-purple-550 bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-500/10">
                  SM
                </div>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-slideUp text-left">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-button text-xs font-bold text-slate-900 dark:text-slate-100">Sravanthi Munasala</p>
                    <p className="text-[10px] text-slate-400 font-mono">sravanthi.m@stanford.edu</p>
                  </div>
                  
                  {secondaryTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        handleTabClick(tab.id);
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-[11px] hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 text-slate-700 dark:text-slate-350"
                    >
                      <span>{tab.label}</span>
                    </button>
                  ))}

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1.5" />
                  <button
                    onClick={() => {
                      alert('EduVerse AI: Successfully completed academic workspace clean state logout.');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-[11px] hover:bg-red-50 dark:hover:bg-red-950/20 text-red-655 text-red-500 flex items-center space-x-2 font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>University Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu collapsible trigger */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="xl:hidden p-1.5 rounded-full text-slate-550 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Expanded Mobile Navigation Drawer */}
      {showMobileMenu && (
        <div className="xl:hidden border-t border-slate-150 dark:border-slate-850 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 space-y-2 max-h-[80vh] overflow-y-auto animate-fadeIn text-left">
          <p className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-wide">Main Channels</p>
          {[...primaryTabs, ...secondaryTabs].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center space-x-3 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white font-bold' 
                    : 'text-slate-650 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
          
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col space-y-2">
            <div className="flex justify-between items-center px-2 text-xs">
              <span className="text-slate-400 font-semibold">Scholar Points</span>
              <span className="font-bold text-amber-500">{eduPoints} pts</span>
            </div>
            <button
              onClick={() => {
                verifyStudent();
                setShowMobileMenu(false);
              }}
              className="w-full text-center py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-button uppercase"
            >
              {isStudentVerified ? '🏛️ Student Account Active' : '🎓 Verify Student ID'}
            </button>
          </div>
        </div>
      )}

      {/* Bottom status line for compact mobile navigation */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur shadow-lg py-2 flex justify-around items-center z-50">
        {[
          { id: 'home', label: 'Home', icon: Compass },
          { id: 'shop', label: 'Shop', icon: BookOpen },
          { id: 'mentor', label: 'AI Mentor', icon: Cpu },
          { id: 'planner', label: 'Planner', icon: Calendar },
          { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: totalCartCount }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center space-y-0.5 relative shrink-0 transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-450 dark:text-slate-550'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span className="text-[9px] font-medium font-button leading-none">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-purple-650 bg-indigo-600 text-white rounded-full text-[8px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

    </nav>
  );
}
