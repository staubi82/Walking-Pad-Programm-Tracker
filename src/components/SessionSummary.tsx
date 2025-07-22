import React, { useState } from 'react';
import { Save, X, Clock, MapPin, Flame, TrendingUp, Activity, Edit3, Footprints, Target, Zap, Award } from 'lucide-react';
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
  { id: 'anfaenger', label: 'Anfänger', emoji: '🟢', color: 'from-emerald-500 to-green-600', description: 'Gemütliches Tempo für Einsteiger' },
  { id: 'leicht', label: 'Leicht', emoji: '🔵', color: 'from-blue-500 to-blue-600', description: 'Entspanntes Walking' },
  { id: 'mittel', label: 'Mittel', emoji: '🟡', color: 'from-amber-500 to-yellow-600', description: 'Moderates Tempo' },
  { id: 'schwer', label: 'Schwer', emoji: '🟠', color: 'from-orange-500 to-red-500', description: 'Anspruchsvolles Training' },
  { id: 'extrem', label: 'Extrem', emoji: '🔴', color: 'from-red-500 to-red-700', description: 'Maximale Herausforderung' },
  { id: 'selbstmord', label: 'Selbstmord', emoji: '⚫', color: 'from-purple-600 to-indigo-700', description: 'Nur für Profis!' }
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
    if (sessionData.averageSpeed >= 5.0) return { rating: 'Ausgezeichnet', color: 'text-emerald-500', bgColor: isDark ? 'from-emerald-900/30 to-green-900/30 border-emerald-700' : 'from-emerald-50 to-green-50 border-emerald-200', emoji: '🏆' };
    if (sessionData.averageSpeed >= 4.0) return { rating: 'Sehr gut', color: 'text-blue-500', bgColor: isDark ? 'from-blue-900/30 to-blue-800/30 border-blue-700' : 'from-blue-50 to-blue-100 border-blue-200', emoji: '⭐' };
    if (sessionData.averageSpeed >= 3.0) return { rating: 'Gut', color: 'text-amber-500', bgColor: isDark ? 'from-amber-900/30 to-yellow-900/30 border-amber-700' : 'from-amber-50 to-yellow-50 border-amber-200', emoji: '👍' };
    return { rating: 'Solide', color: 'text-orange-500', bgColor: isDark ? 'from-orange-900/30 to-red-900/30 border-orange-700' : 'from-orange-50 to-red-50 border-orange-200', emoji: '💪' };
  };

  const performance = getPerformanceRating();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-3xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl transition-colors duration-200 ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Professional Header */}
        <div className={`relative p-8 ${isDark ? 'bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600'}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="relative flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border border-white/20">
                  <Activity className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">Training abgeschlossen!</h2>
                <p className="text-white/80 text-lg font-medium">Großartige Leistung! 🎉</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-200 border border-white/20"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-180px)]">
          <div className="p-8 space-y-10">
            {/* Performance Badge */}
            <div className={`relative bg-gradient-to-r ${performance.bgColor} rounded-2xl p-6 border-2 transition-colors duration-200`}>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-5xl">{performance.emoji}</div>
                <div className="text-center">
                  <h4 className={`text-2xl font-bold ${performance.color} mb-1`}>
                    {performance.rating}
                  </h4>
                  <p className={`text-lg transition-colors duration-200 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Sie haben {formatDuration(sessionData.duration)} trainiert und {sessionData.distance.toFixed(2)} km zurückgelegt!
                    {sessionData.calories >= 100 && ` Dabei haben Sie ${sessionData.calories} Kalorien verbrannt! 🔥`}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Statistics */}
            <div>
              <h3 className={`text-2xl font-bold mb-8 text-center flex items-center justify-center space-x-3 transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                <Target className="w-7 h-7 text-indigo-600" />
                <span>📊 Ihre Trainings-Ergebnisse</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {/* Zeit */}
                <div className={`group relative rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                    : 'bg-white border-gray-100'
                }`}>
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className={`text-3xl font-bold mb-2 transition-colors duration-200 ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>{formatDuration(sessionData.duration)}</div>
                    <div className={`font-medium transition-colors duration-200 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Trainingszeit</div>
                    <div className="mt-3 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  </div>
                </div>
                
                {/* Distanz */}
                <div className={`group relative rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                    : 'bg-white border-gray-100'
                }`}>
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className={`text-3xl font-bold mb-2 transition-colors duration-200 ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>{sessionData.distance.toFixed(2)} <span className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>km</span></div>
                    <div className={`font-medium transition-colors duration-200 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Kilometer</div>
                    <div className="mt-3 h-1 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"></div>
                  </div>
                </div>
                
                {/* Kalorien */}
                <div className={`group relative rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                    : 'bg-white border-gray-100'
                }`}>
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <Flame className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className={`text-3xl font-bold mb-2 transition-colors duration-200 ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>{sessionData.calories} <span className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>kcal</span></div>
                    <div className={`font-medium transition-colors duration-200 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Kalorien</div>
                    <div className="mt-3 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                  </div>
                </div>
                
                {/* Geschwindigkeit */}
                <div className={`group relative rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                    : 'bg-white border-gray-100'
                }`}>
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className={`text-3xl font-bold mb-2 transition-colors duration-200 ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>{sessionData.averageSpeed.toFixed(1)} <span className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>km/h</span></div>
                    <div className={`font-medium transition-colors duration-200 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>km/h Ø Speed</div>
                    <div className="mt-3 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Schritte - Falls verfügbar */}
              {sessionData.steps && (
                <div className={`rounded-2xl p-8 shadow-lg border mb-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-100'
                }`}>
                  <div className="flex items-center justify-center space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Footprints className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <div className={`text-4xl font-bold mb-2 transition-colors duration-200 ${
                        isDark ? 'text-white' : 'text-gray-800'
                      }`}>{sessionData.steps.toLocaleString()}</div>
                      <div className={`font-medium text-lg transition-colors duration-200 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>Schritte</div>
                      <div className={`text-sm mt-1 transition-colors duration-200 ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {Math.round(sessionData.steps / (sessionData.duration / 60))} Schritte/Min
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Trainingsname bearbeiten */}
            <div className={`rounded-2xl p-6 transition-colors duration-200 ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <label className={`block text-lg font-semibold mb-4 flex items-center space-x-2 transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <span>Trainingsname</span>
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full px-6 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 text-lg transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-indigo-500'
                }`}
                placeholder="z.B. Morgendliches Walking"
              />
              {nameError && (
                <p className="mt-3 text-sm text-red-400 flex items-center space-x-2">
                  <span>⚠️</span>
                  <span>{nameError}</span>
                </p>
              )}
            </div>

            {/* Schwierigkeitslevel */}
            <div className={`rounded-2xl p-6 transition-colors duration-200 ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <label className={`block text-lg font-semibold mb-6 flex items-center space-x-2 transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                <Zap className="w-5 h-5 text-indigo-600" />
                <span>🎯 Wie schwer war das Training für Sie?</span>
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setSelectedDifficulty('')}
                  className={`p-4 rounded-xl font-medium transition-all duration-200 border-2 ${
                    !selectedDifficulty 
                      ? `bg-gradient-to-r from-gray-500 to-gray-600 ${isDark ? 'border-indigo-400' : 'border-indigo-500'} text-white shadow-lg transform scale-105` 
                      : `${isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'} hover:shadow-md`
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">❓</div>
                    <div className="text-sm font-semibold">Kein Level</div>
                  </div>
                </button>
                
                {difficultyLevels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedDifficulty(level.id)}
                    className={`p-4 rounded-xl font-medium transition-all duration-200 border-2 ${
                      selectedDifficulty === level.id 
                        ? `bg-gradient-to-r ${level.color} border-white text-white shadow-lg transform scale-105` 
                        : `${isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'} hover:shadow-md`
                    }`}
                    title={level.description}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{level.emoji}</div>
                      <div className="text-sm font-semibold">{level.label}</div>
                    </div>
                  </button>
                ))}
              </div>
              
              {selectedDifficulty && (
                <div className={`mt-6 p-4 rounded-xl border-l-4 border-indigo-500 transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-white'
                }`}>
                  <p className={`transition-colors duration-200 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <span className="font-semibold text-indigo-600">✨ Gewähltes Level:</span> {difficultyLevels.find(l => l.id === selectedDifficulty)?.emoji} {difficultyLevels.find(l => l.id === selectedDifficulty)?.label}
                    <br />
                    <span className="font-semibold text-indigo-600 mt-2 inline-block">📝 Beschreibung:</span> {difficultyLevels.find(l => l.id === selectedDifficulty)?.description}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-8 py-4 rounded-xl flex items-center justify-center space-x-3 text-white font-semibold transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Save className="w-6 h-6" />
                <span>Training speichern</span>
              </button>
              
              <button
                onClick={onCancel}
                className="px-8 py-4 bg-gray-600 hover:bg-gray-500 rounded-xl text-white font-semibold transition-all duration-200 text-lg shadow-md hover:shadow-lg"
              >
                Abbrechen
              </button>
            </div>
            
            <div className="text-center pt-4 pb-2">
              <p className={`text-sm transition-colors duration-200 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                💡 Das Schwierigkeitslevel hilft Ihnen dabei, Ihre Trainings zu kategorisieren und Fortschritte zu verfolgen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};