import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Timer, Heart, Activity } from 'lucide-react';

interface LiveTrackerProps {
  onSessionComplete: (sessionData: any) => void;
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
}

export const LiveTracker: React.FC<LiveTrackerProps> = ({ 
  onSessionComplete, 
  isRecording, 
  onRecordingChange 
}) => {
  const [duration, setDuration] = useState(0);
  const [heartRate, setHeartRate] = useState(0);
  const [calories, setCalories] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
        // Simuliere Herzfrequenz zwischen 120-180
        setHeartRate(Math.floor(Math.random() * 60) + 120);
        // Simuliere Kalorienverbrauch
        setCalories(prev => prev + 0.2);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    onRecordingChange(true);
  };

  const handlePause = () => {
    onRecordingChange(false);
  };

  const handleStop = () => {
    onRecordingChange(false);
    
    const sessionData = {
      duration,
      heartRate,
      calories: Math.round(calories),
      timestamp: new Date().toISOString(),
    };
    
    onSessionComplete(sessionData);
    
    // Reset values
    setDuration(0);
    setHeartRate(0);
    setCalories(0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Activity className="mr-3 text-blue-600" />
          Live Training Tracker
        </h2>
        
        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className="text-6xl font-mono font-bold text-gray-800 mb-2">
            {formatTime(duration)}
          </div>
          <div className="text-gray-500 flex items-center justify-center">
            <Timer className="mr-2" size={20} />
            Trainingszeit
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Heart className="text-red-500 mr-2" size={24} />
              <span className="text-red-700 font-semibold">Herzfrequenz</span>
            </div>
            <div className="text-3xl font-bold text-red-600">
              {heartRate}
            </div>
            <div className="text-red-500 text-sm">BPM</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="text-orange-500 mr-2" size={24} />
              <span className="text-orange-700 font-semibold">Kalorien</span>
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {Math.round(calories)}
            </div>
            <div className="text-orange-500 text-sm">kcal</div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4">
          {!isRecording ? (
            <button
              onClick={handleStart}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center transition-colors"
            >
              <Play className="mr-2" size={20} />
              Start
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center transition-colors"
              >
                <Pause className="mr-2" size={20} />
                Pause
              </button>
              <button
                onClick={handleStop}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center transition-colors"
              >
                <Square className="mr-2" size={20} />
                Stop
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};