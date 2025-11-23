import { NextRequest, NextResponse } from 'next/server';
import { getUser, createGuess, setUserActiveGuess } from '@/lib/dynamodb';
import { getBitcoinPrice } from '@/lib/coinbase';

/**
 * POST /api/guess
 * Submit a new guess
 *
 * User can only have one active guess at a time
 */
export async function POST(request: NextRequest) {
  try {
    // Extract userId from Authorization header
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const userId = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Parse request body
    const body = await request.json();
    const { direction } = body;

    // Validate direction
    if (direction !== 'up' && direction !== 'down') {
      return NextResponse.json(
        { error: 'Invalid direction. Must be "up" or "down"' },
        { status: 400 }
      );
    }

    // Load user
    const user = await getUser(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has an active guess
    if (user.activeGuessId) {
      return NextResponse.json(
        {
          error: 'conflict',
          message: 'You already have an active guess',
        },
        { status: 409 }
      );
    }

    // Fetch current BTC price (respects 5s cache)
    const priceData = await getBitcoinPrice();

    // Create new guess
    const guess = await createGuess(userId, direction, priceData.price);

    // Set as user's active guess
    await setUserActiveGuess(userId, guess.guessId);

    // Return guess details
    return NextResponse.json({
      guessId: guess.guessId,
      direction: guess.direction,
      priceAtGuess: guess.priceAtGuess,
      timestampAtGuess: guess.timestampAtGuess,
    });
  } catch (error) {
    console.error('Error in /api/guess:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
