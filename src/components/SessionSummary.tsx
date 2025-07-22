import React, { useState } from 'react';
import { Save, X, Clock, MapPin, Flame, TrendingUp, Activity, Edit3, Footprints, Target, Zap } from 'lucide-react';
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
    speedHistory: Array<{timestamp: number, speed: number}>;
    steps?: number;
  };
  onSave: (sessionData: {
    name: string;
    duration: number;
    distance: number;
    calories: number;
    averageSpeed: number;
    maxSpeed: number;
    speedHistory: Array<{timestamp: number, speed: number}>;
    difficulty?: string;
    steps?: number;
  }) => void;
  onCancel: () => void;
}

const difficultyLevels = [
  { id: 'anfaenger', label: 'Anfänger', emoji: '🚶‍♀️', color: 'bg-green-600', description: 'Gemütliches Tempo für Einsteiger' },
  { id: 'leicht', label: 'Leicht', emoji: '🚶‍♂️', color: 'bg-blue-600', description: 'Entspanntes Walking' },
  { id: 'mittel', label: 'Mittel', emoji: '🏃‍♀️', color: 'bg-yellow-600', description: 'Moderates Tempo' },
  { id: 'schwer', label: 'Schwer', emoji: '🏃‍♂️', color: 'bg-orange-600', description: 'Anspruchsvolles Training' },
  { id: 'extrem', label: 'Extrem', emoji: '🔥', color: 'bg-red-600', description: 'Maximale Herausforderung' },
  { id: 'selbstmord', label: 'Selbstmord', emoji: '💀', color: 'bg-purple-600', description: 'Nur für Profis!' }
];

