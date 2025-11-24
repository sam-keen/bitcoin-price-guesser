import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Initialise DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || 'Users';
const GUESSES_TABLE = process.env.DYNAMODB_GUESSES_TABLE || 'Guesses';

// Types
export interface User {
  userId: string;
  score: number;
  activeGuessId: string | null;
  createdAt: number;
  lastActivity: number;
}

export interface Guess {
  guessId: string;
  userId: string;
  direction: 'up' | 'down';
  priceAtGuess: number;
  timestampAtGuess: number;
  status: 'pending' | 'resolved';
  priceAtResolution?: number;
  won?: boolean;
  resolvedAt?: number;
}

/**
 * Create a new user with initial score of 0
 */
export async function createUser(userId: string): Promise<User> {
  const now = Date.now();
  const user: User = {
    userId,
    score: 0,
    activeGuessId: null,
    createdAt: now,
    lastActivity: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: USERS_TABLE,
      Item: user,
    })
  );

  return user;
}

/**
 * Get user by userId
 */
export async function getUser(userId: string): Promise<User | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId },
    })
  );

  return (result.Item as User) || null;
}

/**
 * Create a new guess
 */
export async function createGuess(
  userId: string,
  direction: 'up' | 'down',
  priceAtGuess: number
): Promise<Guess> {
  const guessId = uuidv4();
  const now = Date.now();

  const guess: Guess = {
    guessId,
    userId,
    direction,
    priceAtGuess,
    timestampAtGuess: now,
    status: 'pending',
  };

  await docClient.send(
    new PutCommand({
      TableName: GUESSES_TABLE,
      Item: guess,
    })
  );

  return guess;
}

/**
 * Get a guess by guessId
 */
export async function getGuess(guessId: string): Promise<Guess | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: GUESSES_TABLE,
      Key: { guessId },
    })
  );

  return (result.Item as Guess) || null;
}

/**
 * Update a guess with resolution data
 */
export async function updateGuess(
  guessId: string,
  updates: {
    status?: 'pending' | 'resolved';
    priceAtResolution?: number;
    won?: boolean;
    resolvedAt?: number;
  }
): Promise<void> {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, string | number | boolean | null> = {};

  if (updates.status !== undefined) {
    updateExpressions.push('#status = :status');
    expressionAttributeNames['#status'] = 'status';
    expressionAttributeValues[':status'] = updates.status;
  }

  if (updates.priceAtResolution !== undefined) {
    updateExpressions.push('priceAtResolution = :priceAtResolution');
    expressionAttributeValues[':priceAtResolution'] = updates.priceAtResolution;
  }

  if (updates.won !== undefined) {
    updateExpressions.push('won = :won');
    expressionAttributeValues[':won'] = updates.won;
  }

  if (updates.resolvedAt !== undefined) {
    updateExpressions.push('resolvedAt = :resolvedAt');
    expressionAttributeValues[':resolvedAt'] = updates.resolvedAt;
  }

  if (updateExpressions.length === 0) {
    return;
  }

  await docClient.send(
    new UpdateCommand({
      TableName: GUESSES_TABLE,
      Key: { guessId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames:
        Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
    })
  );
}

/**
 * Update user's score and lastActivity
 */
export async function updateUserScore(userId: string, scoreChange: number): Promise<void> {
  const now = Date.now();

  await docClient.send(
    new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET score = score + :scoreChange, lastActivity = :now',
      ExpressionAttributeValues: {
        ':scoreChange': scoreChange,
        ':now': now,
      },
    })
  );
}

/**
 * Clear user's activeGuessId and update lastActivity
 */
export async function clearUserActiveGuess(userId: string): Promise<void> {
  const now = Date.now();

  await docClient.send(
    new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET activeGuessId = :null, lastActivity = :now',
      ExpressionAttributeValues: {
        ':null': null,
        ':now': now,
      },
    })
  );
}

/**
 * Set user's activeGuessId and update lastActivity
 */
export async function setUserActiveGuess(userId: string, guessId: string): Promise<void> {
  const now = Date.now();

  await docClient.send(
    new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET activeGuessId = :guessId, lastActivity = :now',
      ExpressionAttributeValues: {
        ':guessId': guessId,
        ':now': now,
      },
    })
  );
}
