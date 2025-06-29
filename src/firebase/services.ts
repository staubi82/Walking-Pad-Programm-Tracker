import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where, 
  Timestamp,
  updateDoc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db, auth } from './config';
import { TrainingSession, TrainingProgram } from '../types';

// User Profile Services
export const saveUserProfile = async (profile: any) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Benutzer nicht angemeldet');
    }

    // Versuche zuerst das Dokument zu aktualisieren
    const docRef = doc(db, 'userProfiles', user.uid);
    await updateDoc(docRef, profile);
  } catch (error) {
    console.warn('Firebase-Fehler beim Speichern des Benutzerprofils:', error);
    
    // Behandle verschiedene Fehlertypen
    if (error.code === 'not-found') {
      // Wenn Dokument nicht existiert, erstelle es
      const user = auth.currentUser;
      if (user) {
        try {
          await setDoc(doc(db, 'userProfiles', user.uid), profile);
        } catch (setError: any) {
          if (setError.code === 'permission-denied' || 
              (setError.message && setError.message.includes('Missing or insufficient permissions'))) {
            console.warn('Firebase Firestore Security Rules müssen konfiguriert werden. Speichere lokal als Fallback.');
            localStorage.setItem(`userProfile_${user.uid}`, JSON.stringify(profile));
            return;
          }
          throw setError;
        }
      }
    } else if (error.code === 'permission-denied' || 
               (error.message && error.message.includes('Missing or insufficient permissions'))) {
      // Berechtigungsfehler - verwende localStorage als Fallback
      console.warn('Firebase Firestore Security Rules müssen konfiguriert werden. Speichere lokal als Fallback.');
      const user = auth.currentUser;
      if (user) {
        localStorage.setItem(`userProfile_${user.uid}`, JSON.stringify(profile));
        return;
      }
    } else {
      throw error;
    }
  }
};

export const getUserProfile = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Benutzer nicht angemeldet');
    }

    const docRef = doc(db, 'userProfiles', user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return {};
    }
  } catch (error) {
    console.warn('Firebase-Fehler beim Laden des Benutzerprofils:', error);
    
    // Spezifische Behandlung für Berechtigungsfehler
    if (error.code === 'permission-denied' || 
        (error.message && error.message.includes('Missing or insufficient permissions'))) {
      console.warn('Firebase Firestore Security Rules müssen konfiguriert werden. Verwende lokalen Speicher als Fallback.');
      
      // Fallback auf localStorage
      const user = auth.currentUser;
      if (user) {
        const saved = localStorage.getItem(`userProfile_${user.uid}`);
        return saved ? JSON.parse(saved) : {};
      }
      return {};
    }
    
    // Für andere Fehler, verwende auch localStorage als Fallback
    const user = auth.currentUser;
    if (user) {
      const saved = localStorage.getItem(`userProfile_${user.uid}`);
      return saved ? JSON.parse(saved) : {};
    }
    
    throw error;
  }
};

// Training Sessions
export const saveTrainingSession = async (session: Omit<TrainingSession, 'id'>) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Benutzer nicht angemeldet');
    }

    const docRef = await addDoc(collection(db, 'trainingSessions'), {
      ...session,
      userId: user.uid,
      date: Timestamp.fromDate(session.date),
      createdAt: Timestamp.fromDate(session.createdAt)
    });
    return docRef.id;
  } catch (error) {
    console.error('Fehler beim Speichern der Trainingseinheit:', error);
    throw error;
  }
};

export const getTrainingSessions = async (): Promise<TrainingSession[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Benutzer nicht angemeldet');
    }

    // Erst nach userId filtern, dann manuell sortieren um Index-Probleme zu vermeiden
    const q = query(
      collection(db, 'trainingSessions'), 
      where('userId', '==', user.uid)
    );
    const querySnapshot = await getDocs(q);
    
    const sessions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      speedHistory: doc.data().speedHistory || [],
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate()
    })) as TrainingSession[];
    
    // Manuell nach Datum sortieren
    return sessions.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    // Spezifische Behandlung für Berechtigungsfehler
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      console.warn('Firebase-Berechtigungen fehlen. Bitte konfigurieren Sie die Firestore-Regeln.');
    } else {
      console.error('Fehler beim Laden der Trainingseinheiten:', error);
    }
    throw error;
  }
};

export const deleteTrainingSession = async (id: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Benutzer nicht angemeldet');
    }

    await deleteDoc(doc(db, 'trainingSessions', id));
  } catch (error) {
    console.error('Fehler beim Löschen der Trainingseinheit:', error);
    throw error;
  }
};

export const updateTrainingSession = async (id: string, updates: Partial<Omit<TrainingSession, 'id' | 'userId'>>) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Benutzer nicht angemeldet');
    }

    const updateData: any = { ...updates };
    
    // Konvertiere Date-Objekte zu Timestamps
    if (updateData.date) {
      updateData.date = Timestamp.fromDate(updateData.date);
    }
    if (updateData.createdAt) {
      updateData.createdAt = Timestamp.fromDate(updateData.createdAt);
    }

    await updateDoc(doc(db, 'trainingSessions', id), updateData);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Trainingseinheit:', error);
    throw error;
  }
};

// Training Programs
export const saveTrainingProgram = async (program: Omit<TrainingProgram, 'id'>) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Benutzer nicht angemeldet');
    }

    const docRef = await addDoc(collection(db, 'trainingPrograms'), {
      ...program,
      userId: user.uid,
      createdAt: Timestamp.fromDate(program.createdAt)
    });
    return docRef.id;
  } catch (error) {
    console.error('Fehler beim Speichern des Trainingsprogramms:', error);
    throw error;
  }
};

export const getTrainingPrograms = async (): Promise<TrainingProgram[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Benutzer nicht angemeldet');
    }

    const q = query(
      collection(db, 'trainingPrograms'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    })) as TrainingProgram[];
  } catch (error) {
    console.error('Fehler beim Laden der Trainingsprogramme:', error);
    throw error;
  }
};