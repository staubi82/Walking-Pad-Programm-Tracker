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
  { id: 'anfaenger', emoji: '🚶‍♀️', label: 'Anfänger' },
  { id: 'leicht', emoji: '🚶‍♂️', label: 'Leicht' },
  { id: 'mittel', emoji: '🏃‍♀️', label: 'Mittel' },
  { id: 'schwer', emoji: '🏃‍♂️', label: 'Schwer' },
  { id: 'extrem', emoji: '🔥', label: 'Extrem' },
  { id: 'profi', emoji: '💀', label: 'Profi' }
];

export const SessionSummary: React.FC<SessionSummaryProps> = ({ sessionData, onSave, onCancel }) => {
  const { isDark } = useTheme();
  const [name, setName] = useState(sessionData.name);
  const [diff, setDiff] = useState<string>(sessionData['difficulty'] || '');
  const [error, setError] = useState('');

  const performance = (() => {
    if (sessionData.averageSpeed >= 5) return { emoji: '🏆', label: 'Ausgezeichnet' };
    if (sessionData.averageSpeed >= 4) return { emoji: '⭐', label: 'Sehr gut' };
    if (sessionData.averageSpeed >= 3) return { emoji: '👍', label: 'Gut' };
    return { emoji: '💪', label: 'Solide' };
  })();

  const save = () => {
    if (!name.trim()) {
      setError('Bitte Namen eingeben');
      return;
    }
    onSave({ ...sessionData, name, difficulty: diff });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Close */}
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Stats + Performance */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-400 to-blue-500 rounded-full">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Training abgeschlossen!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gut gemacht 🎉</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Clock, label: 'Zeit', value: formatDuration(sessionData.duration) },
              { icon: MapPin, label: 'Distanz', value: `${sessionData.distance.toFixed(2)} km` },
              { icon: Flame, label: 'Kalorien', value: sessionData.calories.toString() },
              { icon: TrendingUp, label: 'Ø Speed', value: `${sessionData.averageSpeed.toFixed(1)} km/h` }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <item.icon className="w-6 h-6 text-blue-500 mb-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white mt-1">{item.value}</span>
              </div>
            ))}
            {sessionData.steps && (
              <div className="col-span-2 flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Footprints className="w-6 h-6 text-teal-500 mb-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Schritte</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white mt-1">{sessionData.steps.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-200 to-orange-200 dark:from-yellow-800 dark:to-orange-800 rounded-lg">
            <div className="text-3xl mb-1">{performance.emoji}</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{performance.label}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{formatDuration(sessionData.duration)} &middot; {sessionData.distance.toFixed(2)} km</p>
          </div>
        </div>

        {/* Right Column: Inputs & Actions */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trainingsname</label>
              <div className="relative">
                <Edit3 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); if (error) setError(''); }}
                  placeholder="z.B. Morgendliches Walking"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
                />
              </div>
              {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Schwierigkeit</label>
              <div className="flex space-x-2">
                {difficultyLevels.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDiff(d.id)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${diff === d.id ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    {d.emoji} {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={save}
              className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg flex items-center justify-center transition"
            >
              <Save className="w-5 h-5 mr-2" /> Speichern
            </button>
            <button
              onClick={onCancel}
              className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
