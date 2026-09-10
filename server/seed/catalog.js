// Realistic product catalog used by the seed script.
// `salesTier` is NOT part of the Product schema — it's only used while
// generating orders, to make some products sell far more than others.
// high = popular, medium = moderate seller, low = rarely ordered.

const CATALOG = [
  // Electronics
  { name: "Wireless Headphones", category: "Electronics", price: 89.99, stock: 120, tier: "high", description: "Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life." },
  { name: "Smart Watch", category: "Electronics", price: 199.99, stock: 80, tier: "high", description: "Fitness and notifications smartwatch with heart-rate tracking and a 5-day battery." },
  { name: "Mechanical Keyboard", category: "Electronics", price: 109.99, stock: 95, tier: "high", description: "Hot-swappable mechanical keyboard with tactile switches and per-key RGB lighting." },
  { name: "Bluetooth Speaker", category: "Electronics", price: 59.99, stock: 150, tier: "medium", description: "Compact waterproof speaker with 12 hours of playback and punchy bass." },
  { name: "Wireless Mouse", category: "Electronics", price: 29.99, stock: 200, tier: "medium", description: "Ergonomic wireless mouse with adjustable DPI and a silent click design." },
  { name: "USB-C Hub", category: "Electronics", price: 34.99, stock: 140, tier: "medium", description: "7-in-1 USB-C hub with HDMI, SD card reader, and 100W pass-through charging." },
  { name: "Portable Power Bank", category: "Electronics", price: 24.99, stock: 180, tier: "low", description: "10,000mAh power bank with dual USB output for on-the-go charging." },
  { name: "Phone Stand", category: "Electronics", price: 14.99, stock: 220, tier: "low", description: "Adjustable aluminum phone and tablet stand for desks and nightstands." },

  // Clothing
  { name: "Cotton Hoodie", category: "Clothing", price: 49.99, stock: 160, tier: "high", description: "Heavyweight cotton hoodie with a relaxed fit and fleece lining." },
  { name: "Slim Fit Jeans", category: "Clothing", price: 59.99, stock: 140, tier: "high", description: "Stretch-denim slim fit jeans available in multiple washes." },
  { name: "Graphic T-Shirt", category: "Clothing", price: 19.99, stock: 300, tier: "medium", description: "Soft cotton crew-neck tee with a printed graphic design." },
  { name: "Denim Jacket", category: "Clothing", price: 79.99, stock: 90, tier: "medium", description: "Classic trucker-style denim jacket with a button front." },
  { name: "Running Shorts", category: "Clothing", price: 24.99, stock: 170, tier: "medium", description: "Lightweight quick-dry running shorts with a built-in liner." },
  { name: "Wool Beanie", category: "Clothing", price: 14.99, stock: 200, tier: "low", description: "Ribbed wool-blend beanie for cold-weather wear." },
  { name: "Flannel Shirt", category: "Clothing", price: 34.99, stock: 120, tier: "low", description: "Brushed flannel button-down shirt in a classic plaid pattern." },
  { name: "Ankle Socks (3-Pack)", category: "Clothing", price: 9.99, stock: 400, tier: "low", description: "Breathable cotton-blend ankle socks, pack of three." },

  // Home
  { name: "Desk Lamp", category: "Home", price: 39.99, stock: 130, tier: "high", description: "Dimmable LED desk lamp with adjustable color temperature." },
  { name: "Memory Foam Pillow", category: "Home", price: 44.99, stock: 110, tier: "high", description: "Contoured memory foam pillow with a cooling gel layer." },
  { name: "Ceramic Coffee Mug Set", category: "Home", price: 24.99, stock: 210, tier: "medium", description: "Set of four handcrafted ceramic mugs, 12oz each." },
  { name: "Throw Blanket", category: "Home", price: 34.99, stock: 150, tier: "medium", description: "Soft woven throw blanket, perfect for the couch or bed." },
  { name: "Scented Candle Trio", category: "Home", price: 22.99, stock: 190, tier: "medium", description: "Set of three soy candles in seasonal scents, 40-hour burn time each." },
  { name: "Desk Organizer", category: "Home", price: 19.99, stock: 160, tier: "low", description: "Multi-compartment bamboo desk organizer for office supplies." },
  { name: "Wall Clock", category: "Home", price: 27.99, stock: 90, tier: "low", description: "Minimalist silent-sweep wall clock, 12-inch diameter." },
  { name: "Kitchen Utensil Set", category: "Home", price: 29.99, stock: 100, tier: "low", description: "6-piece silicone kitchen utensil set with a heat-resistant holder." },

  // Beauty
  { name: "Vitamin C Serum", category: "Beauty", price: 28.99, stock: 220, tier: "high", description: "Brightening vitamin C serum with hyaluronic acid, 30ml." },
  { name: "Hydrating Face Cream", category: "Beauty", price: 32.99, stock: 180, tier: "high", description: "Daily moisturizer with ceramides for dry and sensitive skin." },
  { name: "Matte Lipstick Set", category: "Beauty", price: 24.99, stock: 200, tier: "medium", description: "Set of four long-wear matte lipsticks in everyday shades." },
  { name: "Electric Facial Cleanser", category: "Beauty", price: 39.99, stock: 100, tier: "medium", description: "Sonic facial cleansing brush with three intensity settings." },
  { name: "Hair Dryer", category: "Beauty", price: 54.99, stock: 90, tier: "medium", description: "Ionic hair dryer with diffuser and concentrator attachments." },
  { name: "Bamboo Makeup Brush Set", category: "Beauty", price: 16.99, stock: 210, tier: "low", description: "10-piece makeup brush set with eco-friendly bamboo handles." },
  { name: "Nail Care Kit", category: "Beauty", price: 12.99, stock: 250, tier: "low", description: "Stainless steel manicure and pedicure kit with a travel case." },
  { name: "Travel Toiletry Bag", category: "Beauty", price: 18.99, stock: 140, tier: "low", description: "Hanging toiletry bag with multiple compartments for travel." },

  // Sports
  { name: "Running Shoes", category: "Sports", price: 79.99, stock: 140, tier: "high", description: "Lightweight running shoes with responsive cushioning." },
  { name: "Yoga Mat", category: "Sports", price: 29.99, stock: 200, tier: "high", description: "Non-slip 6mm yoga mat with a carrying strap." },
  { name: "Adjustable Dumbbell Set", category: "Sports", price: 89.99, stock: 60, tier: "medium", description: "Space-saving adjustable dumbbells, 5-25lbs per hand." },
  { name: "Resistance Bands Set", category: "Sports", price: 19.99, stock: 250, tier: "medium", description: "Set of five resistance bands with varying tension levels." },
  { name: "Foam Roller", category: "Sports", price: 24.99, stock: 130, tier: "medium", description: "High-density foam roller for muscle recovery and stretching." },
  { name: "Water Bottle", category: "Sports", price: 14.99, stock: 300, tier: "low", description: "Insulated stainless steel water bottle, keeps drinks cold 24 hours." },
  { name: "Jump Rope", category: "Sports", price: 9.99, stock: 260, tier: "low", description: "Adjustable speed jump rope with ball-bearing handles." },
  { name: "Gym Duffel Bag", category: "Sports", price: 34.99, stock: 110, tier: "low", description: "Water-resistant duffel bag with a separate shoe compartment." },

  // Accessories
  { name: "Leather Wallet", category: "Accessories", price: 44.99, stock: 160, tier: "high", description: "Slim bifold leather wallet with RFID-blocking lining." },
  { name: "Sunglasses", category: "Accessories", price: 54.99, stock: 140, tier: "high", description: "Polarized UV400 sunglasses with a lightweight acetate frame." },
  { name: "Travel Backpack", category: "Accessories", price: 69.99, stock: 130, tier: "medium", description: "30L travel backpack with a padded laptop sleeve and rain cover." },
  { name: "Analog Wristwatch", category: "Accessories", price: 64.99, stock: 100, tier: "medium", description: "Minimalist analog wristwatch with a stainless steel mesh band." },
  { name: "Canvas Tote Bag", category: "Accessories", price: 22.99, stock: 190, tier: "medium", description: "Durable canvas tote bag with reinforced handles." },
  { name: "Baseball Cap", category: "Accessories", price: 17.99, stock: 220, tier: "low", description: "Adjustable cotton twill baseball cap, unstructured fit." },
  { name: "Leather Belt", category: "Accessories", price: 24.99, stock: 150, tier: "low", description: "Full-grain leather belt with a brushed metal buckle." },
  { name: "Phone Case", category: "Accessories", price: 15.99, stock: 300, tier: "low", description: "Shockproof phone case with reinforced corners." },
];

module.exports = { CATALOG };
