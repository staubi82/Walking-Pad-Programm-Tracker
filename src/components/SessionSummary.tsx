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
  { id: 'anfaenger', label: 'Anfänger 🚶‍♀️', color: 'bg-green-600', description: 'Gemütliches Tempo für Einsteiger' },
  { id: 'leicht', label: 'Leicht 🚶‍♂️', color: 'bg-blue-600', description: 'Entspanntes Walking' },
  { id: 'mittel', label: 'Mittel 🏃‍♀️', color: 'bg-yellow-600', description: 'Moderates Tempo' },
  { id: 'schwer', label: 'Schwer 🏃‍♂️', color: 'bg-orange-600', description: 'Anspruchsvolles Training' },
  { id: 'extrem', label: 'Extrem 🔥', color: 'bg-red-600', description: 'Maximale Herausforderung' },
  { id: 'selbstmord', label: 'Selbstmord 💀', color: 'bg-purple-600', description: 'Nur für Profis!' }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border transition-colors duration-200 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDark ? 'bg-green-100' : 'bg-green-100'
            }`}>
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Training abgeschlossen!</h2>
              <p className={`transition-colors duration-200 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Überprüfen Sie Ihre Ergebnisse und wählen Sie das Schwierigkeitslevel</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Trainings-Statistiken */}
        <div className="mb-6">
          <h3 className={`text-xl font-bold mb-4 transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>📊 Ihre Trainings-Ergebnisse</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-sm text-blue-300">Trainingszeit</p>
                  <p className={`text-2xl font-bold transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{formatDuration(sessionData.duration)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-900/30 rounded-lg p-4 border border-green-700">
              <div className="flex items-center space-x-3">
                <MapPin className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-sm text-green-300">Distanz</p>
                  <p className={`text-2xl font-bold transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{sessionData.distance.toFixed(2)} km</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-700">
              <div className="flex items-center space-x-3">
                <Flame className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-sm text-orange-300">Kalorien</p>
                  <p className={`text-2xl font-bold transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{sessionData.calories} kcal</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-700">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-sm text-purple-300">Ø Geschwindigkeit</p>
                  <p className={`text-2xl font-bold transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{sessionData.averageSpeed.toFixed(1)} km/h</p>
                </div>
              </div>
            </div>
            
            {/* Schritte - falls verfügbar */}
            {sessionData.steps && (
              <div className="bg-cyan-900/30 rounded-lg p-4 border border-cyan-700 md:col-span-2">
                <div className="flex items-center space-x-3">
                  <Footprints className="w-8 h-8 text-cyan-400" />
                  <div>
                    <p className="text-sm text-cyan-300">Schritte</p>
                    <p className={`text-2xl font-bold transition-colors duration-200 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{sessionData.steps.toLocaleString()}</p>
                    <p className="text-xs text-cyan-200">
                      {Math.round(sessionData.steps / (sessionData.duration / 60))} Schritte/Min
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Zusätzliche Statistiken */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`rounded-lg p-4 transition-colors duration-200 ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <h4 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>🏃‍♂️ Geschwindigkeits-Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Maximale Geschwindigkeit:</span>
                  <span className={`font-medium transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{sessionData.maxSpeed.toFixed(1)} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className={`transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Durchschnittsgeschwindigkeit:</span>
                  <span className={`font-medium transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{sessionData.averageSpeed.toFixed(1)} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className={`transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Geschwindigkeitsänderungen:</span>
                  <span className={`font-medium transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{sessionData.speedHistory.length} Datenpunkte</span>
                </div>
                {sessionData.steps && (
                  <div className="flex justify-between">
                    <span className={`transition-colors duration-200 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Schritte pro km:</span>
                    <span className={`font-medium transition-colors duration-200 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{Math.round(sessionData.steps / sessionData.distance)} Schritte/km</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className={`rounded-lg p-4 transition-colors duration-200 ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <h4 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>⚡ Performance-Bewertung</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Kalorien pro Minute:</span>
                  <span className={`font-medium transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{(sessionData.calories / (sessionData.duration / 60)).toFixed(1)} kcal/min</span>
                </div>
                <div className="flex justify-between">
                  <span className={`transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Distanz pro Minute:</span>
                  <span className={`font-medium transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{(sessionData.distance / (sessionData.duration / 60)).toFixed(3)} km/min</span>
                </div>
                <div className="flex justify-between">
                  <span className={`transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Trainingsintensität:</span>
                  <span className={`font-medium ${
                    sessionData.averageSpeed >= 5.0 ? 'text-red-400' :
                    sessionData.averageSpeed >= 4.0 ? 'text-orange-400' :
                    sessionData.averageSpeed >= 3.0 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {sessionData.averageSpeed >= 5.0 ? 'Sehr hoch' :
                     sessionData.averageSpeed >= 4.0 ? 'Hoch' :
                     sessionData.averageSpeed >= 3.0 ? 'Mittel' : 'Niedrig'}
                  </span>
                </div>
                {sessionData.steps && (
                  <div className="flex justify-between">
                    <span className={`transition-colors duration-200 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Schritt-Effizienz:</span>
                    <span className={`font-medium ${
                      sessionData.steps >= 10000 ? 'text-green-400' :
                      sessionData.steps >= 5000 ? 'text-yellow-400' :
                      'text-orange-400'
                    }`}>
                      {sessionData.steps >= 10000 ? 'Ausgezeichnet' :
                       sessionData.steps >= 5000 ? 'Gut' : 'Okay'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trainingsname bearbeiten */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <Edit3 className="w-4 h-4 inline mr-2" />
            Trainingsname anpassen
          </label>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg transition-colors duration-200 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="z.B. Morgendliches Walking"
          />
          {nameError && (
            <p className="mt-2 text-sm text-red-400">{nameError}</p>
          )}
        </div>

        {/* Schwierigkeitslevel auswählen */}
        <div className="mb-8">
          <label className={`block text-sm font-medium mb-4 transition-colors duration-200 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            🎯 Wie schwer war das Training für Sie?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedDifficulty('')}
              className={`p-4 rounded-lg text-white font-medium transition-all border-2 ${
                !selectedDifficulty 
                  ? 'bg-gray-500 border-white shadow-lg transform scale-105' 
                  : 'bg-gray-600 border-gray-500 hover:bg-gray-500'
              }`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">❓</div>
                <div className="text-sm">Kein Level</div>
              </div>
            </button>
            
            {difficultyLevels.map(level => (
              <button
                key={level.id}
                onClick={() => setSelectedDifficulty(level.id)}
                className={`${level.color} p-4 rounded-lg text-white font-medium transition-all border-2 ${
                  selectedDifficulty === level.id 
                    ? 'border-white shadow-lg transform scale-105' 
                    : 'border-transparent hover:border-gray-300'
                }`}
                title={level.description}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">{level.label.split(' ')[1]}</div>
                  <div className="text-sm">{level.label.split(' ')[0]}</div>
                </div>
              </button>
            ))}
          </div>
          
          {selectedDifficulty && (
            <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-700">
              <p className="text-blue-300 text-sm">
                ✨ <strong>Gewähltes Level:</strong> {difficultyLevels.find(l => l.id === selectedDifficulty)?.label}
                <br />📝 <strong>Beschreibung:</strong> {difficultyLevels.find(l => l.id === selectedDifficulty)?.description}
              </p>
            </div>
          )}
        </div>

        {/* Motivations-Nachricht */}
        <div className={`mb-6 p-4 rounded-lg border border-green-700 transition-colors duration-200 ${
          isDark 
            ? 'bg-gradient-to-r from-green-900/30 to-blue-900/30' 
            : 'bg-gradient-to-r from-green-100/50 to-blue-100/50'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🎉</div>
            <div>
              <h4 className={`text-lg font-bold transition-colors duration-200 ${
                isDark ? 'text-green-300' : 'text-green-700'
              }`}>Glückwunsch zu Ihrem Training!</h4>
              <p className={`text-sm transition-colors duration-200 ${
                isDark ? 'text-green-200' : 'text-green-600'
              }`}>
                Sie haben {formatDuration(sessionData.duration)} trainiert und {sessionData.distance.toFixed(2)} km zurückgelegt. 
                {sessionData.calories >= 100 && ` Dabei haben Sie ${sessionData.calories} Kalorien verbrannt!`}
                {sessionData.averageSpeed >= 4.0 && ' Das war ein richtig intensives Training!'}
                {sessionData.steps && sessionData.steps >= 10000 && ' Fantastisch - Sie haben über 10.000 Schritte erreicht!'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-700 px-6 py-4 rounded-lg flex items-center justify-center space-x-3 text-white font-medium transition-colors text-lg shadow-lg"
          >
            <Save className="w-6 h-6" />
            <span>Training speichern</span>
          </button>
          
          <button
            onClick={onCancel}
            className="px-6 py-4 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-medium transition-colors text-lg"
          >
            Abbrechen
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <p className={`text-sm transition-colors duration-200 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            💡 Tipp: Das Schwierigkeitslevel hilft Ihnen dabei, Ihre Trainings besser zu kategorisieren und Fortschritte zu verfolgen.
          </p>
        </div>
      </div>
    </div>
  );
};