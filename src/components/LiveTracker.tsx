import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Plus, Minus, Clock, Edit3, Trash2, CheckCircle, TrendingUp, MapPin, Flame, Activity, Footprints } from 'lucide-react';
import { calculateDistance, calculateCalories, calculateSteps, formatDuration, roundToNearestHalfMinute } from '../utils/calculations';
import { SpeedPoint } from '../types';
import { SessionSummary } from './SessionSummary';
import { getUserProfile } from '../firebase/services';
import { UserProfile } from '../types';
import { useTheme } from '../context/ThemeContext';

interface TimelineEntry {
  id: string;
  minute: number;
  speed: number;
}

interface LiveTrackerProps {
  onSessionComplete: (sessionData: {
    name: string;
    duration: number;
    distance: number;
    calories: number;
    averageSpeed: number;
    maxSpeed: number;
    speedHistory: SpeedPoint[];
    difficulty?: string;
  }) => void;
  isRecording: boolean;
  onRecordingChange: (recording: boolean, sessionData?: any) => void;
}

const difficultyLevels = [
  { id: 'anfaenger', label: 'Anfänger 🚶‍♀️', color: 'bg-green-600', description: 'Gemütliches Tempo für Einsteiger' },
  { id: 'leicht', label: 'Leicht 🚶‍♂️', color: 'bg-blue-600', description: 'Entspanntes Walking' },
  { id: 'mittel', label: 'Mittel 🏃‍♀️', color: 'bg-yellow-600', description: 'Moderates Tempo' },
  { id: 'schwer', label: 'Schwer 🏃‍♂️', color: 'bg-orange-600', description: 'Anspruchsvolles Training' },
  { id: 'extrem', label: 'Extrem 🔥', color: 'bg-red-600', description: 'Maximale Herausforderung' },
  { id: 'selbstmord', label: 'Selbstmord 💀', color: 'bg-purple-600', description: 'Nur für Profis!' }
];

