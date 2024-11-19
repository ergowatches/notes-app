import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { NoteEditor } from './components/NoteEditor';
import { Auth } from './components/Auth';
import { auth, getAllWorkspaces, saveWorkspace, updateWorkspace, deleteWorkspace, saveRecording } from './firebase';
import type { Workspace, Note } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    const unsubscribeWorkspaces = getAllWorkspaces((workspaces) => {
      setWorkspaces(workspaces);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeWorkspaces();
    };
  }, []);

  const addWorkspace = async (name: string) => {
    try {
      const workspaceId = await saveWorkspace({
        name,
        notes: [],
        createdAt: new Date(),
        userId: user?.uid
      });
      setActiveWorkspace(workspaceId);
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
        await updateWorkspace(workspaceId, { notes: updatedNotes });
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Auth />;
  }

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
            await updateWorkspace(wId, {
              notes: workspace.notes.filter(n => n.id !== nId)
            });
            if (activeNote === nId) setActiveNote(null);
          }
        }}
        onDeleteWorkspace={async (wId) => {
          await deleteWorkspace(wId);
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