export const SessionSummary: React.FC<SessionSummaryProps> = ({ sessionData, onSave, onCancel }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sessionName, setSessionName] = useState(sessionData.name);
  const [nameError, setNameError] = useState('');
  const { isDark } = useTheme();

  const handleSave = () => {
    if (!sessionName.trim()) {
      setNameError('Bitte geben Sie einen Namen für das Training ein.');
      return;
    }

    setNameError('');
    onSave({
      ...sessionData,
      name: sessionName,
      difficulty: selectedDifficulty
    });
  };

  const handleNameChange = (name: string) => {
    setSessionName(name);
    if (nameError) setNameError('');
  };

  // Berechne Performance-Bewertung
  const getPerformanceRating = () => {
    if (sessionData.averageSpeed >= 5.0) return { rating: 'Ausgezeichnet', color: 'text-green-400', emoji: '🏆' };
    if (sessionData.averageSpeed >= 4.0) return { rating: 'Sehr gut', color: 'text-blue-400', emoji: '⭐' };
    if (sessionData.averageSpeed >= 3.0) return { rating: 'Gut', color: 'text-yellow-400', emoji: '👍' };
    return { rating: 'Solide', color: 'text-orange-400', emoji: '💪' };
  };

  const performance = getPerformanceRating();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl transition-colors duration-200 ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b transition-colors duration-200 ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className={`text-3xl font-bold transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Training abgeschlossen!</h2>
                <p className={`text-lg transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Großartige Leistung! 🎉</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className={`p-3 rounded-full transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Hauptstatistiken - Symmetrisches 2x2 Grid */}
          <div>
            <h3 className={`text-2xl font-bold mb-6 text-center transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>📊 Ihre Trainings-Ergebnisse</h3>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Zeit */}
              <div className={`rounded-2xl p-6 text-center transition-all duration-200 hover:scale-105 ${
                isDark 
                  ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50 border border-blue-700' 
                  : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'
              }`}>
                <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-blue-400 mb-2">{formatDuration(sessionData.duration)}</div>
                <div className={`text-lg font-medium transition-colors duration-200 ${
                  isDark ? 'text-blue-300' : 'text-blue-700'
                }`}>Trainingszeit</div>
              </div>
              
              {/* Distanz */}
              <div className={`rounded-2xl p-6 text-center transition-all duration-200 hover:scale-105 ${
                isDark 
                  ? 'bg-gradient-to-br from-green-900/50 to-green-800/50 border border-green-700' 
                  : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'
              }`}>
                <MapPin className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-green-400 mb-2">{sessionData.distance.toFixed(2)}</div>
                <div className={`text-lg font-medium transition-colors duration-200 ${
                  isDark ? 'text-green-300' : 'text-green-700'
                }`}>Kilometer</div>
              </div>
              
              {/* Kalorien */}
              <div className={`rounded-2xl p-6 text-center transition-all duration-200 hover:scale-105 ${
                isDark 
                  ? 'bg-gradient-to-br from-orange-900/50 to-orange-800/50 border border-orange-700' 
                  : 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200'
              }`}>
                <Flame className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-orange-400 mb-2">{sessionData.calories}</div>
                <div className={`text-lg font-medium transition-colors duration-200 ${
                  isDark ? 'text-orange-300' : 'text-orange-700'
                }`}>Kalorien</div>
              </div>
              
              {/* Geschwindigkeit */}
              <div className={`rounded-2xl p-6 text-center transition-all duration-200 hover:scale-105 ${
                isDark 
                  ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/50 border border-purple-700' 
                  : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'
              }`}>
                <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-purple-400 mb-2">{sessionData.averageSpeed.toFixed(1)}</div>
                <div className={`text-lg font-medium transition-colors duration-200 ${
                  isDark ? 'text-purple-300' : 'text-purple-700'
                }`}>km/h Ø Speed</div>
              </div>
            </div>

            {/* Schritte - Falls verfügbar, als breite Karte */}
            {sessionData.steps && (
              <div className={`rounded-2xl p-6 text-center mb-8 transition-all duration-200 hover:scale-105 ${
                isDark 
                  ? 'bg-gradient-to-br from-cyan-900/50 to-cyan-800/50 border border-cyan-700' 
                  : 'bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200'
              }`}>
                <Footprints className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <div className="text-5xl font-bold text-cyan-400 mb-2">{sessionData.steps.toLocaleString()}</div>
                <div className={`text-xl font-medium mb-2 transition-colors duration-200 ${
                  isDark ? 'text-cyan-300' : 'text-cyan-700'
                }`}>Schritte</div>
                <div className={`text-sm transition-colors duration-200 ${
                  isDark ? 'text-cyan-400' : 'text-cyan-600'
                }`}>
                  {Math.round(sessionData.steps / (sessionData.duration / 60))} Schritte/Min
                </div>
              </div>
            )}
          </div>

          {/* Performance-Bewertung */}
          <div className={`rounded-2xl p-6 text-center transition-colors duration-200 ${
            isDark 
              ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-700' 
              : 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300'
          }`}>
            <div className="text-6xl mb-4">{performance.emoji}</div>
            <h4 className={`text-2xl font-bold mb-2 ${performance.color}`}>
              {performance.rating}
            </h4>
            <p className={`text-lg transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Sie haben {formatDuration(sessionData.duration)} trainiert und {sessionData.distance.toFixed(2)} km zurückgelegt!
              {sessionData.calories >= 100 && ` Dabei haben Sie ${sessionData.calories} Kalorien verbrannt! 🔥`}
            </p>
          </div>

          {/* Trainingsname bearbeiten */}
          <div>
            <label className={`block text-lg font-semibold mb-4 transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <Edit3 className="w-5 h-5 inline mr-2" />
              Trainingsname
            </label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg transition-colors duration-200 ${
                isDark 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="z.B. Morgendliches Walking"
            />
            {nameError && (
              <p className="mt-2 text-sm text-red-400">{nameError}</p>
            )}
          </div>

          {/* Schwierigkeitslevel */}
          <div>
            <label className={`block text-lg font-semibold mb-4 transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              🎯 Wie schwer war das Training für Sie?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button
                onClick={() => setSelectedDifficulty('')}
                className={`p-4 rounded-xl text-white font-medium transition-all border-2 ${
                  !selectedDifficulty 
                    ? 'bg-gray-500 border-white shadow-lg transform scale-105' 
                    : 'bg-gray-600 border-gray-500 hover:bg-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">❓</div>
                  <div className="text-sm">Kein Level</div>
                </div>
              </button>
              
              {difficultyLevels.map(level => (
                <button
                  key={level.id}
                  onClick={() => setSelectedDifficulty(level.id)}
                  className={`${level.color} p-4 rounded-xl text-white font-medium transition-all border-2 ${
                    selectedDifficulty === level.id 
                      ? 'border-white shadow-lg transform scale-105' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  title={level.description}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{level.emoji}</div>
                    <div className="text-sm">{level.label}</div>
                  </div>
                </button>
              ))}
            </div>
            
            {selectedDifficulty && (
              <div className={`mt-4 p-4 rounded-xl border transition-colors duration-200 ${
                isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-300'
              }`}>
                <p className={`transition-colors duration-200 ${
                  isDark ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  ✨ <strong>Gewähltes Level:</strong> {difficultyLevels.find(l => l.id === selectedDifficulty)?.emoji} {difficultyLevels.find(l => l.id === selectedDifficulty)?.label}
                  <br />📝 <strong>Beschreibung:</strong> {difficultyLevels.find(l => l.id === selectedDifficulty)?.description}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8 py-4 rounded-xl flex items-center justify-center space-x-3 text-white font-semibold transition-all text-lg shadow-lg transform hover:scale-105"
            >
              <Save className="w-6 h-6" />
              <span>Training speichern</span>
            </button>
            
            <button
              onClick={onCancel}
              className="px-8 py-4 bg-gray-600 hover:bg-gray-500 rounded-xl text-white font-semibold transition-colors text-lg"
            >
              Abbrechen
            </button>
          </div>
          
          <div className="text-center pt-4">
            <p className={`text-sm transition-colors duration-200 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              💡 Das Schwierigkeitslevel hilft Ihnen dabei, Ihre Trainings zu kategorisieren und Fortschritte zu verfolgen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};