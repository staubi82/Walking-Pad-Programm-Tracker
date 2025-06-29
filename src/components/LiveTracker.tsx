import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Plus, Minus, Clock, Edit3, Trash2, CheckCircle } from 'lucide-react';
import { calculateDistance, calculateCalories, formatDuration, roundToNearestHalfMinute } from '../utils/calculations';
import { SpeedPoint } from '../types';
import { SessionSummary } from './SessionSummary';

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
  onRecordingChange: (recording: boolean) => void;
}

const difficultyLevels = [
  { id: 'anfaenger', label: 'Anfänger 🚶‍♀️', color: 'bg-green-600', description: 'Gemütliches Tempo für Einsteiger' },
  { id: 'leicht', label: 'Leicht 🚶‍♂️', color: 'bg-blue-600', description: 'Entspanntes Walking' },
  { id: 'mittel', label: 'Mittel 🏃‍♀️', color: 'bg-yellow-600', description: 'Moderates Tempo' },
  { id: 'schwer', label: 'Schwer 🏃‍♂️', color: 'bg-orange-600', description: 'Anspruchsvolles Training' },
  { id: 'extrem', label: 'Extrem 🔥', color: 'bg-red-600', description: 'Maximale Herausforderung' },
  { id: 'selbstmord', label: 'Selbstmord 💀', color: 'bg-purple-600', description: 'Nur für Profis!' }
];

