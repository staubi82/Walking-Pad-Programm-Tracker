import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';
import { TrainingSession, TrainingProgram } from '../types';

// Training Sessions
export const saveTrainingSession = async (session: Omit<TrainingSession, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'trainingSessions'), {
      ...session,
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
    const q = query(collection(db, 'trainingSessions'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate()
    })) as TrainingSession[];
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
    await deleteDoc(doc(db, 'trainingSessions', id));
  } catch (error) {
    console.error('Fehler beim Löschen der Trainingseinheit:', error);
    throw error;
  }
};

// Training Programs
export const saveTrainingProgram = async (program: Omit<TrainingProgram, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'trainingPrograms'), {
      ...program,
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
    const q = query(collection(db, 'trainingPrograms'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    })) as TrainingProgram[];
  } catch (error) {
    console.error('Fehler beim Laden der Trainingsprogramme:', error);
    return [];
  }
};