import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../config/firebase';

/**
 * Uploads an audio file to Firebase Storage and saves metadata to Firestore.
 */
 export const uploadAudioFile = async (userId, fileUri, fileName) => {
  try {
    console.log("1. Starting upload process...");

    console.log("2. Fetching local file to convert to Blob...");
    const response = await fetch(fileUri);
    const blob = await response.blob();
    console.log("Blob created successfully!");

    console.log("3. Pushing to Firebase Storage...");
    const storageRef = ref(storage, `users/${userId}/audio/${fileName}`);
    const snapshot = await uploadBytes(storageRef, blob);
    console.log("Storage upload complete!");

    console.log("4. Getting download URL...");
    const downloadUrl = await getDownloadURL(snapshot.ref);

    console.log("5. Writing to Firestore...");
    const docRef = await addDoc(collection(db, 'audioFiles'), {
      userId,
      fileName,
      downloadUrl,
      createdAt: serverTimestamp(),
    });
    console.log("Firestore write complete!");

    return { success: true, downloadUrl, error: null };
  } catch (error) {
    console.error("UPLOAD ERROR CAUGHT:", error);
    return { success: false, downloadUrl: null, error: error.message };
  }
};