export const LiveTracker: React.FC<LiveTrackerProps> = ({ onSessionComplete, onRecordingChange }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [targetDuration, setTargetDuration] = useState<number | null>(null); // in Sekunden
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState(1.0);
  const [speedHistory, setSpeedHistory] = useState<SpeedPoint[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [nameError, setNameError] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  
  // Timeline-Eingabe
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([
    { id: '1', minute: 0, speed: 1.0 }
  ]);
  const [timelineName, setTimelineName] = useState('');
  const [timelineNameError, setTimelineNameError] = useState('');
  const [timelineDifficulty, setTimelineDifficulty] = useState('');
  
  // User Profile für Schrittzähler
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const { isDark } = useTheme();
  
  // Session Summary State
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [completedSessionData, setCompletedSessionData] = useState<{
    name: string;
    duration: number;
    distance: number;
    calories: number;
    averageSpeed: number;
    maxSpeed: number;
    speedHistory: SpeedPoint[];
  } | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  
  // Lade Benutzerprofil für Schrittzähler
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.warn('Konnte Benutzerprofil nicht laden:', error);
        // Verwende Standardwerte
        setUserProfile({});
      }
    };
    
    loadProfile();
  }, []);
  
  // Vordefinierte Timer-Optionen
  const timerPresets = [
    { label: '15 Min', value: 15 * 60 },
    { label: '20 Min', value: 20 * 60 },
    { label: '30 Min', value: 30 * 60 },
    { label: '45 Min', value: 45 * 60 },
    { label: '60 Min', value: 60 * 60 },
    { label: '90 Min', value: 90 * 60 }
  ];

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current - pausedTimeRef.current) / 1000);
        setDuration(elapsed);
        
        // Berechne verbleibende Zeit wenn Timer gesetzt ist
        if (targetDuration) {
          const remaining = targetDuration - elapsed;
          setRemainingTime(Math.max(0, remaining));
          
          // Automatisch stoppen wenn Zeit abgelaufen
          if (remaining <= 0) {
            stopSession();
            return;
          }
        }
        
        setSpeedHistory(prev => [...prev, { timestamp: now, speed: currentSpeed }]);
      }, 1000);
      
      // Update recording state für Header
      onRecordingChange(true, {
        sessionName: sessionName,
        duration: duration,
        currentSpeed: currentSpeed
      });
    } else {
      // Clear interval when not running or paused
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, currentSpeed]);

  const startSession = () => {
    if (!sessionName.trim()) {
      setNameError('Bitte geben Sie einen Namen für die Trainingseinheit ein.');
      return;
    }
    
    setNameError('');
    const now = Date.now();
    startTimeRef.current = now;
    pausedTimeRef.current = 0;
    setIsRunning(true);
    setIsPaused(false);
    setDuration(0);
    setSpeedHistory([{ timestamp: now, speed: currentSpeed }]);
    
    // Setze verbleibende Zeit wenn Timer aktiv
    if (targetDuration) {
      setRemainingTime(targetDuration);
    }
  };

  const pauseSession = () => {
    setIsPaused(true);
  };

  const resumeSession = () => {
    pausedTimeRef.current += Date.now() - (startTimeRef.current + duration * 1000);
    setIsPaused(false);
  };

  const stopSession = () => {
    if (speedHistory.length < 2) {
      alert('Trainingseinheit zu kurz. Mindestens 1 Minute Training erforderlich.');
      return;
    }

    // Runde die Dauer auf nächste 30 Sekunden
    const roundedDuration = roundToNearestHalfMinute(duration);

    const distance = calculateDistance(speedHistory);
    const calories = calculateCalories(speedHistory);
    const steps = calculateSteps(speedHistory, userProfile);
    const averageSpeed = speedHistory.reduce((sum, point) => sum + point.speed, 0) / speedHistory.length;
    const maxSpeed = Math.max(...speedHistory.map(point => point.speed));

    // Zeige Session Summary anstatt direkt zu speichern
    const sessionData = {
      name: sessionName,
      duration: roundedDuration,
      distance,
      calories,
      steps,
      averageSpeed: Math.round(averageSpeed * 10) / 10,
      maxSpeed,
      speedHistory
    };
    
    setCompletedSessionData(sessionData);
    setShowSessionSummary(true);

    // Reset
    setIsRunning(false);
    setIsPaused(false);
    setDuration(0);
    setCurrentSpeed(1.0);
    setSpeedHistory([]);
    setSessionName('');
    setNameError('');
    setTargetDuration(null);
    setRemainingTime(null);
  };

  // Separate useEffect für Recording State Updates
  useEffect(() => {
    if (isRunning && !isPaused) {
      onRecordingChange(true, {
        sessionName: sessionName,
        duration: duration,
        currentSpeed: currentSpeed
      });
    } else {
      onRecordingChange(false);
    }
  }, [isRunning, isPaused, sessionName, duration, currentSpeed, onRecordingChange]);

  const handleSessionSave = (sessionData: {
    name: string;
    duration: number;
    distance: number;
    calories: number;
    averageSpeed: number;
    maxSpeed: number;
    speedHistory: SpeedPoint[];
    difficulty?: string;
    steps?: number;
  }) => {
    onSessionComplete(sessionData);
    setShowSessionSummary(false);
    setCompletedSessionData(null);
    setSelectedDifficulty('');
  };

  const handleSessionCancel = () => {
    setShowSessionSummary(false);
    setCompletedSessionData(null);
    onRecordingChange(false);
  };

  const adjustSpeed = (delta: number) => {
    setCurrentSpeed(prev => Math.max(1.0, Math.min(6.0, prev + delta)));
  };

  const handleSpeedInputChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 1.0 && numValue <= 6.0) {
      setCurrentSpeed(numValue);
    }
  };

  // Timeline-Funktionen
  const addTimelineEntry = () => {
    const lastEntry = timelineEntries[timelineEntries.length - 1];
    const newMinute = lastEntry ? lastEntry.minute + 1 : 0;
    
    setTimelineEntries(prev => [...prev, {
      id: Date.now().toString(),
      minute: newMinute,
      speed: 1.0
    }]);
  };

  const removeTimelineEntry = (id: string) => {
    if (timelineEntries.length > 1) {
      setTimelineEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const updateTimelineEntry = (id: string, field: 'minute' | 'speed', value: number) => {
    setTimelineEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const submitTimelineTraining = () => {
    if (!timelineName.trim()) {
      setTimelineNameError('Bitte geben Sie einen Namen für die Trainingseinheit ein.');
      return;
    }

    // Sortiere Einträge nach Minuten
    const sortedEntries = [...timelineEntries].sort((a, b) => a.minute - b.minute);
    
    // Validierung
    if (sortedEntries.length < 2) {
      alert('Mindestens 2 Timeline-Einträge erforderlich.');
      return;
    }

    const maxMinute = Math.max(...sortedEntries.map(entry => entry.minute));
    // Runde die Dauer auf nächste 30 Sekunden
    const newDuration = roundToNearestHalfMinute(maxMinute * 60);
    if (maxMinute < 1) {
      alert('Training muss mindestens 1 Minute dauern.');
      return;
    }

    setTimelineNameError('');

    // Erstelle Geschwindigkeitsverlauf basierend auf Timeline
    const now = Date.now();
    const simulatedHistory: SpeedPoint[] = [];
    
    for (let minute = 0; minute <= maxMinute; minute++) {
      // Finde die Geschwindigkeit für diese Minute
      let currentSpeedForMinute = 1.0;
      
      // Finde den letzten Eintrag vor oder bei dieser Minute
      for (let i = sortedEntries.length - 1; i >= 0; i--) {
        if (sortedEntries[i].minute <= minute) {
          currentSpeedForMinute = sortedEntries[i].speed;
          break;
        }
      }
      
      // Füge Datenpunkte für diese Minute hinzu (alle 10 Sekunden)
      for (let second = 0; second < 60; second += 10) {
        simulatedHistory.push({
          timestamp: now + (minute * 60 + second) * 1000,
          speed: currentSpeedForMinute
        });
      }
    }

    const distance = calculateDistance(simulatedHistory);
    const calories = calculateCalories(simulatedHistory);
    const steps = calculateSteps(simulatedHistory, userProfile);
    const averageSpeed = simulatedHistory.reduce((sum, point) => sum + point.speed, 0) / simulatedHistory.length;
    const maxSpeed = Math.max(...simulatedHistory.map(point => point.speed));

    onSessionComplete({
      name: timelineName,
      duration: maxMinute * 60,
      distance,
      calories,
      steps,
      averageSpeed: Math.round(averageSpeed * 10) / 10,
      maxSpeed,
      speedHistory: simulatedHistory,
      difficulty: timelineDifficulty
    });

    // Reset
    setTimelineName('');
    setTimelineNameError('');
    setTimelineDifficulty('');
    setTimelineEntries([{ id: '1', minute: 0, speed: 1.0 }]);
    setShowManualEntry(false);
    setTargetDuration(null);
    setRemainingTime(null);
  };

  const speedButtons = [];
  for (let speed = 1.0; speed <= 6.0; speed += 0.5) {
    speedButtons.push(speed);
  }

  const currentDistance = calculateDistance(speedHistory);
  const currentCalories = calculateCalories(speedHistory);
  const currentSteps = calculateSteps(speedHistory, userProfile);
  
  // Berechne Fortschritt in Prozent
  const progressPercentage = targetDuration && targetDuration > 0 
    ? Math.min(100, (duration / targetDuration) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Stoppuhr-Anzeige */}
      <div className={`rounded-xl p-6 shadow-xl transition-colors duration-200 ${
        isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
      }`}>
        {/* Header mit Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 ${
              isRunning && !isPaused 
                ? 'bg-green-500/20 border-2 border-green-500' 
                : isPaused 
                  ? 'bg-yellow-500/20 border-2 border-yellow-500'
                  : isDark 
                    ? 'bg-gray-700 border-2 border-gray-600' 
                    : 'bg-gray-100 border-2 border-gray-300'
            }`}>
              {isRunning && !isPaused ? (
                <Play className="w-6 h-6 text-green-500" />
              ) : isPaused ? (
                <Pause className="w-6 h-6 text-yellow-500" />
              ) : (
                <Clock className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <h2 className={`text-2xl font-bold transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Live Training</h2>
              <p className={`text-sm transition-colors duration-200 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {isRunning && !isPaused ? 'Training läuft' : 
                 isPaused ? 'Pausiert' : 
                 targetDuration ? `Timer: ${formatDuration(targetDuration)}` : 'Bereit zum Start'}
              </p>
            </div>
          </div>
          
          {/* Recording Indicator */}
          {isRunning && !isPaused && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-sm font-medium">REC</span>
            </div>
          )}
        </div>
        
        {/* Haupt-Timer Display */}
        <div className="text-center mb-6">
          <div className={`text-6xl md:text-7xl font-mono font-bold mb-2 transition-colors duration-200 ${
            isRunning && !isPaused 
              ? 'text-green-400' 
              : isPaused 
                ? 'text-yellow-400'
                : isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {targetDuration && remainingTime !== null 
              ? formatDuration(remainingTime)
              : formatDuration(duration)
            }
          </div>
          
          {/* Timer Info */}
          {targetDuration && (
            <div className="space-y-2">
              <div className={`text-sm transition-colors duration-200 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Verstrichene Zeit: {formatDuration(duration)} • Zielzeit: {formatDuration(targetDuration)}
              </div>
              
              {/* Fortschrittsbalken */}
              <div className="max-w-md mx-auto">
                <div className={`w-full rounded-full h-2 transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className={`text-xs mt-1 transition-colors duration-200 ${
                  isDark ? 'text-gray-500' : 'text-gray-600'
                }`}>
                  {progressPercentage.toFixed(1)}% abgeschlossen
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Live Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Aktuelle Geschwindigkeit - Prominent */}
          <div className={`md:col-span-2 rounded-lg p-4 border-2 transition-colors duration-200 ${
            isRunning && !isPaused 
              ? isDark 
                ? 'bg-blue-900/30 border-blue-500/50' 
                : 'bg-blue-50 border-blue-300'
              : isDark 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-100 border-gray-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-medium mb-1 transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Aktuelle Geschwindigkeit</div>
                <div className={`text-3xl font-bold transition-colors duration-200 ${
                  isRunning && !isPaused ? 'text-blue-400' : isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {currentSpeed.toFixed(1)} <span className="text-lg">km/h</span>
                </div>
              </div>
              <TrendingUp className={`w-8 h-8 transition-colors duration-200 ${
                isRunning && !isPaused ? 'text-blue-400' : isDark ? 'text-gray-500' : 'text-gray-400'
              }`} />
            </div>
          </div>
          
          {/* Distanz */}
          <div className={`rounded-lg p-4 transition-colors duration-200 ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-5 h-5 text-green-400" />
              <div className={`text-sm font-medium transition-colors duration-200 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Distanz</div>
            </div>
            <div className={`text-2xl font-bold transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{currentDistance.toFixed(2)} km</div>
          </div>
          
          {/* Kalorien */}
          <div className={`rounded-lg p-4 transition-colors duration-200 ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <div className={`text-sm font-medium transition-colors duration-200 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Kalorien</div>
            </div>
            <div className={`text-2xl font-bold transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{currentCalories}</div>
          </div>
        </div>
        
        {/* Zusätzliche Live-Statistiken */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Schritte */}
          <div className={`rounded-lg p-4 transition-colors duration-200 ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <Footprints className="w-5 h-5 text-purple-400" />
              <div className={`text-sm font-medium transition-colors duration-200 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Schritte</div>
            </div>
            <div className={`text-xl font-bold transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{currentSteps.toLocaleString()}</div>
            <div className={`text-xs transition-colors duration-200 ${
              isDark ? 'text-gray-500' : 'text-gray-600'
            }`}>
              {duration > 0 ? Math.round(currentSteps / (duration / 60)) : 0} /min
            </div>
          </div>
          
          {/* Tempo */}
          <div className={`rounded-lg p-4 transition-colors duration-200 ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <div className={`text-sm font-medium transition-colors duration-200 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Tempo</div>
            </div>
            <div className={`text-xl font-bold transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {currentDistance > 0 ? formatDuration(Math.round((duration / currentDistance) * 60)) : '--:--'}
            </div>
            <div className={`text-xs transition-colors duration-200 ${
              isDark ? 'text-gray-500' : 'text-gray-600'
            }`}>min/km</div>
          </div>
          
          {/* Intensität */}
          <div className={`rounded-lg p-4 transition-colors duration-200 ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-pink-400" />
              <div className={`text-sm font-medium transition-colors duration-200 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Intensität</div>
            </div>
            <div className={`text-lg font-bold ${
              currentSpeed >= 5.0 ? 'text-red-400' :
              currentSpeed >= 4.0 ? 'text-orange-400' :
              currentSpeed >= 3.0 ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {currentSpeed >= 5.0 ? 'Sehr hoch' :
               currentSpeed >= 4.0 ? 'Hoch' :
               currentSpeed >= 3.0 ? 'Mittel' : 'Niedrig'}
            </div>
            <div className={`text-xs transition-colors duration-200 ${
              isDark ? 'text-gray-500' : 'text-gray-600'
            }`}>
              {currentSpeed >= 5.0 ? '🔥' :
               currentSpeed >= 4.0 ? '💪' :
               currentSpeed >= 3.0 ? '👍' : '🚶'}
            </div>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex justify-center space-x-4">
          {!isRunning ? (
            <button
              onClick={startSession}
              disabled={!sessionName.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-8 py-4 rounded-xl flex items-center space-x-3 text-white font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <Play className="w-6 h-6" />
              <span>Training starten</span>
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={resumeSession}
                  className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl flex items-center space-x-2 text-white font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  <Play className="w-5 h-5" />
                  <span>Fortsetzen</span>
                </button>
              ) : (
                <button
                  onClick={pauseSession}
                  className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-xl flex items-center space-x-2 text-white font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  <Pause className="w-5 h-5" />
                  <span>Pausieren</span>
                </button>
              )}
              <button
                onClick={stopSession}
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl flex items-center space-x-2 text-white font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                <Square className="w-5 h-5" />
                <span>Beenden</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Geschwindigkeits-Kontrolle */}
      {isRunning && (
        <div className={`rounded-xl p-6 shadow-xl transition-colors duration-200 ${
          isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-xl font-bold mb-4 transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>⚡ Geschwindigkeit anpassen</h3>
          
          <div className="space-y-4">
            {/* Schnelle Anpassung */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => adjustSpeed(-0.5)}
                disabled={currentSpeed <= 1.0}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-3 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <Minus className="w-6 h-6 text-white" />
              </button>
              
              <div className="text-center">
                <div className={`text-4xl font-bold mb-1 transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{currentSpeed.toFixed(1)}</div>
                <div className={`text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>km/h</div>
              </div>
              
              <button
                onClick={() => adjustSpeed(0.5)}
                disabled={currentSpeed >= 6.0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-3 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <Plus className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* Geschwindigkeits-Presets */}
            <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
              {speedButtons.map((speed) => (
                <button
                  key={speed}
                  onClick={() => setCurrentSpeed(speed)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                    currentSpeed === speed
                      ? 'bg-green-600 text-white shadow-lg'
                      : isDark 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {speed.toFixed(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Session Setup - Nur wenn nicht läuft */}
      {!isRunning && !showManualEntry && (
        <div className={`rounded-xl p-6 shadow-xl transition-colors duration-200 ${
          isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-xl font-bold mb-4 transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>🎯 Training konfigurieren</h3>
          
          <div className="space-y-4">
            {/* Trainingsname */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Name der Trainingseinheit
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => {
                  setSessionName(e.target.value);
                  if (nameError) setNameError('');
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="z.B. Morgendliches Walking"
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-400">{nameError}</p>
              )}
            </div>
            
            {/* Schwierigkeitslevel */}
            <div>
              <label className={`block text-sm font-medium mb-3 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Schwierigkeitslevel (optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {difficultyLevels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedDifficulty(level.id)}
                    className={`${level.color} hover:opacity-80 px-3 py-2 rounded-lg text-white text-sm font-medium transition-all ${
                      selectedDifficulty === level.id ? 'ring-2 ring-white' : ''
                    }`}
                    title={level.description}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timer-Einstellungen - Nur wenn nicht läuft */}
      {!isRunning && !showManualEntry && (
        <div className={`rounded-xl p-6 shadow-xl transition-colors duration-200 ${
          isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-xl font-bold mb-4 transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>⏰ Timer-Einstellungen</h3>
          
          <div className="space-y-4">
            {/* Timer Ein/Aus */}
            <div className="flex items-center justify-between">
              <label className={`text-sm font-medium transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Timer verwenden
              </label>
              <button
                onClick={() => {
                  if (targetDuration) {
                    setTargetDuration(null);
                    setRemainingTime(null);
                  } else {
                    setTargetDuration(30 * 60);
                    setRemainingTime(30 * 60);
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  targetDuration ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    targetDuration ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {/* Timer-Presets */}
            {targetDuration && (
              <div>
                <label className={`block text-sm font-medium mb-3 transition-colors duration-200 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Zielzeit auswählen
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {timerPresets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => {
                        setTargetDuration(preset.value);
                        setRemainingTime(preset.value);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        targetDuration === preset.value
                          ? 'bg-green-600 text-white'
                          : isDark 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timeline-Editor */}
      <div className={`rounded-xl p-6 shadow-xl transition-colors duration-200 ${
        isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-bold transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>📝 Training Timeline erstellen</h3>
          <button
            onClick={() => setShowManualEntry(!showManualEntry)}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-white transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>{showManualEntry ? 'Ausblenden' : 'Timeline-Eingabe'}</span>
          </button>
        </div>

        {showManualEntry && (
          <div className="space-y-6">
            {/* Name und Schwierigkeit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Name der Trainingseinheit
                </label>
                <input
                  type="text"
                  value={timelineName}
                  onChange={(e) => {
                    setTimelineName(e.target.value);
                    if (timelineNameError) setTimelineNameError('');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="z.B. Intervall-Training"
                />
                {timelineNameError && (
                  <p className="mt-1 text-sm text-red-400">{timelineNameError}</p>
                )}
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Schwierigkeitslevel
                </label>
                <select
                  value={timelineDifficulty}
                  onChange={(e) => setTimelineDifficulty(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Schwierigkeit wählen...</option>
                  {difficultyLevels.map(level => (
                    <option key={level.id} value={level.id}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Timeline-Einträge */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className={`text-lg font-semibold transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Geschwindigkeits-Timeline</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={addTimelineEntry}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg flex items-center space-x-1 text-white text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Hinzufügen</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {timelineEntries.map((entry, index) => (
                  <div key={entry.id} className={`rounded-lg p-3 flex items-center space-x-4 transition-colors duration-200 ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs mb-1 transition-colors duration-200 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>Minute</label>
                        <input
                          type="number"
                          min="0"
                          value={entry.minute}
                          onChange={(e) => updateTimelineEntry(entry.id, 'minute', parseInt(e.target.value) || 0)}
                          className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors duration-200 ${
                            isDark 
                              ? 'bg-gray-600 border-gray-500 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 transition-colors duration-200 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>Geschwindigkeit (km/h)</label>
                        <input
                          type="number"
                          min="1.0"
                          max="6.0"
                          step="0.5"
                          value={entry.speed}
                          onChange={(e) => updateTimelineEntry(entry.id, 'speed', parseFloat(e.target.value) || 1.0)}
                          className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors duration-200 ${
                            isDark 
                              ? 'bg-gray-600 border-gray-500 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>
                    
                    {timelineEntries.length > 1 && (
                      <button
                        onClick={() => removeTimelineEntry(entry.id)}
                        className={`p-1 rounded transition-colors ${
                          isDark 
                            ? 'text-red-400 hover:text-red-300' 
                            : 'text-red-600 hover:text-red-700'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className={`mt-4 p-3 rounded-lg border transition-colors duration-200 ${
                isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-300'
              }`}>
                <p className={`text-sm transition-colors duration-200 ${
                  isDark ? 'text-blue-300' : 'text-blue-800'
                }`}>
                  💡 <strong>So funktioniert's:</strong> 
                  <br />• Fügen Sie Zeitpunkte mit verschiedenen Geschwindigkeiten hinzu
                  <br />• Die App berechnet automatisch die Gesamtstatistiken
                  <br />• Klicken Sie "Timeline-Training hinzufügen" um die Aufzeichnung zu beenden
                </p>
              </div>
              
              {/* Vorschau der Timeline */}
              {timelineEntries.length > 1 && (
                <div className={`mt-4 p-3 rounded-lg transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <h5 className={`text-sm font-semibold mb-2 transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Timeline-Vorschau:</h5>
                  <div className={`text-xs space-y-1 transition-colors duration-200 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {timelineEntries
                      .sort((a, b) => a.minute - b.minute)
                      .map((entry, index) => (
                        <div key={entry.id} className="flex justify-between">
                          <span>Minute {entry.minute}:</span>
                          <span className="text-blue-400">{entry.speed} km/h</span>
                        </div>
                      ))}
                    <div className={`border-t pt-1 mt-2 flex justify-between font-semibold transition-colors duration-200 ${
                      isDark ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      <span>Gesamtdauer:</span>
                      <span className="text-green-400">
                        {Math.max(...timelineEntries.map(e => e.minute))} Minuten
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={submitTimelineTraining}
                className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg flex items-center justify-center space-x-2 text-white font-medium transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Training beenden & speichern</span>
              </button>
              
              <button
                onClick={() => {
                  setTimelineName('');
                  setTimelineNameError('');
                  setTimelineDifficulty('');
                  setTimelineEntries([{ id: '1', minute: 0, speed: 1.0 }]);
                  setShowManualEntry(false);
                }}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-medium transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Timer-Einstellungen */}
      {!isRunning && !showManualEntry && (
        <div className={`rounded-xl p-6 shadow-xl transition-colors duration-200 ${
          isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-xl font-bold mb-4 transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Timer-Einstellungen</h3>
          
          <div className="space-y-4">
            {/* Timer Ein/Aus */}
            <div className="flex items-center justify-between">
              <label className={`text-sm font-medium transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Timer verwenden
              </label>
              <button
                onClick={() => {
                  if (targetDuration) {
                    setTargetDuration(null);
                    setRemainingTime(null);
                  } else {
                    setTargetDuration(30 * 60); // Standard: 30 Minuten
                    setRemainingTime(30 * 60);
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  targetDuration ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    targetDuration ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {/* Timer-Presets */}
            {targetDuration && (
              <div>
                <label className={`block text-sm font-medium mb-3 transition-colors duration-200 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Zielzeit auswählen
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {timerPresets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => {
                        setTargetDuration(preset.value);
                        setRemainingTime(preset.value);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        targetDuration === preset.value
                          ? 'bg-green-600 text-white'
                          : isDark 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                
                {/* Benutzerdefinierte Zeit */}
                <div className="mt-4">
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Benutzerdefinierte Zeit (Minuten)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={targetDuration ? Math.round(targetDuration / 60) : 30}
                      onChange={(e) => {
                        const minutes = parseInt(e.target.value) || 30;
                        const seconds = minutes * 60;
                        setTargetDuration(seconds);
                        setRemainingTime(seconds);
                      }}
                      className={`w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <span className={`transition-colors duration-200 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>Minuten</span>
                  </div>
                </div>
                
                {/* Timer-Info */}
                <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-700">
                  <p className="text-blue-300 text-sm">
                    ⏰ <strong>Timer aktiv:</strong> Das Training stoppt automatisch nach {formatDuration(targetDuration)}
                    <br />🎯 <strong>Ziel:</strong> Erreichen Sie Ihre gewünschte Trainingszeit
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Session Summary Modal */}
      {showSessionSummary && completedSessionData && (
        <SessionSummary
          sessionData={completedSessionData}
          onSave={handleSessionSave}
          onCancel={handleSessionCancel}
        />
      )}

      {/* Live Tracking */}
      <div className={`rounded-xl p-6 shadow-xl transition-colors duration-200 ${
        isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
      }`}>
        <h2 className={`text-2xl font-bold mb-6 transition-colors duration-200 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Live Tracking</h2>
        
        {!isRunning && !showManualEntry && (
          <div className="space-y-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Name der Trainingseinheit
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => {
                  setSessionName(e.target.value);
                  if (nameError) setNameError('');
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="z.B. Morgendliches Walking"
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-400">{nameError}</p>
              )}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-3 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Schwierigkeitslevel
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {difficultyLevels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedDifficulty(level.id)}
                    className={`${level.color} hover:opacity-80 px-3 py-2 rounded-lg text-white text-sm font-medium transition-all ${
                      selectedDifficulty === level.id ? 'ring-2 ring-white' : ''
                    }`}
                    title={level.description}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`rounded-lg p-4 transition-colors duration-200 ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className={`text-sm transition-colors duration-200 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Zeit</div>
            <div className={`text-2xl font-bold transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{formatDuration(duration)}</div>
          </div>
          <div className={`rounded-lg p-4 transition-colors duration-200 ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className={`text-sm transition-colors duration-200 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Distanz</div>
            <div className="text-2xl font-bold text-green-400">{currentDistance.toFixed(2)} km</div>
          </div>
          <div className={`rounded-lg p-4 transition-colors duration-200 ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className={`text-sm transition-colors duration-200 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Kalorien</div>
            <div className="text-2xl font-bold text-orange-400">{currentCalories}</div>
          </div>
          <div className={`rounded-lg p-4 transition-colors duration-200 ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className={`text-sm transition-colors duration-200 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Geschwindigkeit</div>
            <div className="text-2xl font-bold text-blue-400">{currentSpeed.toFixed(1)} km/h</div>
          </div>
        </div>

        {/* Zusätzliche Statistiken - Schritte */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`rounded-lg p-4 transition-colors duration-200 ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className={`text-sm transition-colors duration-200 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Schritte</div>
            <div className="text-2xl font-bold text-purple-400">{currentSteps.toLocaleString()}</div>
            <div className={`text-xs mt-1 transition-colors duration-200 ${
              isDark ? 'text-gray-500' : 'text-gray-600'
            }`}>Geschätzt basierend auf Körpergröße</div>
          </div>
          <div className={`rounded-lg p-4 transition-colors duration-200 ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className={`text-sm transition-colors duration-200 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Schritte/Min</div>
            <div className="text-2xl font-bold text-cyan-400">
              {duration > 0 ? Math.round(currentSteps / (duration / 60)) : 0}
            </div>
            <div className={`text-xs mt-1 transition-colors duration-200 ${
              isDark ? 'text-gray-500' : 'text-gray-600'
            }`}>Durchschnittliche Frequenz</div>
          </div>
          <div className={`rounded-lg p-4 transition-colors duration-200 ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className={`text-sm transition-colors duration-200 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Tempo</div>
            <div className="text-2xl font-bold text-yellow-400">
              {currentDistance > 0 ? formatDuration(Math.round((duration / currentDistance) * 60)) : '--:--'}
            </div>
            <div className={`text-xs mt-1 transition-colors duration-200 ${
              isDark ? 'text-gray-500' : 'text-gray-600'
            }`}>Min/km</div>
          </div>
        </div>

        <div className="mb-6">
          <label className={`block text-sm font-medium mb-3 transition-colors duration-200 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Geschwindigkeit einstellen
          </label>
          
          <div className="mb-4">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => adjustSpeed(-0.5)}
                disabled={!isRunning || currentSpeed <= 1.0}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 p-2 rounded-lg transition-colors"
              >
                <Minus className="w-4 h-4 text-white" />
              </button>
              
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1.0"
                  max="6.0"
                  step="0.5"
                  value={currentSpeed}
                  onChange={(e) => handleSpeedInputChange(e.target.value)}
                  disabled={!isRunning}
                  className={`w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-600' 
                      : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-200'
                  }`}
                />
                <span className={`text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>km/h</span>
              </div>
              
              <button
                onClick={() => adjustSpeed(0.5)}
                disabled={!isRunning || currentSpeed >= 6.0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 p-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
            {speedButtons.map((speed) => (
              <button
                key={speed}
                onClick={() => setCurrentSpeed(speed)}
                disabled={!isRunning}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentSpeed === speed
                    ? 'bg-green-600 text-white'
                    : isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:bg-gray-600 disabled:text-gray-500' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:bg-gray-300 disabled:text-gray-500'
                }`}
              >
                {speed.toFixed(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          {!isRunning ? (
            <button
              onClick={startSession}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg flex items-center space-x-2 text-white font-medium transition-colors"
            >
              <Play className="w-5 h-5" />
              <span>Training starten</span>
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={resumeSession}
                  className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg flex items-center space-x-2 text-white font-medium transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span>Fortsetzen</span>
                </button>
              ) : (
                <button
                  onClick={pauseSession}
                  className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg flex items-center space-x-2 text-white font-medium transition-colors"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  <span>Pausieren</span>
                </button>
              )}
              <button
                onClick={stopSession}
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg flex items-center space-x-2 text-white font-medium transition-colors"
              >
                <Square className="w-5 h-5" />
                <span>Training beenden</span>
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Schrittzähler-Info */}
      {!isRunning && !showManualEntry && (
        <div className={`rounded-xl p-6 shadow-xl transition-colors duration-200 ${
          isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-xl font-bold mb-4 transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>🚶‍♂️ Schrittzähler-Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className={`text-lg font-semibold transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Wie funktioniert's?</h4>
              <div className={`space-y-2 text-sm transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <p>• <strong>Automatische Berechnung:</strong> Schritte werden basierend auf Ihrer Geschwindigkeit und Körpergröße geschätzt</p>
                <p>• <strong>Schrittlänge:</strong> Wird aus Ihrer Körpergröße berechnet (Männer: 41.5%, Frauen: 41.3%)</p>
                <p>• <strong>Echtzeit-Tracking:</strong> Sehen Sie Ihre Schritte während des Trainings live</p>
                <p>• <strong>Genauigkeit:</strong> Die Schätzung ist sehr präzise für Walking-Pad Training</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className={`text-lg font-semibold transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Profil-Optimierung</h4>
              <div className={`space-y-2 text-sm transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <p>• <strong>Körpergröße:</strong> {userProfile.height ? `${userProfile.height} cm` : 'Nicht festgelegt (Standard: 170 cm)'}</p>
                <p>• <strong>Geschlecht:</strong> {userProfile.gender ? (userProfile.gender === 'male' ? 'Männlich' : userProfile.gender === 'female' ? 'Weiblich' : 'Divers') : 'Nicht festgelegt (Standard: Männlich)'}</p>
                <p>• <strong>Schrittlänge:</strong> {userProfile.height && userProfile.gender ? 
                  `~${Math.round((userProfile.height * (userProfile.gender === 'male' ? 0.415 : 0.413)))} cm` : 
                  '~70 cm (geschätzt)'}</p>
                <p>• <strong>Tipp:</strong> Gehen Sie zu Ihrem Profil, um genauere Schrittzählungen zu erhalten!</p>
              </div>
            </div>
          </div>
          
          <div className={`mt-6 p-4 rounded-lg transition-colors duration-200 ${
            isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-300'
          }`}>
            <h4 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>💡 Gesundheitstipps</h4>
            <div className={`text-sm space-y-1 transition-colors duration-200 ${
              isDark ? 'text-blue-200' : 'text-blue-600'
            }`}>
              <p>• Regelmäßiges Walking stärkt das Herz-Kreislauf-System</p>
              <p>• 30 Minuten täglich können das Risiko für Herzkrankheiten reduzieren</p>
              <p>• Walking ist gelenkschonend und für alle Altersgruppen geeignet</p>
              <p>• Bereits 2.000 zusätzliche Schritte täglich machen einen Unterschied</p>
            </div>
          </div>
          
          <div className={`mt-6 p-4 rounded-lg border transition-colors duration-200 ${
            isDark ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-300'
          }`}>
            <h5 className={`font-semibold mb-2 transition-colors duration-200 ${
              isDark ? 'text-purple-300' : 'text-purple-700'
            }`}>💡 Schrittziel-Empfehlungen</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className={`text-lg font-bold transition-colors duration-200 ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`}>5.000</div>
                <div className={`transition-colors duration-200 ${
                  isDark ? 'text-purple-300' : 'text-purple-600'
                }`}>Minimum täglich</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold transition-colors duration-200 ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`}>10.000</div>
                <div className={`transition-colors duration-200 ${
                  isDark ? 'text-purple-300' : 'text-purple-600'
                }`}>Empfohlenes Tagesziel</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold transition-colors duration-200 ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`}>15.000+</div>
                <div className={`transition-colors duration-200 ${
                  isDark ? 'text-purple-300' : 'text-purple-600'
                }`}>Sehr aktiver Lebensstil</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};