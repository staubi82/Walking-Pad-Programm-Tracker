import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Clock, MapPin, Flame, TrendingUp, Trash2, Edit3, Footprints } from 'lucide-react';
import { TrainingSession } from '../types';
import { formatDuration, calculateStepsForExistingSession } from '../utils/calculations';
import { getUserProfile } from '../firebase/services';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

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
  const [userProfile, setUserProfile] = useState<any>({});
  const [calculatedSteps, setCalculatedSteps] = useState<number>(0);
  const { isDark } = useTheme();
  
  // Lade Benutzerprofil für Schrittzähler
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
        
        // Berechne Schritte für diese Session
        const steps = calculateStepsForExistingSession(session, profile);
        setCalculatedSteps(steps);
      } catch (error) {
        console.warn('Konnte Benutzerprofil nicht laden:', error);
        // Verwende Standardwerte
        const steps = calculateStepsForExistingSession(session, {});
        setCalculatedSteps(steps);
      }
    };
    
    loadProfile();
  }, [session]);
  
  // Erstelle Datenpunkte nur bei tatsächlichen Geschwindigkeitsänderungen
  const chartData = [];
  const speedChanges: Array<{
    x: number;
    speed: number;
    change: number;
    time: string;
    minute: number;
    second: number;
  }> = [];
  const totalDuration = session.duration;
  
  // Gruppiere speedHistory nach eindeutigen Geschwindigkeiten
  const uniqueSpeedPoints = [];
  let currentSpeed = session.speedHistory[0]?.speed || 1.0;
  
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
      
      // Berechne Minuten und Sekunden korrekt
      const totalSeconds = Math.round(timeFromStart / 30) * 30; // Runde auf 30-Sekunden-Intervalle
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      // Speichere Geschwindigkeitsänderung
      speedChanges.push({
        x: timeFromStart / 60,
        speed: point.speed,
        change: point.speed - currentSpeed,
        time: formatDuration(totalSeconds),
        minute: minutes,
        second: seconds
      });
      
      currentSpeed = point.speed;
    }
  }
  
  // Füge Endpunkt hinzu (letzte Messung)
  if (session.speedHistory.length > 0) {
    const lastPoint = session.speedHistory[session.speedHistory.length - 1];
    const lastTimeFromStart = (lastPoint.timestamp - session.speedHistory[0].timestamp) / 1000;
    
    // Begrenze auf die tatsächliche Session-Dauer
    const maxTimeFromStart = Math.min(lastTimeFromStart, totalDuration);
    
    // Nur hinzufügen wenn es sich vom letzten uniqueSpeedPoint unterscheidet
    const lastUniquePoint = uniqueSpeedPoints[uniqueSpeedPoints.length - 1];
    if (Math.abs(maxTimeFromStart - lastUniquePoint.time) > 10) { // Mindestens 10 Sekunden Unterschied
      uniqueSpeedPoints.push({
        time: maxTimeFromStart,
        speed: lastPoint.speed
      });
      
      // Füge auch zu speedChanges hinzu wenn sich die Geschwindigkeit geändert hat
      if (Math.abs(lastPoint.speed - currentSpeed) > 0.1) {
        const totalSeconds = Math.round(maxTimeFromStart / 30) * 30; // Runde auf 30-Sekunden-Intervalle
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        speedChanges.push({
          x: maxTimeFromStart / 60,
          speed: lastPoint.speed,
          change: Math.round((lastPoint.speed - currentSpeed) * 10) / 10,
          time: formatDuration(totalSeconds),
          minute: minutes,
          second: seconds
        });
      }
    }
  }
  
  // Konvertiere zu Chart-Daten (Zeit in Minuten)
  for (const point of uniqueSpeedPoints) {
    // Begrenze auch hier auf die Session-Dauer
    if (point.time <= totalDuration) {
      chartData.push([point.time / 60, Math.round(point.speed * 10) / 10]);
    }
  }

  // Highcharts Konfiguration
  const options: Highcharts.Options = {
    chart: {
      type: 'spline',
      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
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
          color: isDark ? '#9CA3AF' : '#6B7280',
          fontSize: '12px'
        }
      },
      labels: {
        style: {
          color: isDark ? '#9CA3AF' : '#6B7280',
          fontSize: '11px'
        },
        formatter: function() {
          return `${this.value}min`;
        }
      },
      gridLineColor: isDark ? '#374151' : '#E5E7EB',
      lineColor: isDark ? '#6B7280' : '#9CA3AF',
      tickColor: isDark ? '#6B7280' : '#9CA3AF',
      plotLines: speedChanges.map(change => ({
        color: change.change > 0 ? '#10B981' : '#EF4444',
        width: 1,
        value: change.x,
        dashStyle: 'Dash',
        zIndex: 1,
        label: {
          text: `${change.change > 0 ? '+' : ''}${change.change}`,
          style: {
            color: change.change > 0 ? '#10B981' : '#EF4444',
            fontSize: '10px',
            fontWeight: 'bold',
            textAlign: 'center'
          },
          verticalAlign: 'top',
          y: 15,
          x: 10,
          rotation: 0,
          textAlign: 'center'
        }
      }))
    },
    yAxis: {
      title: {
        text: 'Geschwindigkeit (km/h)',
        style: {
          color: isDark ? '#9CA3AF' : '#6B7280',
          fontSize: '12px'
        }
      },
      labels: {
        style: {
          color: isDark ? '#9CA3AF' : '#6B7280',
          fontSize: '11px'
        },
        formatter: function() {
          return `${this.value} km/h`;
        }
      },
      gridLineColor: isDark ? '#374151' : '#E5E7EB',
      lineColor: isDark ? '#6B7280' : '#9CA3AF',
      tickColor: isDark ? '#6B7280' : '#9CA3AF',
      min: Math.max(0, Math.min(...chartData.map(d => d[1])) - 0.5),
      max: Math.max(...chartData.map(d => d[1])) + 0.5
    },
    tooltip: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderColor: isDark ? '#4B5563' : '#D1D5DB',
      borderRadius: 8,
      style: {
        color: isDark ? '#FFFFFF' : '#111827',
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
    <div className={`relative rounded-lg p-4 transition-colors duration-200 ${
      isDark 
        ? 'bg-gray-700 hover:bg-gray-600' 
        : 'bg-white hover:bg-gray-50 border border-gray-200'
    }`}>
      {/* Action Buttons */}
      <div className="absolute top-3 right-3 flex space-x-2 z-10">
        {onEdit && (
          <button
            onClick={() => onEdit(session)}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-blue-400 hover:text-blue-300 bg-gray-800/80 hover:bg-gray-700/80' 
                : 'text-blue-600 hover:text-blue-700 bg-white/80 hover:bg-gray-100/80 border border-gray-200'
            }`}
            title="Bearbeiten"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(session.id)}
          className={`p-2 rounded-lg transition-colors ${
            isDark 
              ? 'text-red-400 hover:text-red-300 bg-gray-800/80 hover:bg-gray-700/80' 
              : 'text-red-600 hover:text-red-700 bg-white/80 hover:bg-gray-100/80 border border-gray-200'
          }`}
          title="Löschen"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4 pr-20">
        <div>
          <h3 className={`text-lg font-semibold mb-1 transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>{session.name}</h3>
          <p className={`text-sm transition-colors duration-200 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
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
          <span className={`text-sm transition-colors duration-200 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Geschwindigkeitsverlauf</span>
          <div className={`flex items-center space-x-4 text-xs transition-colors duration-200 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <span>Min: {Math.min(...chartData.map(d => d[1])).toFixed(1)} km/h</span>
            <span>Max: {Math.max(...chartData.map(d => d[1])).toFixed(1)} km/h</span>
            <span>Ø: {session.averageSpeed.toFixed(1)} km/h</span>
          </div>
        </div>
        
        {/* Highcharts Container */}
        <div className={`rounded-lg overflow-hidden transition-colors duration-200 ${
          isDark ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
          />
        </div>
        
        {/* Legende für Geschwindigkeitsänderungen */}
        {speedChanges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className={`transition-colors duration-200 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>Timeline-Punkte ({speedChanges.length}):</span>
            {speedChanges.slice(0, 6).map((change, index) => (
              <span 
                key={index}
                className={`px-2 py-1 rounded ${
                  change.change > 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                }`}
              >
                {change.minute}:{change.second.toString().padStart(2, '0')}: {change.change > 0 ? '+' : ''}{change.change} km/h
              </span>
            ))}
            {speedChanges.length > 6 && (
              <span className={`transition-colors duration-200 ${
                isDark ? 'text-gray-500' : 'text-gray-600'
              }`}>+{speedChanges.length - 6} weitere</span>
            )}
          </div>
        )}
      </div>
      
      {/* Details */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <div>
            <p className="text-xs text-gray-400">Dauer</p>
            <p className={`text-sm font-medium transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{formatDuration(session.duration)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-green-400" />
          <div>
            <p className="text-xs text-gray-400">Distanz</p>
            <p className={`text-sm font-medium transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{session.distance.toFixed(2)} km</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <div>
            <p className="text-xs text-gray-400">Kalorien</p>
            <p className={`text-sm font-medium transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{session.calories} kcal</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <div>
            <p className="text-xs text-gray-400">Max Speed</p>
            <p className={`text-sm font-medium transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{session.maxSpeed.toFixed(1)} km/h</p>
          </div>
        </div>
        
        {/* Schritte - falls verfügbar */}
        {(session.steps || calculatedSteps > 0) && (
          <div className="flex items-center space-x-2">
            <Footprints className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-xs text-gray-400">Schritte</p>
              <p className={`text-sm font-medium transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {((session.steps || calculatedSteps) / 1000).toFixed(1)}k
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};