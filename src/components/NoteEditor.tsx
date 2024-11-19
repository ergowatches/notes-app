import React from 'react';
import type { Workspace, Note } from '../types';

interface NoteEditorProps {
  workspaces: Workspace[];
  activeWorkspace: string | null;
  activeNote: string | null;
  onUpdateNote: (workspaceId: string, noteId: string, updates: Partial<Note>) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  workspaces,
  activeWorkspace,
  activeNote,
  onUpdateNote,
}) => {
  const activeWorkspaceData = workspaces.find(w => w.id === activeWorkspace);
  const activeNoteData = activeWorkspaceData?.notes.find(n => n.id === activeNote);

  if (!activeWorkspaceData || !activeNoteData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-2">No Note Selected</h2>
          <p className="text-gray-500">Select or create a note to start writing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="border-b border-gray-200 p-4">
        <input
          type="text"
          value={activeNoteData.title}
          onChange={(e) =>
            onUpdateNote(activeWorkspaceData.id, activeNoteData.id, {
              title: e.target.value,
            })
          }
          className="text-2xl font-bold w-full focus:outline-none"
          placeholder="Untitled"
        />
      </div>
      <div className="flex-1 p-4">
        <textarea
          value={activeNoteData.content}
          onChange={(e) =>
            onUpdateNote(activeWorkspaceData.id, activeNoteData.id, {
              content: e.target.value,
            })
          }
          className="w-full h-full resize-none focus:outline-none text-gray-700"
          placeholder="Start writing..."
        />
      </div>
    </div>
  );
};