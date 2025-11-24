import { NextRequest, NextResponse } from 'next/server';
import {
  getUser,
  getGuess,
  updateGuess,
  updateUserScore,
  clearUserActiveGuess,
} from '@/lib/dynamodb';
import { getBitcoinPrice } from '@/lib/coinbase';
import { COUNTDOWN_SECONDS } from '@/lib/constants';

/**
 * GET /api/user
 * Get user data (score + active guess), resolve any pending guess
 *
 * This endpoint implements "lazy resolution":
 * - If a guess is >= 60 seconds old and the price has changed, it resolves the guess
 * - Returns resolvedGuess with both priceAtGuess and priceAtResolution for transparency
 */
export async function GET(request: NextRequest) {
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

    // Load user
    const user = await getUser(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If no active guess, return user data
    if (!user.activeGuessId) {
      return NextResponse.json({
        userId: user.userId,
        score: user.score,
        activeGuess: null,
        resolvedGuess: null,
      });
    }

    // Load the active guess
    const guess = await getGuess(user.activeGuessId);

    if (!guess) {
      // Active guess ID exists but guess not found - clear it
      await clearUserActiveGuess(userId);
      return NextResponse.json({
        userId: user.userId,
        score: user.score,
        activeGuess: null,
        resolvedGuess: null,
      });
    }

    const now = Date.now();
    const elapsedSeconds = (now - guess.timestampAtGuess) / 1000;

    // If less than COUNTDOWN_SECONDS, return as active guess
    if (elapsedSeconds < COUNTDOWN_SECONDS) {
      return NextResponse.json({
        userId: user.userId,
        score: user.score,
        activeGuess: {
          guessId: guess.guessId,
          direction: guess.direction,
          priceAtGuess: guess.priceAtGuess,
          timestampAtGuess: guess.timestampAtGuess,
          secondsRemaining: Math.ceil(COUNTDOWN_SECONDS - elapsedSeconds),
        },
        resolvedGuess: null,
      });
    }

    // 60+ seconds elapsed, check if we can resolve
    let currentPriceData;
    try {
      currentPriceData = await getBitcoinPrice();
    } catch (error) {
      // If we can't fetch price (rate limit, network error, etc.), keep guess pending
      console.warn('Cannot resolve guess - unable to fetch current price:', error);
      return NextResponse.json({
        userId: user.userId,
        score: user.score,
        activeGuess: {
          guessId: guess.guessId,
          direction: guess.direction,
          priceAtGuess: guess.priceAtGuess,
          timestampAtGuess: guess.timestampAtGuess,
          secondsRemaining: 0,
        },
        resolvedGuess: null,
      });
    }
    const currentPrice = currentPriceData.price;

    // If price hasn't changed, keep as pending
    if (currentPrice === guess.priceAtGuess) {
      return NextResponse.json({
        userId: user.userId,
        score: user.score,
        activeGuess: {
          guessId: guess.guessId,
          direction: guess.direction,
          priceAtGuess: guess.priceAtGuess,
          timestampAtGuess: guess.timestampAtGuess,
          secondsRemaining: 0,
        },
        resolvedGuess: null,
      });
    }

    // Price changed - resolve the guess
    const priceWentUp = currentPrice > guess.priceAtGuess;
    const won =
      (guess.direction === 'up' && priceWentUp) || (guess.direction === 'down' && !priceWentUp);

    const scoreChange = won ? 1 : -1;

    // Update guess in database
    await updateGuess(guess.guessId, {
      status: 'resolved',
      priceAtResolution: currentPrice,
      won,
      resolvedAt: now,
    });

    // Update user score and clear active guess
    await updateUserScore(userId, scoreChange);
    await clearUserActiveGuess(userId);

    // Return resolved guess
    return NextResponse.json({
      userId: user.userId,
      score: user.score + scoreChange, // Return updated score
      activeGuess: null,
      resolvedGuess: {
        guessId: guess.guessId,
        direction: guess.direction,
        priceAtGuess: guess.priceAtGuess,
        priceAtResolution: currentPrice,
        won,
        scoreChange,
      },
    });
  } catch (error) {
    console.error('Error in /api/user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
