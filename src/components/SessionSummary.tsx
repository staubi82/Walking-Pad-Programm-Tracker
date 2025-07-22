import React, { useState } from 'react';
import { Save, X, Clock, MapPin, Flame, TrendingUp, Activity, Edit3, Footprints } from 'lucide-react';
import { formatDuration } from '../utils/calculations';
import { useTheme } from '../context/ThemeContext';

interface SessionSummaryProps {
  sessionData: {
    name: string;
    duration: number;
    distance: number;
    calories: number;
    averageSpeed: number;
    maxSpeed: number;
    speedHistory: Array<{ timestamp: number; speed: number }>;
    steps?: number;
  };
  onSave: (sessionData: {
    name: string;
    duration: number;
    distance: number;
    calories: number;
    averageSpeed: number;
    maxSpeed: number;
    speedHistory: Array<{ timestamp: number; speed: number }>;
    difficulty?: string;
    steps?: number;
  }) => void;
  onCancel: () => void;
}

const difficultyLevels = [
  { id: 'anfaenger', label: 'Anfänger', emoji: '🚶‍♀️', description: 'Gemütliches Tempo' },
  { id: 'leicht', label: 'Leicht', emoji: '🚶‍♂️', description: 'Entspanntes Walking' },
  { id: 'mittel', label: 'Mittel', emoji: '🏃‍♀️', description: 'Moderates Tempo' },
  { id: 'schwer', label: 'Schwer', emoji: '🏃‍♂️', description: 'Anspruchsvolles Training' },
  { id: 'extrem', label: 'Extrem', emoji: '🔥', description: 'Maximale Herausforderung' },
  { id: 'selbstmord', label: 'Profi', emoji: '💀', description: 'Nur für Profis' }
];

// Reusable Card Component
const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
    {children}
  </div>
);

export const SessionSummary: React.FC<SessionSummaryProps> = ({ sessionData, onSave, onCancel }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sessionName, setSessionName] = useState(sessionData.name);
  const [nameError, setNameError] = useState('');
  const { isDark } = useTheme();

  const handleSave = () => {
    if (!sessionName.trim()) {
      setNameError('Bitte Namen eingeben.');
      return;
    }
    onSave({ ...sessionData, name: sessionName, difficulty: selectedDifficulty });
  };

  const performance = (() => {
    if (sessionData.averageSpeed >= 5) return { label: 'Ausgezeichnet', emoji: '🏆' };
    if (sessionData.averageSpeed >= 4) return { label: 'Sehr gut', emoji: '⭐' };
    if (sessionData.averageSpeed >= 3) return { label: 'Gut', emoji: '👍' };
    return { label: 'Solide', emoji: '💪' };
  })();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 p-4 z-50">
      <div className="w-full max-w-md lg:max-w-3xl bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-green-400 to-blue-500 rounded-full">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Training abgeschlossen!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Großartige Leistung 🎉</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-lg font-semibold text-center">Trainingszeit</p>
              <p className="text-2xl font-bold text-blue-600 text-center mt-1">{formatDuration(sessionData.duration)}</p>
            </Card>
            <Card>
              <MapPin className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-lg font-semibold text-center">Distanz (km)</p>
              <p className="text-2xl font-bold text-green-600 text-center mt-1">{sessionData.distance.toFixed(2)}</p>
            </Card>
            <Card>
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-lg font-semibold text-center">Kalorien</p>
              <p className="text-2xl font-bold text-orange-600 text-center mt-1">{sessionData.calories}</p>
            </Card>
            <Card>
              <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-lg font-semibold text-center">Ø Speed (km/h)</p>
              <p className="text-2xl font-bold text-purple-600 text-center mt-1">{sessionData.averageSpeed.toFixed(1)}</p>
            </Card>
          </div>

          {/* Steps (optional) */}
          {sessionData.steps && (
            <Card>
              <Footprints className="w-8 h-8 text-teal-500 mx-auto mb-2" />
              <p className="text-lg font-semibold text-center">Schritte</p>
              <p className="text-3xl font-bold text-teal-600 text-center mt-1">{sessionData.steps.toLocaleString()}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                {Math.round(sessionData.steps / (sessionData.duration / 60))} Schritte/Min
              </p>
            </Card>
          )}

          {/* Performance */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 text-center">
            <div className="text-4xl mb-2">{performance.emoji}</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{performance.label}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sie haben {formatDuration(sessionData.duration)} trainiert und {sessionData.distance.toFixed(2)} km zurückgelegt{sessionData.calories >= 100 ? ` – dabei ${sessionData.calories} Kalorien verbrannt!` : ''}</p>
          </div>

          {/* Name & Difficulty */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Edit3 className="w-4 h-4 inline mr-1" /> Trainingsname
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={e => { setSessionName(e.target.value); nameError && setNameError(''); }}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                placeholder="z.B. Morgendliches Walking"
              />
              {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🎯 Schwierigkeit</p>
              <div className="flex space-x-3 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedDifficulty('')}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg border ${!selectedDifficulty ? 'bg-gray-700 text-white' : 'bg-transparent'} text-sm`}
                >
                  ❓ Kein Level
                </button>
                {difficultyLevels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedDifficulty(level.id)}
                    className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm border-2 ${selectedDifficulty === level.id ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 bg-transparent text-gray-700 dark:text-gray-300'}`}
                    title={level.description}
                  >
                    {level.emoji} {level.label}
                  </button>
                ))}
              </div>
              {selectedDifficulty && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ausgewählt: {difficultyLevels.find(l => l.id === selectedDifficulty)?.emoji} {difficultyLevels.find(l => l.id === selectedDifficulty)?.label}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white font-semibold hover:from-green-600 hover:to-blue-600 transition"
            >
              <Save className="w-5 h-5 inline mr-2" /> Speichern
            </button>
            <button
              onClick={onCancel}
              className="flex-1 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Abbrechen
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
