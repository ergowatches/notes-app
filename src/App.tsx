// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { NoteEditor } from './components/NoteEditor';
import type { Workspace, Note } from './types';
import './App.css';

const App: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    const saved = localStorage.getItem('workspaces');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  const addWorkspace = (name: string) => {
    const newWorkspace: Workspace = {
      id: Date.now().toString(),
      name,
      notes: [],
    };
    setWorkspaces([...workspaces, newWorkspace]);
    setActiveWorkspace(newWorkspace.id);
  };

  const addNote = (workspaceId: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setWorkspaces(workspaces.map(w =>
      w.id === workspaceId
        ? { ...w, notes: [...w.notes, newNote] }
        : w
    ));
    
    setActiveWorkspace(workspaceId);
    setActiveNote(newNote.id);
  };

  const updateNote = (workspaceId: string, noteId: string, updates: Partial<Note>) => {
    setWorkspaces(workspaces.map(w =>
      w.id === workspaceId
        ? {
            ...w,
            notes: w.notes.map(n =>
              n.id === noteId ? { ...n, ...updates } : n
            ),
          }
        : w
    ));
  };

  const deleteNote = (workspaceId: string, noteId: string) => {
    setWorkspaces(workspaces.map(w =>
      w.id === workspaceId
        ? { ...w, notes: w.notes.filter(n => n.id !== noteId) }
        : w
    ));
    if (activeNote === noteId) setActiveNote(null);
  };

  const deleteWorkspace = (workspaceId: string) => {
    setWorkspaces(workspaces.filter(w => w.id !== workspaceId));
    if (activeWorkspace === workspaceId) {
      setActiveWorkspace(null);
      setActiveNote(null);
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
        onDeleteNote={deleteNote}
        onDeleteWorkspace={deleteWorkspace}
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