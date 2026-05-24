/* ============================================================
   SUREAL — Product Data
   ============================================================ */

const SUREAL_PRODUCTS = [
  {
    id: 'sr-001',
    name: 'Liberty Rhinestone Shorts',
    slug: 'liberty-rhinestone-shorts',
    category: 'bottoms',
    price: 189,
    originalPrice: null,
    description: 'Hand-crafted black denim shorts featuring a full Statue of Liberty rhinestone artwork across the back leg. Each piece is unique — no two are identical. The rhinestones are heat-pressed and hand-placed for a permanent, high-quality finish.',
    details: [
      'Premium black denim base (Weekday collaboration piece)',
      'Full hand-placed rhinestone artwork — Statue of Liberty design',
      'Oversized/baggy fit',
      'Raw edge hem option',
      '100% cotton denim',
      'Machine wash cold, inside out'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    unavailableSizes: [],
    images: [
      'assets/products/liberty-shorts-back.jpg',
      'assets/products/liberty-shorts-detail.jpg',
      'assets/products/liberty-shorts-front.jpg',
    ],
    placeholder: 'LIBERTY SHORTS',
    tag: 'NEW',
    featured: true,
    inStock: true
  },
  {
    id: 'sr-002',
    name: 'SUREAL Baggy Cargo',
    slug: 'sureal-baggy-cargo',
    category: 'bottoms',
    price: 159,
    originalPrice: 220,
    description: 'Ultra-baggy cargo pants with custom graffiti prints and hand-painted detailing. Born from the streets, made for the bold.',
    details: [
      'Heavyweight cotton twill',
      'Hand-painted graffiti elements',
      'Multiple utility pockets',
      'Adjustable waistband',
      'Wide leg silhouette'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    unavailableSizes: ['XXL'],
    images: ['assets/products/cargo-pants-1.jpg'],
    placeholder: 'CARGO PANTS',
    tag: 'SALE',
    featured: true,
    inStock: true
  },
  {
    id: 'sr-003',
    name: 'SUREAL Oversized Tee',
    slug: 'sureal-oversized-tee',
    category: 'tops',
    price: 79,
    originalPrice: null,
    description: 'Our signature oversized tee with custom screen-print graphic. Drop-shoulder cut, heavyweight 300gsm cotton.',
    details: [
      '300gsm heavyweight cotton',
      'Drop-shoulder cut',
      'Custom screen-print graphic',
      'Garment washed for worn-in feel',
      'Oversized fit — size down for a fitted look'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    unavailableSizes: ['XS'],
    images: ['assets/products/tee-1.jpg'],
    placeholder: 'OVERSIZED TEE',
    tag: null,
    featured: true,
    inStock: true
  },
  {
    id: 'sr-004',
    name: 'Custom Denim Jacket',
    slug: 'custom-denim-jacket',
    category: 'outerwear',
    price: 299,
    originalPrice: null,
    description: 'Fully custom denim jacket with hand-painted artwork. One-of-a-kind statement piece from the SUREAL atelier.',
    details: [
      'Premium denim base',
      'Fully hand-painted custom artwork',
      'One-of-a-kind — no two identical',
      'Oversized silhouette',
      'Art-sealed for longevity'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    unavailableSizes: ['S'],
    images: ['assets/products/denim-jacket-1.jpg'],
    placeholder: 'CUSTOM JACKET',
    tag: 'LIMITED',
    featured: true,
    inStock: true
  },
  {
    id: 'sr-005',
    name: 'Rhinestone Hoodie',
    slug: 'rhinestone-hoodie',
    category: 'tops',
    price: 219,
    originalPrice: null,
    description: 'Premium heavyweight hoodie with custom rhinestone logo work on chest and back. The ultimate SUREAL statement piece.',
    details: [
      '500gsm heavyweight fleece',
      'Custom rhinestone SUREAL branding',
      'Kangaroo pocket',
      'Relaxed oversized fit',
      'Ribbed cuffs and hem'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    unavailableSizes: [],
    images: ['assets/products/hoodie-1.jpg'],
    placeholder: 'RHINESTONE HOODIE',
    tag: 'NEW',
    featured: false,
    inStock: true
  },
  {
    id: 'sr-006',
    name: 'SUREAL Wide Leg Jeans',
    slug: 'sureal-wide-leg-jeans',
    category: 'bottoms',
    price: 169,
    originalPrice: null,
    description: 'Baggy wide-leg denim with custom graffiti leg print. Inspired by 90s skate culture and modern streetwear.',
    details: [
      'Mid-rise waist',
      'Extreme wide-leg silhouette',
      'Custom graffiti print on legs',
      'Soft washed denim',
      'Five-pocket construction'
    ],
    sizes: ['28', '30', '32', '34', '36'],
    unavailableSizes: ['28'],
    images: ['assets/products/jeans-1.jpg'],
    placeholder: 'WIDE LEG JEANS',
    tag: null,
    featured: false,
    inStock: true
  }
];

/* Category data */
const SUREAL_CATEGORIES = [
  { id: 'all',       label: 'All Pieces',  count: SUREAL_PRODUCTS.length },
  { id: 'bottoms',   label: 'Bottoms',     count: SUREAL_PRODUCTS.filter(p => p.category === 'bottoms').length },
  { id: 'tops',      label: 'Tops',        count: SUREAL_PRODUCTS.filter(p => p.category === 'tops').length },
  { id: 'outerwear', label: 'Outerwear',   count: SUREAL_PRODUCTS.filter(p => p.category === 'outerwear').length },
];

/* Helpers */
function getProductBySlug(slug) {
  return SUREAL_PRODUCTS.find(p => p.slug === slug) || null;
}

function getProductById(id) {
  return SUREAL_PRODUCTS.find(p => p.id === id) || null;
}

function getFeaturedProducts() {
  return SUREAL_PRODUCTS.filter(p => p.featured);
}

function getProductsByCategory(category) {
  if (category === 'all') return SUREAL_PRODUCTS;
  return SUREAL_PRODUCTS.filter(p => p.category === category);
}

function formatPrice(price) {
  return '€' + price.toFixed(2);
}
