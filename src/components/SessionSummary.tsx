import React, { useState } from 'react';
import { Save, X, Clock, MapPin, Flame, TrendingUp, Activity, Edit3, Footprints, Target, Zap, Award, Smile, ThumbsUp, Skull, Trophy, Star, CheckCircle } from 'lucide-react';
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
  { id: 'anfaenger', label: 'Anfänger', icon: 'Smile', color: 'from-emerald-400 to-emerald-500', bgColor: 'bg-emerald-50 border-emerald-200', darkBgColor: 'bg-emerald-950/30 border-emerald-800', description: 'Gemütliches Tempo für Einsteiger' },
  { id: 'leicht', label: 'Leicht', icon: 'ThumbsUp', color: 'from-blue-400 to-blue-500', bgColor: 'bg-blue-50 border-blue-200', darkBgColor: 'bg-blue-950/30 border-blue-800', description: 'Entspanntes Walking' },
  { id: 'mittel', label: 'Mittel', icon: 'Zap', color: 'from-amber-400 to-amber-500', bgColor: 'bg-amber-50 border-amber-200', darkBgColor: 'bg-amber-950/30 border-amber-800', description: 'Moderates Tempo' },
  { id: 'schwer', label: 'Schwer', icon: 'Flame', color: 'from-orange-400 to-orange-500', bgColor: 'bg-orange-50 border-orange-200', darkBgColor: 'bg-orange-950/30 border-orange-800', description: 'Anspruchsvolles Training' },
  { id: 'extrem', label: 'Extrem', icon: 'TrendingUp', color: 'from-red-400 to-red-500', bgColor: 'bg-red-50 border-red-200', darkBgColor: 'bg-red-950/30 border-red-800', description: 'Maximale Herausforderung' },
  { id: 'selbstmord', label: 'Selbstmord', icon: 'Skull', color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-50 border-gray-200', darkBgColor: 'bg-gray-950/30 border-gray-800', description: 'Nur für Profis!' }
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
      difficulty: selectedDifficulty || undefined
    });
  };

  const handleNameChange = (name: string) => {
    setSessionName(name);
    if (nameError) setNameError('');
  };

  const getPerformanceData = () => {
    if (sessionData.averageSpeed >= 5.0) return { 
      rating: 'Fantastisch!', 
      emoji: '🔥',
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-600',
      bgColor: isDark ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20' : 'bg-gradient-to-br from-green-50 to-emerald-50',
      borderColor: isDark ? 'border-green-800/50' : 'border-green-200',
      description: 'Außergewöhnliche Leistung!'
    };
    if (sessionData.averageSpeed >= 4.0) return { 
      rating: 'Ausgezeichnet', 
      emoji: '⭐',
      color: 'from-blue-500 to-indigo-500',
      textColor: 'text-blue-600',
      bgColor: isDark ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20' : 'bg-gradient-to-br from-blue-50 to-indigo-50',
      borderColor: isDark ? 'border-blue-800/50' : 'border-blue-200',
      description: 'Sehr starke Performance!'
    };
    if (sessionData.averageSpeed >= 3.0) return { 
      rating: 'Sehr gut', 
      emoji: '👏',
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-600',
      bgColor: isDark ? 'bg-gradient-to-br from-amber-900/20 to-orange-900/20' : 'bg-gradient-to-br from-amber-50 to-orange-50',
      borderColor: isDark ? 'border-amber-800/50' : 'border-amber-200',
      description: 'Tolle Leistung!'
    };
    return { 
      rating: 'Gut gemacht', 
      emoji: '✨',
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-600',
      bgColor: isDark ? 'bg-gradient-to-br from-purple-900/20 to-pink-900/20' : 'bg-gradient-to-br from-purple-50 to-pink-50',
      borderColor: isDark ? 'border-purple-800/50' : 'border-purple-200',
      description: 'Weiter so!'
    };
  };

  const performance = getPerformanceData();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className={`rounded-3xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl transition-all duration-300 ${
        isDark ? 'bg-gray-900/95 border border-gray-700/50' : 'bg-white/95 border border-gray-200/50'
      }`}>
        
        {/* Hero Header mit Celebration */}
        <div className={`relative overflow-hidden ${
          isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 to-white'
        }`}>
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 -translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-gradient-to-br from-green-500 to-blue-500 translate-x-20 translate-y-20"></div>
          </div>
          
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-6">
                {/* Success Icon */}
                <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${performance.color} shadow-lg flex items-center justify-center`}>
                  <Trophy className="w-10 h-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm">
                    ✓
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Training absolviert!
                    </h1>
                    <span className="text-3xl">{performance.emoji}</span>
                  </div>
                  <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {performance.description}
                  </p>
                </div>
              </div>

              <button
                onClick={onCancel}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  isDark 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Performance Badge */}
            <div className={`rounded-2xl p-6 border-2 ${performance.bgColor} ${performance.borderColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${performance.color} shadow-lg flex items-center justify-center`}>
                    <Star className="w-7 h-7 text-white" fill="currentColor" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${performance.textColor} mb-1`}>
                      {performance.rating}
                    </h3>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium`}>
                      {formatDuration(sessionData.duration)} • {sessionData.distance.toFixed(2)} km • {sessionData.calories} kcal
                    </p>
                  </div>
                </div>
                <div className={`text-5xl ${performance.textColor}`}>
                  {performance.emoji}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="p-8 space-y-8">
            
            {/* Statistics Cards mit modernem Layout */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Zeit Card */}
              <div className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                  : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm hover:shadow-lg'
              }`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <Clock className={`w-8 h-8 mb-4 ${isDark ? 'text-blue-400' : 'text-blue-500'} relative z-10`} />
                <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'} relative z-10`}>
                  {formatDuration(sessionData.duration)}
                </div>
                <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} relative z-10`}>
                  Trainingszeit
                </div>
              </div>

              {/* Distanz Card */}
              <div className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                  : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm hover:shadow-lg'
              }`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <MapPin className={`w-8 h-8 mb-4 ${isDark ? 'text-green-400' : 'text-green-500'} relative z-10`} />
                <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'} relative z-10`}>
                  {sessionData.distance.toFixed(2)}
                  <span className={`text-lg ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>km</span>
                </div>
                <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} relative z-10`}>
                  Zurückgelegte Distanz
                </div>
              </div>

              {/* Kalorien Card */}
              <div className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                  : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm hover:shadow-lg'
              }`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <Flame className={`w-8 h-8 mb-4 ${isDark ? 'text-orange-400' : 'text-orange-500'} relative z-10`} />
                <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'} relative z-10`}>
                  {sessionData.calories}
                  <span className={`text-lg ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>kcal</span>
                </div>
                <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} relative z-10`}>
                  Verbrannte Kalorien
                </div>
              </div>

              {/* Geschwindigkeit Card */}
              <div className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                  : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm hover:shadow-lg'
              }`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <TrendingUp className={`w-8 h-8 mb-4 ${isDark ? 'text-purple-400' : 'text-purple-500'} relative z-10`} />
                <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'} relative z-10`}>
                  {sessionData.averageSpeed.toFixed(1)}
                  <span className={`text-lg ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>km/h</span>
                </div>
                <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} relative z-10`}>
                  Durchschnittstempo
                </div>
              </div>
            </div>

            {/* Schritte - Falls verfügbar */}
            {sessionData.steps && (
              <div className={`rounded-2xl p-6 border-2 border-dashed transition-all duration-300 ${
                isDark ? 'bg-gray-800/50 border-gray-600' : 'bg-gray-50 border-gray-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg flex items-center justify-center`}>
                      <Footprints className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {sessionData.steps.toLocaleString()} Schritte
                      </div>
                      <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {Math.round(sessionData.steps / (sessionData.duration / 60))} Schritte pro Minute
                      </div>
                    </div>
                  </div>
                  <div className="text-4xl">👟</div>
                </div>
              </div>
            )}

            {/* Trainingsname Section */}
            <div className={`rounded-2xl p-6 border transition-all duration-200 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <label className={`block text-lg font-semibold mb-4 flex items-center space-x-3 ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center`}>
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <span>Trainingsname bearbeiten</span>
              </label>
              
              <input
                type="text"
                value={sessionName}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full px-6 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg ${
                  isDark 
                    ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="z.B. Morgendliches Walking im Park"
              />
              {nameError && (
                <div className="mt-3 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">!</span>
                  </div>
                  <p className="text-red-700 font-medium">{nameError}</p>
                </div>
              )}
            </div>

            {/* Schwierigkeitslevel */}
            <div className={`rounded-2xl p-6 border transition-all duration-200 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <label className={`block text-lg font-semibold mb-6 flex items-center space-x-3 ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center`}>
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span>Schwierigkeitslevel (optional)</span>
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                <button
                  onClick={() => setSelectedDifficulty('')}
                  className={`group relative p-4 rounded-xl border-2 transition-all duration-200 ${
                    !selectedDifficulty 
                      ? `border-gray-800 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'}` 
                      : `${isDark ? 'bg-gray-900 border-gray-600 text-gray-300 hover:border-gray-500' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'}`
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-2xl mb-2 ${!selectedDifficulty ? 'text-white' : 'text-gray-400'}`}>–</div>
                    <div className="font-medium">Kein Level</div>
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
                      className={`group relative p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedDifficulty === level.id 
                          ? `bg-gradient-to-br ${level.color} border-transparent text-white shadow-lg` 
                          : `${isDark ? level.darkBgColor : level.bgColor} ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                      }`}
                      title={level.description}
                    >
                      <div className="text-center">
                        <div className="mb-3 flex justify-center">
                          <IconComponent className={`w-6 h-6 ${selectedDifficulty === level.id ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                        <div className={`font-semibold text-sm ${selectedDifficulty === level.id ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {level.label}
                        </div>
                      </div>
                      {selectedDifficulty === level.id && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-4 h-4 text-green-500" fill="currentColor" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {selectedDifficulty && (
                <div className={`mt-4 p-4 rounded-xl border-l-4 ${
                  isDark 
                    ? 'bg-gray-900 border-blue-500' 
                    : 'bg-blue-50 border-blue-500'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">ℹ</span>
                    </div>
                    <div>
                      <p className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {difficultyLevels.find(l => l.id === selectedDifficulty)?.label}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {difficultyLevels.find(l => l.id === selectedDifficulty)?.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-4 rounded-xl flex items-center justify-center space-x-3 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <Save className="w-6 h-6" />
                <span className="text-lg">Training speichern</span>
              </button>
              
              <button
                onClick={onCancel}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 border-2 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
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
