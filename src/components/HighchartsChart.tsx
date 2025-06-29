import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Clock, MapPin, Flame, TrendingUp, Trash2, Edit3 } from 'lucide-react';
import { TrainingSession } from '../types';
import { formatDuration } from '../utils/calculations';

interface HighchartsChartProps {
  session: TrainingSession;
  onDelete: (id: string) => void;
  onEdit?: (session: TrainingSession) => void;
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

export const HighchartsChart: React.FC<HighchartsChartProps> = ({ session, onDelete, onEdit }) => {
  // Erstelle Datenpunkte nur bei tatsächlichen Geschwindigkeitsänderungen
  const chartData = [];
  const speedChanges = [];
  const totalDuration = session.duration;
  
  // Gruppiere speedHistory nach eindeutigen Geschwindigkeiten
  const uniqueSpeedPoints = [];
  let currentSpeed = session.speedHistory[0]?.speed || 1.0;
  let currentStartTime = 0;
  
  // Füge Startpunkt hinzu
  uniqueSpeedPoints.push({
    time: 0,
    speed: currentSpeed
  });
  
  // Durchlaufe speedHistory und finde echte Änderungen
  for (let i = 1; i < session.speedHistory.length; i++) {
    const point = session.speedHistory[i];
    const timeFromStart = (point.timestamp - session.speedHistory[0].timestamp) / 1000;
    
    // Wenn sich die Geschwindigkeit ändert
    if (Math.abs(point.speed - currentSpeed) > 0.1) {
      uniqueSpeedPoints.push({
        time: timeFromStart,
        speed: point.speed
      });
      
      // Speichere Geschwindigkeitsänderung
      speedChanges.push({
        x: timeFromStart / 60,
        speed: point.speed,
        change: point.speed - currentSpeed,
        time: formatDuration(timeFromStart)
      });
      
      currentSpeed = point.speed;
    }
  }
  
  // Füge Endpunkt hinzu falls nötig
  const lastPoint = uniqueSpeedPoints[uniqueSpeedPoints.length - 1];
  if (lastPoint.time < totalDuration - 10) {
    uniqueSpeedPoints.push({
      time: totalDuration,
      speed: currentSpeed
    });
  }
  
  // Konvertiere zu Chart-Daten (Zeit in Minuten)
  for (const point of uniqueSpeedPoints) {
    chartData.push([point.time / 60, Math.round(point.speed * 10) / 10]);
  }

  // Highcharts Konfiguration
  const options: Highcharts.Options = {
    chart: {
      type: 'spline',
      backgroundColor: '#1F2937',
      borderRadius: 8,
      height: 200,
      spacing: [10, 10, 10, 10],
      style: {
        fontFamily: 'Inter, system-ui, sans-serif'
      }
    },
    title: {
      text: '',
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: false
    },
    xAxis: {
      title: {
        text: 'Zeit (Minuten)',
        style: {
          color: '#9CA3AF',
          fontSize: '12px'
        }
      },
      labels: {
        style: {
          color: '#9CA3AF',
          fontSize: '11px'
        },
        formatter: function() {
          return `${this.value}min`;
        }
      },
      gridLineColor: '#374151',
      lineColor: '#6B7280',
      tickColor: '#6B7280',
      plotLines: speedChanges.map(change => ({
        color: change.change > 0 ? '#10B981' : '#EF4444',
        width: 1,
        value: change.x,
        dashStyle: 'Dash',
        zIndex: 1,
        label: {
          text: `${change.change > 0 ? '+' : ''}${change.change.toFixed(1)}`,
          style: {
            color: change.change > 0 ? '#10B981' : '#EF4444',
            fontSize: '10px',
            fontWeight: 'bold'
          },
          verticalAlign: 'top',
          y: 15
        }
      }))
    },
    yAxis: {
      title: {
        text: 'Geschwindigkeit (km/h)',
        style: {
          color: '#9CA3AF',
          fontSize: '12px'
        }
      },
      labels: {
        style: {
          color: '#9CA3AF',
          fontSize: '11px'
        },
        formatter: function() {
          return `${this.value} km/h`;
        }
      },
      gridLineColor: '#374151',
      lineColor: '#6B7280',
      tickColor: '#6B7280',
      min: Math.max(0, Math.min(...chartData.map(d => d[1])) - 0.5),
      max: Math.max(...chartData.map(d => d[1])) + 0.5
    },
    tooltip: {
      backgroundColor: '#1F2937',
      borderColor: '#4B5563',
      borderRadius: 8,
      style: {
        color: '#FFFFFF',
        fontSize: '12px'
      },
      formatter: function() {
        const timeInSeconds = (this.x as number) * 60;
        return `
          <div style="padding: 8px;">
            <strong>Zeit:</strong> ${formatDuration(timeInSeconds)}<br/>
            <strong>Geschwindigkeit:</strong> <span style="color: #10B981;">${this.y} km/h</span>
          </div>
        `;
      },
      useHTML: true
    },
    plotOptions: {
      line: {
        lineWidth: 3,
        step: 'left', // Horizontale Linien bis zur nächsten Änderung
        states: {
          hover: {
            lineWidth: 4
          }
        },
        marker: {
          enabled: true,
          radius: 5, // Größere Marker für bessere Sichtbarkeit
          states: {
            hover: {
              enabled: true,
              radius: 8
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    },
    series: [{
      type: 'line',
      name: 'Geschwindigkeit',
      data: chartData,
      color: '#10B981',
      fillOpacity: 0.1,
      step: 'left', // Wichtig: Auch hier step definieren
      marker: {
        fillColor: '#10B981',
        lineWidth: 3,
        lineColor: '#FFFFFF',
        symbol: 'circle'
      }
    }]
  };

  return (
    <div className="relative bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
      {/* Action Buttons */}
      <div className="absolute top-3 right-3 flex space-x-2 z-10">
        {onEdit && (
          <button
            onClick={() => onEdit(session)}
            className="text-blue-400 hover:text-blue-300 p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
            title="Bearbeiten"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(session.id)}
          className="text-red-400 hover:text-red-300 p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
          title="Löschen"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4 pr-20">
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
      
      {/* Highcharts Chart */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-400">Geschwindigkeitsverlauf</span>
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span>Min: {Math.min(...chartData.map(d => d[1])).toFixed(1)} km/h</span>
            <span>Max: {Math.max(...chartData.map(d => d[1])).toFixed(1)} km/h</span>
            <span>Ø: {session.averageSpeed.toFixed(1)} km/h</span>
          </div>
        </div>
        
        {/* Highcharts Container */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
          />
        </div>
        
        {/* Legende für Geschwindigkeitsänderungen */}
        {speedChanges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="text-gray-400">Timeline-Punkte ({speedChanges.length}):</span>
            {speedChanges.slice(0, 6).map((change, index) => (
              <span 
                key={index}
                className={`px-2 py-1 rounded ${
                  change.change > 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                }`}
              >
                {change.time}: {change.change > 0 ? '+' : ''}{change.change.toFixed(1)} km/h
              </span>
            ))}
            {speedChanges.length > 6 && (
              <span className="text-gray-500">+{speedChanges.length - 6} weitere</span>
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