import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { NoteEditor } from './components/NoteEditor';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import type { Workspace, Note } from './types';
import './index.css';

const App: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<string | null>(null);

  useEffect(() => {
    const q = collection(db, 'workspaces');
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
        createdAt: new Date()
      });
      setActiveWorkspace(docRef.id);
    } catch (error) {
      console.error('Error adding workspace:', error);
    }
  };

  const addNote = async (workspaceId: string) => {
    try {
      const workspace = workspaces.find(w => w.id === workspaceId);
      if (workspace) {
        const newNote: Note = {
          id: Date.now().toString(),
          title: 'New Note',
          content: '',
          recordings: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const workspaceRef = doc(db, 'workspaces', workspaceId);
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
      const workspace = workspaces.find(w => w.id === workspaceId);
      if (workspace) {
        const updatedNotes = workspace.notes.map(note =>
          note.id === noteId ? { ...note, ...updates, updatedAt: new Date() } : note
        );
        
        const workspaceRef = doc(db, 'workspaces', workspaceId);
        await updateDoc(workspaceRef, {
          notes: updatedNotes
        });
      }
    } catch (error) {
      console.error('Error updating note:', error);
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
      />
      <NoteEditor
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        activeNote={activeNote}
        onUpdateNote={updateNote}
      />
    </Layout>
  );
};

export default App;