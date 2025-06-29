import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

// Auth Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const githubProvider = new GithubAuthProvider();

// Konfiguriere Provider
googleProvider.addScope('profile');
googleProvider.addScope('email');

facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

githubProvider.addScope('user:email');

// Benutzer registrieren
export const registerUser = async (email: string, password: string, displayName: string, rememberMe: boolean = false) => {
  try {
    // Setze Persistenz basierend auf "Eingeloggt bleiben"
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Aktualisiere Profil mit Display Name
    if (userCredential.user && displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
    }
    
    return userCredential.user;
  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    throw error;
  }
};

// Benutzer anmelden
export const loginUser = async (email: string, password: string, rememberMe: boolean = false) => {
  try {
    // Setze Persistenz basierend auf "Eingeloggt bleiben"
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Fehler bei der Anmeldung:', error);
    throw error;
  }
};

// Google Login
export const loginWithGoogle = async (rememberMe: boolean = false) => {
  try {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Fehler beim Google Login:', error);
    throw error;
  }
};

// Facebook Login
export const loginWithFacebook = async (rememberMe: boolean = false) => {
  try {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    const result = await signInWithPopup(auth, facebookProvider);
    return result.user;
  } catch (error) {
    console.error('Fehler beim Facebook Login:', error);
    throw error;
  }
};

// GitHub Login
export const loginWithGithub = async (rememberMe: boolean = false) => {
  try {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    const result = await signInWithPopup(auth, githubProvider);
    return result.user;
  } catch (error) {
    console.error('Fehler beim GitHub Login:', error);
    throw error;
  }
};

// Benutzer abmelden
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Fehler beim Abmelden:', error);
    throw error;
  }
};

// Passwort zurücksetzen
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Fehler beim Passwort zurücksetzen:', error);
    throw error;
  }
};

// Profil aktualisieren
export const updateUserProfile = async (user: User, updates: { displayName?: string; photoURL?: string }) => {
  try {
    await updateProfile(user, updates);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Profils:', error);
    throw error;
  }
};

// Auth State Listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Aktueller Benutzer
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Hilfsfunktionen für Fehlermeldungen
export const getAuthErrorMessage = (error: any): string => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'Kein Benutzer mit dieser E-Mail-Adresse gefunden.';
    case 'auth/wrong-password':
      return 'Falsches Passwort.';
    case 'auth/email-already-in-use':
      return 'Diese E-Mail-Adresse wird bereits verwendet.';
    case 'auth/weak-password':
      return 'Das Passwort ist zu schwach. Mindestens 6 Zeichen erforderlich.';
    case 'auth/invalid-email':
      return 'Ungültige E-Mail-Adresse.';
    case 'auth/user-disabled':
      return 'Dieses Benutzerkonto wurde deaktiviert.';
    case 'auth/too-many-requests':
      return 'Zu viele Anmeldeversuche. Versuchen Sie es später erneut.';
    case 'auth/network-request-failed':
      return 'Netzwerkfehler. Überprüfen Sie Ihre Internetverbindung.';
    case 'auth/popup-closed-by-user':
      return 'Anmeldung wurde vom Benutzer abgebrochen.';
    case 'auth/popup-blocked':
      return 'Popup wurde blockiert. Bitte erlauben Sie Popups für diese Seite.';
    case 'auth/cancelled-popup-request':
      return 'Anmeldung wurde abgebrochen.';
    case 'auth/account-exists-with-different-credential':
      return 'Ein Konto mit dieser E-Mail-Adresse existiert bereits mit einem anderen Anmeldeverfahren.';
    default:
      return error.message || 'Ein unbekannter Fehler ist aufgetreten.';
  }
};