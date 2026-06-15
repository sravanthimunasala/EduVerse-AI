export interface Product {
  id: string;
  name: string;
  category: 'books' | 'stationery' | 'accessories' | 'digital';
  subcategory: string;
  price: number;
  originalPrice?: number;
  description: string;
  rating: number;
  reviewsCount: number;
  image: string;
  features: string[];
  stock: number;
  studentDiscount: number; // Percentage
  academicLevel: 'School' | 'College' | 'University' | 'Teacher' | 'All';
  brand: string;
  deliveryDays: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SavedAddress {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

export interface TrackingStep {
  status: 'order_placed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';
  title: string;
  description: string;
  time: string;
  completed: boolean;
  current: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  address: SavedAddress;
  paymentMethod: 'card' | 'upi' | 'wallet' | 'cod';
  status: 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';
  trackingTimeline: TrackingStep[];
  subtotal: number;
  discount: number;
  total: number;
  date: string;
  estimatedDelivery: string;
}

export interface Coupon {
  code: string;
  description: string;
  discountPercent: number;
  minPurchase: number;
  studentRequired: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  type?: 'general' | 'doubt' | 'planner' | 'notes';
  structuredData?: any; // e.g. a lists of topics or a planner
}
