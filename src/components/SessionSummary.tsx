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

const tabs = [
  { id: 'overview', label: 'Übersicht' },
  { id: 'details', label: 'Details' }
];

const difficultyLevels = [
  { id: 'anfaenger', emoji: '🚶‍♀️', label: 'Anfänger' },
  { id: 'leicht', emoji: '🚶‍♂️', label: 'Leicht' },
  { id: 'mittel', emoji: '🏃‍♀️', label: 'Mittel' },
  { id: 'schwer', emoji: '🏃‍♂️', label: 'Schwer' },
  { id: 'extrem', emoji: '🔥', label: 'Extrem' },
  { id: 'profi', emoji: '💀', label: 'Profi' }
];

export const SessionSummary: React.FC<SessionSummaryProps> = ({ sessionData, onSave, onCancel }) => {
  const { isDark } = useTheme();
  const [tab, setTab] = useState<'overview' | 'details'>('overview');
  const [name, setName] = useState(sessionData.name);
  const [diff, setDiff] = useState<string>(sessionData['difficulty'] || '');
  const [error, setError] = useState('');

  const save = () => {
    if (!name.trim()) return setError('Name fehlt');
    onSave({ ...sessionData, name, difficulty: diff });
  };

  const performance = (() => {
    if (sessionData.averageSpeed >= 5) return { emoji: '🏆', label: 'Ausgezeichnet' };
    if (sessionData.averageSpeed >= 4) return { emoji: '⭐', label: 'Sehr gut' };
    if (sessionData.averageSpeed >= 3) return { emoji: '👍', label: 'Gut' };
    return { emoji: '💪', label: 'Solide' };
  })();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 py-6 z-50">
      <div className={`w-full max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 sm:p-6 relative`}>
        <button onClick={onCancel} className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <X className="w-5 h-5" />
        </button>
        <div className="flex space-x-4 mb-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex-1 py-2 text-center rounded-lg ${tab === t.id ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <Clock className="w-6 h-6 text-blue-500 mb-1" />
              <span className="text-sm">Zeit</span>
              <span className="text-lg font-bold">{formatDuration(sessionData.duration)}</span>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-6 h-6 text-green-500 mb-1" />
              <span className="text-sm">Distanz</span>
              <span className="text-lg font-bold">{sessionData.distance.toFixed(2)} km</span>
            </div>
            <div className="flex flex-col items-center">
              <Flame className="w-6 h-6 text-orange-500 mb-1" />
              <span className="text-sm">Kalorien</span>
              <span className="text-lg font-bold">{sessionData.calories}</span>
            </div>
            <div className="flex flex-col items-center">
              <TrendingUp className="w-6 h-6 text-purple-500 mb-1" />
              <span className="text-sm">Ø Speed</span>
              <span className="text-lg font-bold">{sessionData.averageSpeed.toFixed(1)} km/h</span>
            </div>
            {sessionData.steps && (
              <div className="col-span-2 flex flex-col items-center">
                <Footprints className="w-6 h-6 text-teal-500 mb-1" />
                <span className="text-sm">Schritte</span>
                <span className="text-lg font-bold">{sessionData.steps.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {tab === 'details' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-1">{performance.emoji}</div>
              <div className="text-lg font-semibold">{performance.label}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                value={name}
                onChange={e => { setName(e.target.value); if (error) setError(''); }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                placeholder="Trainingsname"
              />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
            <div>
              <span className="block text-sm font-medium mb-1">Schwierigkeit</span>
              <div className="flex space-x-2">
                {difficultyLevels.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDiff(d.id)}
                    className={`flex-1 py-2 rounded-lg text-sm ${diff === d.id ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    {d.emoji} {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex space-x-3">
          <button onClick={save} className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg flex items-center justify-center">
            <Save className="w-5 h-5 mr-2" /> Speichern
          </button>
          <button onClick={onCancel} className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};
