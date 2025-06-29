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
}

export interface SpeedPoint {
  timestamp: number;
  speed: number;
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
  sortBy: 'name' | 'difficulty' | 'date' | 'duration' | 'distance' | 'calories';
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