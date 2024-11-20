import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Workspace, Note } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyCnIusN2kXesUqy5GBrP3uWuaAH85K6KNE",
  authDomain: "notes-app-f5310.firebaseapp.com",
  projectId: "notes-app-f5310",
  storageBucket: "notes-app-f5310.appspot.com", // Updated to standard format
  messagingSenderId: "563844045225",
  appId: "1:563844045225:web:f3f6d8e991c1f12be90cb8",
  measurementId: "G-M1HT1RJLHP"
};

console.log('Initializing Firebase...');
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
console.log('Firebase initialized successfully');

// Firestore operations
export const saveWorkspace = async (workspace: Omit<Workspace, 'id'>) => {
  try {
    console.log('Saving workspace:', workspace);
    const docRef = await addDoc(collection(db, 'workspaces'), {
      ...workspace,
      createdAt: new Date(),
      notes: workspace.notes || []
    });
    console.log('Workspace saved successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving workspace:', error);
    throw error;
  }
};

export const getAllWorkspaces = (callback: (workspaces: Workspace[]) => void) => {
  try {
    console.log('Setting up workspaces listener...');
    const q = query(collection(db, 'workspaces'));
    return onSnapshot(q, (querySnapshot) => {
      const workspaces: Workspace[] = [];
      querySnapshot.forEach((doc) => {
        workspaces.push({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          notes: (doc.data().notes || []).map((note: any) => ({
            ...note,
            createdAt: note.createdAt?.toDate(),
            updatedAt: note.updatedAt?.toDate()
          }))
        } as Workspace);
      });
      console.log('Workspaces updated:', workspaces.length);
      callback(workspaces);
    });
  } catch (error) {
    console.error('Error getting workspaces:', error);
    throw error;
  }
};

export const updateWorkspace = async (workspaceId: string, data: Partial<Workspace>) => {
  try {
    console.log('Updating workspace:', workspaceId, data);
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    await updateDoc(workspaceRef, {
      ...data,
      updatedAt: new Date()
    });
    console.log('Workspace updated successfully');
  } catch (error) {
    console.error('Error updating workspace:', error);
    throw error;
  }
};

export const deleteWorkspace = async (workspaceId: string) => {
  try {
    console.log('Deleting workspace:', workspaceId);
    await deleteDoc(doc(db, 'workspaces', workspaceId));
    console.log('Workspace deleted successfully');
  } catch (error) {
    console.error('Error deleting workspace:', error);
    throw error;
  }
};

export const saveRecording = async (audioBlob: Blob, workspaceId: string, noteId: string) => {
  try {
    console.log('Saving recording for workspace:', workspaceId, 'note:', noteId);
    const fileName = `recordings/${workspaceId}/${noteId}/${Date.now()}.webm`;
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, audioBlob);
    const url = await getDownloadURL(storageRef);
    console.log('Recording saved successfully:', url);
    return url;
  } catch (error) {
    console.error('Error saving recording:', error);
    throw error;
  }
};

// Helper function to handle Firestore timestamps
export const convertTimestamps = (obj: any) => {
  if (obj?.createdAt?.toDate) {
    obj.createdAt = obj.createdAt.toDate();
  }
  if (obj?.updatedAt?.toDate) {
    obj.updatedAt = obj.updatedAt.toDate();
  }
  return obj;
};