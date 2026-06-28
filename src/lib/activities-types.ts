export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  suffer_score?: number;
  calories?: number;
  total_photo_count?: number;
  map?: { summary_polyline: string };
  photos?: {
    primary?: { urls: { '100': string; '600': string } };
    count: number;
  };
}

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
  images?: { id: string; url: string }[];
  image_urls?: string[];
  /** Strava gym post from the same session — photo loaded separately. */
  matchedStrava?: {
    id: number;
  };
}

export interface ActivitiesPayload {
  strava: StravaActivity[];
  hevy: HevyWorkout[];
  fetchedAt: string;
  errors: { strava?: string; hevy?: string };
}

export type CombinedActivity = {
  id: string;
  type: 'cardio' | 'gym';
  date: string;
  stravaActivity?: StravaActivity;
  gymWorkout?: HevyWorkout;
};

export type ActivityFilter = 'all' | 'run' | 'ride' | 'walk' | 'gym';
export type StatsPeriod = 'week' | 'month' | 'all';