export const LiveTracker: React.FC<LiveTrackerProps> = ({ onSessionComplete, isRecording, onRecordingChange }) => {
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [speedHistory, setSpeedHistory] = useState<SpeedPoint[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editSpeed, setEditSpeed] = useState('');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      startTimeRef.current = Date.now() - elapsedTime * 1000;
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const now = Date.now();
          const elapsed = Math.floor((now - startTimeRef.current) / 1000);
          setElapsedTime(elapsed);
          
          // Add speed point every second
          setSpeedHistory(prev => [...prev, { time: elapsed, speed: currentSpeed }]);
        }
      }, 1000);
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
  }, [isRecording, currentSpeed, elapsedTime]);

  const handleStart = () => {
    if (!sessionName.trim()) {
      alert('Bitte geben Sie einen Session-Namen ein!');
      return;
    }
    onRecordingChange(true);
  };

  const handlePause = () => {
    onRecordingChange(false);
  };

  const handleStop = () => {
    onRecordingChange(false);
    
    if (speedHistory.length === 0) {
      alert('Keine Daten zum Speichern vorhanden!');
      return;
    }

    const distance = calculateDistance(speedHistory);
    const calories = calculateCalories(speedHistory, 70); // 70kg default weight
    const averageSpeed = speedHistory.reduce((sum, point) => sum + point.speed, 0) / speedHistory.length;
    const maxSpeed = Math.max(...speedHistory.map(point => point.speed));

    const finalSessionData = {
      name: sessionName,
      duration: elapsedTime,
      distance,
      calories,
      averageSpeed,
      maxSpeed,
      speedHistory,
      difficulty: selectedDifficulty
    };

    setSessionData(finalSessionData);
    setShowSummary(true);
  };

  const handleReset = () => {
    onRecordingChange(false);
    setElapsedTime(0);
    setCurrentSpeed(0);
    setSpeedHistory([]);
    setTimeline([]);
    setSessionName('');
    setSelectedDifficulty('');
    setShowSummary(false);
    setSessionData(null);
    startTimeRef.current = null;
  };

  const addTimelineEntry = () => {
    const minute = roundToNearestHalfMinute(elapsedTime / 60);
    const newEntry: TimelineEntry = {
      id: Date.now().toString(),
      minute,
      speed: currentSpeed
    };
    setTimeline(prev => [...prev, newEntry]);
  };

  const removeTimelineEntry = (id: string) => {
    setTimeline(prev => prev.filter(entry => entry.id !== id));
  };

  const startEditEntry = (entry: TimelineEntry) => {
    setEditingEntry(entry.id);
    setEditSpeed(entry.speed.toString());
  };

  const saveEditEntry = (id: string) => {
    const newSpeed = parseFloat(editSpeed);
    if (!isNaN(newSpeed) && newSpeed >= 0) {
      setTimeline(prev => prev.map(entry => 
        entry.id === id ? { ...entry, speed: newSpeed } : entry
      ));
    }
    setEditingEntry(null);
    setEditSpeed('');
  };

  const cancelEdit = () => {
    setEditingEntry(null);
    setEditSpeed('');
  };

  const handleSummaryClose = (save: boolean) => {
    if (save && sessionData) {
      onSessionComplete(sessionData);
    }
    setShowSummary(false);
    handleReset();
  };

  const distance = calculateDistance(speedHistory);
  const calories = calculateCalories(speedHistory, 70);
  const averageSpeed = speedHistory.length > 0 
    ? speedHistory.reduce((sum, point) => sum + point.speed, 0) / speedHistory.length 
    : 0;

  if (showSummary && sessionData) {
    return (
      <SessionSummary
        sessionData={sessionData}
        onClose={handleSummaryClose}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Live Training Tracker</h2>
        <p className="text-gray-600">Verfolgen Sie Ihr Training in Echtzeit</p>
      </div>

      {/* Session Name Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Session Name
        </label>
        <input
          type="text"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          placeholder="z.B. Morgen-Lauf im Park"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isRecording}
        />
      </div>

      {/* Difficulty Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Schwierigkeitsgrad
        </label>
        <div className="grid grid-cols-2 gap-2">
          {difficultyLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => setSelectedDifficulty(level.id)}
              disabled={isRecording}
              className={`p-3 rounded-lg text-white text-sm font-medium transition-all duration-200 ${
                selectedDifficulty === level.id 
                  ? `${level.color} ring-2 ring-offset-2 ring-blue-500` 
                  : `${level.color} opacity-70 hover:opacity-100`
              } ${isRecording ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <div className="font-semibold">{level.label}</div>
              <div className="text-xs opacity-90">{level.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{formatDuration(elapsedTime)}</div>
          <div className="text-sm text-blue-500">Zeit</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{currentSpeed.toFixed(1)}</div>
          <div className="text-sm text-green-500">km/h</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{distance.toFixed(2)}</div>
          <div className="text-sm text-purple-500">km</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{Math.round(calories)}</div>
          <div className="text-sm text-orange-500">kcal</div>
        </div>
      </div>

      {/* Speed Control */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Aktuelle Geschwindigkeit: {currentSpeed.toFixed(1)} km/h
        </label>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentSpeed(Math.max(0, currentSpeed - 0.5))}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            disabled={!isRecording}
          >
            <Minus className="w-5 h-5" />
          </button>
          <input
            type="range"
            min="0"
            max="25"
            step="0.1"
            value={currentSpeed}
            onChange={(e) => setCurrentSpeed(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            disabled={!isRecording}
          />
          <button
            onClick={() => setCurrentSpeed(Math.min(25, currentSpeed + 0.5))}
            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
            disabled={!isRecording}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center">
          <input
            type="number"
            value={currentSpeed}
            onChange={(e) => setCurrentSpeed(Math.max(0, Math.min(25, parseFloat(e.target.value) || 0)))}
            className="w-24 px-3 py-1 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={!isRecording}
            step="0.1"
            min="0"
            max="25"
          />
        </div>
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Timeline</h3>
            <button
              onClick={addTimelineEntry}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              disabled={!isRecording}
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Punkt hinzufügen
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {timeline.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Min {entry.minute}</span>
                  {editingEntry === entry.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={editSpeed}
                        onChange={(e) => setEditSpeed(e.target.value)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                        step="0.1"
                        min="0"
                        max="25"
                      />
                      <button
                        onClick={() => saveEditEntry(entry.id)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-600">{entry.speed.toFixed(1)} km/h</span>
                  )}
                </div>
                {editingEntry !== entry.id && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => startEditEntry(entry)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeTimelineEntry(entry.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4">
        {!isRecording ? (
          <button
            onClick={handleStart}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Play className="w-5 h-5" />
            <span>Start</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
          >
            <Pause className="w-5 h-5" />
            <span>Pause</span>
          </button>
        )}
        
        <button
          onClick={handleStop}
          className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          disabled={speedHistory.length === 0}
        >
          <Square className="w-5 h-5" />
          <span>Stop</span>
        </button>
        
        <button
          onClick={handleReset}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          <span>Reset</span>
        </button>
      </div>

      {/* Add Timeline Entry Button */}
      {isRecording && (
        <div className="text-center">
          <button
            onClick={addTimelineEntry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Timeline-Punkt hinzufügen
          </button>
        </div>
      )}

      {/* Average Speed Display */}
      {speedHistory.length > 0 && (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-800">
            Durchschnittsgeschwindigkeit: {averageSpeed.toFixed(1)} km/h
          </div>
        </div>
      )}
    </div>
  );
};