/**
 * Modular parser for Estonian grocery receipts.
 * Prioritizes Lidl and Selver formats.
 */

export const STORE_TYPES = {
  LIDL: 'lidl',
  SELVER: 'selver',
  UNKNOWN: 'unknown'
};

/**
 * Main entry point for parsing raw receipt text.
 * @param {string} text Raw text from receipt
 * @param {string} store Type of store (Lidl, Selver, etc.)
 */
export const parseReceiptContents = (text, store = STORE_TYPES.UNKNOWN) => {
  if (!text) return { items: [], total: 0 };

  switch (store) {
    case STORE_TYPES.LIDL:
      return parseLidlReceipt(text);
    case STORE_TYPES.SELVER:
      return parseSelverReceipt(text);
    default:
      return attemptAutoParse(text);
  }
};

const parseLidlReceipt = (text) => {
  // Skeleton for Lidl PDF-to-text parsing
  // Usually contains "Lidl Eesti OÜ" and items with "EUR" suffix
  const lines = text.split('\n');
  const items = [];
  let total = 0;

  // Basic regex for Lidl line items: "Product Description   Price A"
  const itemRegex = /^(.*?)\s+(\d+[\.,]\d{2})\s+[A-Z]$/i;

  lines.forEach(line => {
    const match = line.match(itemRegex);
    if (match) {
      items.push({
        name: match[1].trim(),
        total_price: parseFloat(match[2].replace(',', '.')),
        quantity: 1, // Default if not found
        unit_price: parseFloat(match[2].replace(',', '.'))
      });
    }

    if (line.toLowerCase().includes('kokku') || line.toLowerCase().includes('maksmisele')) {
      const amountMatch = line.match(/(\d+[\.,]\d{2})/);
      if (amountMatch) total = parseFloat(amountMatch[1].replace(',', '.'));
    }
  });

  return { items, total, store: STORE_TYPES.LIDL };
};

const parseSelverReceipt = (text) => {
  // Skeleton for Selver Partnerkaart digital receipts
  const lines = text.split('\n');
  const items = [];
  let total = 0;

  lines.forEach(line => {
    // Selver often lists items as "Product Name   Qty x Price   Total"
    if (line.includes(' x ')) {
      // Logic for multi-line or complex item extraction
    }

    if (line.toLowerCase().includes('kokku')) {
      const amountMatch = line.match(/(\d+[\.,]\d{2})/);
      if (amountMatch) total = parseFloat(amountMatch[1].replace(',', '.'));
    }
  });

  return { items, total, store: STORE_TYPES.SELVER };
};

const attemptAutoParse = (text) => {
  if (text.toLowerCase().includes('lidl')) return parseLidlReceipt(text);
  if (text.toLowerCase().includes('selver')) return parseSelverReceipt(text);
  return { items: [], total: 0, store: STORE_TYPES.UNKNOWN };
};
