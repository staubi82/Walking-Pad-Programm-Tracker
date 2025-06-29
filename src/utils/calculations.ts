// Kalkulationen für Trainingsstatistiken

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

export const calculateCalories = (
  speedHistory: Array<{timestamp: number, speed: number}>, 
  weight: number = 70 // Standard-Gewicht in kg
): number => {
  if (speedHistory.length < 2) return 0;
  
  let totalCalories = 0;
  
  for (let i = 1; i < speedHistory.length; i++) {
    const timeInterval = (speedHistory[i].timestamp - speedHistory[i - 1].timestamp) / 1000 / 60; // in Minuten
    const speed = speedHistory[i - 1].speed; // km/h
    
    // MET-Werte basierend auf Geschwindigkeit beim Gehen
    let met = 2.0; // Ruhewert
    if (speed >= 3.2) met = 3.0;
    if (speed >= 4.0) met = 3.3;
    if (speed >= 4.8) met = 3.8;
    if (speed >= 5.6) met = 4.3;
    if (speed >= 6.4) met = 5.0;
    
    // Kalorien = MET * Gewicht * Zeit(h)
    const calories = met * weight * (timeInterval / 60);
    totalCalories += calories;
  }
  
  return Math.round(totalCalories);
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
}