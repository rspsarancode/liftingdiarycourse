import { format, parse } from "date-fns";
import { Dumbbell } from "lucide-react";
import { DatePickerNav } from "@/components/date-picker-nav";
import { getWorkoutsByDate } from "@/data/workouts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const selectedDate = params.date
    ? parse(params.date, "yyyy-MM-dd", new Date())
    : new Date();

  const workouts = await getWorkoutsByDate(selectedDate);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Workouts</h1>
        <DatePickerNav selectedDate={selectedDate} />
      </div>

      <p className="text-muted-foreground mb-6">
        Showing workouts for {format(selectedDate, "do MMM yyyy")}
      </p>

      <div className="flex flex-col gap-4">
        {workouts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dumbbell className="text-muted-foreground mb-4 h-12 w-12" />
              <p className="text-muted-foreground text-center">
                No workouts logged for this day.
              </p>
            </CardContent>
          </Card>
        ) : (
          workouts.map((workout) => (
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
                  {workout.exercises.map((exercise) => (
                    <li
                      key={exercise.id}
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
