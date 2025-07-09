import React from 'react';
import { TrendingUp, Target, Flame, MapPin, Clock, Activity, Footprints } from 'lucide-react';
import { TrainingSession } from '../types';
import { formatDuration, calculateStepsForExistingSession } from '../utils/calculations';
import { getUserProfile } from '../firebase/services';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

interface StatisticsProps {
  sessions: TrainingSession[];
}

export const Statistics: React.FC<StatisticsProps> = ({ sessions }) => {
  const [userProfile, setUserProfile] = useState<any>({});
  const { isDark } = useTheme();
  
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
  
  // Berechnungen
  const totalSessions = sessions.length;
  const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
  const totalDistance = sessions.reduce((sum, session) => sum + session.distance, 0);
  const totalCalories = sessions.reduce((sum, session) => sum + session.calories, 0);
  const totalSteps = sessions.reduce((sum, session) => {
    const steps = session.steps || calculateStepsForExistingSession(session, userProfile);
    return sum + steps;
  }, 0);
  
  const averageDistance = totalSessions > 0 ? totalDistance / totalSessions : 0;
  const averageCalories = totalSessions > 0 ? totalCalories / totalSessions : 0;
  const averageSpeed = sessions.length > 0 
    ? sessions.reduce((sum, session) => sum + session.averageSpeed, 0) / sessions.length 
    : 0;
  const averageSteps = totalSessions > 0 ? totalSteps / totalSessions : 0;

  // Filter für Zeiträume
  const thisWeekSessions = sessions.filter(session => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return session.date >= weekAgo;
  });

  const thisMonthSessions = sessions.filter(session => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return session.date >= monthAgo;
  });

  const thisWeekSteps = thisWeekSessions.reduce((sum, s) => {
    const steps = s.steps || calculateStepsForExistingSession(s, userProfile);
    return sum + steps;
  }, 0);
  const thisMonthSteps = thisMonthSessions.reduce((sum, s) => {
    const steps = s.steps || calculateStepsForExistingSession(s, userProfile);
    return sum + steps;
  }, 0);

  // Rekorde
  const maxDistance = Math.max(...sessions.map(s => s.distance));
  const maxCalories = Math.max(...sessions.map(s => s.calories));
  const maxDuration = Math.max(...sessions.map(s => s.duration));
  const maxSteps = Math.max(...sessions.map(s => s.steps || calculateStepsForExistingSession(s, userProfile)));

  // Statistik-Karten
  const statsCards = [
    {
      title: 'Gesamteinheiten',
      value: totalSessions.toString(),
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      trend: null
    },
    {
      title: 'Gesamtzeit',
      value: formatDuration(totalTime),
      icon: Clock,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      trend: null
    },
    {
      title: 'Gesamtdistanz',
      value: `${totalDistance.toFixed(1)} km`,
      icon: MapPin,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      trend: null
    },
    {
      title: 'Gesamtkalorien',
      value: `${totalCalories} kcal`,
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      trend: null
    }
  ];

  // Durchschnitts-Karten
  const avgCards = [
    {
      title: 'Ø Distanz',
      value: `${averageDistance.toFixed(1)} km`,
      icon: TrendingUp,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    },
    {
      title: 'Ø Geschwindigkeit',
      value: `${averageSpeed.toFixed(1)} km/h`,
      icon: Activity,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    },
    {
      title: 'Gesamtschritte',
      value: totalSteps.toLocaleString(),
      icon: Footprints,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10'
    },
    {
      title: 'Ø Schritte',
      value: Math.round(averageSteps).toLocaleString(),
      icon: Target,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10'
    }
  ];

  return (
    <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Trainingsstatistiken
      </h2>
      
      {/* Hauptstatistiken */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat, index) => (
          <div 
            key={index} 
            className={`${stat.bgColor} rounded-xl p-5 transition-all duration-300 hover:shadow-lg ${
              isDark ? 'border-gray-700' : 'border-gray-100'
            } border`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Zweite Reihe mit Durchschnittswerten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {avgCards.map((stat, index) => (
          <div 
            key={index} 
            className={`${stat.bgColor} rounded-xl p-5 transition-all duration-300 hover:shadow-lg ${
              isDark ? 'border-gray-700' : 'border-gray-100'
            } border`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Zeiträume und Rekorde */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Diese Woche */}
        <div className={`rounded-xl p-5 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} border ${
          isDark ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Diese Woche
          </h3>
          <div className="space-y-3">
            <StatItem 
              label="Einheiten" 
              value={thisWeekSessions.length} 
              isDark={isDark} 
              icon={<Target className="w-4 h-4 text-blue-500" />}
            />
            <StatItem 
              label="Distanz" 
              value={`${thisWeekSessions.reduce((sum, s) => sum + s.distance, 0).toFixed(1)} km`} 
              isDark={isDark}
              icon={<MapPin className="w-4 h-4 text-purple-500" />}
            />
            <StatItem 
              label="Kalorien" 
              value={`${thisWeekSessions.reduce((sum, s) => sum + s.calories, 0)} kcal`} 
              isDark={isDark}
              icon={<Flame className="w-4 h-4 text-orange-500" />}
            />
            <StatItem 
              label="Schritte" 
              value={thisWeekSteps.toLocaleString()} 
              isDark={isDark}
              icon={<Footprints className="w-4 h-4 text-indigo-500" />}
            />
          </div>
        </div>

        {/* Dieser Monat */}
        <div className={`rounded-xl p-5 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} border ${
          isDark ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
            Dieser Monat
          </h3>
          <div className="space-y-3">
            <StatItem 
              label="Einheiten" 
              value={thisMonthSessions.length} 
              isDark={isDark}
              icon={<Target className="w-4 h-4 text-blue-500" />}
            />
            <StatItem 
              label="Distanz" 
              value={`${thisMonthSessions.reduce((sum, s) => sum + s.distance, 0).toFixed(1)} km`} 
              isDark={isDark}
              icon={<MapPin className="w-4 h-4 text-purple-500" />}
            />
            <StatItem 
              label="Kalorien" 
              value={`${thisMonthSessions.reduce((sum, s) => sum + s.calories, 0)} kcal`} 
              isDark={isDark}
              icon={<Flame className="w-4 h-4 text-orange-500" />}
            />
            <StatItem 
              label="Schritte" 
              value={thisMonthSteps.toLocaleString()} 
              isDark={isDark}
              icon={<Footprints className="w-4 h-4 text-indigo-500" />}
            />
          </div>
        </div>

        {/* Rekorde */}
        {sessions.length > 0 && (
          <div className={`rounded-xl p-5 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} border ${
            isDark ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
              Persönliche Rekorde
            </h3>
            <div className="space-y-3">
              <StatItem 
                label="Längste Distanz" 
                value={`${maxDistance.toFixed(2)} km`} 
                isDark={isDark}
                icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
              />
              <StatItem 
                label="Meiste Kalorien" 
                value={`${maxCalories} kcal`} 
                isDark={isDark}
                icon={<Flame className="w-4 h-4 text-orange-500" />}
              />
              <StatItem 
                label="Längste Zeit" 
                value={formatDuration(maxDuration)} 
                isDark={isDark}
                icon={<Clock className="w-4 h-4 text-blue-500" />}
              />
              <StatItem 
                label="Meiste Schritte" 
                value={maxSteps.toLocaleString()} 
                isDark={isDark}
                icon={<Footprints className="w-4 h-4 text-indigo-500" />}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Hilfskomponente für Statistik-Elemente
const StatItem = ({ label, value, isDark, icon }: { 
  label: string; 
  value: string | number; 
  isDark: boolean;
  icon: React.ReactNode;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      <div className="mr-2">
        {icon}
      </div>
      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
      {value}
    </span>
  </div>
);