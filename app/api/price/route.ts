import { NextResponse } from 'next/server';
import { getBitcoinPrice } from '@/lib/coinbase';

/**
 * GET /api/price
 * Get current Bitcoin price in USD
 * Results are cached for 5 seconds
 */
export async function GET() {
  try {
    const priceData = await getBitcoinPrice();

    return NextResponse.json({
      price: priceData.price,
      timestamp: priceData.timestamp,
    });
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Bitcoin price' },
      { status: 503 }
    );
  }
}
