import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth } from './config';

const storage = getStorage();

export const uploadProfileImage = async (file: File): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Benutzer nicht angemeldet');
  }

  // Validierung
  if (!file.type.startsWith('image/')) {
    throw new Error('Bitte wählen Sie eine gültige Bilddatei aus.');
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB Limit
    throw new Error('Das Bild ist zu groß. Maximale Dateigröße: 5MB');
  }

  try {
    // Erstelle Referenz für das Profilbild
    const imageRef = ref(storage, `profile-images/${user.uid}`);
    
    // Lade das Bild hoch
    const snapshot = await uploadBytes(imageRef, file);
    
    // Hole die Download-URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error: any) {
    console.error('Fehler beim Hochladen des Profilbilds:', error);
    throw new Error('Fehler beim Hochladen des Bildes: ' + error.message);
  }
};

export const deleteProfileImage = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Benutzer nicht angemeldet');
  }

  try {
    // Erstelle Referenz für das Profilbild
    const imageRef = ref(storage, `profile-images/${user.uid}`);
    
    // Lösche das Bild
    await deleteObject(imageRef);
  } catch (error: any) {
    // Wenn das Bild nicht existiert, ist das okay
    if (error.code === 'storage/object-not-found') {
      return;
    }
    console.error('Fehler beim Löschen des Profilbilds:', error);
    throw new Error('Fehler beim Löschen des Bildes: ' + error.message);
  }
};

export const getProfileImageUrl = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }

  try {
    const imageRef = ref(storage, `profile-images/${user.uid}`);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error: any) {
    // Wenn das Bild nicht existiert, return null
    if (error.code === 'storage/object-not-found') {
      return null;
    }
    console.error('Fehler beim Laden des Profilbilds:', error);
    return null;
  }
};