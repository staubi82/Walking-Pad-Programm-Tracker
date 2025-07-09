import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Plus, Minus, Clock, Edit3, Trash2, CheckCircle, Timer, Target, Zap, Activity, Footprints, TrendingUp } from 'lucide-react';
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
  const [targetDuration, setTargetDuration] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState(1.0);
  const [speedHistory, setSpeedHistory] = useState<SpeedPoint[]>([]);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [designMode, setDesignMode] = useState<'compact' | 'minimal'>('compact');
  
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
        
        if (targetDuration) {
          const remaining = targetDuration - elapsed;
          setRemainingTime(Math.max(0, remaining));
          
          if (remaining <= 0) {
            stopSession();
            return;
          }
        }
        
        setSpeedHistory(prev => [...prev, { timestamp: now, speed: currentSpeed }]);
      }, 1000);
      
      onRecordingChange(true, {
        duration: duration,
        currentSpeed: currentSpeed
      });
    } else {
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
    const now = Date.now();
    startTimeRef.current = now;
    pausedTimeRef.current = 0;
    setIsRunning(true);
    setIsPaused(false);
    setDuration(0);
    setSpeedHistory([{ timestamp: now, speed: currentSpeed }]);
    
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

    const roundedDuration = roundToNearestHalfMinute(duration);
    const distance = calculateDistance(speedHistory);
    const calories = calculateCalories(speedHistory);
    const steps = calculateSteps(speedHistory, userProfile);
    const averageSpeed = speedHistory.reduce((sum, point) => sum + point.speed, 0) / speedHistory.length;
    const maxSpeed = Math.max(...speedHistory.map(point => point.speed));

    const sessionData = {
      name: 'Training', // Wird im Summary Modal eingegeben
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

    setIsRunning(false);
    setIsPaused(false);
    setDuration(0);
    setCurrentSpeed(1.0);
    setSpeedHistory([]);
    setTargetDuration(null);
    setRemainingTime(null);
  };

  useEffect(() => {
    if (isRunning && !isPaused) {
      onRecordingChange(true, {
        duration: duration,
        currentSpeed: currentSpeed
      });
    } else {
      onRecordingChange(false);
    }
  }, [isRunning, isPaused, duration, currentSpeed, onRecordingChange]);

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

    const sortedEntries = [...timelineEntries].sort((a, b) => a.minute - b.minute);
    
    if (sortedEntries.length < 2) {
      alert('Mindestens 2 Timeline-Einträge erforderlich.');
      return;
    }

    const maxMinute = Math.max(...sortedEntries.map(entry => entry.minute));
    const newDuration = roundToNearestHalfMinute(maxMinute * 60);
    if (maxMinute < 1) {
      alert('Training muss mindestens 1 Minute dauern.');
      return;
    }

    setTimelineNameError('');

    const now = Date.now();
    const simulatedHistory: SpeedPoint[] = [];
    
    for (let minute = 0; minute <= maxMinute; minute++) {
      let currentSpeedForMinute = 1.0;
      
      for (let i = sortedEntries.length - 1; i >= 0; i--) {
        if (sortedEntries[i].minute <= minute) {
          currentSpeedForMinute = sortedEntries[i].speed;
          break;
        }
      }
      
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
  
  const progressPercentage = targetDuration && targetDuration > 0 
    ? Math.min(100, (duration / targetDuration) * 100)
    : 0;

  // Wenn Training läuft - kompakte Dashboard-Ansicht
  if (isRunning) {
    if (designMode === 'minimal') {
      // ALTERNATIVE: Ultra-minimales Design
      return (
        <div className="space-y-4">
          {/* Session Summary Modal */}
          {showSessionSummary && completedSessionData && (
            <SessionSummary
              sessionData={completedSessionData}
              onSave={handleSessionSave}
              onCancel={handleSessionCancel}
            />
          )}

          {/* Ultra-minimales Live Dashboard */}
          <div className={`rounded-2xl p-6 shadow-2xl border-2 transition-all duration-300 ${
            isDark 
              ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          }`}>
            {/* Hauptzeit - Zentral und groß */}
            <div className="text-center mb-8">
              <div className="text-7xl sm:text-8xl font-mono font-black bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
                {targetDuration && remainingTime !== null 
                  ? formatDuration(remainingTime)
                  : formatDuration(duration)
                }
              </div>
              
              {/* Status-Indikator */}
              <div className="flex items-center justify-center space-x-2 mb-4">
                {isPaused ? (
                  <div className="flex items-center text-yellow-400">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
                    <span className="text-lg font-medium">PAUSIERT</span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-400">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    <span className="text-lg font-medium">LIVE</span>
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              {targetDuration && (
                <div className={`w-full max-w-md mx-auto rounded-full h-3 mb-4 transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              )}
            </div>

            {/* Kompakte Statistiken - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className={`rounded-xl p-4 text-center transition-all duration-200 hover:scale-105 ${
                isDark 
                  ? 'bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-700/50' 
                  : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'
              }`}>
                <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1">{currentDistance.toFixed(2)}</div>
                <div className={`text-sm font-medium transition-colors duration-200 ${
                  isDark ? 'text-green-300' : 'text-green-700'
                }`}>km</div>
              </div>
              
              <div className={`rounded-xl p-4 text-center transition-all duration-200 hover:scale-105 ${
                isDark 
                  ? 'bg-gradient-to-br from-orange-900/30 to-orange-800/30 border border-orange-700/50' 
                  : 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200'
              }`}>
                <div className="text-2xl sm:text-3xl font-bold text-orange-400 mb-1">{currentCalories}</div>
                <div className={`text-sm font-medium transition-colors duration-200 ${
                  isDark ? 'text-orange-300' : 'text-orange-700'
                }`}>kcal</div>
              </div>
              
              <div className={`rounded-xl p-4 text-center transition-all duration-200 hover:scale-105 ${
                isDark 
                  ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-700/50' 
                  : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'
              }`}>
                <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1">{currentSpeed.toFixed(1)}</div>
                <div className={`text-sm font-medium transition-colors duration-200 ${
                  isDark ? 'text-blue-300' : 'text-blue-700'
                }`}>km/h</div>
              </div>
              
              <div className={`rounded-xl p-4 text-center transition-all duration-200 hover:scale-105 ${
                isDark 
                  ? 'bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-700/50' 
                  : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'
              }`}>
                <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-1">{currentSteps.toLocaleString()}</div>
                <div className={`text-sm font-medium transition-colors duration-200 ${
                  isDark ? 'text-purple-300' : 'text-purple-700'
                }`}>Schritte</div>
              </div>
            </div>

            {/* Geschwindigkeits-Kontrolle - Minimalistisch */}
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-6 mb-4">
                <button
                  onClick={() => adjustSpeed(-0.5)}
                  disabled={currentSpeed <= 1.0}
                  className="w-14 h-14 bg-red-500 hover:bg-red-600 disabled:bg-gray-500 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:scale-100 shadow-lg"
                >
                  <Minus className="w-6 h-6 text-white" />
                </button>
                
                <div className={`px-6 py-3 rounded-2xl border-2 transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600' 
                    : 'bg-white border-gray-300'
                }`}>
                  <div className="text-center">
                    <div className={`text-3xl font-bold transition-colors duration-200 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{currentSpeed.toFixed(1)}</div>
                    <div className={`text-sm transition-colors duration-200 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>km/h</div>
                  </div>
                </div>
                
                <button
                  onClick={() => adjustSpeed(0.5)}
                  disabled={currentSpeed >= 6.0}
                  className="w-14 h-14 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:scale-100 shadow-lg"
                >
                  <Plus className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Control Buttons - Minimalistisch */}
            <div className="flex justify-center space-x-4">
              {isPaused ? (
                <button
                  onClick={resumeSession}
                  className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-2xl flex items-center space-x-3 text-white font-bold text-lg transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <Play className="w-6 h-6" />
                  <span>Fortsetzen</span>
                </button>
              ) : (
                <button
                  onClick={pauseSession}
                  className="bg-yellow-500 hover:bg-yellow-600 px-8 py-4 rounded-2xl flex items-center space-x-3 text-white font-bold text-lg transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <Pause className="w-6 h-6" />
                  <span>Pause</span>
                </button>
              )}
              <button
                onClick={stopSession}
                className="bg-red-500 hover:bg-red-600 px-8 py-4 rounded-2xl flex items-center space-x-3 text-white font-bold text-lg transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Square className="w-6 h-6" />
                <span>Stop</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Standard kompakte Ansicht
    return (
      <div className="space-y-4">
        {/* Session Summary Modal */}
        {showSessionSummary && completedSessionData && (
          <SessionSummary
            sessionData={completedSessionData}
            onSave={handleSessionSave}
            onCancel={handleSessionCancel}
          />
        )}

        {/* Design Mode Toggle */}
        <div className="flex justify-center mb-4">
          <div className={`inline-flex rounded-lg p-1 transition-colors duration-200 ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <button
              onClick={() => setDesignMode('compact')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                designMode === 'compact'
                  ? 'bg-green-600 text-white shadow-lg'
                  : isDark 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Kompakt
            </button>
            <button
              onClick={() => setDesignMode('minimal')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                designMode === 'minimal'
                  ? 'bg-green-600 text-white shadow-lg'
                  : isDark 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Minimal
            </button>
          </div>
        </div>

        {/* Kompaktes Live Dashboard */}
        <div className={`rounded-xl p-4 sm:p-6 shadow-xl transition-colors duration-200 ${
          isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
        }`}>
          {/* Header mit Status */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              {isPaused ? (
                <div className="flex items-center text-yellow-400">
                  <Pause className="w-5 h-5 mr-2" />
                  <span className="text-lg font-medium">Training pausiert</span>
                </div>
              ) : (
                <div className="flex items-center text-green-400">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
                  <span className="text-lg font-medium">Live Training</span>
                </div>
              )}
            </div>
            
            {/* Control Buttons */}
            <div className="flex space-x-2">
              {isPaused ? (
                <button
                  onClick={resumeSession}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-white font-medium transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span className="hidden sm:inline">Fortsetzen</span>
                </button>
              ) : (
                <button
                  onClick={pauseSession}
                  className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-white font-medium transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  <span className="hidden sm:inline">Pause</span>
                </button>
              )}
              <button
                onClick={stopSession}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-white font-medium transition-colors"
              >
                <Square className="w-4 h-4" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            </div>
          </div>

          {/* Hauptzeit-Anzeige */}
          <div className="text-center mb-6">
            <div className="text-4xl sm:text-6xl font-mono font-bold text-green-400 mb-2">
              {targetDuration && remainingTime !== null 
                ? formatDuration(remainingTime)
                : formatDuration(duration)
              }
            </div>
            
            {targetDuration && (
              <>
                <div className={`text-sm mb-2 transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Verstrichene Zeit: {formatDuration(duration)} / {formatDuration(targetDuration)}
                </div>
                <div className={`w-full rounded-full h-2 mb-2 transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </>
            )}
          </div>

          {/* Live Statistiken Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className={`rounded-lg p-3 sm:p-4 transition-colors duration-200 ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <Target className="w-4 h-4 text-green-400" />
                <span className={`text-xs sm:text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Distanz</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-green-400">{currentDistance.toFixed(2)} km</div>
            </div>
            
            <div className={`rounded-lg p-3 sm:p-4 transition-colors duration-200 ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="w-4 h-4 text-orange-400" />
                <span className={`text-xs sm:text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Kalorien</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-orange-400">{currentCalories}</div>
            </div>
            
            <div className={`rounded-lg p-3 sm:p-4 transition-colors duration-200 ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className={`text-xs sm:text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Speed</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-blue-400">{currentSpeed.toFixed(1)} km/h</div>
            </div>
            
            <div className={`rounded-lg p-3 sm:p-4 transition-colors duration-200 ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <Footprints className="w-4 h-4 text-purple-400" />
                <span className={`text-xs sm:text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Schritte</span>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-purple-400">{currentSteps.toLocaleString()}</div>
            </div>
          </div>

          {/* Geschwindigkeits-Kontrolle */}
          <div className="mb-4">
            <div className="flex items-center justify-center space-x-4 mb-3">
              <button
                onClick={() => adjustSpeed(-0.5)}
                disabled={currentSpeed <= 1.0}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 p-2 sm:p-3 rounded-lg transition-colors"
              >
                <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
              
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1.0"
                  max="6.0"
                  step="0.5"
                  value={currentSpeed}
                  onChange={(e) => handleSpeedInputChange(e.target.value)}
                  className={`w-16 sm:w-20 px-2 sm:px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <span className={`text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>km/h</span>
              </div>
              
              <button
                onClick={() => adjustSpeed(0.5)}
                disabled={currentSpeed >= 6.0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 p-2 sm:p-3 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>

            {/* Schnell-Buttons für Geschwindigkeit */}
            <div className="grid grid-cols-6 lg:grid-cols-11 gap-1 sm:gap-2">
              {speedButtons.map((speed) => (
                <button
                  key={speed}
                  onClick={() => setCurrentSpeed(speed)}
                  className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    currentSpeed === speed
                      ? 'bg-green-600 text-white'
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
      </div>
    );
  }

  // Setup-Ansicht wenn nicht läuft
  return (
    <div className="space-y-6">
      {/* Session Summary Modal */}
      {showSessionSummary && completedSessionData && (
        <SessionSummary
          sessionData={completedSessionData}
          onSave={handleSessionSave}
          onCancel={handleSessionCancel}
        />
      )}

      {/* Training Setup */}
      <div className={`rounded-xl p-6 shadow-xl transition-colors duration-200 ${
        isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
      }`}>
        <h2 className={`text-2xl font-bold mb-6 transition-colors duration-200 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Neues Training starten</h2>
        
        <div className="space-y-6">
          {/* Timer-Einstellungen */}
          <div>
            <div className="flex items-center justify-between mb-4">
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
            
            {targetDuration && (
              <div className="space-y-4">
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

          {/* Start Button */}
          <button
            onClick={startSession}
            className="w-full bg-green-600 hover:bg-green-700 px-6 py-4 rounded-lg flex items-center justify-center space-x-3 text-white font-medium transition-colors text-lg shadow-lg"
          >
            <Play className="w-6 h-6" />
            <span>Training starten</span>
          </button>
        </div>
      </div>

      {/* Timeline-Editor */}
      <div className={`rounded-xl p-6 shadow-xl transition-colors duration-200 ${
        isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-bold transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Training Timeline erstellen</h3>
          <button
            onClick={() => setShowManualEntry(!showManualEntry)}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-white transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>{showManualEntry ? 'Ausblenden' : 'Timeline-Editor'}</span>
          </button>
        </div>

        {showManualEntry && (
          <div className="space-y-6">
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

            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className={`text-lg font-semibold transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Geschwindigkeits-Timeline</h4>
                <button
                  onClick={addTimelineEntry}
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg flex items-center space-x-1 text-white text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Hinzufügen</span>
                </button>
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
    </div>
  );
};