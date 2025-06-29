import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Activity, BarChart3, History, AlertCircle, Play, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { logoutUser } from './firebase/auth';
import { getUserProfile } from './firebase/services';
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
import { useNavigate } from 'react-router-dom';

interface RecordingState {
  isRecording: boolean;
  sessionName: string;
  duration: number;
  currentSpeed: number;
}

const MainApp: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'tracker' | 'history' | 'stats' | 'profile'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [firebaseConfigured, setFirebaseConfigured] = useState(true);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

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
      loadProfileImage();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadProfileImage = async () => {
    if (currentUser?.uid) {
      // Versuche zuerst das lokale Profilbild zu laden
      const savedImage = localStorage.getItem(`profileImage_${currentUser.uid}`);
      if (savedImage) {
        setProfileImage(savedImage);
      } else if (currentUser.photoURL) {
        setProfileImage(currentUser.photoURL);
      }
    }
  };

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
            const localSessions = JSON.parse(localStorage.getItem('walkingPadSessions') || '[]').map((session: any) => ({
              id: session.id || Date.now().toString(),
              name: session.name || '',
              date: new Date(session.date),
              createdAt: new Date(session.createdAt),
              duration: Number(session.duration) || 0,
              distance: Number(session.distance) || 0,
              calories: Number(session.calories) || 0,
              averageSpeed: Number(session.averageSpeed) || 0,
              maxSpeed: Number(session.maxSpeed) || 0,
              speedHistory: (session.speedHistory || []).map((entry: any) => ({
                timestamp: Number(entry.timestamp) || 0,
                speed: Number(entry.speed) || 0
              })),
              difficulty: session.difficulty || 'medium'
            }));
            setSessions(localSessions);
          } else {
            const localSessions = JSON.parse(localStorage.getItem('walkingPadSessions') || '[]').map((session: any) => ({
              id: session.id || Date.now().toString(),
              name: session.name || '',
              date: new Date(session.date),
              createdAt: new Date(session.createdAt),
              duration: Number(session.duration) || 0,
              distance: Number(session.distance) || 0,
              calories: Number(session.calories) || 0,
              averageSpeed: Number(session.averageSpeed) || 0,
              maxSpeed: Number(session.maxSpeed) || 0,
              speedHistory: (session.speedHistory || []).map((entry: any) => ({
                timestamp: Number(entry.timestamp) || 0,
                speed: Number(entry.speed) || 0
              })),
              difficulty: session.difficulty || 'medium'
            }));
            setSessions(localSessions);
          }
        }
      } else {
        // Lade aus localStorage wenn Firebase nicht verfügbar ist
        const localSessions = JSON.parse(localStorage.getItem('walkingPadSessions') || '[]').map((session: any) => ({
          id: session.id || Date.now().toString(),
          name: session.name || '',
          date: new Date(session.date),
          createdAt: new Date(session.createdAt),
          duration: Number(session.duration) || 0,
          distance: Number(session.distance) || 0,
          calories: Number(session.calories) || 0,
          averageSpeed: Number(session.averageSpeed) || 0,
          maxSpeed: Number(session.maxSpeed) || 0,
          speedHistory: (session.speedHistory || []).map((entry: any) => ({
            timestamp: Number(entry.timestamp) || 0,
            speed: Number(entry.speed) || 0
          })),
          difficulty: session.difficulty || 'medium'
        }));
        setSessions(localSessions);
      }
    } catch (error) {
      console.error('Allgemeiner Fehler beim Laden der Trainingseinheiten:', error);
      // Fallback auf leeres Array
      try {
        const localSessions = JSON.parse(localStorage.getItem('walkingPadSessions') || '[]').map((session: any) => ({
          id: session.id || Date.now().toString(),
          name: session.name || '',
          date: new Date(session.date),
          createdAt: new Date(session.createdAt),
          duration: Number(session.duration) || 0,
          distance: Number(session.distance) || 0,
          calories: Number(session.calories) || 0,
          averageSpeed: Number(session.averageSpeed) || 0,
          maxSpeed: Number(session.maxSpeed) || 0,
          speedHistory: (session.speedHistory || []).map((entry: any) => ({
            timestamp: Number(entry.timestamp) || 0,
            speed: Number(entry.speed) || 0
          })),
          difficulty: session.difficulty || 'medium'
        }));
        setSessions(localSessions);
      } catch (parseError) {
        console.error('Fehler beim Parsen der lokalen Daten:', parseError);
        setSessions([]);
      }
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

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false); // Schließe Mobile Menu beim Tab-Wechsel
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
    { id: 'overview', label: 'Übersicht', icon: Activity, shortLabel: 'Home' },
    { id: 'tracker', label: 'Live Tracking', icon: Play, shortLabel: 'Live' },
    { id: 'history', label: 'Programme', icon: History, shortLabel: 'Programme' },
    { id: 'stats', label: 'Statistiken', icon: BarChart3, shortLabel: 'Stats' },
    { id: 'profile', label: 'Profil', icon: User, shortLabel: 'Profil' }
  ] as const;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className={`shadow-lg sticky top-0 z-40 transition-colors duration-200 ${
        isDark ? 'bg-gray-800' : 'bg-white border-b border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo & Title */}
            <div className="flex items-center space-x-3 sm:space-x-6 flex-1 min-w-0">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                  !isDark ? 'shadow-gray-300' : ''
                }`}>
                  <Activity className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className={`text-base sm:text-xl font-bold truncate transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Walking-Pad Tracker</h1>
                  <p className={`text-xs hidden sm:block transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Professionelles Training</p>
                </div>
              </div>
              
            </div>
            
            {/* Right Side */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {/* Theme Toggle */}
              <ThemeToggle className="hidden sm:flex" />
              
              {/* Firebase Status - Nur Desktop */}
              {!firebaseConfigured && (
                <div className={`hidden lg:flex items-center space-x-2 text-yellow-400 px-3 py-1 rounded-lg border border-yellow-400/30 transition-colors duration-200 ${
                  isDark ? 'bg-yellow-400/10' : 'bg-yellow-50'
                }`}>
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Lokale Speicherung</span>
                </div>
              )}
              
              {/* User Info - Desktop */}
              {currentUser && (
                <div className="hidden md:flex items-center space-x-3">
                  <div className="flex flex-col items-end">
                    <p className={`text-sm font-medium leading-tight transition-colors duration-200 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {currentUser.displayName || 'Benutzer'}
                    </p>
                    <p className={`text-xs leading-tight transition-colors duration-200 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>{currentUser.email}</p>
                  </div>
                  
                  <button
                    onClick={() => handleTabChange('profile')}
                    className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center hover:from-green-500 hover:to-blue-600 transition-all ring-2 ring-transparent hover:ring-white/20 shadow-lg overflow-hidden"
                    title="Profil öffnen"
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profil"
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-xs sm:text-sm">
                        {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className={`p-2 hover:text-red-400 rounded-lg transition-all group ${
                      isDark 
                        ? 'text-gray-400 hover:bg-red-500/10' 
                        : 'text-gray-600 hover:bg-red-50'
                    }`}
                    title="Abmelden"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 hover:text-green-400 transition-colors ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <div className={`absolute top-0 right-0 w-80 max-w-[90vw] h-full shadow-2xl transition-colors duration-200 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Mobile Menu Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-bold transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Menü</h3>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2 transition-colors ${
                    isDark 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User Info Mobile */}
              {currentUser && (
                <div className={`mb-6 p-4 rounded-lg transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profil"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate transition-colors duration-200 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {currentUser.displayName || 'Benutzer'}
                      </p>
                      <p className={`text-sm truncate transition-colors duration-200 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>{currentUser.email}</p>
                    </div>
                  </div>
                  
                  {!firebaseConfigured && (
                    <div className={`flex items-center space-x-2 text-yellow-400 px-3 py-2 rounded-lg border border-yellow-400/30 transition-colors duration-200 ${
                      isDark ? 'bg-yellow-400/10' : 'bg-yellow-50'
                    }`}>
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Lokale Speicherung aktiv</span>
                    </div>
                  )}
                </div>
              )}

              {/* Theme Toggle Mobile */}
              <div className="mb-6">
                <ThemeToggle className="w-full justify-center" showLabel={true} />
              </div>

              {/* Navigation Links */}
              <div className="space-y-2 mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-green-600 text-white'
                        : isDark 
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                    {tab.id === 'tracker' && recordingState.isRecording && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-auto"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg text-white font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Abmelden</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <nav className={`hidden md:block py-8 transition-colors duration-200 ${
        isDark 
          ? 'bg-gray-900' 
          : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className={`relative flex items-center gap-1 p-1.5 rounded-3xl backdrop-blur-2xl border transition-all duration-500 shadow-2xl hover:shadow-3xl ${
              isDark 
                ? 'bg-gray-800/60 border-gray-600/30 shadow-black/40 hover:bg-gray-800/70' 
                : 'bg-white/60 border-gray-300/30 shadow-gray-500/20 hover:bg-white/70'
            }`}>
              
              {/* Background Glow Effect */}
              <div className={`absolute inset-0 rounded-3xl transition-opacity duration-500 ${
                isDark 
                  ? 'bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10' 
                  : 'bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5'
              }`}></div>
              
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center py-4 px-5 rounded-2xl font-medium text-xs transition-all duration-500 min-w-[90px] group z-10 ${
                  activeTab === tab.id
                    ? isDark
                      ? 'bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white shadow-xl shadow-green-500/40 scale-110 transform'
                      : 'bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white shadow-xl shadow-green-500/40 scale-110 transform'
                    : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700/40 hover:scale-105 hover:shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/40 hover:scale-105 hover:shadow-lg'
                }`}
              >
                {/* Active Background Glow */}
                {activeTab === tab.id && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400/20 to-green-600/20 blur-sm scale-110"></div>
                )}
                
                {/* Icon */}
                <div className="relative z-10">
                  <tab.icon className={`w-6 h-6 transition-all duration-500 ${
                    activeTab === tab.id 
                      ? 'scale-125 drop-shadow-lg filter brightness-110' 
                      : 'group-hover:scale-115 group-hover:drop-shadow-md'
                  }`} />
                  
                  {/* Recording Indicator */}
                  {tab.id === 'tracker' && recordingState.isRecording && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full animate-pulse border-2 border-white shadow-xl">
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-60"></div>
                      <div className="absolute inset-1 bg-white rounded-full opacity-90"></div>
                    </div>
                  )}
                </div>
                
                {/* Label */}
                <span className={`mt-2 font-bold transition-all duration-500 tracking-wide z-10 ${
                  activeTab === tab.id 
                    ? 'text-white drop-shadow-sm' 
                    : 'group-hover:font-extrabold'
                }`}>
                  <span className="hidden xl:inline">{tab.label}</span>
                  <span className="xl:hidden">{tab.shortLabel}</span>
                </span>
                
                {/* Active Indicator */}
                {activeTab === tab.id && (
                  <>
                    <div className="absolute -bottom-2 w-2 h-2 bg-white rounded-full shadow-lg animate-pulse"></div>
                    <div className="absolute -bottom-3 w-6 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 rounded-full"></div>
                  </>
                )}
                
                {/* Hover Effect */}
                <div className={`absolute inset-0 rounded-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 ${
                  activeTab !== tab.id 
                    ? isDark
                      ? 'bg-gradient-to-br from-gray-600/20 to-gray-700/20'
                      : 'bg-gradient-to-br from-gray-200/30 to-gray-300/30'
                    : ''
                }`}></div>
              </button>
            ))}
            
            {/* Floating Particles Effect */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-1 h-1 rounded-full animate-pulse ${
                    isDark ? 'bg-green-400/30' : 'bg-green-500/20'
                  }`}
                  style={{
                    left: `${20 + i * 30}%`,
                    top: `${10 + i * 20}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `${2 + i}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 border-t z-30 transition-colors duration-200 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-5 h-16">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex flex-col items-center justify-center space-y-1 transition-all relative ${
                activeTab === tab.id
                  ? isDark 
                    ? 'text-green-400 bg-gray-700'
                    : 'text-green-600 bg-gray-100'
                  : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.shortLabel}</span>
              {tab.id === 'tracker' && recordingState.isRecording && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              )}
              {activeTab === tab.id && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-500"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 md:pb-8">
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            <div className={`rounded-xl p-4 sm:p-6 shadow-xl transition-colors duration-200 ${
              isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
            }`}>
              <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Willkommen zurück, {currentUser?.displayName || 'Benutzer'}!
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className={`rounded-lg p-4 transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <h3 className={`text-base sm:text-lg font-semibold mb-3 transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Schnellstart</h3>
                  <p className={`text-sm sm:text-base mb-4 transition-colors duration-200 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>Starten Sie sofort ein neues Training</p>
                  <button
                    onClick={() => handleTabChange('tracker')}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-white font-medium transition-colors w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <Play className="w-4 h-4" />
                    <span>Neues Training</span>
                  </button>
                </div>
                <div className={`rounded-lg p-4 transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <h3 className={`text-base sm:text-lg font-semibold mb-3 transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Letzte Aktivität</h3>
                  {sessions.length > 0 ? (
                    <div>
                      <p className={`text-sm sm:text-base truncate transition-colors duration-200 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>{sessions[0].name}</p>
                      <p className={`text-xs sm:text-sm transition-colors duration-200 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>{formatDate(sessions[0].date)}</p>
                      <p className="text-sm sm:text-base text-green-400 font-medium">{(sessions[0].distance || 0).toFixed(2)} km</p>
                    </div>
                  ) : (
                    <p className={`text-sm sm:text-base transition-colors duration-200 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>Noch keine Trainings absolviert</p>
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
        
        {activeTab === 'profile' && (
          <ProfilePage />
        )}
      </main>

      {/* Footer - Nur Desktop */}
      <footer className={`border-t mt-12 hidden md:block transition-colors duration-200 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className={`text-center transition-colors duration-200 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
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
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white">Lade...</p>
          <p className={`transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Lade...</p>
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