// Kalkulationen für Trainingsstatistiken
import { UserProfile } from '../types';

// Runde Zeit auf 30 Sekunden auf oder ab
export const roundToNearestHalfMinute = (seconds: number): number => {
  // Runde auf nächste 30 Sekunden (0.5 Minuten)
  return Math.round(seconds / 30) * 30;
};

export const calculateDistance = (speedHistory: Array<{timestamp: number, speed: number}>): number => {
  if (speedHistory.length < 2) return 0;
  
  let totalDistance = 0;
  
  for (let i = 1; i < speedHistory.length; i++) {
    const timeInterval = (speedHistory[i].timestamp - speedHistory[i - 1].timestamp) / 1000 / 3600; // in Stunden
    const speed = speedHistory[i - 1].speed; // km/h
    totalDistance += speed * timeInterval;
  }
  
  return Math.round(totalDistance * 1000) / 1000; // Runde auf 3 Dezimalstellen
};

// Verbesserte Kalorienberechnung mit Benutzerprofil
export const calculateCalories = (
  speedHistory: Array<{timestamp: number, speed: number}>, 
  userProfile?: UserProfile
): number => {
  if (speedHistory.length < 2) return 0;
  
  const weight = userProfile?.weight || 70; // Standard-Gewicht in kg
  const age = userProfile?.age || 30;
  const gender = userProfile?.gender || 'male';
  
  let totalCalories = 0;
  
  for (let i = 1; i < speedHistory.length; i++) {
    const timeInterval = (speedHistory[i].timestamp - speedHistory[i - 1].timestamp) / 1000 / 60; // in Minuten
    const speed = speedHistory[i - 1].speed; // km/h
    
    // Verbesserte MET-Werte basierend auf Geschwindigkeit beim Gehen/Laufen
    let met = 2.0; // Ruhewert
    if (speed >= 2.7) met = 2.8; // Langsames Gehen
    if (speed >= 3.2) met = 3.0; // Normales Gehen
    if (speed >= 4.0) met = 3.3; // Zügiges Gehen
    if (speed >= 4.8) met = 3.8; // Schnelles Gehen
    if (speed >= 5.6) met = 4.3; // Sehr schnelles Gehen
    if (speed >= 6.4) met = 5.0; // Langsames Joggen
    if (speed >= 8.0) met = 8.0; // Joggen
    if (speed >= 9.7) met = 9.8; // Laufen
    if (speed >= 11.3) met = 11.0; // Schnelles Laufen
    
    // Anpassung basierend auf Geschlecht und Alter
    let adjustmentFactor = 1.0;
    if (gender === 'female') {
      adjustmentFactor *= 0.95; // Frauen verbrennen tendenziell etwas weniger Kalorien
    }
    if (age > 40) {
      adjustmentFactor *= (1 - (age - 40) * 0.005); // Metabolismus verlangsamt sich mit dem Alter
    }
    
    // Kalorien = MET * Gewicht * Zeit(h)
    const calories = met * weight * (timeInterval / 60) * adjustmentFactor;
    totalCalories += calories;
  }
  
  return Math.round(totalCalories);
};

// BMI Berechnung
export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
};

// BMI Kategorie
export const getBMICategory = (bmi: number): { category: string; color: string; description: string } => {
  if (bmi < 18.5) {
    return { 
      category: 'Untergewicht', 
      color: 'text-blue-400', 
      description: 'Möglicherweise zu wenig Gewicht' 
    };
  } else if (bmi < 25) {
    return { 
      category: 'Normalgewicht', 
      color: 'text-green-400', 
      description: 'Gesundes Gewicht' 
    };
  } else if (bmi < 30) {
    return { 
      category: 'Übergewicht', 
      color: 'text-yellow-400', 
      description: 'Leichtes Übergewicht' 
    };
  } else {
    return { 
      category: 'Adipositas', 
      color: 'text-red-400', 
      description: 'Starkes Übergewicht' 
    };
  }
};

// Grundumsatz berechnen (Harris-Benedict-Formel)
export const calculateBMR = (weight: number, height: number, age: number, gender: 'male' | 'female' | 'other'): number => {
  if (gender === 'male' || gender === 'other') {
    return Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
  } else {
    return Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
  }
};

// Gesamtumsatz berechnen
export const calculateTDEE = (bmr: number, activityLevel: string): number => {
  const activityFactors = {
    sedentary: 1.2,      // Wenig/keine Bewegung
    light: 1.375,        // Leichte Aktivität (1-3 Tage/Woche)
    moderate: 1.55,      // Moderate Aktivität (3-5 Tage/Woche)
    active: 1.725,       // Hohe Aktivität (6-7 Tage/Woche)
    very_active: 1.9     // Sehr hohe Aktivität (2x täglich, intensive Trainings)
  };
  
  const factor = activityFactors[activityLevel as keyof typeof activityFactors] || 1.55;
  return Math.round(bmr * factor);
};

// Ideales Trainingsgewicht berechnen
export const calculateIdealWeight = (height: number, gender: 'male' | 'female' | 'other'): { min: number; max: number } => {
  const heightInMeters = height / 100;
  
  // Basierend auf BMI 18.5-24.9 (Normalgewicht)
  const minWeight = Math.round(18.5 * heightInMeters * heightInMeters);
  const maxWeight = Math.round(24.9 * heightInMeters * heightInMeters);
  
  return { min: minWeight, max: maxWeight };
};

// Kaloriendefizit für Gewichtsverlust
export const calculateWeightLossCalories = (currentWeight: number, targetWeight: number, weeks: number): number => {
  const weightDifference = currentWeight - targetWeight;
  const totalCaloriesNeeded = weightDifference * 7700; // 1kg = ~7700 kcal
  const dailyDeficit = totalCaloriesNeeded / (weeks * 7);
  return Math.round(dailyDeficit);
};

// Trainingsintensität basierend auf Herzfrequenz (geschätzt)
export const estimateHeartRate = (age: number, intensity: 'low' | 'moderate' | 'high'): { min: number; max: number } => {
  const maxHR = 220 - age;
  
  switch (intensity) {
    case 'low':
      return { min: Math.round(maxHR * 0.5), max: Math.round(maxHR * 0.6) };
    case 'moderate':
      return { min: Math.round(maxHR * 0.6), max: Math.round(maxHR * 0.7) };
    case 'high':
      return { min: Math.round(maxHR * 0.7), max: Math.round(maxHR * 0.85) };
    default:
      return { min: Math.round(maxHR * 0.6), max: Math.round(maxHR * 0.7) };
  }
};

export const calculateAverageSpeed = (speedHistory: Array<{timestamp: number, speed: number}>): number => {
  if (speedHistory.length === 0) return 0;
  
  const totalSpeed = speedHistory.reduce((sum, point) => sum + point.speed, 0);
  return Math.round((totalSpeed / speedHistory.length) * 10) / 10;
};

export const calculateMaxSpeed = (speedHistory: Array<{timestamp: number, speed: number}>): number => {
  if (speedHistory.length === 0) return 0;
  
  return Math.max(...speedHistory.map(point => point.speed));
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);