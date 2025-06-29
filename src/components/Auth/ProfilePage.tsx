import React, { useState } from 'react';
import { User, Mail, Calendar, Edit3, Save, X, LogOut, Trash2, Activity, TrendingUp, Target, Scale } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile, logoutUser } from '../../firebase/auth';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../../types';
import { calculateBMI, getBMICategory, calculateBMR, calculateTDEE, calculateIdealWeight } from '../../utils/calculations';

export const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`userProfile_${currentUser?.uid}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    if (!currentUser) return;
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateUserProfile(currentUser, { displayName });
      
      // Speichere Benutzerprofil in localStorage
      localStorage.setItem(`userProfile_${currentUser.uid}`, JSON.stringify(userProfile));
      
      setSuccess('Profil erfolgreich aktualisiert!');
      setIsEditing(false);
      
      // Success message nach 3 Sekunden ausblenden
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Fehler beim Aktualisieren des Profils: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(currentUser?.displayName || '');
    const saved = localStorage.getItem(`userProfile_${currentUser?.uid}`);
    setUserProfile(saved ? JSON.parse(saved) : {});
    setIsEditing(false);
    setError('');
  };

  const updateProfileField = (field: keyof UserProfile, value: any) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
    }
  };

  // Berechnungen
  const bmi = userProfile.weight && userProfile.height ? calculateBMI(userProfile.weight, userProfile.height) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;
  const bmr = userProfile.weight && userProfile.height && userProfile.age && userProfile.gender 
    ? calculateBMR(userProfile.weight, userProfile.height, userProfile.age, userProfile.gender) 
    : null;
  const tdee = bmr && userProfile.activityLevel ? calculateTDEE(bmr, userProfile.activityLevel) : null;
  const idealWeight = userProfile.height ? calculateIdealWeight(userProfile.height, userProfile.gender || 'male') : null;

  const getProviderInfo = () => {
    if (!currentUser?.providerData.length) return null;
    
    const provider = currentUser.providerData[0];
    switch (provider.providerId) {
      case 'google.com':
        return { name: 'Google', icon: '🔍', color: 'text-blue-400' };
      case 'facebook.com':
        return { name: 'Facebook', icon: '📘', color: 'text-blue-600' };
      case 'github.com':
        return { name: 'GitHub', icon: '🐙', color: 'text-gray-400' };
      case 'password':
        return { name: 'E-Mail/Passwort', icon: '📧', color: 'text-green-400' };
      default:
        return { name: provider.providerId, icon: '🔐', color: 'text-gray-400' };
    }
  };

  const providerInfo = getProviderInfo();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Nicht angemeldet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Mein Profil</h1>
          <p className="mt-2 text-gray-400">Verwalten Sie Ihre Kontoinformationen</p>
        </div>

        {/* Gesundheits-Statistiken */}
        {(userProfile.weight || userProfile.height || userProfile.age) && (
          <div className="bg-gray-800 rounded-xl p-8 shadow-xl mb-6">
            <h3 className="text-xl font-bold text-white mb-6">📊 Gesundheits-Statistiken</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* BMI */}
              {bmi && bmiCategory && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Target className="w-6 h-6 text-blue-400" />
                    <h4 className="font-semibold text-white">BMI</h4>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{bmi}</div>
                  <div className={`text-sm ${bmiCategory.color}`}>{bmiCategory.category}</div>
                  <div className="text-xs text-gray-400 mt-1">{bmiCategory.description}</div>
                </div>
              )}
              
              {/* Grundumsatz */}
              {bmr && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Activity className="w-6 h-6 text-green-400" />
                    <h4 className="font-semibold text-white">Grundumsatz</h4>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{bmr}</div>
                  <div className="text-sm text-green-400">kcal/Tag</div>
                  <div className="text-xs text-gray-400 mt-1">Ruheumsatz</div>
                </div>
              )}
              
              {/* Gesamtumsatz */}
              {tdee && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <TrendingUp className="w-6 h-6 text-orange-400" />
                    <h4 className="font-semibold text-white">Gesamtumsatz</h4>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{tdee}</div>
                  <div className="text-sm text-orange-400">kcal/Tag</div>
                  <div className="text-xs text-gray-400 mt-1">Mit Aktivität</div>
                </div>
              )}
              
              {/* Idealgewicht */}
              {idealWeight && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Scale className="w-6 h-6 text-purple-400" />
                    <h4 className="font-semibold text-white">Idealgewicht</h4>
                  </div>
                  <div className="text-lg font-bold text-white mb-1">
                    {idealWeight.min}-{idealWeight.max} kg
                  </div>
                  <div className="text-sm text-purple-400">Normalgewicht</div>
                  <div className="text-xs text-gray-400 mt-1">BMI 18.5-24.9</div>
                </div>
              )}
            </div>
            
            {/* Zusätzliche Informationen */}
            <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
              <h4 className="text-lg font-semibold text-blue-300 mb-2">💡 Gesundheitstipps</h4>
              <div className="text-blue-200 text-sm space-y-1">
                {bmi && bmi < 18.5 && (
                  <p>• Ihr BMI deutet auf Untergewicht hin. Konsultieren Sie einen Arzt für eine gesunde Gewichtszunahme.</p>
                )}
                {bmi && bmi >= 25 && bmi < 30 && (
                  <p>• Regelmäßige Bewegung und eine ausgewogene Ernährung können beim Erreichen des Idealgewichts helfen.</p>
                )}
                {bmi && bmi >= 30 && (
                  <p>• Bei Adipositas ist eine ärztliche Beratung empfehlenswert für einen gesunden Gewichtsverlust.</p>
                )}
                {tdee && (
                  <p>• Ihr täglicher Kalorienbedarf liegt bei etwa {tdee} kcal. Für Gewichtsverlust: 300-500 kcal weniger, für Zunahme: 300-500 kcal mehr.</p>
                )}
                <p>• Diese Werte sind Richtwerte. Konsultieren Sie bei gesundheitlichen Fragen immer einen Arzt.</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-gray-800 rounded-xl p-8 shadow-xl">
          {/* Messages */}
          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-700 rounded-lg p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 bg-green-900/50 border border-green-700 rounded-lg p-4">
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          )}

          {/* Profile Header */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profilbild"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">
                {currentUser.displayName || 'Unbekannter Benutzer'}
              </h2>
              <p className="text-gray-400">{currentUser.email}</p>
              
              {providerInfo && (
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-lg">{providerInfo.icon}</span>
                  <span className={`text-sm ${providerInfo.color}`}>
                    Angemeldet über {providerInfo.name}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-white transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Bearbeiten</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-white transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Speichern</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg flex items-center space-x-2 text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Abbrechen</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Anzeigename
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ihr Name"
                />
              ) : (
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded-lg">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-white">{currentUser.displayName || 'Nicht festgelegt'}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-Mail-Adresse
              </label>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded-lg">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-white">{currentUser.email}</span>
                {currentUser.emailVerified && (
                  <span className="text-green-400 text-xs bg-green-900/30 px-2 py-1 rounded">
                    Verifiziert
                  </span>
                )}
              </div>
            </div>

            {/* Account Created */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Konto erstellt
              </label>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-white">
                  {currentUser.metadata.creationTime 
                    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Unbekannt'
                  }
                </span>
              </div>
            </div>

            {/* Last Sign In */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Letzte Anmeldung
              </label>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-white">
                  {currentUser.metadata.lastSignInTime 
                    ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Unbekannt'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="bg-gray-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Konto-Statistiken</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">0</div>
                <div className="text-sm text-gray-400">Trainingseinheiten</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">0.0 km</div>
                <div className="text-sm text-gray-400">Gesamtdistanz</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">0 kcal</div>
                <div className="text-sm text-gray-400">Verbrannte Kalorien</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg flex items-center justify-center space-x-2 text-white font-medium transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Abmelden</span>
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-600 hover:bg-gray-500 px-6 py-3 rounded-lg text-white font-medium transition-colors"
            >
              Zurück zur App
            </button>
          </div>

          {/* Danger Zone */}
          <div className="mt-8 pt-8 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-red-400 mb-4">Gefahrenbereich</h3>
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Konto löschen</h4>
                  <p className="text-gray-400 text-sm">
                    Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Daten werden permanent gelöscht.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
                      // TODO: Implement account deletion
                      alert('Konto-Löschung ist noch nicht implementiert.');
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Löschen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};