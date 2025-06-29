import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Play, 
  BarChart3, 
  Clock, 
  MapPin, 
  Flame, 
  TrendingUp, 
  Users, 
  Shield, 
  Smartphone,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { loginUser, registerUser, getAuthErrorMessage } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

export const LandingPage: React.FC = () => {
  // SVG pattern for background
  const backgroundPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (authMode === 'register') {
      if (!formData.displayName.trim()) {
        setError('Bitte geben Sie Ihren Namen ein.');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Die Passwörter stimmen nicht überein.');
        return false;
      }
    }
    if (!formData.email.trim()) {
      setError('Bitte geben Sie Ihre E-Mail-Adresse ein.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (authMode === 'register') {
        await registerUser(formData.email, formData.password, formData.displayName, rememberMe);
      } else {
        await loginUser(formData.email, formData.password, rememberMe);
      }
      navigate('/');
    } catch (error: any) {
      setError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      displayName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchAuthMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setMobileMenuOpen(false);
    resetForm();
  };

  const features = [
    {
      icon: Play,
      title: 'Live Tracking',
      description: 'Verfolgen Sie Ihr Training in Echtzeit mit präzisen Geschwindigkeits- und Distanzmessungen.',
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      icon: BarChart3,
      title: 'Detaillierte Statistiken',
      description: 'Analysieren Sie Ihre Fortschritte mit professionellen Charts und umfassenden Auswertungen.',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      icon: Clock,
      title: 'Timer & Programme',
      description: 'Nutzen Sie vordefinierte Timer oder erstellen Sie individuelle Trainingsprogramme.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    },
    {
      icon: TrendingUp,
      title: 'Fortschrittsverfolgung',
      description: 'Behalten Sie Ihre Ziele im Blick und verfolgen Sie Ihre Verbesserungen über Zeit.',
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10'
    }
  ];

  const benefits = [
    'Professionelle Geschwindigkeitsdiagramme mit Highcharts',
    '6 verschiedene Schwierigkeitslevel',
    'Cloud-Synchronisation mit Firebase',
    'Responsive Design für alle Geräte',
    'Offline-Funktionalität als Fallback',
    'Detaillierte Kalorienberechnung'
  ];

  const stats = [
    { value: '1.0 - 6.0', label: 'km/h Geschwindigkeit', icon: Zap },
    { value: '15-90', label: 'Min Timer-Optionen', icon: Clock },
    { value: '6', label: 'Schwierigkeitslevel', icon: TrendingUp },
    { value: '100%', label: 'Kostenlos', icon: Star }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className={`absolute inset-0 transition-colors duration-200 ${
          isDark 
            ? 'bg-gradient-to-br from-green-900/20 via-gray-900 to-blue-900/20' 
            : 'bg-gradient-to-br from-green-100/50 via-gray-50 to-blue-100/50'
        }`}></div>
        <div className={`absolute inset-0 bg-[url('${backgroundPattern}')] opacity-20`}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
          {/* Header */}
          <header className="flex justify-between items-center mb-8 lg:mb-16">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg ${
                !isDark ? 'shadow-gray-300' : ''
              }`}>
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl lg:text-2xl font-bold transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Walking-Pad Tracker</h1>
                <p className={`text-xs hidden sm:block transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Professionelles Training</p>
              </div>
            </div>
            
            {/* Theme Toggle */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
            {/* Desktop Navigation */}
            {!authMode && (
              <div className="hidden md:flex space-x-4 ml-4">
                <button
                  onClick={() => switchAuthMode('login')}
                  className={`px-6 py-2 font-medium transition-colors ${
                    isDark 
                      ? 'text-green-400 hover:text-green-300' 
                      : 'text-green-600 hover:text-green-700'
                  }`}
                >
                  Anmelden
                </button>
                <button
                  onClick={() => switchAuthMode('register')}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-lg"
                >
                  Registrieren
                </button>
              </div>
            )}
            </div>

            {/* Mobile Menu Button */}
            {!authMode && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 hover:text-green-400 transition-colors ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}

            {/* Back Button for Auth Mode */}
            {authMode && (
              <button
                onClick={() => setAuthMode(null)}
                className={`p-2 transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </header>

          {/* Mobile Menu */}
          {mobileMenuOpen && !authMode && (
            <div className={`md:hidden mb-8 backdrop-blur-sm rounded-xl p-6 border shadow-2xl transition-colors duration-200 ${
              isDark 
                ? 'bg-gray-800/95 border-gray-700' 
                : 'bg-white/95 border-gray-200'
            }`}>
              <div className="space-y-4">
                {/* Theme Toggle Mobile */}
                <ThemeToggle className="w-full justify-center mb-4" showLabel={true} />
                
                <button
                  onClick={() => switchAuthMode('login')}
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Anmelden</span>
                </button>
                <button
                  onClick={() => switchAuthMode('register')}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-6 py-3 rounded-lg text-white font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Registrieren</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
              <div>
                <h2 className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 lg:mb-6 leading-tight transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Ihr professioneller
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                    {' '}Walking-Pad
                  </span>
                  {' '}Tracker
                </h2>
                <p className={`text-lg lg:text-xl mb-6 lg:mb-8 leading-relaxed transition-colors duration-200 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Verfolgen Sie Ihre Trainings in Echtzeit, analysieren Sie Ihre Fortschritte und erreichen Sie Ihre Fitness-Ziele mit unserem fortschrittlichen Walking-Pad Tracker.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className={`text-center p-3 lg:p-4 rounded-lg backdrop-blur-sm border transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gray-800/50 border-gray-700/50' 
                      : 'bg-white/70 border-gray-200/50'
                  }`}>
                    <stat.icon className="w-5 h-5 lg:w-6 lg:h-6 text-green-400 mx-auto mb-2" />
                    <div className={`text-lg lg:text-2xl font-bold transition-colors duration-200 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{stat.value}</div>
                    <div className={`text-xs lg:text-sm transition-colors duration-200 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Benefits */}
              <div className="space-y-2 lg:space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className={`text-sm lg:text-base transition-colors duration-200 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>{benefit}</span>
                  </div>
                ))}
              </div>

              {!authMode && (
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                  <button
                    onClick={() => switchAuthMode('register')}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-6 lg:px-8 py-3 lg:py-4 rounded-lg text-white font-semibold text-base lg:text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Kostenlos starten</span>
                  </button>
                  <button
                    onClick={() => switchAuthMode('login')}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 px-6 lg:px-8 py-3 lg:py-4 rounded-lg text-white font-semibold text-base lg:text-lg transition-all border border-gray-600 flex items-center justify-center space-x-2"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Anmelden</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - Auth Form or Demo */}
            <div className="order-1 lg:order-2 lg:pl-8">
              {authMode ? (
                /* Auth Form */
                <div className={`backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-2xl border transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-800/90 border-gray-700' 
                    : 'bg-white/90 border-gray-200'
                }`}>
                  <div className="text-center mb-6">
                    <h3 className={`text-xl lg:text-2xl font-bold mb-2 transition-colors duration-200 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {authMode === 'login' ? 'Willkommen zurück!' : 'Konto erstellen'}
                    </h3>
                    <p className={`text-sm lg:text-base transition-colors duration-200 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {authMode === 'login' 
                        ? 'Melden Sie sich in Ihrem Konto an' 
                        : 'Starten Sie Ihre Fitness-Reise noch heute'
                      }
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                    {error && (
                      <div className={`border border-red-700 rounded-lg p-4 transition-colors duration-200 ${
                        isDark ? 'bg-red-900/50' : 'bg-red-50'
                      }`}>
                        <p className="text-red-300 text-sm">{error}</p>
                      </div>
                    )}

                    {authMode === 'register' && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Vollständiger Name
                        </label>
                        <div className="relative">
                          <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <input
                            name="displayName"
                            type="text"
                            required
                            value={formData.displayName}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base transition-colors duration-200 ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                            placeholder="Max Mustermann"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        E-Mail-Adresse
                      </label>
                      <div className="relative">
                        <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <input
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base transition-colors duration-200 ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          placeholder="ihre.email@beispiel.de"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Passwort
                      </label>
                      <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base transition-colors duration-200 ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          placeholder={authMode === 'register' ? 'Mindestens 6 Zeichen' : 'Ihr Passwort'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
                        >
                          {showPassword ? (
                            <EyeOff className={`h-5 w-5 transition-colors duration-200 ${
                              isDark 
                                ? 'text-gray-400 hover:text-gray-300' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`} />
                          ) : (
                            <Eye className={`h-5 w-5 transition-colors duration-200 ${
                              isDark 
                                ? 'text-gray-400 hover:text-gray-300' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`} />
                          )}
                        </button>
                      </div>
                    </div>

                    {authMode === 'register' && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Passwort bestätigen
                        </label>
                        <div className="relative">
                          <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <input
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base transition-colors duration-200 ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                            placeholder="Passwort wiederholen"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className={`h-5 w-5 transition-colors duration-200 ${
                                isDark 
                                  ? 'text-gray-400 hover:text-gray-300' 
                                  : 'text-gray-500 hover:text-gray-700'
                              }`} />
                            ) : (
                              <Eye className={`h-5 w-5 transition-colors duration-200 ${
                                isDark 
                                  ? 'text-gray-400 hover:text-gray-300' 
                                  : 'text-gray-500 hover:text-gray-700'
                              }`} />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className={`h-4 w-4 text-green-600 focus:ring-green-500 rounded transition-colors duration-200 ${
                            isDark 
                              ? 'border-gray-600 bg-gray-700' 
                              : 'border-gray-300 bg-white'
                          }`}
                        />
                        <label htmlFor="remember-me" className={`ml-2 block text-sm transition-colors duration-200 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Eingeloggt bleiben
                        </label>
                      </div>

                      {authMode === 'login' && (
                        <Link
                          to="/forgot-password"
                          className="text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
                        >
                          Passwort vergessen?
                        </Link>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 py-3 px-4 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-base"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          {authMode === 'login' ? (
                            <LogIn className="w-5 h-5" />
                          ) : (
                            <UserPlus className="w-5 h-5" />
                          )}
                          <span>
                            {authMode === 'login' ? 'Anmelden' : 'Konto erstellen'}
                          </span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className={`transition-colors duration-200 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {authMode === 'login' ? 'Noch kein Konto?' : 'Bereits ein Konto?'}{' '}
                      <button
                        onClick={() => switchAuthMode(authMode === 'login' ? 'register' : 'login')}
                        className="font-medium text-green-400 hover:text-green-300 transition-colors"
                      >
                        {authMode === 'login' ? 'Jetzt registrieren' : 'Jetzt anmelden'}
                      </button>
                    </p>
                  </div>

                  <button
                    onClick={() => setAuthMode(null)}
                    className={`mt-4 w-full text-sm transition-colors ${
                      isDark 
                        ? 'text-gray-400 hover:text-gray-300' 
                        : 'text-gray-600 hover:text-gray-700'
                    }`}
                  >
                    ← Zurück zur Übersicht
                  </button>
                </div>
              ) : (
                /* Demo Preview */
                <div className="space-y-6">
                  {/* Mock App Screenshot */}
                  <div className={`backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-2xl border transition-colors duration-200 ${
                    isDark 
                      ? 'bg-gray-800/90 border-gray-700' 
                      : 'bg-white/90 border-gray-200'
                  }`}>
                    <div className={`rounded-lg p-3 lg:p-4 mb-4 transition-colors duration-200 ${
                      isDark ? 'bg-gray-900' : 'bg-gray-100'
                    }`}>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-2 h-2 lg:w-3 lg:h-3 bg-red-500 rounded-full"></div>
                        <div className="w-2 h-2 lg:w-3 lg:h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full"></div>
                      </div>
                      
                      {/* Mock Live Tracking */}
                      <div className="space-y-3 lg:space-y-4">
                        <div className="text-center">
                          <div className="text-2xl lg:text-4xl font-mono font-bold text-green-400 mb-2">25:30</div>
                          <div className="text-xs lg:text-sm text-gray-400">Live Training</div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 lg:gap-3">
                          <div className={`rounded-lg p-2 lg:p-3 text-center transition-colors duration-200 ${
                            isDark ? 'bg-gray-800' : 'bg-white'
                          }`}>
                            <div className="text-sm lg:text-lg font-bold text-blue-400">2.1 km</div>
                            <div className={`text-xs transition-colors duration-200 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>Distanz</div>
                          </div>
                          <div className={`rounded-lg p-2 lg:p-3 text-center transition-colors duration-200 ${
                            isDark ? 'bg-gray-800' : 'bg-white'
                          }`}>
                            <div className="text-sm lg:text-lg font-bold text-orange-400">156 kcal</div>
                            <div className={`text-xs transition-colors duration-200 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>Kalorien</div>
                          </div>
                          <div className={`rounded-lg p-2 lg:p-3 text-center transition-colors duration-200 ${
                            isDark ? 'bg-gray-800' : 'bg-white'
                          }`}>
                            <div className="text-sm lg:text-lg font-bold text-purple-400">4.8 km/h</div>
                            <div className={`text-xs transition-colors duration-200 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>Speed</div>
                          </div>
                        </div>
                        
                        {/* Mock Speed Chart */}
                        <div className={`rounded-lg p-2 lg:p-3 transition-colors duration-200 ${
                          isDark ? 'bg-gray-800' : 'bg-white'
                        }`}>
                          <div className={`h-16 lg:h-20 rounded flex items-end justify-between px-2 transition-colors duration-200 ${
                            isDark 
                              ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20' 
                              : 'bg-gradient-to-r from-green-500/30 to-blue-500/30'
                          }`}>
                            {[40, 60, 80, 70, 90, 85, 95, 75].map((height, i) => (
                              <div
                                key={i}
                                className="bg-green-500 w-1 lg:w-2 rounded-t"
                                style={{ height: `${height}%` }}
                              ></div>
                            ))}
                          </div>
                          <div className={`text-xs mt-2 text-center transition-colors duration-200 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>Geschwindigkeitsverlauf</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-sm mb-2 transition-colors duration-200 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>Live Demo</div>
                      <div className={`text-base lg:text-lg font-semibold transition-colors duration-200 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>Professionelles Training-Interface</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className={`py-12 lg:py-20 transition-colors duration-200 ${
        isDark ? 'bg-gray-800/50' : 'bg-white/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className={`text-2xl lg:text-4xl font-bold mb-4 transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Alles was Sie für erfolgreiches Training brauchen
            </h2>
            <p className={`text-lg lg:text-xl max-w-3xl mx-auto transition-colors duration-200 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Unser Walking-Pad Tracker bietet professionelle Features für ambitionierte Fitness-Enthusiasten
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className={`rounded-xl p-6 h-full transition-all duration-300 transform group-hover:scale-105 border ${
                  isDark 
                    ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' 
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}>
                  <div className={`${feature.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className={`text-lg lg:text-xl font-semibold mb-3 transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{feature.title}</h3>
                  <p className={`text-sm lg:text-base leading-relaxed transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className={`text-2xl lg:text-4xl font-bold mb-4 transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>So einfach geht's</h2>
            <p className={`text-lg lg:text-xl transition-colors duration-200 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>In nur 3 Schritten zu Ihrem perfekten Training</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Registrieren & Einrichten',
                description: 'Erstellen Sie Ihr kostenloses Konto und richten Sie Ihr Profil ein.',
                icon: UserPlus
              },
              {
                step: '02',
                title: 'Training starten',
                description: 'Wählen Sie einen Timer oder erstellen Sie ein individuelles Programm.',
                icon: Play
              },
              {
                step: '03',
                title: 'Fortschritte verfolgen',
                description: 'Analysieren Sie Ihre Ergebnisse und verfolgen Sie Ihre Verbesserungen.',
                icon: TrendingUp
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                    <item.icon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 lg:w-8 lg:h-8 bg-gray-800 rounded-full flex items-center justify-center border-2 border-green-500">
                    <span className="text-xs lg:text-sm font-bold text-green-400">{item.step}</span>
                  </div>
                </div>
                <h3 className={`text-lg lg:text-xl font-semibold mb-3 transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{item.title}</h3>
                <p className={`text-sm lg:text-base transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-12 lg:py-20 transition-colors duration-200 ${
        isDark 
          ? 'bg-gradient-to-r from-green-900/20 to-blue-900/20' 
          : 'bg-gradient-to-r from-green-100/50 to-blue-100/50'
      }`}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6 transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Bereit für Ihr nächstes Training?
          </h2>
          <p className={`text-lg lg:text-xl mb-6 lg:mb-8 transition-colors duration-200 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Starten Sie noch heute kostenlos und entdecken Sie, wie einfach professionelles Training-Tracking sein kann.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => switchAuthMode('register')}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-6 lg:px-8 py-3 lg:py-4 rounded-lg text-white font-semibold text-base lg:text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
              <span>Jetzt kostenlos starten</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          <p className={`text-sm mt-4 transition-colors duration-200 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Keine Kreditkarte erforderlich • Sofort einsatzbereit • 100% kostenlos
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-8 lg:py-12 transition-colors duration-200 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center ${
                !isDark ? 'shadow-md' : ''
              }`}>
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className={`text-lg lg:text-xl font-bold transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Walking-Pad Tracker</span>
            </div>
            
            <div className={`flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-center md:text-left transition-colors duration-200 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <p className="text-sm">&copy; 2025 Walking-Pad Tracker by Staubi. Bleiben Sie aktiv und gesund!</p>
              <a 
                href="https://github.com/staubi82" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1 text-sm"
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
    </div>
  );
};