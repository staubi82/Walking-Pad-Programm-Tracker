import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Flame, Trash2, Filter, BarChart3, Edit3, ArrowUpDown, ArrowUp, ArrowDown, Footprints } from 'lucide-react';
import { TrainingSession, FilterOptions } from '../types';
import { formatDuration, formatDate, calculateStepsForExistingSession } from '../utils/calculations';
import { HighchartsChart } from './HighchartsChart';
import { getUserProfile } from '../firebase/services';
import { useTheme } from '../context/ThemeContext';

interface SessionHistoryProps {
  sessions: TrainingSession[];
  onDeleteSession: (id: string) => void;
  onEditSession?: (session: TrainingSession) => void;
  showTitle?: boolean;
  title?: string;
  showControls?: boolean;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ 
  sessions, 
  onDeleteSession, 
  onEditSession,
  showTitle = true,
  title = "Trainingsprogramme",
  showControls = true
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [userProfile, setUserProfile] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('chart');
  const { isDark } = useTheme();
  
  // Lade Benutzerprofil für Schrittzähler
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.warn('Konnte Benutzerprofil nicht laden:', error);
        setUserProfile({});
      }
    };
    
    loadProfile();
  }, []);

  const applyFilters = (sessions: TrainingSession[]): TrainingSession[] => {
    let filtered = [...sessions];

    // Datum Filter
    if (filters.dateFrom) {
      filtered = filtered.filter(session => session.date >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(session => session.date <= filters.dateTo!);
    }

    // Dauer Filter
    if (filters.minDuration) {
      filtered = filtered.filter(session => session.duration >= filters.minDuration! * 60);
    }
    if (filters.maxDuration) {
      filtered = filtered.filter(session => session.duration <= filters.maxDuration! * 60);
    }

    // Distanz Filter
    if (filters.minDistance) {
      filtered = filtered.filter(session => session.distance >= filters.minDistance!);
    }
    if (filters.maxDistance) {
      filtered = filtered.filter(session => session.distance <= filters.maxDistance!);
    }

    // Kalorien Filter
    if (filters.minCalories) {
      filtered = filtered.filter(session => session.calories >= filters.minCalories!);
    }
    if (filters.maxCalories) {
      filtered = filtered.filter(session => session.calories <= filters.maxCalories!);
    }

    // Sortierung
    if (filters.difficulty) {
      filtered = filtered.filter(session => session.difficulty === filters.difficulty);
    }

    // Sortierung
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'difficulty':
          const difficultyOrder = ['anfaenger', 'leicht', 'mittel', 'schwer', 'extrem', 'selbstmord'];
          const aIndex = difficultyOrder.indexOf(a.difficulty || '');
          const bIndex = difficultyOrder.indexOf(b.difficulty || '');
          comparison = aIndex - bIndex;
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'distance':
          comparison = a.distance - b.distance;
          break;
        case 'calories':
          comparison = a.calories - b.calories;
          break;
        case 'steps':
          const aSteps = a.steps || calculateStepsForExistingSession(a, userProfile);
          const bSteps = b.steps || calculateStepsForExistingSession(b, userProfile);
          comparison = aSteps - bSteps;
          break;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const handleSortClick = (sortBy: FilterOptions['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getSortIcon = (sortBy: FilterOptions['sortBy']) => {
    if (filters.sortBy !== sortBy) {
      return <ArrowUpDown className="w-4 h-4 text-gray-500" />;
    }
    return filters.sortOrder === 'desc' 
      ? <ArrowDown className="w-4 h-4 text-green-400" />
      : <ArrowUp className="w-4 h-4 text-green-400" />;
  };

  const filteredSessions = applyFilters(sessions);

  return (
    <div className={`rounded-xl p-6 shadow-xl transition-colors duration-200 ${
      isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
    }`}>
      {showTitle && (
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>{title}</h2>
          {showControls && (
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'chart' : 'list')}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-white transition-colors shadow-lg"
              >
                <BarChart3 className="w-4 h-4" />
                <span>{viewMode === 'list' ? 'Chart-Ansicht' : 'Listen-Ansicht'}</span>
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-white transition-colors shadow-lg ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          )}
        </div>
      )}

      {showFilters && showTitle && showControls && (
        <div className={`mb-6 p-4 rounded-lg transition-colors duration-200 ${
          isDark ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Sortieren nach
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as FilterOptions['sortBy'] }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-600 border-gray-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="name">Name</option>
                <option value="difficulty">Schwierigkeit</option>
                <option value="date">Datum</option>
                <option value="duration">Dauer</option>
                <option value="distance">Distanz</option>
                <option value="calories">Kalorien</option>
                <option value="steps">Schritte</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Reihenfolge
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as FilterOptions['sortOrder'] }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-600 border-gray-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="desc">Absteigend</option>
                <option value="asc">Aufsteigend</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Schwierigkeitsgrad
              </label>
              <select
                value={filters.difficulty || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value || undefined }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-600 border-gray-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Alle Schwierigkeiten</option>
                <option value="anfaenger">Anfänger 🚶‍♀️</option>
                <option value="leicht">Leicht 🚶‍♂️</option>
                <option value="mittel">Mittel 🏃‍♀️</option>
                <option value="schwer">Schwer 🏃‍♂️</option>
                <option value="extrem">Extrem 🔥</option>
                <option value="selbstmord">Selbstmord 💀</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Min. Dauer (Min.)
              </label>
              <input
                type="number"
                value={filters.minDuration || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minDuration: e.target.value ? parseInt(e.target.value) : undefined }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="0"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Min. Distanz (km)
              </label>
              <input
                type="number"
                step="0.1"
                value={filters.minDistance || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minDistance: e.target.value ? parseFloat(e.target.value) : undefined }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="0.0"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Min. Kalorien
              </label>
              <input
                type="number"
                value={filters.minCalories || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minCalories: e.target.value ? parseInt(e.target.value) : undefined }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="0"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Max. Dauer (Min.)
              </label>
              <input
                type="number"
                value={filters.maxDuration || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, maxDuration: e.target.value ? parseInt(e.target.value) : undefined }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="∞"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({
                sortBy: 'name',
                sortOrder: 'asc'
              })}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm transition-colors"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>
      )}

      {/* Sortier-Buttons */}
      {filteredSessions.length > 0 && showControls && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handleSortClick('name')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all shadow-lg ${
                filters.sortBy === 'name'
                  ? 'bg-green-600 text-white shadow-lg'
                  : isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span>Name</span>
              {getSortIcon('name')}
            </button>
            
            <button
              onClick={() => handleSortClick('difficulty')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all shadow-lg ${
                filters.sortBy === 'difficulty'
                  ? 'bg-green-600 text-white shadow-lg'
                  : isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span>Level</span>
              {getSortIcon('difficulty')}
            </button>
            
            <button
              onClick={() => handleSortClick('distance')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all shadow-lg ${
                filters.sortBy === 'distance'
                  ? 'bg-green-600 text-white shadow-lg'
                  : isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span>Distanz</span>
              {getSortIcon('distance')}
            </button>
            
            <button
              onClick={() => handleSortClick('calories')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all shadow-lg ${
                filters.sortBy === 'calories'
                  ? 'bg-green-600 text-white shadow-lg'
                  : isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span>Kcal</span>
              {getSortIcon('calories')}
            </button>
            
            <button
              onClick={() => handleSortClick('steps')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all shadow-lg ${
                filters.sortBy === 'steps'
                  ? 'bg-green-600 text-white shadow-lg'
                  : isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span>Schritte</span>
              {getSortIcon('steps')}
            </button>
          </div>
          
          {/* Sortier-Info */}
          <div className="text-center mt-3">
            <span className={`text-sm transition-colors duration-200 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Sortiert nach: <span className="text-green-400 font-medium">
                {filters.sortBy === 'name' && 'Name'}
                {filters.sortBy === 'difficulty' && 'Schwierigkeitslevel'}
                {filters.sortBy === 'distance' && 'Distanz'}
                {filters.sortBy === 'calories' && 'Kalorien'}
                {filters.sortBy === 'steps' && 'Schritte'}
              </span>
              {' '}({filters.sortOrder === 'asc' ? 'A-Z / niedrigste zuerst' : 'Z-A / höchste zuerst'})
            </span>
          </div>
        </div>
      )}

      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className={`w-16 h-16 mx-auto mb-4 transition-colors duration-200 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <p className={`transition-colors duration-200 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Noch keine Trainingsprogramme vorhanden.</p>
          <p className={`text-sm transition-colors duration-200 ${
            isDark ? 'text-gray-500' : 'text-gray-500'
          }`}>Erstellen Sie Ihr erstes Programm!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {viewMode === 'chart' ? (
            // Chart-Ansicht
            filteredSessions.map((session) => (
              <HighchartsChart 
                key={session.id} 
                session={session} 
                onDelete={onDeleteSession}
                onEdit={onEditSession}
              />
            ))
          ) : (
            // Listen-Ansicht
            filteredSessions.map((session) => (
              <div key={session.id} className={`rounded-lg p-4 transition-colors duration-200 ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-white hover:bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{session.name}</h3>
                  <div className="flex space-x-2">
                    {onEditSession && (
                      <button
                        onClick={() => onEditSession(session)}
                        className={`p-1 rounded transition-colors ${
                          isDark 
                            ? 'text-blue-400 hover:text-blue-300' 
                            : 'text-blue-600 hover:text-blue-700'
                        }`}
                        title="Bearbeiten"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteSession(session.id)}
                      className={`p-1 rounded transition-colors ${
                        isDark 
                          ? 'text-red-400 hover:text-red-300' 
                          : 'text-red-600 hover:text-red-700'
                      }`}
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className={`text-sm transition-colors duration-200 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>{formatDuration(session.duration)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className={`text-sm transition-colors duration-200 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>{session.distance.toFixed(2)} km</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className={`text-sm transition-colors duration-200 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>{session.calories} kcal</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className={`text-sm transition-colors duration-200 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>{formatDate(session.date)}</span>
                  </div>
                  
                  {/* Schritte - falls verfügbar */}
                  {(session.steps || calculateStepsForExistingSession(session, userProfile) > 0) && (
                    <div className="flex items-center space-x-2">
                      <Footprints className="w-4 h-4 text-cyan-400" />
                      <span className={`text-sm transition-colors duration-200 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {(session.steps || calculateStepsForExistingSession(session, userProfile)).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className={`flex justify-between text-xs transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <span>Ø Geschwindigkeit: {session.averageSpeed} km/h</span>
                  <span>Max. Geschwindigkeit: {session.maxSpeed} km/h</span>
                  {session.difficulty && (
                    <span className="text-purple-400">
                      Schwierigkeit: {session.difficulty}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};