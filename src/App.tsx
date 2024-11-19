import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { NoteEditor } from './components/NoteEditor';
import { db, storage } from './firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Workspace, Note } from './types';

const App: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<string | null>(null);

  // Fetch workspaces from Firestore
  useEffect(() => {
    const q = query(collection(db, 'workspaces'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const workspacesData: Workspace[] = [];
      querySnapshot.forEach((doc) => {
        workspacesData.push({ id: doc.id, ...doc.data() } as Workspace);
      });
      setWorkspaces(workspacesData);
    });

    return () => unsubscribe();
  }, []);

  const addWorkspace = async (name: string) => {
    try {
      const docRef = await addDoc(collection(db, 'workspaces'), {
        name,
        notes: [],
        createdAt: new Date(),
      });
      setActiveWorkspace(docRef.id);
    } catch (error) {
      console.error('Error adding workspace:', error);
    }
  };

  const addNote = async (workspaceId: string) => {
    try {
      const workspaceRef = doc(db, 'workspaces', workspaceId);
      const newNote: Note = {
        id: Date.now().toString(),
        title: 'New Note',
        content: '',
        recordings: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const workspace = workspaces.find(w => w.id === workspaceId);
      if (workspace) {
        await updateDoc(workspaceRef, {
          notes: [...workspace.notes, newNote]
        });
        setActiveNote(newNote.id);
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const updateNote = async (workspaceId: string, noteId: string, updates: Partial<Note>) => {
    try {
      const workspaceRef = doc(db, 'workspaces', workspaceId);
      const workspace = workspaces.find(w => w.id === workspaceId);
      
      if (workspace) {
        const updatedNotes = workspace.notes.map(note =>
          note.id === noteId ? { ...note, ...updates, updatedAt: new Date() } : note
        );
        
        await updateDoc(workspaceRef, { notes: updatedNotes });
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  // Handle audio recordings
  const saveRecording = async (audioBlob: Blob, workspaceId: string, noteId: string) => {
    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `recordings/${workspaceId}/${noteId}/${Date.now()}.webm`);
      await uploadBytes(storageRef, audioBlob);
      const url = await getDownloadURL(storageRef);
      
      // Update note with recording URL
      const workspace = workspaces.find(w => w.id === workspaceId);
      const note = workspace?.notes.find(n => n.id === noteId);
      
      if (workspace && note) {
        const updatedRecordings = [...(note.recordings || []), {
          id: Date.now().toString(),
          url,
          title: `Recording ${note.recordings.length + 1}`,
          duration: 0, // You'll need to calculate this
          createdAt: new Date()
        }];
        
        await updateNote(workspaceId, noteId, { recordings: updatedRecordings });
      }
    } catch (error) {
      console.error('Error saving recording:', error);
    }
  };

  return (
    <Layout>
      <Sidebar
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        activeNote={activeNote}
        onAddWorkspace={addWorkspace}
        onSelectWorkspace={setActiveWorkspace}
        onAddNote={addNote}
        onSelectNote={(wId, nId) => {
          setActiveWorkspace(wId);
          setActiveNote(nId);
        }}
        onDeleteNote={async (wId, nId) => {
          const workspace = workspaces.find(w => w.id === wId);
          if (workspace) {
            const workspaceRef = doc(db, 'workspaces', wId);
            await updateDoc(workspaceRef, {
              notes: workspace.notes.filter(n => n.id !== nId)
            });
            if (activeNote === nId) setActiveNote(null);
          }
        }}
        onDeleteWorkspace={async (wId) => {
          await deleteDoc(doc(db, 'workspaces', wId));
          if (activeWorkspace === wId) {
            setActiveWorkspace(null);
            setActiveNote(null);
          }
        }}
      />
      <NoteEditor
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        activeNote={activeNote}
        onUpdateNote={updateNote}
        onSaveRecording={saveRecording}
      />
    </Layout>
  );
};

export default App;