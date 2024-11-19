import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Workspace, Note } from './types';

const firebaseConfig = {
    apiKey: "AIzaSyCnIusN2kXesUqy5GBrP3uWuaAH85K6KNE",
    authDomain: "notes-app-f5310.firebaseapp.com",
    projectId: "notes-app-f5310",
    storageBucket: "notes-app-f5310.firebasestorage.app",
    messagingSenderId: "563844045225",
    appId: "1:563844045225:web:f3f6d8e991c1f12be90cb8",
    measurementId: "G-M1HT1RJLHP"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Firestore operations
export const saveWorkspace = async (workspace: Omit<Workspace, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'workspaces'), workspace);
    return docRef.id;
  } catch (error) {
    console.error('Error saving workspace:', error);
    throw error;
  }
};

export const getAllWorkspaces = (callback: (workspaces: Workspace[]) => void) => {
  const q = query(collection(db, 'workspaces'));
  return onSnapshot(q, (querySnapshot) => {
    const workspaces: Workspace[] = [];
    querySnapshot.forEach((doc) => {
      workspaces.push({ id: doc.id, ...doc.data() } as Workspace);
    });
    callback(workspaces);
  });
};

export const updateWorkspace = async (workspaceId: string, data: Partial<Workspace>) => {
  try {
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    await updateDoc(workspaceRef, data);
  } catch (error) {
    console.error('Error updating workspace:', error);
    throw error;
  }
};

export const deleteWorkspace = async (workspaceId: string) => {
  try {
    await deleteDoc(doc(db, 'workspaces', workspaceId));
  } catch (error) {
    console.error('Error deleting workspace:', error);
    throw error;
  }
};

export const saveRecording = async (audioBlob: Blob, workspaceId: string, noteId: string) => {
  try {
    const storageRef = ref(storage, `recordings/${workspaceId}/${noteId}/${Date.now()}.webm`);
    await uploadBytes(storageRef, audioBlob);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error saving recording:', error);
    throw error;
  }
};