import React, { useState } from 'react';
import { Save, X, Clock, MapPin, Flame, TrendingUp, Activity, Edit3, Footprints, Target, Zap, Award, Smile, ThumbsUp, Skull, BarChart3, Calendar } from 'lucide-react';
import { formatDuration } from '../utils/calculations';
import { useTheme } from '../context/ThemeContext';

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
    onSave({ ...sessionData, name: sessionName, difficulty: selectedDifficulty || undefined });
  };

  const handleNameChange = (name: string) => {
    setSessionName(name);
    if (nameError) setNameError('');
  };

  const difficultyLevels = [
    { id: 'anfaenger', label: 'Anfänger', icon: Smile, color: 'emerald', description: 'Gemütliches Tempo' },
    { id: 'leicht', label: 'Leicht', icon: ThumbsUp, color: 'blue', description: 'Entspanntes Walking' },
    { id: 'mittel', label: 'Mittel', icon: Zap, color: 'amber', description: 'Moderates Tempo' },
    { id: 'schwer', label: 'Schwer', icon: Flame, color: 'orange', description: 'Anspruchsvoll' },
    { id: 'extrem', label: 'Extrem', icon: TrendingUp, color: 'red', description: 'Maximale Challenge' },
    { id: 'selbstmord', label: 'Profi', icon: Skull, color: 'gray', description: 'Nur für Profis' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-4xl max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-100'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center`}>
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Training Summary
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {new Date().toLocaleDateString('de-DE')}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className={`p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
          }`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          {/* Stats Grid */}
          <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <Clock className={`w-5 h-5 mb-3 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
              <div className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatDuration(sessionData.duration)}
              </div>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Zeit
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <MapPin className={`w-5 h-5 mb-3 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
              <div className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {sessionData.distance.toFixed(2)}
                <span className="text-sm ml-1 font-normal">km</span>
              </div>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Distanz
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <Flame className={`w-5 h-5 mb-3 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
              <div className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {sessionData.calories}
                <span className="text-sm ml-1 font-normal">kcal</span>
              </div>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Kalorien
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <TrendingUp className={`w-5 h-5 mb-3 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
              <div className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {sessionData.averageSpeed.toFixed(1)}
                <span className="text-sm ml-1 font-normal">km/h</span>
              </div>
              <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Ø Tempo
              </div>
            </div>
          </div>

          {sessionData.steps && (
            <div className="px-6 pb-6">
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="flex items-center space-x-3">
                  <Footprints className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
                  <div className="flex-1">
                    <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {sessionData.steps.toLocaleString()} Schritte
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {Math.round(sessionData.steps / (sessionData.duration / 60))} pro Minute
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Name Input */}
          <div className="px-6 pb-6">
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Trainingsname
            </label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                isDark 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
              placeholder="z.B. Morgendliches Walking"
            />
            {nameError && (
              <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {nameError}
              </p>
            )}
          </div>

          {/* Difficulty */}
          <div className="px-6 pb-6">
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Schwierigkeitsgrad
            </label>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
              {difficultyLevels.map(level => {
                const Icon = level.icon;
                const isSelected = selectedDifficulty === level.id;
                return (
                  <button
                    key={level.id}
                    onClick={() => setSelectedDifficulty(level.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      isSelected 
                        ? `border-${level.color}-500 bg-${level.color}-50 text-${level.color}-700` 
                        : `${isDark ? 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-2 ${
                      isSelected ? `text-${level.color}-600` : ''
                    }`} />
                    <div className="text-xs font-medium">{level.label}</div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setSelectedDifficulty('')}
              className={`mt-3 w-full p-2 text-xs rounded-lg border ${
                !selectedDifficulty 
                  ? `${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}` 
                  : `${isDark ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`
              }`}
            >
              Keine Angabe
            </button>
          </div>

          {/* Actions */}
          <div className={`px-6 py-4 border-t bg-gray-50/50 ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Speichern</span>
              </button>
              <button
                onClick={onCancel}
                className={`px-6 py-3 rounded-xl font-medium border transition-colors ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
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
