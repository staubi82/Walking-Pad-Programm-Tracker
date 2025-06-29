import React from 'react';
import { TrendingUp, Target, Flame, MapPin, Clock, Activity } from 'lucide-react';
import { TrainingSession } from '../types';
import { formatDuration } from '../utils/calculations';

interface StatisticsProps {
  sessions: TrainingSession[];
}

export const Statistics: React.FC<StatisticsProps> = ({ sessions }) => {
  const totalSessions = sessions.length;
  const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
  const totalDistance = sessions.reduce((sum, session) => sum + session.distance, 0);
  const totalCalories = sessions.reduce((sum, session) => sum + session.calories, 0);
  
  const averageDistance = totalSessions > 0 ? totalDistance / totalSessions : 0;
  const averageCalories = totalSessions > 0 ? totalCalories / totalSessions : 0;
  const averageSpeed = sessions.length > 0 
    ? sessions.reduce((sum, session) => sum + session.averageSpeed, 0) / sessions.length 
    : 0;

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

  const statsCards = [
    {
      title: 'Gesamteinheiten',
      value: totalSessions.toString(),
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      title: 'Gesamtzeit',
      value: formatDuration(totalTime),
      icon: Clock,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      title: 'Gesamtdistanz',
      value: `${totalDistance.toFixed(1)} km`,
      icon: MapPin,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    },
    {
      title: 'Gesamtkalorien',
      value: `${totalCalories} kcal`,
      icon: Flame,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10'
    },
    {
      title: 'Ø Distanz',
      value: `${averageDistance.toFixed(1)} km`,
      icon: TrendingUp,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10'
    },
    {
      title: 'Ø Geschwindigkeit',
      value: `${averageSpeed.toFixed(1)} km/h`,
      icon: Activity,
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/10'
    }
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">Statistiken</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-lg p-4 border border-gray-700`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Diese Woche</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Einheiten:</span>
              <span className="text-white font-medium">{thisWeekSessions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Distanz:</span>
              <span className="text-green-400 font-medium">
                {thisWeekSessions.reduce((sum, s) => sum + s.distance, 0).toFixed(1)} km
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Kalorien:</span>
              <span className="text-orange-400 font-medium">
                {thisWeekSessions.reduce((sum, s) => sum + s.calories, 0)} kcal
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Diesen Monat</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Einheiten:</span>
              <span className="text-white font-medium">{thisMonthSessions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Distanz:</span>
              <span className="text-green-400 font-medium">
                {thisMonthSessions.reduce((sum, s) => sum + s.distance, 0).toFixed(1)} km
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Kalorien:</span>
              <span className="text-orange-400 font-medium">
                {thisMonthSessions.reduce((sum, s) => sum + s.calories, 0)} kcal
              </span>
            </div>
          </div>
        </div>
      </div>

      {sessions.length > 0 && (
        <div className="mt-6 bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Persönliche Rekorde</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-400">Längste Distanz</p>
              <p className="text-xl font-bold text-green-400">
                {Math.max(...sessions.map(s => s.distance)).toFixed(2)} km
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Meiste Kalorien</p>
              <p className="text-xl font-bold text-orange-400">
                {Math.max(...sessions.map(s => s.calories))} kcal
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Längste Zeit</p>
              <p className="text-xl font-bold text-blue-400">
                {formatDuration(Math.max(...sessions.map(s => s.duration)))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};