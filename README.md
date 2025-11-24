# Bitcoin Price Prediction Game

A real-time game where players predict whether Bitcoin's price will go up or down in the next 60 seconds.

**Live Demo:** https://bitcoin-price-guesser.vercel.app

## How It Works

1. See the current BTC/USD price (updates every 5 seconds)
2. Predict **UP** or **DOWN**
3. Wait 60 seconds for the countdown
4. Win (+1 point) or lose (-1 point) based on price movement
5. Your score persists across browser sessions

## Tech Stack

| Layer            | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Frontend         | Next.js 16, React 19, TypeScript, Tailwind CSS |
| State Management | TanStack React Query                           |
| Backend          | Next.js API Routes                             |
| Database         | AWS DynamoDB                                   |
| Price Feed       | Coinbase API                                   |
| Hosting          | Vercel                                         |

## Architecture

```
Browser                          Vercel (Serverless)              AWS
┌─────────────────┐             ┌─────────────────┐         ┌──────────┐
│  React + Query  │◄───────────►│  API Routes     │◄───────►│ DynamoDB │
│                 │   HTTPS     │  /api/session   │  SDK    │  Users   │
│  localStorage   │             │  /api/price     │         │  Guesses │
│  (userId)       │             │  /api/user      │         └──────────┘
└─────────────────┘             │  /api/guess     │
                                └────────┬────────┘
                                         │ HTTPS
                                         ▼
                                ┌─────────────────┐
                                │  Coinbase API   │
                                │   (BTC price)   │
                                └─────────────────┘
```

## Key Design Decisions

### Anonymous Sessions (userId = Token)

Players start immediately with no login required. A UUID is generated server-side and serves dual purpose as both the user identifier and auth token.

**Why this approach:**

- **No friction:** Users can play instantly without signup/login flow
- **Simpler architecture:** No separate session token table, no token-to-userId lookup, no GSI needed
- **Sufficient security:** The UUID is unguessable and validated against the database on each request
- **Persistence:** Stored in localStorage, survives browser restarts

**Alternative considered:** OAuth or email-based auth would add complexity without benefit for an anonymous game.

### Lazy Resolution

Guesses are resolved when the client polls `/api/user` after the countdown completes, rather than via server-side background jobs.

**Why this approach:**

- **Serverless-friendly:** No persistent processes, cron jobs, or scheduled functions needed
- **Simpler deployment:** Single Vercel project, no additional Lambda/EventBridge infrastructure
- **Still fair:** Resolution logic runs server-side with live price data - the client can't manipulate the outcome
- **Meets requirements:** The brief states guesses resolve "when the price changes and at least 60 seconds have passed" - this is satisfied

**Trade-off:** This approach is gameable (see Known Limitations). A production system would use server-side scheduled resolution.

### Server-Side Price Comparison

The backend fetches the current BTC price at resolution time and compares it to the stored `priceAtGuess`. Both prices are returned to the frontend.

**Why this approach:**

- **Tamper-proof:** Users can't manipulate prices via DevTools or network interception
- **Single source of truth:** Server is authoritative on resolution outcome
- **Transparent:** Returning both prices lets users verify the outcome was fair
- **Auditable:** Both prices are stored in DynamoDB for any disputes

### Price Updates

The frontend polls `/api/price` every 5 seconds to keep the display current. This balances freshness (BTC prices move frequently) against API efficiency.

### Backend Caching

The backend caches the Coinbase response for 5 seconds. This means concurrent requests share the same price data rather than each hitting the external API. The cache also provides a fallback if Coinbase is temporarily unavailable.

**Note:** The current single-route app doesn't require React Query's `staleTime` configuration. If additional routes or modals that mount/unmount were added, configuring `staleTime` per-query would prevent redundant API calls on component remount.

## Known Limitations

### Lazy Resolution is Gameable

Because resolution only happens when the client requests it, a user could:

1. Make a prediction
2. Close the browser
3. Monitor BTC price elsewhere
4. Return only when the price has moved in their favor

**Production fix:** Server-side scheduled resolution using AWS EventBridge + Lambda to resolve guesses at exactly 60 seconds, independent of client activity.

### In-Memory Cache on Serverless

The backend price cache is per-instance. With serverless (Vercel), multiple concurrent requests might hit different instances with separate caches. For low traffic this is fine; at scale, a shared cache (Redis/Upstash) would be needed.

## Possible Improvements

These would be valuable additions in a production system:

| Improvement                 | Description                                                                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Leaderboard**             | The main reason scores are stored in DynamoDB rather than localStorage - enables a global ranking system. Would require a new `/api/leaderboard` endpoint with a GSI on score. |
| **Background resolution**   | AWS Lambda + EventBridge to resolve guesses server-side after 60 seconds, even if the user closes their browser. Eliminates the gaming exploit.                                |
| **User authentication**     | OAuth or email login to tie scores to accounts rather than anonymous sessions. Enables cross-device play.                                                                      |
| **CI/CD pipeline**          | GitHub Actions to lint, test, and build on every push. Block merges on test failures.                                                                                          |
| **Auto-removal of records** | Auto-delete old guesses after 30 days using DynamoDB TTL to save storage costs.                                                                                                |
| **Rate limiting**           | Prevent API abuse (though not needed for a demo).                                                                                                                              |
| **Real-time price feed**    | WebSocket connection instead of 5-second polling for lower latency, though polling is simpler and sufficient for this use case.                                                |

## Setup & Deployment

### Prerequisites

- Node.js 18+
- AWS account with CLI configured (`aws configure`)

### 1. Create DynamoDB Tables

```bash
aws dynamodb create-table --table-name Users \
  --attribute-definitions AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

aws dynamodb create-table --table-name Guesses \
  --attribute-definitions AttributeName=guessId,AttributeType=S \
  --key-schema AttributeName=guessId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### 2. Create IAM User for App Access

1. Go to AWS Console → IAM → Users → Create user
2. User name: `bitcoin-game-app` (or similar)
3. Attach this inline policy (Create policy → JSON):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem"],
      "Resource": ["arn:aws:dynamodb:*:*:table/Users", "arn:aws:dynamodb:*:*:table/Guesses"]
    }
  ]
}
```

4. Go to the user → Security credentials → Create access key
5. Select "Application running outside AWS"
6. Copy the **Access key ID** and **Secret access key** (you won't see the secret again)

### 3. Run Locally

```bash
npm install

# Create .env.local
cat > .env.local << EOF
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
DYNAMODB_USERS_TABLE=Users
DYNAMODB_GUESSES_TABLE=Guesses
EOF

npm run dev
```

## Testing

```bash
# Unit tests (Jest + React Testing Library)
npm test

# E2E tests (Playwright)
npm run test:e2e
```

**53 unit tests** covering:

- UI components (GuessForm, CountdownTimer, ResultDisplay, ScoreDisplay, PriceDisplay)
- Hooks (useCountdown, useSession)

**13 E2E tests** (run across Chromium, Firefox, and WebKit) covering:

- Page display and loading states
- UP/DOWN prediction submission
- Countdown flow and resolution states
- Session persistence
- API endpoint validation

Unit tests use `getByRole` queries for accessibility-aware testing.

### Configurable Countdown

The countdown duration is configurable via environment variable for fast E2E testing:

```bash
NEXT_PUBLIC_COUNTDOWN_SECONDS=3  # Used in E2E tests (default: 60)
```

---

Built to demonstrate full-stack TypeScript, React Query, serverless architecture, and AWS integration.
