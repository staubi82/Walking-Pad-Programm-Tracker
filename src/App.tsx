import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import PasswordResetPage from './components/Auth/PasswordResetPage';
import ProfilePage from './components/Auth/ProfilePage';
import { LiveTracker } from './components/LiveTracker';
import SessionHistory from './components/SessionHistory';
import Statistics from './components/Statistics';
import ThemeToggle from './components/ThemeToggle';
import SessionEditModal from './components/SessionEditModal';
import { TrainingSession } from './types';
import { 
  getTrainingSessions, 
  deleteTrainingSession, 
  updateTrainingSession 
} from './firebase/services';
import { 
  User, 
  LogOut, 
  Activity, 
  BarChart3, 
  History, 
  Settings 
} from 'lucide-react';

const App: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'register' | 'reset' | 'profile' | 'tracker' | 'history' | 'stats'>('landing');
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    sessionId: '',
    sessionName: ''
  });

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    if (user) {
      try {
        const userSessions = await getTrainingSessions(user.uid);
        setSessions(userSessions);
      } catch (error) {
        console.error('Fehler beim Laden der Sessions:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage('landing');
    } catch (error) {
      console.error('Logout-Fehler:', error);
    }
  };

  const handleDeleteSession = (sessionId: string, sessionName: string) => {
    setDeleteConfirmation({
      show: true,
      sessionId,
      sessionName
    });
  };

  const confirmDelete = async () => {
    try {
      await deleteTrainingSession(deleteConfirmation.sessionId);
      await loadSessions();
      setDeleteConfirmation({ show: false, sessionId: '', sessionName: '' });
    } catch (error) {
      console.error('Fehler beim Löschen der Session:', error);
    }
  };

  const handleSaveEditedSession = async (updatedSession: TrainingSession) => {
    try {
      await updateTrainingSession(updatedSession.id, updatedSession);
      await loadSessions();
      setEditingSession(null);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Session:', error);
    }
  };

  if (!user) {
    if (currentPage === 'login') {
      return <LoginPage onBack={() => setCurrentPage('landing')} onRegister={() => setCurrentPage('register')} onForgotPassword={() => setCurrentPage('reset')} />;
    }
    if (currentPage === 'register') {
      return <RegisterPage onBack={() => setCurrentPage('landing')} onLogin={() => setCurrentPage('login')} />;
    }
    if (currentPage === 'reset') {
      return <PasswordResetPage onBack={() => setCurrentPage('login')} />;
    }
    return <LandingPage onLogin={() => setCurrentPage('login')} onRegister={() => setCurrentPage('register')} />;
  }

  const MainApp = () => (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className={`shadow-sm border-b transition-colors duration-200 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Activity className={`w-8 h-8 transition-colors duration-200 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <h1 className={`text-xl font-bold transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Trainings Tracker
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              <nav className="hidden md:flex space-x-1">
                <button
                  onClick={() => setCurrentPage('tracker')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    currentPage === 'tracker'
                      ? isDark 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-600 text-white'
                      : isDark
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Live Tracker
                </button>
                <button
                  onClick={() => setCurrentPage('history')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    currentPage === 'history'
                      ? isDark 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-600 text-white'
                      : isDark
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Verlauf
                </button>
                <button
                  onClick={() => setCurrentPage('stats')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    currentPage === 'stats'
                      ? isDark 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-600 text-white'
                      : isDark
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Statistiken
                </button>
              </nav>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage('profile')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    currentPage === 'profile'
                      ? isDark 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-600 text-white'
                      : isDark
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    isDark
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className={`md:hidden border-b transition-colors duration-200 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="px-4 py-2">
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage('tracker')}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-xs font-medium transition-colors duration-200 ${
                currentPage === 'tracker'
                  ? isDark 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-600 text-white'
                  : isDark
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Activity className="w-4 h-4 mr-1" />
              Tracker
            </button>
            <button
              onClick={() => setCurrentPage('history')}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-xs font-medium transition-colors duration-200 ${
                currentPage === 'history'
                  ? isDark 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-600 text-white'
                  : isDark
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <History className="w-4 h-4 mr-1" />
              Verlauf
            </button>
            <button
              onClick={() => setCurrentPage('stats')}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-xs font-medium transition-colors duration-200 ${
                currentPage === 'stats'
                  ? isDark 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-600 text-white'
                  : isDark
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Stats
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'profile' && <ProfilePage />}
        {currentPage === 'tracker' && <LiveTracker onSessionSaved={loadSessions} />}
        {currentPage === 'history' && (
          <SessionHistory 
            sessions={sessions} 
            onEditSession={setEditingSession}
            onDeleteSession={handleDeleteSession}
          />
        )}
        {currentPage === 'stats' && <Statistics sessions={sessions} />}
      </main>

      {/* Footer */}
      <footer className={`border-t mt-16 transition-colors duration-200 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className={`text-sm transition-colors duration-200 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              © 2024 Trainings Tracker. Alle Rechte vorbehalten.
            </p>
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
          <div className={`rounded-xl p-6 w-full max-w-md shadow-2xl border transition-colors duration-200 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isDark ? 'bg-red-100' : 'bg-red-100'
              }`}>
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Programm löschen</h3>
                <p className={`text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Diese Aktion kann nicht rückgängig gemacht werden</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className={`transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Möchten Sie das Programm <span className={`font-semibold transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>"{deleteConfirmation.sessionName}"</span> wirklich löschen?
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
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                  isDark 
                    ? 'bg-gray-600 hover:bg-gray-500' 
                    : 'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return <MainApp />;
};

export default App;