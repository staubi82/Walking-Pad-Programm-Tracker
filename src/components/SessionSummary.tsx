import React, { useState } from 'react';
import { Save, X, Clock, MapPin, Flame, TrendingUp, Activity, Edit3, Footprints, Target, Zap, Award, Smile, ThumbsUp, Skull } from 'lucide-react';
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
  { id: 'anfaenger', label: 'Anfänger', icon: 'Smile', color: 'from-green-500 to-green-600', description: 'Gemütliches Tempo für Einsteiger' },
  { id: 'leicht', label: 'Leicht', icon: 'ThumbsUp', color: 'from-blue-500 to-blue-600', description: 'Entspanntes Walking' },
  { id: 'mittel', label: 'Mittel', icon: 'Zap', color: 'from-amber-500 to-amber-600', description: 'Moderates Tempo' },
  { id: 'schwer', label: 'Schwer', icon: 'Flame', color: 'from-orange-500 to-orange-600', description: 'Anspruchsvolles Training' },
  { id: 'extrem', label: 'Extrem', icon: 'TrendingUp', color: 'from-red-500 to-red-600', description: 'Maximale Herausforderung' },
  { id: 'selbstmord', label: 'Selbstmord', icon: 'Skull', color: 'from-gray-600 to-gray-700', description: 'Nur für Profis!' }
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
    if (sessionData.averageSpeed >= 5.0) return { 
      rating: 'Ausgezeichnet', 
      color: 'text-green-600', 
      bgColor: isDark ? 'bg-green-950/50 border-green-800' : 'bg-green-50 border-green-200',
      icon: '✓'
    };
    if (sessionData.averageSpeed >= 4.0) return { 
      rating: 'Sehr gut', 
      color: 'text-blue-600', 
      bgColor: isDark ? 'bg-blue-950/50 border-blue-800' : 'bg-blue-50 border-blue-200',
      icon: '✓'
    };
    if (sessionData.averageSpeed >= 3.0) return { 
      rating: 'Gut', 
      color: 'text-amber-600', 
      bgColor: isDark ? 'bg-amber-950/50 border-amber-800' : 'bg-amber-50 border-amber-200',
      icon: '✓'
    };
    return { 
      rating: 'Solide', 
      color: 'text-orange-600', 
      bgColor: isDark ? 'bg-orange-950/50 border-orange-800' : 'bg-orange-50 border-orange-200',
      icon: '✓'
    };
  };

  const performance = getPerformanceRating();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-xl transition-colors duration-200 ${
        isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-100'
      }`}>
        {/* Clean Header */}
        <div className={`relative p-6 border-b transition-colors duration-200 ${
          isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
              }`}>
                <Activity className={`w-7 h-7 transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <h2 className={`text-2xl font-semibold transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Training abgeschlossen
                </h2>
                <p className={`transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Ihre Trainingsstatistiken
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDark 
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="p-6 space-y-8">
            {/* Performance Badge */}
            <div className={`rounded-xl p-6 border transition-colors duration-200 ${performance.bgColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${performance.color} ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    {performance.icon}
                  </div>
                  <div>
                    <h4 className={`text-lg font-semibold ${performance.color}`}>
                      {performance.rating}
                    </h4>
                    <p className={`text-sm transition-colors duration-200 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {formatDuration(sessionData.duration)} • {sessionData.distance.toFixed(2)} km • {sessionData.calories} kcal
                    </p>
                  </div>
                </div>
                <Award className={`w-6 h-6 ${performance.color}`} />
              </div>
            </div>

            {/* Main Statistics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Zeit */}
              <div className={`rounded-xl p-4 border transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                  : 'bg-white border-gray-200 hover:shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <Clock className={`w-5 h-5 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <div className={`text-2xl font-semibold mb-1 transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatDuration(sessionData.duration)}
                </div>
                <div className={`text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Trainingszeit
                </div>
              </div>
              
              {/* Distanz */}
              <div className={`rounded-xl p-4 border transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                  : 'bg-white border-gray-200 hover:shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <MapPin className={`w-5 h-5 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <div className={`text-2xl font-semibold mb-1 transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {sessionData.distance.toFixed(2)}
                  <span className={`text-base ml-1 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>km</span>
                </div>
                <div className={`text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Distanz
                </div>
              </div>
              
              {/* Kalorien */}
              <div className={`rounded-xl p-4 border transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                  : 'bg-white border-gray-200 hover:shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <Flame className={`w-5 h-5 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <div className={`text-2xl font-semibold mb-1 transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {sessionData.calories}
                  <span className={`text-base ml-1 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>kcal</span>
                </div>
                <div className={`text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Kalorien
                </div>
              </div>
              
              {/* Geschwindigkeit */}
              <div className={`rounded-xl p-4 border transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                  : 'bg-white border-gray-200 hover:shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className={`w-5 h-5 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <div className={`text-2xl font-semibold mb-1 transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {sessionData.averageSpeed.toFixed(1)}
                  <span className={`text-base ml-1 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>km/h</span>
                </div>
                <div className={`text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Ø Geschwindigkeit
                </div>
              </div>
            </div>

            {/* Schritte - Falls verfügbar */}
            {sessionData.steps && (
              <div className={`rounded-xl p-4 border transition-colors duration-200 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <Footprints className={`w-5 h-5 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <div className="flex-1">
                    <div className={`text-lg font-semibold transition-colors duration-200 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {sessionData.steps.toLocaleString()} Schritte
                    </div>
                    <div className={`text-sm transition-colors duration-200 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {Math.round(sessionData.steps / (sessionData.duration / 60))} Schritte/Min
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trainingsname bearbeiten */}
            <div className="space-y-4">
              <label className={`block text-sm font-medium flex items-center space-x-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Edit3 className="w-4 h-4" />
                <span>Trainingsname</span>
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="z.B. Morgendliches Walking"
              />
              {nameError && (
                <p className="text-sm text-red-500 flex items-center space-x-2">
                  <span>⚠</span>
                  <span>{nameError}</span>
                </p>
              )}
            </div>

            {/* Schwierigkeitslevel */}
            <div className="space-y-4">
              <label className={`block text-sm font-medium flex items-center space-x-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Target className="w-4 h-4" />
                <span>Schwierigkeitslevel (optional)</span>
              </label>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                <button
                  onClick={() => setSelectedDifficulty('')}
                  className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                    !selectedDifficulty 
                      ? `${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-900 border-gray-900 text-white'}` 
                      : `${isDark ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`
                  }`}
                >
                  <div className="text-center">
                    <div className={`mb-1 text-lg ${!selectedDifficulty ? 'text-white' : 'text-gray-400'}`}>–</div>
                    <div>Kein Level</div>
                  </div>
                </button>
                
                {difficultyLevels.map(level => {
                  const IconComponent = level.icon === 'Smile' ? Smile : 
                                      level.icon === 'ThumbsUp' ? ThumbsUp : 
                                      level.icon === 'Zap' ? Zap : 
                                      level.icon === 'Flame' ? Flame : 
                                      level.icon === 'TrendingUp' ? TrendingUp : 
                                      Skull;
                  
                  return (
                    <button
                      key={level.id}
                      onClick={() => setSelectedDifficulty(level.id)}
                      className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                        selectedDifficulty === level.id 
                          ? `bg-gradient-to-r ${level.color} border-transparent text-white` 
                          : `${isDark ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`
                      }`}
                      title={level.description}
                    >
                      <div className="text-center">
                        <div className="mb-1 flex justify-center">
                          <IconComponent className={`w-4 h-4 ${selectedDifficulty === level.id ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <div className="leading-tight">{level.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {selectedDifficulty && (
                <div className={`mt-3 p-3 rounded-lg border-l-4 border-blue-500 transition-colors duration-200 ${
                  isDark ? 'bg-gray-800' : 'bg-blue-50'
                }`}>
                  <p className={`text-xs transition-colors duration-200 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <span className="font-medium">Level:</span> {difficultyLevels.find(l => l.id === selectedDifficulty)?.label} • 
                    <span className="font-medium"> Beschreibung:</span> {difficultyLevels.find(l => l.id === selectedDifficulty)?.description}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center justify-center space-x-2 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Save className="w-5 h-5" />
                <span>Training speichern</span>
              </button>
              
              <button
                onClick={onCancel}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};