import { Product, Coupon, SavedAddress } from './types';

const generateStationeryItems = (): Product[] => {
  const subcategories = ["Pens", "Pencils", "Notebooks", "Drawing Materials", "Geometry Boxes"];
  const brands = [
    "Faber-Castell Academic",
    "Classmate Premium",
    "Staedtler Professional",
    "Rotring Scientific",
    "Cello Write",
    "Reynolds Classic",
    "Uni-ball Super-gel",
    "Oxford Study",
    "Pilot Comfort",
    "Doms Creative",
    "Kokuyo Camlin"
  ];

  const typesBySubcat: Record<string, { names: string[], desc: string[], feats: string[][], img: string }> = {
    "Pens": {
      names: [
        "Retractable Comfort Gel Pen", "Smooth Glide Rollerball Pen", "Classic Brass Nib Fountain Pen",
        "Fine Tip Smudge-Free Fineliner", "Ultra Fluid Liquid Ink Pen", "Archival Calligraphy Accent Pen",
        "Ergonomic Active Grip Pen", "High-Flow Ballpoint Pen Pack", "Quick-Dry Dual-Color Stylus Ink Pen",
        "Premium Bold-Stroke Signature Pen", "Chisel-Tip Dual Highlighter Duo", "Metallic Permanent Gel Ink Pen"
      ],
      desc: [
        "A smooth-writing pen with rapid-dry waterproof design, ideal for lengthy secondary board examination revisions.",
        "Engineered with a micro-cushion comfort grip and premium twin-ball ink flow for seamless drafting and sketching.",
        "Professional archival quality instrument featuring rich pigmented formulation that does not ghost standard paper."
      ],
      feats: [
        ["Smudgeproof 0.5mm tungsten point", "Soft-vulcanized elastomer comfort grip", "Water-resistant pigment ink"],
        ["Smooth-writing continuous ink feed", "Sturdy stainless steel pocket clip", "Compatible with refill cartridges"]
      ],
      img: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=400"
    },
    "Pencils": {
      names: [
        "Shatter-Resistant Carbon Pencil", "Precision Drafting Mechanical Pencil", "Matte Black Graphite Sketching Pencil",
        "Water-Soluble Color Drawing Pencil", "High-Density HB Student Pencil", "Professional Clutch Pencil",
        "Lead Refill Holder with Built-in Lead Pointer", "Hexagonal Softwood Shading Pencil", "Primary Grade Bold Lead Pencil",
        "Premium Pastel Blend Graphic Pencil"
      ],
      desc: [
        "Crafted with robust break-resistant structural core bonds and smooth premium cedar body for reliable performance.",
        "Perfect dynamic companion for math plots, technical diagrams, and high-fidelity fine-art sketching.",
        "Features uniform lead density and a matte coating to keep layouts neat and smear-free."
      ],
      feats: [
        ["Shatter-resistant bond protection", "Crafted from sustainable premium cedar", "Includes protective end cap eraser"],
        ["Precision self-feeding mechanism", "Includes bonus lead refills and pointers", "Balanced weight distribution body"]
      ],
      img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400"
    },
    "Notebooks": {
      names: [
        "Spiral Polypropylene Dotted Notebook", "Faux-Leather Bound Lay-Flat Journal", "Thick Multi-Subject Grid Notebook",
        "Pocket Sized Elastic Band Memo Pad", "Linen Texture Ruled Composition Book", "Art-Grade Medium Grain Sketchbook",
        "Syllabus Tracker Dotted Study Pad", "Recycled Craft Cover Study Ledger", "High-Yield Ring-Bound Academic Binder"
      ],
      desc: [
        "Comes with thick acid-free 120GSM paper designed specifically to prevent gel marker ghosting and bleed-through.",
        "Beautifully structured with custom-index templates, page numbers, and elastic-band closure layouts.",
        "Multi-subject notebook with colored dividers, optimized for collegiate or professional syllabus tracking."
      ],
      feats: [
        ["120GSM thick inkproof pages", "Sturdy dual ring spiral lay-flat design", "Features inside quick folder sleeves"],
        ["Eco-friendly archival safe papers", "Secure elastic band closure wrap", "Includes blank index tables"]
      ],
      img: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=400"
    },
    "Drawing Materials": {
      names: [
        "Highly Pigmented Artist Watercolor Set", "Rich Non-Toxic Student Poster Colors", "Vivid Blending Dry Pastel Sticks",
        "Indelible Fine-Tip Drawing Fineliner Duo", "Acid-Free Heavyweight Sketching Pad", "Flexible Acrylic Artist Color Tubes",
        "Charcoal Blending Stump and Eraser Kit", "Metallic Accent Dual-Brush Sketch Pens"
      ],
      desc: [
        "Designed for vivid illustrations, diagram highlighting, and academic anatomical modeling sketch notes.",
        "Premium lightfast and non-toxic formulation with smooth flow characteristics on physical paper sheets.",
        "Superior blending attributes, crafted for classroom projects and professional university engineering submissions."
      ],
      feats: [
        ["Non-toxic acid-free skin safe", "Ultra high density vibrant pigment", "Includes precise blending brushes"],
        ["Smooth flow velvety finish textures", "Specially certified lightfast formula", "Compatible with wet & dry charts"]
      ],
      img: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=400"
    },
    "Geometry Boxes": {
      names: [
        "Self-Centering Quick-Action Geometry Box", "Advanced Collegiate Drafting Compasses Kit", "Shatterproof Multi-Ruler Math Set",
        "Compact Metal Box Geometry Instrument Case", "Professional Engineer Compass Divider Set", "Student Basic Solid Lead Geometry Box"
      ],
      desc: [
        "Professional grade metal math case containing a carbon steel self-centering compass, layout scales, and key indicators.",
        "High-grade drafting tools with non-slip locking mechanisms on mathematical compass legs to ensure perfect arcs.",
        "Perfectly structured with non-glare high visibility markings to prevent scale errors during critical reviews."
      ],
      feats: [
        ["Durable high-carbon steel arms", "Shatterproof transparent clear scales", "Secure self-centering locking nut"],
        ["Comfortable anti-slip grip adjustments", "Sleek dent-proof protective tin box", "Comes pre-packed with extra lead sets"]
      ],
      img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400"
    }
  };

  const list: Product[] = [];
  
  for (let i = 1; i <= 105; i++) {
    const subcat = subcategories[i % subcategories.length];
    const data = typesBySubcat[subcat];
    const nameBase = data.names[i % data.names.length];
    const name = `${nameBase} (Pro Grade - v${10 + i})`;
    const brand = brands[i % brands.length];
    const desc = data.desc[i % data.desc.length];
    const feats = data.feats[i % data.feats.length];
    
    // Vary prices strictly below 500 (e.g. ₹45 - ₹454)
    const price = 45 + (i * 13) % 410; 
    const originalPrice = Math.round(price * 1.25 + 10);
    const stock = 15 + (i * 19) % 200;
    const studentDiscount = [5, 10, 15, 20, 25, 30][i % 6];
    const academicLevels: ("School" | "College" | "University" | "Teacher" | "All")[] = ["School", "College", "University", "Teacher", "All"];
    const academicLevel = academicLevels[i % academicLevels.length];
    const deliveryDays = 2 + (i % 3);
    const rating = Math.round((4.2 + (i % 8) * 0.1) * 10) / 10;
    const reviewsCount = 12 + (i * 23) % 240;

    list.push({
      id: `s_gen_${i}`,
      name,
      category: 'stationery',
      subcategory: subcat,
      price,
      originalPrice,
      description: desc,
      rating,
      reviewsCount,
      image: data.img,
      features: feats,
      stock,
      studentDiscount,
      academicLevel,
      brand,
      deliveryDays
    });
  }
  return list;
};

