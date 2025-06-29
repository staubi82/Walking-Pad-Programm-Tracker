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
  updateDoc
} from 'firebase/firestore';
import { db, auth } from './config';
import { TrainingSession, TrainingProgram } from '../types';

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