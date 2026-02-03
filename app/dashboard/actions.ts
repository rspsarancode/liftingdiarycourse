"use server";

import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export type WorkoutWithExercises = {
  id: number;
  name: string | null;
  startedAt: Date;
  completedAt: Date | null;
  exercises: {
    id: number;
    name: string;
    order: number;
    sets: {
      id: number;
      setNumber: number;
      reps: number | null;
      weight: string | null;
    }[];
  }[];
};

export async function getWorkoutsForDate(
  dateString: string
): Promise<WorkoutWithExercises[]> {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const date = new Date(dateString);
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const nextDay = new Date(startOfDay);
  nextDay.setDate(nextDay.getDate() + 1);

  // Get all workouts for the user on the specified date
  const dayWorkouts = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, startOfDay),
        lt(workouts.startedAt, nextDay)
      )
    );

  // For each workout, get its exercises and sets
  const workoutsWithExercises: WorkoutWithExercises[] = await Promise.all(
    dayWorkouts.map(async (workout) => {
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

      const exercisesWithSets = await Promise.all(
        workoutExerciseRows.map(async (we) => {
          const exerciseSets = await db
            .select({
              id: sets.id,
              setNumber: sets.setNumber,
              reps: sets.reps,
              weight: sets.weight,
            })
            .from(sets)
            .where(eq(sets.workoutExerciseId, we.workoutExerciseId))
            .orderBy(sets.setNumber);

          return {
            id: we.exerciseId,
            name: we.exerciseName,
            order: we.order,
            sets: exerciseSets,
          };
        })
      );

      return {
        id: workout.id,
        name: workout.name,
        startedAt: workout.startedAt,
        completedAt: workout.completedAt,
        exercises: exercisesWithSets,
      };
    })
  );

  return workoutsWithExercises;
}