export const INITIAL_PRODUCTS: Product[] = [
  // --- Books ---
  {
    id: 'b1',
    name: 'NCERT Class 10 Science Exemplar Solutions',
    category: 'books',
    subcategory: 'School Books',
    price: 150.00,
    originalPrice: 199.00,
    description: 'Authentic school board book with detailed diagrams and solved physics, chemistry, and biology problems for secondary level preparation.',
    rating: 4.8,
    reviewsCount: 142,
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
    features: ['Includes step-by-step master proofs', 'NCERT based curriculum board guidance', 'Handwritten study-notes appendix included'],
    stock: 45,
    studentDiscount: 20,
    academicLevel: 'School',
    brand: 'NCERT Official publication',
    deliveryDays: 3
  },
  {
    id: 'b2',
    name: 'Advanced Principles of Organic Chemistry',
    category: 'books',
    subcategory: 'College Textbooks',
    price: 480.00,
    originalPrice: 499.00,
    description: 'A masterpiece text on standard molecular reaction mechanisms, stereochemistry principles, and lab synthesis routines.',
    rating: 4.7,
    reviewsCount: 98,
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400',
    features: ['Over 300 molecular mechanisms fully explained', 'Complimentary access code for digital exams', 'Recommended for undergraduate STEM degrees'],
    stock: 28,
    studentDiscount: 15,
    academicLevel: 'College',
    brand: 'Pearson Education',
    deliveryDays: 3
  },
  {
    id: 'b3',
    name: 'JEE Mains & Advanced Prep Physics Volume 1',
    category: 'books',
    subcategory: 'Competitive Exam Books',
    price: 450.00,
    originalPrice: 495.00,
    description: 'High-yield conceptual physics revision handbook focused heavily on mechanics, kinetics, and thermodynamics equations for JEE aspirants.',
    rating: 4.9,
    reviewsCount: 310,
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400',
    features: ['Over 1500 objective level MCQs included', 'Previous 10 years JEE solved exam papers', 'Exclusive doubt solving session codes from live tutors'],
    stock: 60,
    studentDiscount: 25,
    academicLevel: 'University',
    brand: 'Arihant publications',
    deliveryDays: 4
  },
  {
    id: 'b4',
    name: 'Oxford Student Reference Atlas for India',
    category: 'books',
    subcategory: 'Reference Books',
    price: 290.00,
    originalPrice: 350.00,
    description: 'Essential geographic reference book featuring high-precision physical maps, political maps, and regional demography figures.',
    rating: 4.6,
    reviewsCount: 52,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
    features: ['High-fidelity 3D physical terrain details', 'Detailed industrial demography metrics', 'Interactive QR code for online digital globes'],
    stock: 35,
    studentDiscount: 10,
    academicLevel: 'All',
    brand: 'Oxford University Press',
    deliveryDays: 3
  },
  {
    id: 'b5',
    name: 'Visual Calculus Concepts [Interactive E-Book]',
    category: 'books',
    subcategory: 'E-Books',
    price: 99.00,
    originalPrice: 199.00,
    description: 'High-quality comprehensive e-book focusing on limits, continuity, limits of integration, and vector derivatives.',
    rating: 4.5,
    reviewsCount: 165,
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=400',
    features: ['Downloadable standard PDF & EPUB formats', 'Stunning dynamic geometric visualization graphs', 'Includes 50 mock revision interactive tests'],
    stock: 9999,
    studentDiscount: 50,
    academicLevel: 'College',
    brand: 'EduVerse Digital Press',
    deliveryDays: 1
  },

  // --- Stationery ---
  {
    id: 's1',
    name: 'Luxury Executive Finish Gel Pens (Pack of 5)',
    category: 'stationery',
    subcategory: 'Pens',
    price: 120.00,
    originalPrice: 180.00,
    description: 'Smudge-proof, quick-drying comfortable fluid gel ink pens optimized specifically for marathon examination writing.',
    rating: 4.6,
    reviewsCount: 74,
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=400',
    features: ['Ergonomic soft vulcanized custom grip', 'Liquid-glide continuous ink flow feeds', 'Waterproof archival pigment ink certified'],
    stock: 80,
    studentDiscount: 5,
    academicLevel: 'All',
    brand: 'Uniball Super-gel',
    deliveryDays: 3
  },
  {
    id: 's2',
    name: 'Fine Charcoal Matte Pencils (12 Pack)',
    category: 'stationery',
    subcategory: 'Pencils',
    price: 80.00,
    originalPrice: 120.00,
    description: 'High-density graphite and charcoal pencil sets. Perfect for precision layout sketching and shading academic models.',
    rating: 4.7,
    reviewsCount: 112,
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400',
    features: ['Shatter-proof structural lead bonds', '12 specific grade levels (2H to 10B)', 'Comes with complementary precision sharpener'],
    stock: 120,
    studentDiscount: 10,
    academicLevel: 'School',
    brand: 'Faber-Castell Academic',
    deliveryDays: 3
  },
  {
    id: 's3',
    name: 'Premium Spiral Grid Subject Notebook',
    category: 'stationery',
    subcategory: 'Notebooks',
    price: 140.00,
    originalPrice: 180.00,
    description: '160 pages of extra smooth 120GSM warm-cream paper with dotted grids, optimized to prevent ghosting and bleed-through.',
    rating: 4.9,
    reviewsCount: 420,
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=400',
    features: ['Tough moisture-proof polypropylene plastic cover', 'Syllabus tracker bookmark sleeve inside', 'Perfect flat-lay double spiral configuration'],
    stock: 300,
    studentDiscount: 15,
    academicLevel: 'All',
    brand: 'Classmate Premium',
    deliveryDays: 4
  },
  {
    id: 's4',
    name: 'Artistic Fine-Tip Drawing Fineliners Set',
    category: 'stationery',
    subcategory: 'Drawing Materials',
    price: 240.00,
    originalPrice: 299.00,
    description: 'Set of 6 dynamic technical black ink pens with tips varying from 0.05mm to 0.8mm for high-precision design mappings.',
    rating: 4.8,
    reviewsCount: 32,
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400',
    features: ['Acid-free indelible archival lightfast inks', 'Metal clad ultra-durable precision composite tips', 'Perfect for drawing vector charts and biology diagrams'],
    stock: 45,
    studentDiscount: 20,
    academicLevel: 'University',
    brand: 'Sakura Pigma Micron',
    deliveryDays: 3
  },
  {
    id: 's5',
    name: 'Mathematical High-Grade Instrument Geometry Box',
    category: 'stationery',
    subcategory: 'Geometry Boxes',
    price: 190.00,
    originalPrice: 250.00,
    description: 'Professional metal geometry box housing solid-brass die-cast self-centering compass, layout dividers, scales, and protractors.',
    rating: 4.8,
    reviewsCount: 156,
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400',
    features: ['Secure anti-slip screw clamps on arms', 'Clear non-yellowing protective plastic grids', 'Ergonomic easy-grip layout dials'],
    stock: 90,
    studentDiscount: 30,
    academicLevel: 'School',
    brand: 'Maped Technical',
    deliveryDays: 3
  },

  // --- Educational Accessories ---
  {
    id: 'a1',
    name: 'Ergonomic Water-Resistant Class Backpack',
    category: 'accessories',
    subcategory: 'Backpacks',
    price: 499.00,
    originalPrice: 599.00,
    description: 'High-density Oxford cloth backpack with specialized padded compartments to safely carry laptop, heavy books, and stationery organizers.',
    rating: 4.8,
    reviewsCount: 95,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400',
    features: ['Thick pressure-relieving dual S-shape belts', 'Secret water bottle & power socket slots', 'Dedicated anti-theft zipper compartment'],
    stock: 40,
    studentDiscount: 15,
    academicLevel: 'All',
    brand: 'Skybags Campus',
    deliveryDays: 3
  },
  {
    id: 'a2',
    name: 'Pocket Scientific Trigonometric Calculator',
    category: 'accessories',
    subcategory: 'Calculators',
    price: 350.00,
    originalPrice: 420.00,
    description: 'Full-featured dual-powered math calculator with 240 scientific and stat computing operations.',
    rating: 4.7,
    reviewsCount: 110,
    image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&q=80&w=400',
    features: ['High clarity 2-line equation readout display', 'Includes robust slip-on slide protective hard cover', 'Solar and button cell dual battery systems'],
    stock: 55,
    studentDiscount: 20,
    academicLevel: 'College',
    brand: 'Casio Scientific',
    deliveryDays: 3
  },
  {
    id: 'a3',
    name: 'Heavy-Duty Drafting Compass & Scientific Divider Set',
    category: 'accessories',
    subcategory: 'Scientific Instruments',
    price: 160.00,
    originalPrice: 220.00,
    description: 'High grade chrome-plated brass engineering instrument meant for university geometric drafting and physical design labs.',
    rating: 4.6,
    reviewsCount: 42,
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400',
    features: ['Rust-resistant alloy drafting legs', 'Spring-bow adjustment dials for micro millimeter accuracy', 'Supplied in an impact protecting presentation tray'],
    stock: 30,
    studentDiscount: 15,
    academicLevel: 'University',
    brand: 'Rotring Scientific',
    deliveryDays: 4
  },
  {
    id: 'a4',
    name: 'Rechargeable Eye-Care Flexible Study Lamp',
    category: 'accessories',
    subcategory: 'Study Lamps',
    price: 390.00,
    originalPrice: 490.00,
    description: 'Minimalist study desk lamp featuring energy-efficient, flicker-free LEDs, custom light modes, and multi-angle adjustments.',
    rating: 4.9,
    reviewsCount: 185,
    image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=400',
    features: ['Smart touch-control panels with 3 brightness modes', 'No-blue light certified eye safeguard emitters', 'Flexible 360-degree goose-neck rotation silicon jacket'],
    stock: 50,
    studentDiscount: 25,
    academicLevel: 'All',
    brand: 'Philips Study-Light',
    deliveryDays: 3
  },

  // --- Digital Resources ---
  {
    id: 'd1',
    name: 'STEM Formulas, Theorems & Equations Quick PDF',
    category: 'digital',
    subcategory: 'PDFs',
    price: 49.00,
    originalPrice: 99.00,
    description: 'An exhaustive, high-yield cheat sheet compiling primary board-level physics, chemistry, and calculus formulas in single PDF format.',
    rating: 4.9,
    reviewsCount: 340,
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=400',
    features: ['Perfect print high resolution vectors', 'Clipped charts optimized for rapid mobile previewing', 'Lifetime free access code updates with new chapters'],
    stock: 9999,
    studentDiscount: 40,
    academicLevel: 'All',
    brand: 'EduVerse Academic PDF Hub',
    deliveryDays: 1
  },
  {
    id: 'd2',
    name: 'Advanced Molecular Biology Digital Study Guide',
    category: 'digital',
    subcategory: 'Study Guides',
    price: 120.00,
    originalPrice: 199.00,
    description: 'Durable digital revision bundle containing structured outlines, concept graphics, and self-evaluation cards for bio majors.',
    rating: 4.8,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400',
    features: ['6 full-length digital diagnostic exams included', 'High-res interactive cell structures illustrations', 'Fully compatible with iPad, Kindle, and Mac reader apps'],
    stock: 999,
    studentDiscount: 35,
    academicLevel: 'College',
    brand: 'EduVerse Study Guides Inc.',
    deliveryDays: 1
  },
  {
    id: 'd3',
    name: 'All-Chapter Topper Hand-Written Revision Notes',
    category: 'digital',
    subcategory: 'Notes',
    price: 99.00,
    originalPrice: 150.00,
    description: 'Beautifully compiled handwritten organic chemistry and calculus study notes representing clean conceptual breakdowns from top-tier students.',
    rating: 4.9,
    reviewsCount: 220,
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=400',
    features: ['High-resolution scans with clear highlighted core tags', 'Proven memorization mnemonics included', 'Includes printable color revision flashcards'],
    stock: 9999,
    studentDiscount: 50,
    academicLevel: 'University',
    brand: 'Syllaper Notes Hub',
    deliveryDays: 1
  },
  {
    id: 'd4',
    name: 'Simulated Board & Competitive Practice Papers',
    category: 'digital',
    subcategory: 'Practice Papers',
    price: 180.00,
    originalPrice: 250.00,
    description: '10 complete JEE Mains sample paper sets structured by board experts to mirror actual examination timing, pattern, and marking grades.',
    rating: 4.9,
    reviewsCount: 165,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400',
    features: ['Includes standard interactive computer testing portal codes', 'Exhaustive detailed explanation booklet (PDF)', 'AI-driven score performance analysis graphs'],
    stock: 9999,
    studentDiscount: 50,
    academicLevel: 'School',
    brand: 'Competitive Exam Board Group',
    deliveryDays: 1
  },
  ...generateStationeryItems()
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'STUDENT30',
    description: 'Get an extra flat 30% discount off all textbook orders. Valid with active student registration.',
    discountPercent: 30,
    minPurchase: 20,
    studentRequired: true
  },
  {
    code: 'SCHOLAR50',
    description: 'Unlocks a massive 50% discount on all active Digital & Video Courses. Accelerate your studies.',
    discountPercent: 50,
    minPurchase: 0,
    studentRequired: true
  },
  {
    code: 'INSTITU50',
    description: 'For schools and teachers. Flat 50% off orders above ₹1000 for stationery sets and binders.',
    discountPercent: 50,
    minPurchase: 1000,
    studentRequired: false
  },
  {
    code: 'WELCOME10',
    description: 'Special 10% introductory markdown on any category purchase.',
    discountPercent: 10,
    minPurchase: 0,
    studentRequired: false
  }
];

