import React, { useState } from 'react';
import { User, Mail, Calendar, Edit3, Save, X, Trash2, Activity, TrendingUp, Target, Scale, Camera, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { TrainingSession } from '../../types';
import { updateUserProfile, PhotoUrlTooLongError } from '../../firebase/auth';
import { saveUserProfile, getUserProfile } from '../../firebase/services';
import { UserProfile } from '../../types';
import { calculateBMI, getBMICategory, calculateBMR, calculateTDEE, calculateIdealWeight } from '../../utils/calculations';
import { useEffect } from 'react';

interface ProfilePageProps {
  sessions?: TrainingSession[];
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ sessions = [] }) => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: user?.displayName || '',
    email: user?.email || '',
    photoURL: user?.photoURL || '',
    age: 0,
    weight: 0,
    height: 0,
    activityLevel: 'moderate',
    goal: 'maintain'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const userProfile = await getUserProfile(user.uid);
          if (userProfile) {
            setProfile(userProfile);
          }
        } catch (error) {
          console.error('Fehler beim Laden des Profils:', error);
        }
      }
    };
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateUserProfile({
        displayName: profile.displayName,
        photoURL: profile.photoURL
      });
      
      await saveUserProfile(user.uid, profile);
      
      setSuccess('Profil erfolgreich aktualisiert!');
      setIsEditing(false);
    } catch (error: any) {
      if (error instanceof PhotoUrlTooLongError) {
        setError('Die Foto-URL ist zu lang. Bitte verwenden Sie eine kürzere URL.');
      } else {
        setError('Fehler beim Aktualisieren des Profils: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfile({
      displayName: user?.displayName || '',
      email: user?.email || '',
      photoURL: user?.photoURL || '',
      age: profile.age,
      weight: profile.weight,
      height: profile.height,
      activityLevel: profile.activityLevel,
      goal: profile.goal
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      try {
        await logout();
      } catch (error: any) {
        setError('Fehler beim Löschen des Kontos: ' + error.message);
      }
    }
  };

  const bmi = profile.weight && profile.height ? calculateBMI(profile.weight, profile.height) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;
  const bmr = profile.weight && profile.height && profile.age ? calculateBMR(profile.weight, profile.height, profile.age, 'male') : null;
  const tdee = bmr ? calculateTDEE(bmr, profile.activityLevel) : null;
  const idealWeight = profile.height ? calculateIdealWeight(profile.height, 'male') : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-xl p-6 shadow-xl transition-colors duration-200 ${
        isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
      }`}>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{sessions?.length || 0}</div>
          <div className={`text-sm transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Trainingseinheiten
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {sessions?.reduce((sum, s) => sum + (s.distance || 0), 0).toFixed(1) || '0.0'} km
          </div>
          <div className={`text-sm transition-colors duration-200 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>Gesamtdistanz</div>
        </div>
      </div>

      {/* Profil Information */}
      <div className={`rounded-xl p-6 shadow-xl transition-colors duration-200 ${
        isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Profil Information
          </h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 size={16} />
              Bearbeiten
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                Speichern
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X size={16} />
                Abbrechen
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profilbild */}
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt="Profilbild"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                  <User size={32} className="text-gray-600" />
                </div>
              )}
            </div>
            {isEditing && (
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Profilbild URL
                </label>
                <input
                  type="url"
                  value={profile.photoURL}
                  onChange={(e) => setProfile({ ...profile, photoURL: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            )}
          </div>

          {/* Persönliche Daten */}
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <User size={16} className="inline mr-2" />
                Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              ) : (
                <p className={`px-3 py-2 transition-colors duration-200 ${
                  isDark ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {profile.displayName || 'Nicht angegeben'}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Mail size={16} className="inline mr-2" />
                E-Mail
              </label>
              <p className={`px-3 py-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                {profile.email}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Calendar size={16} className="inline mr-2" />
                Alter
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  min="1"
                  max="120"
                />
              ) : (
                <p className={`px-3 py-2 transition-colors duration-200 ${
                  isDark ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {profile.age || 'Nicht angegeben'} Jahre
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Körperdaten */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Scale size={16} className="inline mr-2" />
              Gewicht (kg)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={profile.weight || ''}
                onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                min="1"
                step="0.1"
              />
            ) : (
              <p className={`px-3 py-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                {profile.weight || 'Nicht angegeben'} kg
              </p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Größe (cm)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={profile.height || ''}
                onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                min="1"
              />
            ) : (
              <p className={`px-3 py-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                {profile.height || 'Nicht angegeben'} cm
              </p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Activity size={16} className="inline mr-2" />
              Aktivitätslevel
            </label>
            {isEditing ? (
              <select
                value={profile.activityLevel}
                onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value as any })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="sedentary">Sitzend</option>
                <option value="light">Leicht aktiv</option>
                <option value="moderate">Mäßig aktiv</option>
                <option value="active">Aktiv</option>
                <option value="very_active">Sehr aktiv</option>
              </select>
            ) : (
              <p className={`px-3 py-2 transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                {profile.activityLevel === 'sedentary' && 'Sitzend'}
                {profile.activityLevel === 'light' && 'Leicht aktiv'}
                {profile.activityLevel === 'moderate' && 'Mäßig aktiv'}
                {profile.activityLevel === 'active' && 'Aktiv'}
                {profile.activityLevel === 'very_active' && 'Sehr aktiv'}
              </p>
            )}
          </div>
        </div>

        {/* Ziel */}
        <div className="mt-6">
          <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <Target size={16} className="inline mr-2" />
            Ziel
          </label>
          {isEditing ? (
            <select
              value={profile.goal}
              onChange={(e) => setProfile({ ...profile, goal: e.target.value as any })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="lose">Abnehmen</option>
              <option value="maintain">Gewicht halten</option>
              <option value="gain">Zunehmen</option>
            </select>
          ) : (
            <p className={`px-3 py-2 transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-900'
            }`}>
              {profile.goal === 'lose' && 'Abnehmen'}
              {profile.goal === 'maintain' && 'Gewicht halten'}
              {profile.goal === 'gain' && 'Zunehmen'}
            </p>
          )}
        </div>
      </div>

      {/* Gesundheitsdaten */}
      {(profile.weight && profile.height && profile.age) && (
        <div className={`rounded-xl p-6 shadow-xl transition-colors duration-200 ${
          isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-4 transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <TrendingUp size={20} className="inline mr-2" />
            Gesundheitsdaten
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bmi && (
              <div className={`p-4 rounded-lg transition-colors duration-200 ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="text-2xl font-bold text-blue-500">{bmi.toFixed(1)}</div>
                <div className={`text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>BMI</div>
                <div className={`text-xs transition-colors duration-200 ${
                  isDark ? 'text-gray-500' : 'text-gray-500'
                }`}>{bmiCategory}</div>
              </div>
            )}
            
            {bmr && (
              <div className={`p-4 rounded-lg transition-colors duration-200 ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="text-2xl font-bold text-green-500">{Math.round(bmr)}</div>
                <div className={`text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>BMR (kcal/Tag)</div>
              </div>
            )}
            
            {tdee && (
              <div className={`p-4 rounded-lg transition-colors duration-200 ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="text-2xl font-bold text-purple-500">{Math.round(tdee)}</div>
                <div className={`text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>TDEE (kcal/Tag)</div>
              </div>
            )}
            
            {idealWeight && (
              <div className={`p-4 rounded-lg transition-colors duration-200 ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="text-2xl font-bold text-orange-500">{idealWeight.toFixed(1)} kg</div>
                <div className={`text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Idealgewicht</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gefahrenzone */}
      <div className={`rounded-xl p-6 shadow-xl border-2 border-red-200 transition-colors duration-200 ${
        isDark ? 'bg-gray-800 border-red-800' : 'bg-red-50'
      }`}>
        <h3 className={`text-lg font-bold mb-4 text-red-600 transition-colors duration-200 ${
          isDark ? 'text-red-400' : 'text-red-600'
        }`}>
          <Trash2 size={20} className="inline mr-2" />
          Gefahrenzone
        </h3>
        <p className={`text-sm mb-4 transition-colors duration-200 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Das Löschen Ihres Kontos ist unwiderruflich. Alle Ihre Daten werden permanent entfernt.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Konto löschen
        </button>
      </div>
    </div>
  );
};