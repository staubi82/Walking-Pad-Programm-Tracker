export interface TrainingSession {
  id: string;
  name: string;
  date: Date;
  duration: number; // in seconds
  distance: number; // in km
  calories: number;
  averageSpeed: number; // in km/h
  maxSpeed: number; // in km/h
  speedHistory: SpeedPoint[];
  createdAt: Date;
  difficulty?: string;
  weight?: number; // Gewicht zum Zeitpunkt des Trainings
  steps?: number; // Geschätzte Schritte
}

export interface SpeedPoint {
  timestamp: number;
  speed: number;
}

export interface UserProfile {
  weight?: number; // in kg
  height?: number; // in cm
  age?: number; // in Jahren
  gender?: 'male' | 'female' | 'other';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  targetDuration: number; // in minutes
  targetDistance?: number; // in km
  targetCalories?: number;
  createdAt: Date;
}

export interface FilterOptions {
  sortBy: 'name' | 'difficulty' | 'date' | 'duration' | 'distance' | 'calories' | 'steps';
  sortOrder: 'asc' | 'desc';
  difficulty?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minDuration?: number;
  maxDuration?: number;
  minDistance?: number;
  maxDistance?: number;
  minCalories?: number;
  maxCalories?: number;
}