export const SAMPLE_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr1',
    name: 'Sravanthi Munasala',
    street: '142 Academic Boulevard, Suite 300B',
    city: 'Stanford',
    state: 'CA',
    zipCode: '94305',
    phone: '+1 (555) 432-8765',
    isDefault: true
  },
  {
    id: 'addr2',
    name: 'Sravanthi Munasala (University Campus)',
    street: 'Building 40, Escondido Village',
    city: 'Stanford',
    state: 'CA',
    zipCode: '94305',
    phone: '+1 (555) 432-1200',
    isDefault: false
  }
];

export const SAMPLE_REVIEWS = [
  {
    id: 'r1',
    author: 'Michael Chang (Graduate Student)',
    rating: 5,
    comment: 'The advanced calculus textbook saved my grade! The proofs are so readable compared to other standard college materials. Plus, the AI tutor on this portal answered all my syllabus questions in seconds. Arrived in just 2 days!',
    date: 'June 02, 2026',
    verified: true
  },
  {
    id: 'r2',
    author: 'Dianne Vance (School Biology Teacher)',
    rating: 5,
    comment: 'I purchased the Lesson Planner Ledger along with some AP manuals for my class. High-quality paper, nice cover and very structured categories. Recommended to all educators looking to streamline class schedules.',
    date: 'May 14, 2026',
    verified: true
  },
  {
    id: 'r3',
    author: 'Ryan K. K. (High School Junior)',
    rating: 4,
    comment: 'Got the draft kit and color markers. Fast delivery, products are genuinely high tier. The student discount codes are highly appreciated!',
    date: 'May 28, 2026',
    verified: false
  }
];
