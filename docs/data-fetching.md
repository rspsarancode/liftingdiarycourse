# Data Fetching Standards

## Core Principle

**ALL data fetching in this application MUST be done via Server Components.**

This is non-negotiable. Do not deviate from this pattern.

## Prohibited Patterns

The following data fetching methods are **strictly forbidden**:

- Route Handlers (`app/api/**/route.ts`)
- Client Components (components with `"use client"`)
- `fetch()` calls from the client
- Direct database queries outside of the `/data` directory
- Any other client-side data fetching mechanism

## Required Pattern

### 1. Server Components Only

All pages and components that fetch data must be Server Components (no `"use client"` directive).

```typescript
// app/dashboard/page.tsx (Server Component)
import { getWorkouts } from "@/data/workouts";

export default async function DashboardPage() {
  const workouts = await getWorkouts();

  return <WorkoutList workouts={workouts} />;
}
```

### 2. Data Helper Functions

All database queries **MUST** be implemented as helper functions within the `/data` directory.

```
/data
  ├── workouts.ts    # Workout-related queries
  ├── exercises.ts   # Exercise-related queries
  └── users.ts       # User-related queries
```

### 3. Drizzle ORM Only

**DO NOT USE RAW SQL.** All database queries must use Drizzle ORM.

```typescript
// CORRECT - Using Drizzle ORM
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWorkouts(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

// WRONG - Raw SQL (DO NOT DO THIS)
export async function getWorkouts(userId: string) {
  return db.execute(`SELECT * FROM workouts WHERE user_id = '${userId}'`);
}
```

## User Data Isolation

**CRITICAL SECURITY REQUIREMENT:** A logged-in user can ONLY access their own data. They MUST NOT be able to access any other user's data under any circumstances.

### Implementation Rules

1. **Every data helper function MUST filter by the current user's ID**
2. **Never trust user input for user identification** - always get the user ID from the authenticated session
3. **All queries MUST include a `userId` filter**

### Example Implementation

```typescript
// data/workouts.ts
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function getUserId() {
  const session = await auth();

  if (!session.userId) {
    throw new Error("Unauthorized");
  }

  return session.userId;
}

export async function getWorkouts() {
  const userId = await getUserId();

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

export async function getWorkoutById(workoutId: string) {
  const userId = await getUserId();

  // ALWAYS filter by BOTH workoutId AND userId
  const result = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId)
      )
    );

  return result[0] ?? null;
}
```

### Security Checklist

Before merging any data-fetching code, verify:

- [ ] Data is fetched in a Server Component
- [ ] Query is implemented in a `/data` helper function
- [ ] Drizzle ORM is used (no raw SQL)
- [ ] User ID is obtained from `auth()`, not from user input
- [ ] Every query filters by `userId`
- [ ] No data from other users can be accessed
