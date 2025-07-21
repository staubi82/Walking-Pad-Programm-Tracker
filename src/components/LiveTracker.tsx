import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock, Target, Zap, Activity, Footprints } from 'lucide-react';
import { calculateDistance, calculateCalories, calculateSteps, formatDuration, roundToNearestHalfMinute } from '../utils/calculations';
import { SpeedPoint } from '../types';
import { SessionSummary } from './SessionSummary';
import { getUserProfile } from '../firebase/services';
import { UserProfile } from '../types';
import { useTheme } from '../context/ThemeContext';

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

export const LiveTracker: React.FC<LiveTrackerProps> = ({ onSessionComplete, onRecordingChange }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [targetDuration, setTargetDuration] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState(1.0);
  const [speedHistory, setSpeedHistory] = useState<SpeedPoint[]>([]);
  
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

    const distance = calculateDistance(speedHistory);
    const calories = calculateCalories(speedHistory);
    const steps = calculateSteps(speedHistory, userProfile);
    const averageSpeed = speedHistory.reduce((sum, point) => sum + point.speed, 0) / speedHistory.length;
    const maxSpeed = Math.max(...speedHistory.map(point => point.speed));

    const sessionData = {
      name: 'Training', // Wird im Summary Modal eingegeben
      duration: duration, // Verwende echte Dauer, nicht gerundet
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

  // Geschwindigkeits-Buttons von 0.5 bis 18 km/h
  const speedButtons = [];
  for (let speed = 0.5; speed <= 18; speed += 0.5) {
    speedButtons.push(speed);
  }

  const currentDistance = calculateDistance(speedHistory);
  const currentCalories = calculateCalories(speedHistory);
  const currentSteps = calculateSteps(speedHistory, userProfile);
  
  const progressPercentage = targetDuration && targetDuration > 0 
    ? Math.min(100, (duration / targetDuration) * 100)
    : 0;

  // Wenn Training läuft - Professionelle Dashboard-Ansicht
  if (isRunning) {
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

        {/* Professionelles Live Dashboard */}
        <div className={`rounded-2xl p-4 sm:p-6 shadow-2xl border-2 transition-all duration-300 ${
          isDark 
            ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700' 
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
        }`}>
          {/* Status Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              {isPaused ? (
                <div className="flex items-center text-yellow-400">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm sm:text-base font-medium">PAUSIERT</span>
                </div>
              ) : (
                <div className="flex items-center text-green-400">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm sm:text-base font-medium">LIVE TRAINING</span>
                </div>
              )}
            </div>
            
            {/* Control Buttons */}
            <div className="flex space-x-2">
              {isPaused ? (
                <button
                  onClick={resumeSession}
                  className="bg-green-600 hover:bg-green-700 px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 text-white font-medium transition-colors text-sm sm:text-base"
                >
                  <Play className="w-4 h-4" />
                  <span className="hidden sm:inline">Fortsetzen</span>
                </button>
              ) : (
                <button
                  onClick={pauseSession}
                  className="bg-yellow-600 hover:bg-yellow-700 px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 text-white font-medium transition-colors text-sm sm:text-base"
                >
                  <Pause className="w-4 h-4" />
                  <span className="hidden sm:inline">Pause</span>
                </button>
              )}
              <button
                onClick={stopSession}
                className="bg-red-600 hover:bg-red-700 px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 text-white font-medium transition-colors text-sm sm:text-base"
              >
                <Square className="w-4 h-4" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            </div>
          </div>

          {/* Hauptzeit-Anzeige */}
          <div className="text-center mb-6">
            <div className="text-4xl sm:text-6xl lg:text-7xl font-mono font-black bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
              {targetDuration && remainingTime !== null 
                ? formatDuration(remainingTime)
                : formatDuration(duration)
              }
            </div>
            
            {/* Progress Bar */}
            {targetDuration && (
              <>
                <div className={`text-xs sm:text-sm mb-2 transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {formatDuration(duration)} / {formatDuration(targetDuration)}
                </div>
                <div className={`w-full max-w-md mx-auto rounded-full h-2 sm:h-3 mb-4 transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out shadow-lg"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </>
            )}
          </div>

          {/* Live Statistiken Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className={`rounded-xl p-3 sm:p-4 text-center transition-all duration-200 hover:scale-105 ${
              isDark 
                ? 'bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-700/50' 
                : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'
            }`}>
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                <span className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${
                  isDark ? 'text-green-300' : 'text-green-700'
                }`}>Distanz</span>
              </div>
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-400 mb-1">{currentDistance.toFixed(2)}</div>
              <div className={`text-xs sm:text-sm transition-colors duration-200 ${
                isDark ? 'text-green-300' : 'text-green-700'
              }`}>km</div>
            </div>
            
            <div className={`rounded-xl p-3 sm:p-4 text-center transition-all duration-200 hover:scale-105 ${
              isDark 
                ? 'bg-gradient-to-br from-orange-900/30 to-orange-800/30 border border-orange-700/50' 
                : 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200'
            }`}>
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                <span className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${
                  isDark ? 'text-orange-300' : 'text-orange-700'
                }`}>Kalorien</span>
              </div>
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-orange-400 mb-1">{currentCalories}</div>
              <div className={`text-xs sm:text-sm transition-colors duration-200 ${
                isDark ? 'text-orange-300' : 'text-orange-700'
              }`}>kcal</div>
            </div>
            
            <div className={`rounded-xl p-3 sm:p-4 text-center transition-all duration-200 hover:scale-105 ${
              isDark 
                ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-700/50' 
                : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'
            }`}>
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <span className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${
                  isDark ? 'text-blue-300' : 'text-blue-700'
                }`}>Speed</span>
              </div>
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-400 mb-1">{currentSpeed.toFixed(1)}</div>
              <div className={`text-xs sm:text-sm transition-colors duration-200 ${
                isDark ? 'text-blue-300' : 'text-blue-700'
              }`}>km/h</div>
            </div>
            
            <div className={`rounded-xl p-3 sm:p-4 text-center transition-all duration-200 hover:scale-105 ${
              isDark 
                ? 'bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-700/50' 
                : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'
            }`}>
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Footprints className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                <span className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${
                  isDark ? 'text-purple-300' : 'text-purple-700'
                }`}>Schritte</span>
              </div>
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-purple-400 mb-1">{currentSteps.toLocaleString()}</div>
              <div className={`text-xs sm:text-sm transition-colors duration-200 ${
                isDark ? 'text-purple-300' : 'text-purple-700'
              }`}>Steps</div>
            </div>
          </div>

          {/* Geschwindigkeits-Kontrolle */}
          <div className="mb-4">
            <div className="text-center mb-4">
              <h3 className={`text-lg sm:text-xl font-bold mb-2 transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Geschwindigkeit wählen</h3>
              <div className={`inline-flex items-center px-4 py-2 rounded-xl border-2 transition-colors duration-200 ${
                isDark 
                  ? 'bg-gray-800 border-gray-600' 
                  : 'bg-white border-gray-300'
              }`}>
                <span className={`text-2xl sm:text-3xl font-bold mr-2 transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{currentSpeed.toFixed(1)}</span>
                <span className={`text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>km/h</span>
              </div>
            </div>

            {/* Geschwindigkeits-Buttons Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-1 sm:gap-2 max-h-32 sm:max-h-40 overflow-y-auto">
              {speedButtons.map((speed) => (
                <button
                  key={speed}
                  onClick={() => setCurrentSpeed(speed)}
                  className={`px-2 py-2 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all hover:scale-105 ${
                    currentSpeed === speed
                      ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-400'
                      : isDark 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900'
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
    </div>
  );
};