import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Activity } from 'lucide-react';
import { resetPassword, getAuthErrorMessage } from '../../firebase/auth';

export const PasswordResetPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error: any) {
      setError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-6">
              <Activity className="w-12 h-12 text-green-500" />
              <h1 className="text-3xl font-bold text-white">Walking-Pad Tracker</h1>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">E-Mail gesendet!</h2>
            
            <p className="text-gray-300 mb-6">
              Wir haben Ihnen eine E-Mail mit Anweisungen zum Zurücksetzen Ihres Passworts an{' '}
              <span className="font-medium text-green-400">{email}</span> gesendet.
            </p>
            
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
              <p className="text-blue-300 text-sm">
                💡 <strong>Tipp:</strong> Überprüfen Sie auch Ihren Spam-Ordner, falls Sie die E-Mail nicht erhalten haben.
              </p>
            </div>

            <div className="space-y-4">
              <Link
                to="/login"
                className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg text-white font-medium transition-colors inline-flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Zurück zur Anmeldung
              </Link>
              
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="w-full bg-gray-600 hover:bg-gray-500 px-4 py-3 rounded-lg text-white font-medium transition-colors"
              >
                Erneut senden
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <Activity className="w-12 h-12 text-green-500" />
            <h1 className="text-3xl font-bold text-white">Walking-Pad Tracker</h1>
          </div>
          <h2 className="text-2xl font-bold text-white">Passwort zurücksetzen</h2>
          <p className="mt-2 text-gray-400">
            Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-gray-800 rounded-xl p-8 shadow-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-Mail-Adresse
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="ihre.email@beispiel.de"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Reset-Link senden
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zur Anmeldung
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};