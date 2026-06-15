// Helper utility methods for EduCart AI E-Commerce

// Format currency standard (now in Indian Rupees)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

// Browser Speech Synthesis Text-To-Speech wrapper
export function speakText(text: string, isSpeaking: boolean, onDone?: () => void): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return () => {};
  }

  // If already speaking and requested to stop
  if (isSpeaking) {
    window.speechSynthesis.cancel();
    if (onDone) onDone();
    return () => {};
  }

  window.speechSynthesis.cancel(); // Stop anything else

  const cleanedText = text
    .replace(/#+/g, '') // Remove Markdown headers
    .replace(/\*+/g, '') // Remove Markdown bold
    .replace(/`/g, '') // Remove code inline tickers
    .slice(0, 300); // Read first 300 chars to avoid infinite loops

  const utterance = new SpeechSynthesisUtterance(cleanedText);
  utterance.onend = () => {
    if (onDone) onDone();
  };
  utterance.onerror = () => {
    if (onDone) onDone();
  };

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
  };
}

// LocalStorage persistent state manager key listings
export const STORAGE_KEYS = {
  CART: 'educart_cart_items',
  WISHLIST: 'educart_wishlist_items',
  ORDERS: 'educart_orders_list',
  ADDRESSES: 'educart_saved_addresses',
  THEME: 'educart_color_mode',
  NOTIFICATIONS: 'educart_push_notifs_log',
  STUDENT_STOCKS: 'educart_custom_products'
};

// Safe LocalStorage getters
export function getStoredData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Storage parsing breakdown:', error);
    return defaultValue;
  }
}

// Safe LocalStorage setter
export function setStoredData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage writing breakdown:', error);
  }
}
