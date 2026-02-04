import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

/**
 * Get all workouts for the current authenticated user
 * SECURITY: Automatically filters by current user's ID
 */
export async function getWorkouts() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

/**
 * Get workouts for a specific date with their exercises and sets
 * SECURITY: Automatically filters by current user's ID
 */
export async function getWorkoutsByDate(date: Date) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get start and end of the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch workouts for this user on this date
  const userWorkouts = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, startOfDay),
        lt(workouts.startedAt, endOfDay)
      )
    );

  // For each workout, fetch the exercises with their sets
  const workoutsWithExercises = await Promise.all(
    userWorkouts.map(async (workout) => {
      const workoutExerciseRows = await db
        .select({
          workoutExerciseId: workoutExercises.id,
          exerciseId: exercises.id,
          exerciseName: exercises.name,
          order: workoutExercises.order,
        })
        .from(workoutExercises)
        .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
        .where(eq(workoutExercises.workoutId, workout.id))
        .orderBy(workoutExercises.order);

      // For each exercise, get the sets
      const exercisesWithSets = await Promise.all(
        workoutExerciseRows.map(async (we) => {
          const exerciseSets = await db
            .select()
            .from(sets)
            .where(eq(sets.workoutExerciseId, we.workoutExerciseId))
            .orderBy(sets.setNumber);

          return {
            id: we.exerciseId,
            name: we.exerciseName,
            sets: exerciseSets.length,
            reps: exerciseSets[0]?.reps ?? 0,
          };
        })
      );

      return {
        id: workout.id.toString(),
        name: workout.name ?? "Workout",
        startedAt: workout.startedAt,
        exercises: exercisesWithSets,
      };
    })
  );

  return workoutsWithExercises;
}

/**
 * Get a specific workout by ID (current user only)
 * SECURITY: Filters by both workoutId AND userId to prevent unauthorized access
 */
export async function getWorkoutById(workoutId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const result = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.id, parseInt(workoutId)),
        eq(workouts.userId, userId)
      )
    );

  return result[0] ?? null;
}
