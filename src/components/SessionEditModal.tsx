import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, MapPin, Flame, Plus, Trash2, Edit3 } from 'lucide-react';
import { TrainingSession, SpeedPoint } from '../types';
import { formatDuration, calculateDistance, calculateCalories } from '../utils/calculations';

interface SessionEditModalProps {
  session: TrainingSession;
  onSave: (updatedSession: TrainingSession) => void;
  onCancel: () => void;
}

interface TimelineEntry {
  id: string;
  minute: number;
  speed: number;
}

const difficultyLevels = [
  { id: 'anfaenger', label: 'Anfänger 🚶‍♀️', color: 'bg-green-600' },
  { id: 'leicht', label: 'Leicht 🚶‍♂️', color: 'bg-blue-600' },
  { id: 'mittel', label: 'Mittel 🏃‍♀️', color: 'bg-yellow-600' },
  { id: 'schwer', label: 'Schwer 🏃‍♂️', color: 'bg-orange-600' },
  { id: 'extrem', label: 'Extrem 🔥', color: 'bg-red-600' },
  { id: 'selbstmord', label: 'Selbstmord 💀', color: 'bg-purple-600' }
];

export const SessionEditModal: React.FC<SessionEditModalProps> = ({ session, onSave, onCancel }) => {
  const [editedSession, setEditedSession] = useState<TrainingSession>({ ...session });
  const [nameError, setNameError] = useState('');
  const [showTimelineEdit, setShowTimelineEdit] = useState(false);
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);

  // Initialisiere Timeline-Einträge basierend auf der aktuellen Session
  useEffect(() => {
    const entries = extractTimelineFromSession(session);
    setTimelineEntries(entries);
  }, [session]);

  // Extrahiere Timeline-Einträge aus der Session
  const extractTimelineFromSession = (session: TrainingSession): TimelineEntry[] => {
    const entries: TimelineEntry[] = [];
    const speedHistory = session.speedHistory;
    
    if (speedHistory.length === 0) {
      return [{ id: '1', minute: 0, speed: 1.0 }];
    }

    let currentSpeed = speedHistory[0].speed;
    let entryId = 1;
    
    // Füge Startpunkt hinzu
    entries.push({
      id: entryId.toString(),
      minute: 0,
      speed: Math.round(currentSpeed * 10) / 10
    });
    entryId++;

    // Durchlaufe speedHistory und finde Geschwindigkeitsänderungen
    for (let i = 1; i < speedHistory.length; i++) {
      const point = speedHistory[i];
      const timeFromStart = (point.timestamp - speedHistory[0].timestamp) / 1000;
      const minute = Math.round(timeFromStart / 60);
      
      // Wenn sich die Geschwindigkeit signifikant ändert
      if (Math.abs(point.speed - currentSpeed) > 0.1) {
        entries.push({
          id: entryId.toString(),
          minute: minute,
          speed: Math.round(point.speed * 10) / 10
        });
        entryId++;
        currentSpeed = point.speed;
      }
    }

    // Entferne Duplikate basierend auf Minute
    const uniqueEntries = entries.filter((entry, index, self) => 
      index === self.findIndex(e => e.minute === entry.minute)
    );

    return uniqueEntries.length > 0 ? uniqueEntries : [{ id: '1', minute: 0, speed: 1.0 }];
  };

  // Berechne neue Session-Daten basierend auf Timeline
  const calculateUpdatedSession = (): TrainingSession => {
    if (!showTimelineEdit) {
      return editedSession;
    }

    // Sortiere Einträge nach Minuten
    const sortedEntries = [...timelineEntries].sort((a, b) => a.minute - b.minute);
    
    if (sortedEntries.length === 0) {
      return editedSession;
    }

    const maxMinute = Math.max(...sortedEntries.map(entry => entry.minute));
    const newDuration = maxMinute * 60;
    
    // Erstelle neuen Geschwindigkeitsverlauf
    const now = Date.now();
    const newSpeedHistory: SpeedPoint[] = [];
    
    for (let minute = 0; minute <= maxMinute; minute++) {
      // Finde die Geschwindigkeit für diese Minute
      let currentSpeedForMinute = 1.0;
      
      // Finde den letzten Eintrag vor oder bei dieser Minute
      for (let i = sortedEntries.length - 1; i >= 0; i--) {
        if (sortedEntries[i].minute <= minute) {
          currentSpeedForMinute = sortedEntries[i].speed;
          break;
        }
      }
      
      // Füge Datenpunkte für diese Minute hinzu (alle 10 Sekunden)
      for (let second = 0; second < 60; second += 10) {
        newSpeedHistory.push({
          timestamp: now + (minute * 60 + second) * 1000,
          speed: currentSpeedForMinute
        });
      }
    }

    // Berechne neue Statistiken
    const newDistance = calculateDistance(newSpeedHistory);
    const newCalories = calculateCalories(newSpeedHistory);
    const newAverageSpeed = newSpeedHistory.reduce((sum, point) => sum + point.speed, 0) / newSpeedHistory.length;
    const newMaxSpeed = Math.max(...newSpeedHistory.map(point => point.speed));

    return {
      ...editedSession,
      duration: newDuration,
      distance: newDistance,
      calories: newCalories,
      averageSpeed: Math.round(newAverageSpeed * 10) / 10,
      maxSpeed: newMaxSpeed,
      speedHistory: newSpeedHistory
    };
  };

  const handleSave = () => {
    if (!editedSession.name.trim()) {
      setNameError('Name darf nicht leer sein');
      return;
    }

    if (showTimelineEdit && timelineEntries.length < 1) {
      alert('Mindestens ein Timeline-Eintrag erforderlich.');
      return;
    }

    setNameError('');
    const updatedSession = calculateUpdatedSession();
    onSave(updatedSession);
  };

  const handleNameChange = (name: string) => {
    setEditedSession(prev => ({ ...prev, name }));
    if (nameError) setNameError('');
  };

  const handleDifficultyChange = (difficulty: string) => {
    setEditedSession(prev => ({ ...prev, difficulty }));
  };

  // Timeline-Funktionen
  const addTimelineEntry = () => {
    const lastEntry = timelineEntries[timelineEntries.length - 1];
    const newMinute = lastEntry ? lastEntry.minute + 1 : 0;
    
    setTimelineEntries(prev => [...prev, {
      id: Date.now().toString(),
      minute: newMinute,
      speed: 1.0
    }]);
  };

  const removeTimelineEntry = (id: string) => {
    if (timelineEntries.length > 1) {
      setTimelineEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const updateTimelineEntry = (id: string, field: 'minute' | 'speed', value: number) => {
    setTimelineEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  // Berechne Vorschau-Statistiken
  const previewSession = calculateUpdatedSession();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Training bearbeiten</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Aktuelle vs. Neue Statistiken */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Aktuelle Statistiken */}
          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">Aktuelle Werte</h3>
            <div className="grid grid-cols-2 gap-3">
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
                <Calendar className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-xs text-gray-400">Ø Speed</p>
                  <p className="text-sm font-medium text-white">{session.averageSpeed.toFixed(1)} km/h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Neue Statistiken (Vorschau) */}
          {showTimelineEdit && (
            <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-700">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">Neue Werte (Vorschau)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-xs text-blue-400">Dauer</p>
                    <p className="text-sm font-medium text-white">{formatDuration(previewSession.duration)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <div>
                    <p className="text-xs text-blue-400">Distanz</p>
                    <p className="text-sm font-medium text-white">{previewSession.distance.toFixed(2)} km</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <div>
                    <p className="text-xs text-blue-400">Kalorien</p>
                    <p className="text-sm font-medium text-white">{previewSession.calories} kcal</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-xs text-blue-400">Ø Speed</p>
                    <p className="text-sm font-medium text-white">{previewSession.averageSpeed.toFixed(1)} km/h</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bearbeitbare Felder */}
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name der Trainingseinheit
            </label>
            <input
              type="text"
              value={editedSession.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="z.B. Morgendliches Walking"
            />
            {nameError && (
              <p className="mt-1 text-sm text-red-400">{nameError}</p>
            )}
          </div>

          {/* Schwierigkeitsgrad */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Schwierigkeitslevel
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <button
                onClick={() => handleDifficultyChange('')}
                className={`px-3 py-2 rounded-lg text-white text-sm font-medium transition-all ${
                  !editedSession.difficulty 
                    ? 'bg-gray-500 ring-2 ring-white' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                Kein Level
              </button>
              {difficultyLevels.map(level => (
                <button
                  key={level.id}
                  onClick={() => handleDifficultyChange(level.id)}
                  className={`${level.color} hover:opacity-80 px-3 py-2 rounded-lg text-white text-sm font-medium transition-all ${
                    editedSession.difficulty === level.id ? 'ring-2 ring-white' : ''
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline-Bearbeitung */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-300">
                Geschwindigkeits-Timeline
              </label>
              <button
                onClick={() => setShowTimelineEdit(!showTimelineEdit)}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-white transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>{showTimelineEdit ? 'Timeline ausblenden' : 'Timeline bearbeiten'}</span>
              </button>
            </div>

            {showTimelineEdit && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-white">Timeline-Einträge</h4>
                  <button
                    onClick={addTimelineEntry}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg flex items-center space-x-1 text-white text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Hinzufügen</span>
                  </button>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {timelineEntries.map((entry, index) => (
                    <div key={entry.id} className="bg-gray-700 rounded-lg p-3 flex items-center space-x-4">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Minute</label>
                          <input
                            type="number"
                            min="0"
                            value={entry.minute}
                            onChange={(e) => updateTimelineEntry(entry.id, 'minute', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Geschwindigkeit (km/h)</label>
                          <input
                            type="number"
                            min="1.0"
                            max="6.0"
                            step="0.5"
                            value={entry.speed}
                            onChange={(e) => updateTimelineEntry(entry.id, 'speed', parseFloat(e.target.value) || 1.0)}
                            className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                      
                      {timelineEntries.length > 1 && (
                        <button
                          onClick={() => removeTimelineEntry(entry.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Timeline-Vorschau */}
                {timelineEntries.length > 0 && (
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <h5 className="text-sm font-semibold text-white mb-2">Timeline-Vorschau:</h5>
                    <div className="text-xs text-gray-300 space-y-1 max-h-32 overflow-y-auto">
                      {timelineEntries
                        .sort((a, b) => a.minute - b.minute)
                        .map((entry, index) => (
                          <div key={entry.id} className="flex justify-between">
                            <span>Minute {entry.minute}:</span>
                            <span className="text-blue-400">{entry.speed} km/h</span>
                          </div>
                        ))}
                      <div className="border-t border-gray-600 pt-1 mt-2 flex justify-between font-semibold">
                        <span>Gesamtdauer:</span>
                        <span className="text-green-400">
                          {Math.max(...timelineEntries.map(e => e.minute))} Minuten
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-700">
            <p className="text-blue-300 text-sm">
              💡 <strong>Bearbeitungsoptionen:</strong> 
              <br />• <strong>Name & Schwierigkeit:</strong> Jederzeit änderbar
              <br />• <strong>Timeline bearbeiten:</strong> Vollständige Anpassung von Zeiten und Geschwindigkeiten
              <br />• <strong>Automatische Berechnung:</strong> Distanz, Kalorien und Durchschnittswerte werden neu berechnet
              <br />• <strong>Vorschau:</strong> Sehen Sie die neuen Werte vor dem Speichern
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-8">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg flex items-center justify-center space-x-2 text-white font-medium transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>Änderungen speichern</span>
          </button>
          
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-medium transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};