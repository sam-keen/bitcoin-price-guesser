// Bitcoin price API helper with 5-second cache
// Uses Coinbase API (no geo-restrictions, generous rate limits)

const COINBASE_API = 'https://api.coinbase.com/v2/prices/BTC-USD/spot';
const CACHE_DURATION_MS = 5000; // 5 seconds

interface PriceData {
  price: number;
  timestamp: number;
}

// In-memory cache
let cachedPrice: PriceData | null = null;

/**
 * Fetch current Bitcoin price in USD from Coinbase
 * Results are cached for 5 seconds
 */
export async function getBitcoinPrice(): Promise<PriceData> {
  const now = Date.now();

  // Return cached price if it's still fresh
  if (cachedPrice && now - cachedPrice.timestamp < CACHE_DURATION_MS) {
    return cachedPrice;
  }

  try {
    const response = await fetch(COINBASE_API, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const priceString = data?.data?.amount;

    if (typeof priceString !== 'string') {
      throw new Error('Invalid price data from Coinbase');
    }

    const price = parseFloat(priceString);

    if (isNaN(price)) {
      throw new Error('Failed to parse price from Coinbase');
    }

    // Update cache
    cachedPrice = {
      price,
      timestamp: now,
    };

    return cachedPrice;
  } catch (error) {
    // If we have a cached price (even if stale), return it as fallback
    if (cachedPrice) {
      console.warn('Coinbase API error, returning stale cached price:', error);
      return cachedPrice;
    }

    // No cache available, throw error
    throw new Error(`Failed to fetch Bitcoin price: ${error}`);
  }
}
