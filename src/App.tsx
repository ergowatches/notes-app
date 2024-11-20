import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { NoteEditor } from './components/NoteEditor';
import { getAllWorkspaces, saveWorkspace, updateWorkspace, deleteWorkspace } from './firebase';
import type { Workspace, Note } from './types';
import './index.css';

const App: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<string | null>(null);

  // Subscribe to workspaces
  useEffect(() => {
    const unsubscribe = getAllWorkspaces((workspacesData) => {
      setWorkspaces(workspacesData);
    });
    return () => unsubscribe();
  }, []);

  const addWorkspace = async (name: string) => {
    try {
      await saveWorkspace({
        name,
        notes: [],
        createdAt: new Date(),
      });
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
          updatedAt: new Date(),
        };

        await updateWorkspace(workspaceId, {
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
        
        await updateWorkspace(workspaceId, {
          notes: updatedNotes
        });
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (workspaceId: string, noteId: string) => {
    try {
      const workspace = workspaces.find(w => w.id === workspaceId);
      if (workspace) {
        await updateWorkspace(workspaceId, {
          notes: workspace.notes.filter(n => n.id !== noteId)
        });
        if (activeNote === noteId) setActiveNote(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const deleteWorkspaceHandler = async (workspaceId: string) => {
    try {
      await deleteWorkspace(workspaceId);
      if (activeWorkspace === workspaceId) {
        setActiveWorkspace(null);
        setActiveNote(null);
      }
    } catch (error) {
      console.error('Error deleting workspace:', error);
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
        onDeleteWorkspace={deleteWorkspaceHandler}
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