import React from 'react';
import { Clock, MapPin, Flame, TrendingUp, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrainingSession } from '../types';
import { formatDuration } from '../utils/calculations';

interface ProgramChartProps {
  session: TrainingSession;
  onDelete: (id: string) => void;
}

const difficultyColors = {
  'anfaenger': 'bg-green-500',
  'leicht': 'bg-blue-500',
  'mittel': 'bg-yellow-500',
  'schwer': 'bg-orange-500',
  'extrem': 'bg-red-500',
  'selbstmord': 'bg-purple-500'
};

const difficultyLabels = {
  'anfaenger': 'Anfänger 🚶‍♀️',
  'leicht': 'Leicht 🚶‍♂️',
  'mittel': 'Mittel 🏃‍♀️',
  'schwer': 'Schwer 🏃‍♂️',
  'extrem': 'Extrem 🔥',
  'selbstmord': 'Selbstmord 💀'
};

export const ProgramChart: React.FC<ProgramChartProps> = ({ session, onDelete }) => {
  // Erstelle Datenpunkte für das Chart (alle 30 Sekunden)
  const chartData = [];
  const totalDuration = session.duration;
  const interval = Math.max(30, Math.floor(totalDuration / 120)); // Maximal 120 Punkte für Performance
  
  for (let time = 0; time <= totalDuration; time += interval) {
    // Finde die Geschwindigkeit zum Zeitpunkt
    const targetTimestamp = session.speedHistory[0]?.timestamp + (time * 1000);
    let speed = 1.0;
    
    // Finde den nächstgelegenen Geschwindigkeitswert
    for (let i = 0; i < session.speedHistory.length; i++) {
      if (session.speedHistory[i].timestamp <= targetTimestamp) {
        speed = session.speedHistory[i].speed;
      } else {
        break;
      }
    }
    
    chartData.push({
      time: Math.floor(time / 60), // Zeit in Minuten
      timeFormatted: formatDuration(time),
      speed: Math.round(speed * 10) / 10,
      timeSeconds: time
    });
  }
  
  // Finde Geschwindigkeitsänderungen für Referenzlinien
  const speedChanges = [];
  for (let i = 1; i < chartData.length; i++) {
    const currentSpeed = chartData[i].speed;
    const prevSpeed = chartData[i - 1].speed;
    
    // Wenn sich die Geschwindigkeit um mehr als 0.5 km/h ändert
    if (Math.abs(currentSpeed - prevSpeed) > 0.5) {
      speedChanges.push({
        time: chartData[i].time,
        speed: currentSpeed,
        change: currentSpeed - prevSpeed
      });
    }
  }

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{`Zeit: ${data.timeFormatted}`}</p>
          <p className="text-green-400">{`Geschwindigkeit: ${data.speed} km/h`}</p>
        </div>
      );
    }
    return null;
  };

  // Berechne Y-Achsen Bereich
  const minSpeed = Math.min(...chartData.map(d => d.speed));
  const maxSpeed = Math.max(...chartData.map(d => d.speed));
  const speedPadding = (maxSpeed - minSpeed) * 0.1;
  const yAxisMin = Math.max(0, minSpeed - speedPadding);
  const yAxisMax = maxSpeed + speedPadding;

  return (
    <div className="relative bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
      {/* Löschen-Button */}
      <button
        onClick={() => onDelete(session.id)}
        className="absolute top-3 right-3 text-red-400 hover:text-red-300 p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700/80 transition-colors z-10"
        title="Löschen"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4 pr-12">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{session.name}</h3>
          <p className="text-sm text-gray-400">
            {new Date(session.date).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        {session.difficulty && (
          <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
            difficultyColors[session.difficulty as keyof typeof difficultyColors] || 'bg-gray-500'
          }`}>
            {difficultyLabels[session.difficulty as keyof typeof difficultyLabels] || session.difficulty}
          </span>
        )}
      </div>
      
      {/* Geschwindigkeits-Chart */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-400">Geschwindigkeitsverlauf</span>
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span>Min: {minSpeed.toFixed(1)} km/h</span>
            <span>Max: {maxSpeed.toFixed(1)} km/h</span>
            <span>Ø: {session.averageSpeed.toFixed(1)} km/h</span>
          </div>
        </div>
        
        {/* Recharts Chart */}
        <div className="bg-gray-800 rounded-lg p-3 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#374151" 
                opacity={0.3}
              />
              <XAxis 
                dataKey="time"
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `${value}min`}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                domain={[yAxisMin, yAxisMax]}
                tickFormatter={(value) => `${value.toFixed(1)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Referenzlinien für Geschwindigkeitsänderungen */}
              {speedChanges.map((change, index) => (
                <ReferenceLine 
                  key={index}
                  x={change.time} 
                  stroke={change.change > 0 ? "#10B981" : "#EF4444"}
                  strokeDasharray="5 5"
                  opacity={0.6}
                />
              ))}
              
              {/* Hauptlinie */}
              <Line 
                type="monotone" 
                dataKey="speed" 
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#ffffff' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legende für Geschwindigkeitsänderungen */}
        {speedChanges.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="text-gray-400">Geschwindigkeitsänderungen:</span>
            {speedChanges.slice(0, 5).map((change, index) => (
              <span 
                key={index}
                className={`px-2 py-1 rounded ${
                  change.change > 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                }`}
              >
                {change.time}min: {change.change > 0 ? '+' : ''}{change.change.toFixed(1)} km/h
              </span>
            ))}
            {speedChanges.length > 5 && (
              <span className="text-gray-500">+{speedChanges.length - 5} weitere</span>
            )}
          </div>
        )}
      </div>
      
      {/* Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <div>
            <p className="text-xs text-gray-400">Dauer</p>
            <p className="text-sm font-medium text-white">{formatDuration(session.duration)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-green-400" />
          <div>
            <p className="text-xs text-gray-400">Distanz</p>
            <p className="text-sm font-medium text-white">{session.distance.toFixed(2)} km</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <div>
            <p className="text-xs text-gray-400">Kalorien</p>
            <p className="text-sm font-medium text-white">{session.calories} kcal</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <div>
            <p className="text-xs text-gray-400">Max Speed</p>
            <p className="text-sm font-medium text-white">{session.maxSpeed.toFixed(1)} km/h</p>
          </div>
        </div>
      </div>
    </div>
  );
};