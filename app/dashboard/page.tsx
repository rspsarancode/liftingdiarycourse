"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Dumbbell } from "lucide-react";
import { DatePicker } from "@/components/date-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Mock workout data for UI demonstration
const mockWorkouts = [
  {
    id: "1",
    name: "Push Day",
    startedAt: new Date(),
    exercises: [
      { name: "Bench Press", sets: 4, reps: 8 },
      { name: "Overhead Press", sets: 3, reps: 10 },
      { name: "Tricep Pushdown", sets: 3, reps: 12 },
    ],
  },
  {
    id: "2",
    name: "Morning Cardio",
    startedAt: new Date(),
    exercises: [{ name: "Treadmill", sets: 1, reps: 30 }],
  },
];

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Workouts</h1>
        <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
      </div>

      {selectedDate && (
        <p className="text-muted-foreground mb-6">
          Showing workouts for {format(selectedDate, "do MMM yyyy")}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {mockWorkouts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dumbbell className="text-muted-foreground mb-4 h-12 w-12" />
              <p className="text-muted-foreground text-center">
                No workouts logged for this day.
              </p>
            </CardContent>
          </Card>
        ) : (
          mockWorkouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader>
                <CardTitle>{workout.name}</CardTitle>
                <CardDescription>
                  {format(workout.startedAt, "do MMM yyyy")} &middot;{" "}
                  {workout.exercises.length} exercise
                  {workout.exercises.length !== 1 && "s"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {workout.exercises.map((exercise, index) => (
                    <li
                      key={index}
                      className="text-muted-foreground flex items-center justify-between text-sm"
                    >
                      <span>{exercise.name}</span>
                      <span>
                        {exercise.sets} sets &times; {exercise.reps} reps
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
