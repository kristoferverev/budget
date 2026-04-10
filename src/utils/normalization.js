/**
 * Normalization layer for grocery products.
 * Maps store-specific names (e.g., "PIIM 2,5% 1L") to canonical products.
 */

const NORM_MAP = {
  'piim': { name: 'Piim', category: 'Dairy', unit: 'L' },
  'leib': { name: 'Leib', category: 'Bakery', unit: 'tk' },
  'sai': { name: 'Sai', category: 'Bakery', unit: 'tk' },
  'muna': { name: 'Munad', category: 'Dairy', unit: 'pk' },
  'või': { name: 'Või', category: 'Dairy', unit: 'kg' },
};

/**
 * Normalizes a raw product name string.
 * @param {string} rawName 
 */
export const normalizeProductName = (rawName) => {
  const lower = rawName.toLowerCase();
  
  for (const [key, info] of Object.entries(NORM_MAP)) {
    if (lower.includes(key)) {
      return info;
    }
  }

  // Fallback: use title casing
  return {
    name: rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase(),
    category: 'Määramata',
    unit: '?'
  };
};

/**
 * Compares a "basket" (list of normalized names) across multiple stores.
 * @param {Array} basket List of item names
 * @param {Array} storePrices Array of { store_id, product_name, price }
 */
export const compareBasketPrices = (basket, storePrices) => {
  const result = {};

  basket.forEach(itemName => {
    const itemPrices = storePrices.filter(p => 
      p.product_name.toLowerCase().includes(itemName.toLowerCase())
    );

    itemPrices.forEach(p => {
      if (!result[p.store_id]) {
        result[p.store_id] = { total: 0, items_found: 0 };
      }
      result[p.store_id].total += p.price;
      result[p.store_id].items_found += 1;
    });
  });

  return result;
};
