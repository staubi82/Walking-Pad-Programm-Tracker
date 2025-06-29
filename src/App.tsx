import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Activity, BarChart3, History, AlertCircle, Play } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { LandingPage } from './components/LandingPage';
import { PasswordResetPage } from './components/Auth/PasswordResetPage';
import { ProfilePage } from './components/Auth/ProfilePage';
import { LiveTracker } from './components/LiveTracker';
import { SessionHistory } from './components/SessionHistory';
import { Statistics } from './components/Statistics';
import { TrainingSession } from './types';
import { saveTrainingSession, getTrainingSessions, deleteTrainingSession, updateTrainingSession } from './firebase/services';
import { formatDate } from './utils/calculations';
import { SessionEditModal } from './components/SessionEditModal';

interface RecordingState {
  isRecording: boolean;
  sessionName: string;
  duration: number;
  currentSpeed: number;
}

const MainApp: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'tracker' | 'history' | 'stats'>('overview');
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [firebaseConfigured, setFirebaseConfigured] = useState(true);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);

  // Recording State für Header-Indikator
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    sessionName: '',
    duration: 0,
    currentSpeed: 0
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    sessionId: string;
    sessionName: string;
  }>({ show: false, sessionId: '', sessionName: '' });

  useEffect(() => {
    if (isAuthenticated) {
      loadSessions();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      if (firebaseConfigured && isAuthenticated) {
        try {
          const loadedSessions = await getTrainingSessions();
          setSessions(loadedSessions);
        } catch (firebaseError) {
          console.warn('Firebase nicht verfügbar, wechsle zu lokaler Speicherung:', firebaseError);
          if (firebaseError.message.includes('Missing or insufficient permissions')) {
            setFirebaseConfigured(false);
            // Lade aus localStorage wenn Firebase nicht verfügbar ist
            const localSessions = JSON.parse(localStorage.getItem('walkingPadSessions') || '[]');
            setSessions(localSessions);
          } else {
          const localSessions = JSON.parse(localStorage.getItem('walkingPadSessions') || '[]').map((session: any) => ({
            ...session,
            date: new Date(session.date),
            createdAt: new Date(session.createdAt)
          }));
          }
        }
      } else {
        // Lade aus localStorage wenn Firebase nicht verfügbar ist
        const localSessions = JSON.parse(localStorage.getItem('walkingPadSessions') || '[]').map((session: any) => ({
          ...session,
          date: new Date(session.date),
          createdAt: new Date(session.createdAt)
        }));
        setSessions(localSessions);
      }
    } catch (error) {
      console.error('Allgemeiner Fehler beim Laden der Trainingseinheiten:', error);
      // Fallback auf leeres Array
      const localSessions = JSON.parse(localStorage.getItem('walkingPadSessions') || '[]').map((session: any) => ({
        ...session,
        date: new Date(session.date),
        createdAt: new Date(session.createdAt)
      }));
      setSessions(localSessions);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionComplete = async (sessionData: {
    name: string;
    duration: number;
    distance: number;
    calories: number;
    averageSpeed: number;
    maxSpeed: number;
    speedHistory: Array<{timestamp: number, speed: number}>;
  }) => {
    try {
      const newSession: Omit<TrainingSession, 'id'> = {
        ...sessionData,
        date: new Date(),
        createdAt: new Date()
      };

      if (firebaseConfigured) {
        await saveTrainingSession(newSession);
        await loadSessions();
      } else {
        // Fallback: Save to localStorage if Firebase is not configured
        const localSessions = JSON.parse(localStorage.getItem('walkingPadSessions') || '[]');
        const sessionWithId = { ...newSession, id: Date.now().toString() };
        const sessionToStore = {
          ...sessionWithId,
          date: sessionWithId.date.toISOString(),
          createdAt: sessionWithId.createdAt.toISOString()
        };
        localSessions.push(sessionToStore);
        localStorage.setItem('walkingPadSessions', JSON.stringify(localSessions));
        setSessions(prev => [sessionWithId as TrainingSession, ...prev]);
      }

      setActiveTab('overview'); // Switch to overview tab after completing session
    } catch (error) {
      console.error('Fehler beim Speichern der Trainingseinheit:', error);
    }
  };

  const handleDeleteSession = async (id: string) => {
    // Finde die Session für den Namen
    const sessionToDelete = sessions.find(session => session.id === id);
    if (!sessionToDelete) return;
    
    // Zeige Bestätigungsdialog
    setDeleteConfirmation({
      show: true,
      sessionId: id,
      sessionName: sessionToDelete.name
    });
  };

  const confirmDelete = async () => {
    const { sessionId } = deleteConfirmation;

    try {
      if (firebaseConfigured) {
        await deleteTrainingSession(sessionId);
        await loadSessions();
      } else {
        // Fallback: Remove from localStorage
        const localSessions = JSON.parse(localStorage.getItem('walkingPadSessions') || '[]');
        const filtered = localSessions.filter((session: TrainingSession) => session.id !== sessionId);
        localStorage.setItem('walkingPadSessions', JSON.stringify(filtered));
        setSessions(prev => prev.filter(session => session.id !== sessionId));
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Trainingseinheit:', error);
    } finally {
      setDeleteConfirmation({ show: false, sessionId: '', sessionName: '' });
    }
  };

  const handleEditSession = (session: TrainingSession) => {
    setEditingSession(session);
  };

  const handleSaveEditedSession = async (updatedSession: TrainingSession) => {
    try {
      if (firebaseConfigured && isAuthenticated) {
        await updateTrainingSession(updatedSession.id, {
          name: updatedSession.name,
          date: updatedSession.date,
          duration: updatedSession.duration,
          distance: updatedSession.distance,
          calories: updatedSession.calories,
          averageSpeed: updatedSession.averageSpeed,
          maxSpeed: updatedSession.maxSpeed,
          speedHistory: updatedSession.speedHistory,
          difficulty: updatedSession.difficulty
        });
        await loadSessions();
      } else {
        // Fallback: Update in localStorage
        const localSessions = JSON.parse(localStorage.getItem('walkingPadSessions') || '[]').map((session: any) => ({
          ...session,
          date: new Date(session.date),
          createdAt: new Date(session.createdAt)
        }));
        const updatedSessions = localSessions.map((session: TrainingSession) => 
          session.id === updatedSession.id ? updatedSession : session
        );
        const sessionsToStore = updatedSessions.map(session => ({
          ...session,
          date: session.date.toISOString(),
          createdAt: session.createdAt.toISOString()
        }));
        localStorage.setItem('walkingPadSessions', JSON.stringify(sessionsToStore));
        setSessions(prev => prev.map(session => 
          session.id === updatedSession.id ? updatedSession : session
        ));
      }
      setEditingSession(null);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Trainingseinheit:', error);
    }
  };

  const handleRecordingChange = (isRecording: boolean, sessionData?: Partial<RecordingState>) => {
    setRecordingState(prev => ({
      ...prev,
      isRecording,
      ...sessionData
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white">Lade Daten...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: Activity },
    { id: 'tracker', label: 'Live Tracking', icon: Play },
    { id: 'history', label: 'Programme', icon: History },
    { id: 'stats', label: 'Statistiken', icon: BarChart3 }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Activity className="w-8 h-8 text-green-500" />
              <h1 className="text-2xl font-bold text-white">Walking-Pad Tracker</h1>
              
              {/* Recording Indicator */}
              {recordingState.isRecording && (
                <div 
                  onClick={() => setActiveTab('tracker')}
                  className="flex items-center space-x-3 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg cursor-pointer transition-all animate-pulse"
                  title="Klicken um zur laufenden Aufzeichnung zu wechseln"
                >
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <div className="text-white">
                    <div className="text-sm font-medium">🔴 AUFZEICHNUNG LÄUFT</div>
                    <div className="text-xs opacity-90">
                      {recordingState.sessionName || 'Unbenanntes Training'} • {formatDuration(recordingState.duration)}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {!firebaseConfigured && (
                <div className="flex items-center space-x-2 text-yellow-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">Lokale Speicherung aktiv</span>
                </div>
              )}
              
              {/* User Menu */}
              {currentUser && (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm text-white font-medium">
                      {currentUser.displayName || 'Benutzer'}
                    </p>
                    <p className="text-xs text-gray-400">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => window.location.href = '/profile'}
                    className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center hover:from-green-500 hover:to-blue-600 transition-all"
                  >
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profil"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-400'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">
                Willkommen zurück, {currentUser?.displayName || 'Benutzer'}!
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Schnellstart</h3>
                  <p className="text-gray-300 mb-4">Starten Sie sofort ein neues Training</p>
                  <button
                    onClick={() => setActiveTab('tracker')}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-white font-medium transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>Neues Training</span>
                  </button>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Letzte Aktivität</h3>
                  {sessions.length > 0 ? (
                    <div>
                      <p className="text-gray-300">{sessions[0].name}</p>
                      <p className="text-sm text-gray-400">{formatDate(sessions[0].date)}</p>
                      <p className="text-green-400 font-medium">{sessions[0].distance.toFixed(2)} km</p>
                    </div>
                  ) : (
                    <p className="text-gray-400">Noch keine Trainings absolviert</p>
                  )}
                </div>
              </div>
            </div>
            
            <SessionHistory 
              sessions={sessions.slice(0, 5)} 
              onDeleteSession={handleDeleteSession}
              onEditSession={handleEditSession}
              showTitle={true}
              title="Letzte Programme"
              showControls={false}
            />
          </div>
        )}
        
        {activeTab === 'tracker' && (
          <LiveTracker 
            onSessionComplete={handleSessionComplete}
            isRecording={recordingState.isRecording}
            onRecordingChange={handleRecordingChange}
          />
        )}
        
        {activeTab === 'history' && (
          <SessionHistory 
            sessions={sessions} 
            onDeleteSession={handleDeleteSession}
            onEditSession={handleEditSession}
            showTitle={false}
            showControls={true}
          />
        )}
        
        {activeTab === 'stats' && (
          <Statistics sessions={sessions} />
        )}
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-400">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-4">
              <p>&copy; 2025 Walking-Pad Tracker by Staubi. Bleiben Sie aktiv und gesund!</p>
              <a 
                href="https://github.com/staubi82" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Edit Modal */}
      {editingSession && (
        <SessionEditModal
          session={editingSession}
          onSave={handleSaveEditedSession}
          onCancel={() => setEditingSession(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Programm löschen</h3>
                <p className="text-sm text-gray-400">Diese Aktion kann nicht rückgängig gemacht werden</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300">
                Möchten Sie das Programm <span className="font-semibold text-white">"{deleteConfirmation.sessionName}"</span> wirklich löschen?
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Löschen</span>
              </button>
              <button
                onClick={() => setDeleteConfirmation({ show: false, sessionId: '', sessionName: '' })}
                className="flex-1 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg text-white font-medium transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format duration
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white">Lade...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LandingPage />} />
      <Route path="/register" element={<LandingPage />} />
      <Route path="/forgot-password" element={<PasswordResetPage />} />
      
      {/* Protected Routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      
      {/* Main Route */}
      <Route path="/" element={
        isAuthenticated ? <MainApp /> : <LandingPage />
      } />
      
      {/* Redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;