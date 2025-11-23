import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getUser, createUser } from '@/lib/dynamodb';

/**
 * GET /api/session
 * Get or create anonymous session
 *
 * If Authorization header with userId is present and valid, return existing user
 * Otherwise, create a new user with generated UUID
 */
export async function GET(request: NextRequest) {
  try {
    // Check for existing userId in Authorization header
    const authHeader = request.headers.get('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const userId = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Try to fetch existing user
      const existingUser = await getUser(userId);

      if (existingUser) {
        return NextResponse.json({
          userId: existingUser.userId,
          score: existingUser.score,
        });
      }
    }

    // No valid session found, create new user
    const newUserId = uuidv4();
    const newUser = await createUser(newUserId);

    return NextResponse.json({
      userId: newUser.userId,
      score: newUser.score,
    });
  } catch (error) {
    console.error('Error in /api/session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
