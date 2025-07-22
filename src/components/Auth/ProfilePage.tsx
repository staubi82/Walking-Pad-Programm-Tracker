import React, { useState } from 'react';
import { User, Mail, Calendar, Edit3, Save, X, Trash2, Activity, TrendingUp, Target, Scale, Camera, Upload, ImageOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { updateUserProfile, PhotoUrlTooLongError } from '../../firebase/auth';
import { saveUserProfile, getUserProfile } from '../../firebase/services';
import { uploadProfileImage, deleteProfileImage, getProfileImageUrl } from '../../firebase/storage';
import { UserProfile } from '../../types';
import { calculateBMI, getBMICategory, calculateBMR, calculateTDEE, calculateIdealWeight } from '../../utils/calculations';
import { useEffect } from 'react';

export const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    return {};
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Lade Benutzerprofil beim Laden der Komponente
  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser?.uid) {
        try {
          const profile = await getUserProfile();
          setUserProfile(profile);
          
          // Lade Profilbild von Firebase Storage
          const imageUrl = await getProfileImageUrl();
          if (imageUrl) {
            setProfileImage(imageUrl);
          }
        } catch (error) {
          console.error('Fehler beim Laden des Profils:', error);
          setError('Profil konnte nicht geladen werden. Bitte versuchen Sie es später erneut.');
          
          // Fallback auf localStorage für Profil
          const savedProfile = localStorage.getItem(`userProfile_${currentUser.uid}`);
          setUserProfile(savedProfile ? JSON.parse(savedProfile) : {});
          
          // Fallback auf localStorage für Profilbild
          const savedImage = localStorage.getItem(`profileImage_${currentUser.uid}`);
          if (savedImage) {
            setProfileImage(savedImage);
          }
        }
      }
    };
    
    loadProfile();
  }, [currentUser]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validierung
    if (!file.type.startsWith('image/')) {
      setError('Bitte wählen Sie eine gültige Bilddatei aus.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB Limit
      setError('Das Bild ist zu groß. Maximale Dateigröße: 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      // Lade zu Firebase Storage hoch
      const downloadURL = await uploadProfileImage(file);
      
      // Aktualisiere Firebase Auth Profil
      try {
        await updateUserProfile(currentUser!, { photoURL: downloadURL });
      } catch (authError) {
        console.warn('Firebase Auth Update fehlgeschlagen, aber Storage erfolgreich:', authError);
      }
      
      setProfileImage(downloadURL);
      setSuccess('Profilbild erfolgreich hochgeladen!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.warn('Firebase Storage Fehler, verwende lokale Speicherung:', error);
      
      // Fallback: Lokale Speicherung
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        
        try {
          await updateUserProfile(currentUser!, { photoURL: base64String });
        } catch (authError) {
          console.warn('Firebase Auth Update fehlgeschlagen:', authError);
        }
        
        setProfileImage(base64String);
        if (currentUser?.uid) {
          localStorage.setItem(`profileImage_${currentUser.uid}`, base64String);
        }
        setSuccess('Profilbild lokal gespeichert (Firebase nicht verfügbar)');
        setTimeout(() => setSuccess(''), 3000);
      };
      
      reader.onerror = () => {
        setError('Fehler beim Lesen der Bilddatei.');
      };
      
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm('Möchten Sie Ihr Profilbild wirklich löschen?')) {
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      // Lösche von Firebase Storage
      await deleteProfileImage();
      
      // Aktualisiere Firebase Auth Profil
      try {
        await updateUserProfile(currentUser!, { photoURL: null });
      } catch (authError) {
        console.warn('Firebase Auth Update fehlgeschlagen:', authError);
      }
      
      setProfileImage(null);
      
      // Entferne auch aus localStorage
      if (currentUser?.uid) {
        localStorage.removeItem(`profileImage_${currentUser.uid}`);
      }
      
      setSuccess('Profilbild erfolgreich gelöscht!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.warn('Firebase Storage Fehler:', error);
      
      // Fallback: Nur lokal löschen
      setProfileImage(null);
      if (currentUser?.uid) {
        localStorage.removeItem(`profileImage_${currentUser.uid}`);
      }
      setSuccess('Profilbild lokal gelöscht!');
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateUserProfile(currentUser, { displayName });
      
      // Speichere Benutzerprofil in Firebase
      try {
        await saveUserProfile(userProfile);
        setSuccess('Profil erfolgreich aktualisiert!');
      } catch (firebaseError) {
        console.warn('Firebase-Fehler beim Speichern:', firebaseError);
        // Der Fallback wird bereits in saveUserProfile behandelt
        setSuccess('Profil lokal gespeichert (Firebase nicht verfügbar)');
      }
      
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
    // Lade ursprüngliche Werte neu
    const loadProfile = async () => {
      if (currentUser?.uid) {
        try {
          const profile = await getUserProfile();
          setUserProfile(profile);
        } catch (error) {
          const saved = localStorage.getItem(`userProfile_${currentUser.uid}`);
          setUserProfile(saved ? JSON.parse(saved) : {});
        }
      }
    };
    loadProfile();
    setIsEditing(false);
    setError('');
  };

  const updateProfileField = (field: keyof UserProfile, value: any) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      // Nach dem Logout wird automatisch zur LandingPage weitergeleitet
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
    <div className="space-y-6">
        {/* Profile Card - Persönliche Daten */}
        <div className={`rounded-xl p-8 shadow-xl transition-colors duration-200 ${
          isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
        }`}>
          {/* Messages */}
          {error && (
            <div className={`mb-6 border rounded-lg p-4 transition-colors duration-200 ${
              isDark ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-300'
            }`}>
              <p className={`text-sm transition-colors duration-200 ${
                isDark ? 'text-red-300' : 'text-red-700'
              }`}>{error}</p>
            </div>
          )}
          
          {success && (
            <div className={`mb-6 border rounded-lg p-4 transition-colors duration-200 ${
              isDark ? 'bg-green-900/50 border-green-700' : 'bg-green-50 border-green-300'
            }`}>
              <p className={`text-sm transition-colors duration-200 ${
                isDark ? 'text-green-300' : 'text-green-700'
              }`}>{success}</p>
            </div>
          )}

          {/* Profile Header */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative group">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-xl">
                {profileImage || currentUser.photoURL ? (
                  <img
                    src={profileImage || currentUser.photoURL!}
                    alt="Profilbild"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              
              {/* Upload Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <div className="flex space-x-2">
                  <label htmlFor="profile-image-upload" className="cursor-pointer flex flex-col items-center">
                    {uploadingImage ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Camera className="w-5 h-5 text-white mb-1" />
                        <span className="text-xs text-white">Ändern</span>
                      </>
                    )}
                  </label>
                  
                  {profileImage && !uploadingImage && (
                    <button
                      onClick={handleDeleteImage}
                      className="flex flex-col items-center text-red-300 hover:text-red-200"
                    >
                      <ImageOff className="w-5 h-5 mb-1" />
                      <span className="text-xs">Löschen</span>
                    </button>
                  )}
                </div>
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </div>
              
              {/* Upload Button für mobile Geräte */}
              <button
                onClick={() => document.getElementById('profile-image-upload')?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors sm:hidden"
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </button>
              
              {/* Delete Button für mobile Geräte */}
              {profileImage && !uploadingImage && (
                <button
                  onClick={handleDeleteImage}
                  className="absolute -bottom-2 -left-2 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors sm:hidden"
                >
                  <ImageOff className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">
                {currentUser.displayName || 'Unbekannter Benutzer'}
              </h2>
              <p className={`transition-colors duration-200 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>{currentUser.email}</p>
              
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
          
          {/* Profilbild-Upload Info */}
          <div className={`mb-6 p-4 rounded-lg border transition-colors duration-200 ${
            isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-300'
          }`}>
            <h4 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>📸 Profilbild</h4>
            <div className={`text-sm space-y-1 transition-colors duration-200 ${
              isDark ? 'text-blue-200' : 'text-blue-600'
            }`}>
              <p>• Fahren Sie mit der Maus über Ihr Profilbild, um es zu ändern</p>
              <p>• Unterstützte Formate: JPG, PNG, GIF (max. 5MB)</p>
              <p>• Das Bild wird in Firebase Storage gespeichert (mit lokalem Fallback)</p>
              <p>• Klicken Sie auf "Löschen" um das Profilbild zu entfernen</p>
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Ihr Name"
                />
              ) : (
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <User className={`w-4 h-4 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                  <span className={`transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{currentUser.displayName || 'Nicht festgelegt'}</span>
                </div>
              )}
            </div>

            {/* Körperliche Daten */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gewicht (kg)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="30"
                  max="300"
                  value={userProfile.weight || ''}
                  onChange={(e) => updateProfileField('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="70"
                />
              ) : (
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Scale className={`w-4 h-4 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                  <span className={`transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{userProfile.weight ? `${userProfile.weight} kg` : 'Nicht festgelegt'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Größe (cm)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={userProfile.height || ''}
                  onChange={(e) => updateProfileField('height', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="175"
                />
              ) : (
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <TrendingUp className={`w-4 h-4 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                  <span className={`transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{userProfile.height ? `${userProfile.height} cm` : 'Nicht festgelegt'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Alter (Jahre)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={userProfile.age || ''}
                  onChange={(e) => updateProfileField('age', e.target.value ? parseInt(e.target.value) : undefined)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="30"
                />
              ) : (
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Calendar className={`w-4 h-4 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                  <span className={`transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{userProfile.age ? `${userProfile.age} Jahre` : 'Nicht festgelegt'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Geschlecht
              </label>
              {isEditing ? (
                <select
                  value={userProfile.gender || ''}
                  onChange={(e) => updateProfileField('gender', e.target.value || undefined)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Nicht angegeben</option>
                  <option value="male">Männlich</option>
                  <option value="female">Weiblich</option>
                  <option value="other">Divers</option>
                </select>
              ) : (
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <User className={`w-4 h-4 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                  <span className={`transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {userProfile.gender === 'male' ? 'Männlich' : 
                     userProfile.gender === 'female' ? 'Weiblich' : 
                     userProfile.gender === 'other' ? 'Divers' : 'Nicht angegeben'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Aktivitätslevel
              </label>
              {isEditing ? (
                <select
                  value={userProfile.activityLevel || ''}
                  onChange={(e) => updateProfileField('activityLevel', e.target.value || undefined)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Nicht angegeben</option>
                  <option value="sedentary">Wenig aktiv (Bürojob, wenig Sport)</option>
                  <option value="light">Leicht aktiv (1-3x Sport/Woche)</option>
                  <option value="moderate">Mäßig aktiv (3-5x Sport/Woche)</option>
                  <option value="active">Sehr aktiv (6-7x Sport/Woche)</option>
                  <option value="very_active">Extrem aktiv (2x täglich Training)</option>
                </select>
              ) : (
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Activity className={`w-4 h-4 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                  <span className={`transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {userProfile.activityLevel === 'sedentary' ? 'Wenig aktiv' :
                     userProfile.activityLevel === 'light' ? 'Leicht aktiv' :
                     userProfile.activityLevel === 'moderate' ? 'Mäßig aktiv' :
                     userProfile.activityLevel === 'active' ? 'Sehr aktiv' :
                     userProfile.activityLevel === 'very_active' ? 'Extrem aktiv' : 'Nicht angegeben'}
                  </span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-Mail-Adresse
              </label>
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <Mail className={`w-4 h-4 transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <span className={`transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{currentUser.email}</span>
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
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <Calendar className={`w-4 h-4 transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <span className={`transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
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
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <Calendar className={`w-4 h-4 transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <span className={`transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
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
        </div>

        {/* Gesundheits-Statistiken */}
        {(userProfile.weight || userProfile.height || userProfile.age) && (
          <div className={`rounded-xl p-8 shadow-xl mb-6 transition-colors duration-200 ${
            isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`text-xl font-bold mb-6 transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>📊 Gesundheits-Statistiken</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* BMI */}
              {bmi && bmiCategory && (
                <div className={`rounded-lg p-4 transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <Target className="w-6 h-6 text-blue-400" />
                    <h4 className={`font-semibold transition-colors duration-200 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>BMI</h4>
                  </div>
                  <div className={`text-2xl font-bold mb-1 transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{bmi}</div>
                  <div className={`text-sm ${bmiCategory.color}`}>{bmiCategory.category}</div>
                  <div className={`text-xs mt-1 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>{bmiCategory.description}</div>
                </div>
              )}
              
              {/* Grundumsatz */}
              {bmr && (
                <div className={`rounded-lg p-4 transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <Activity className="w-6 h-6 text-green-400" />
                    <h4 className={`font-semibold transition-colors duration-200 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Grundumsatz</h4>
                  </div>
                  <div className={`text-2xl font-bold mb-1 transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{bmr}</div>
                  <div className="text-sm text-green-400">kcal/Tag</div>
                  <div className={`text-xs mt-1 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Ruheumsatz</div>
                </div>
              )}
              
              {/* Gesamtumsatz */}
              {tdee && (
                <div className={`rounded-lg p-4 transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <TrendingUp className="w-6 h-6 text-orange-400" />
                    <h4 className={`font-semibold transition-colors duration-200 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Gesamtumsatz</h4>
                  </div>
                  <div className={`text-2xl font-bold mb-1 transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{tdee}</div>
                  <div className="text-sm text-orange-400">kcal/Tag</div>
                  <div className={`text-xs mt-1 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Mit Aktivität</div>
                </div>
              )}
              
              {/* Idealgewicht */}
              {idealWeight && (
                <div className={`rounded-lg p-4 transition-colors duration-200 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <Scale className="w-6 h-6 text-purple-400" />
                    <h4 className={`font-semibold transition-colors duration-200 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Idealgewicht</h4>
                  </div>
                  <div className={`text-lg font-bold mb-1 transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {idealWeight.min}-{idealWeight.max} kg
                  </div>
                  <div className="text-sm text-purple-400">Normalgewicht</div>
                  <div className={`text-xs mt-1 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>BMI 18.5-24.9</div>
                </div>
              )}
            </div>
            
            {/* Zusätzliche Informationen */}
            <div className={`mt-6 p-4 rounded-lg border transition-colors duration-200 ${
              isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-300'
            }`}>
              <h4 className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
                isDark ? 'text-blue-300' : 'text-blue-700'
              }`}>💡 Gesundheitstipps</h4>
              <div className={`text-sm space-y-1 transition-colors duration-200 ${
                isDark ? 'text-blue-200' : 'text-blue-600'
              }`}>
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


          {/* Danger Zone */}
          <div className={`rounded-xl p-8 shadow-xl transition-colors duration-200 ${
            isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold text-red-400 mb-4 transition-colors duration-200`}>Gefahrenbereich</h3>
            <div className={`border rounded-lg p-4 transition-colors duration-200 ${
              isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Konto löschen</h4>
                  <p className={`text-sm transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
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
  );
};