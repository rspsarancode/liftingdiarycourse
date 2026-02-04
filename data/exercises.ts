import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Get all exercises for the current authenticated user
 * SECURITY: Automatically filters by current user's ID
 */
export async function getExercises() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return db
    .select()
    .from(exercises)
    .where(eq(exercises.userId, userId));
}

/**
 * Get a specific exercise by ID (current user only)
 * SECURITY: Filters by both exerciseId AND userId to prevent unauthorized access
 */
export async function getExerciseById(exerciseId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const result = await db
    .select()
    .from(exercises)
    .where(
      and(
        eq(exercises.id, parseInt(exerciseId)),
        eq(exercises.userId, userId)
      )
    );

  return result[0] ?? null;
}
