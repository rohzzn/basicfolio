export interface ExerciseSet {
  index: number;
  set_type: string;
  weight_kg?: number;
  reps?: number;
  distance_meters?: number;
  duration_seconds?: number;
}

export interface Exercise {
  id: string;
  title: string;
  notes?: string;
  exercise_template_id: string;
  superset_id?: string | null;
  sets: ExerciseSet[];
}

export interface HevyWorkout {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  exercises: Exercise[];
}

export interface ActivitiesPayload {
  hevy: HevyWorkout[];
  fetchedAt: string;
  errors: { hevy?: string };
}

export type CombinedActivity = {
  id: string;
  type: 'gym';
  date: string;
  gymWorkout: HevyWorkout;
};

export type StatsPeriod = 'week' | 'month' | 'all';
