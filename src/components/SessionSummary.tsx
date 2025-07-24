export const SessionSummary: React.FC<SessionSummaryProps> = ({ sessionData, onSave, onCancel }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sessionName, setSessionName] = useState(sessionData.name);
  const [nameError, setNameError] = useState('');
  const { isDark } = useTheme();

  // ... handlers bleiben gleich ...

  const difficultyOptions = [
    { id: 'anfaenger', label: 'Anfänger', icon: '🚶', color: 'emerald' },
    { id: 'leicht', label: 'Leicht', icon: '👍', color: 'blue' },
    { id: 'mittel', label: 'Mittel', icon: '⚡', color: 'amber' },
    { id: 'schwer', label: 'Schwer', icon: '🔥', color: 'orange' },
    { id: 'extrem', label: 'Extrem', icon: '📈', color: 'red' },
    { id: 'selbstmord', label: 'Profi', icon: '💀', color: 'gray' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-5xl max-h-[95vh] rounded-3xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        
        {/* Top Bar */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Training Summary
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {new Date().toLocaleDateString('de-DE', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className={`p-3 rounded-xl transition-colors ${
            isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
          }`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-200px)] p-6">
          <div className="space-y-6">
            
            {/* Performance Overview */}
            <div className={`p-6 rounded-2xl border-2 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Performance Übersicht
                </h3>
                <Award className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {formatDuration(sessionData.duration)}
                  </div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Gesamtzeit
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {sessionData.distance.toFixed(1)}
                    <span className="text-lg ml-1">km</span>
                  </div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Distanz
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                    {sessionData.calories}
                  </div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Kalorien
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    {sessionData.averageSpeed.toFixed(1)}
                    <span className="text-lg ml-1">km/h</span>
                  </div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Ø Geschw.
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`p-6 rounded-2xl border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h4 className={`font-semibold mb-4 flex items-center space-x-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <TrendingUp className="w-5 h-5" />
                  <span>Geschwindigkeit</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Durchschnitt:</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {sessionData.averageSpeed.toFixed(1)} km/h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Maximum:</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {sessionData.maxSpeed.toFixed(1)} km/h
                    </span>
                  </div>
                </div>
              </div>

              {sessionData.steps && (
                <div className={`p-6 rounded-2xl border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <h4 className={`font-semibold mb-4 flex items-center space-x-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Footprints className="w-5 h-5" />
                    <span>Schritte</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Gesamt:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {sessionData.steps.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pro Minute:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {Math.round(sessionData.steps / (sessionData.duration / 60))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Session Name */}
            <div className={`p-6 rounded-2xl border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h4 className={`font-semibold mb-4 flex items-center space-x-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Edit3 className="w-5 h-5" />
                <span>Trainingsbezeichnung</span>
              </h4>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDark 
                    ? 'bg-gray-900 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
                placeholder="Trainingsname eingeben..."
              />
              {nameError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{nameError}</p>
                </div>
              )}
            </div>

            {/* Difficulty */}
            <div className={`p-6 rounded-2xl border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h4 className={`font-semibold mb-4 flex items-center space-x-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Target className="w-5 h-5" />
                <span>Schwierigkeitsgrad</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {difficultyOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedDifficulty(option.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      selectedDifficulty === option.id 
                        ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700` 
                        : `${isDark ? 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'}`
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSelectedDifficulty('')}
                className={`mt-3 w-full p-3 rounded-xl border transition-colors ${
                  !selectedDifficulty 
                    ? `${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}` 
                    : `${isDark ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`
                }`}
              >
                Keine Bewertung
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className={`p-6 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
            >
              <Save className="w-5 h-5" />
              <span>Training speichern</span>
            </button>
            <button
              onClick={onCancel}
              className={`px-6 py-4 rounded-xl font-semibold border transition-all ${
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
  );
};
