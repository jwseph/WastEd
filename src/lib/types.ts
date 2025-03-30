export interface School {
  id: number;
  username: string;
}

export interface SchoolCredentials {
  username: string;
  password: string;
  confirm_password: string;
}

export interface SisterSchool {
  id: number;
  username: string;
  current_food_score: number | null;
  waste_metrics?: {
    surface_area: number;
    food_trays: number;
    unfinished_burgers: number;
    milk_cartons: number;
    vegetable_portions: number;
    fruit_portions: number;
  };
}

export interface SisterSchoolRequest {
  sister_school_username: string;
}

export interface Bin {
  id: number;
  ip_address: string;
  name: string;
  current_score: number;
  latest_snapshot?: Snapshot;
  history?: Array<{
    id: number;
    score: number;
    timestamp: string;
  }>;
}

export interface BinCreate {
  ip_address: string;
  school_id: number;
  name: string;
}

export interface BinUpdate {
  ip_address?: string;
  name?: string;
}

export interface HistoricalScores {
  "1_day_ago": number | null;
  "2_days_ago": number | null;
  "4_days_ago": number | null;
  "7_days_ago": number | null;
  "1_month_ago": number | null;
}

export interface BinHistory {
  current_score: number;
  historical_scores: HistoricalScores;
  name?: string;
  ip_address?: string;
}

export interface Snapshot {
  id: number;
  bin_id: number;
  image_data: string;
  food_trays: number;
  unfinished_burgers: number;
  milk_cartons: number;
  vegetable_portions: number;
  fruit_portions: number;
  percent_hundred_surface_area: number;
  food_score: number;
  is_empty: boolean;
  timestamp: string;
} 