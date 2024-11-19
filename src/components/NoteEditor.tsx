import React, { useState } from 'react';
import { Mic, Clock, Calendar, Volume2, ChevronRight, ChevronLeft } from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
import { RecordingsPanel } from './RecordingsPanel';
import type { Workspace, Note, Recording } from '../types';

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
  const [showRecorder, setShowRecorder] = useState(false);
  const [showRecordings, setShowRecordings] = useState(true);
  
  const activeWorkspaceData = workspaces.find((w) => w.id === activeWorkspace);
  const activeNoteData = activeWorkspaceData?.notes.find((n) => n.id === activeNote);

  const handleRecordingSave = (audioUrl: string, duration: number, title: string) => {
    if (activeWorkspaceData && activeNoteData) {
      const newRecording: Recording = {
        id: Date.now().toString(),
        url: audioUrl,
        title,
        duration,
        createdAt: new Date()
      };

      const updatedRecordings = [...(activeNoteData.recordings || []), newRecording];
      
      onUpdateNote(activeWorkspaceData.id, activeNoteData.id, {
        recordings: updatedRecordings,
        updatedAt: new Date()
      });
    }
    setShowRecorder(false);
  };

  const handleRecordingDelete = (recordingId: string) => {
    if (activeWorkspaceData && activeNoteData && activeNoteData.recordings) {
      const updatedRecordings = activeNoteData.recordings.filter(
        rec => rec.id !== recordingId
      );
      
      onUpdateNote(activeWorkspaceData.id, activeNoteData.id, {
        recordings: updatedRecordings,
        updatedAt: new Date()
      });
    }
  };

  const handleRecordingRename = (recordingId: string, newTitle: string) => {
    if (activeWorkspaceData && activeNoteData && activeNoteData.recordings) {
      const updatedRecordings = activeNoteData.recordings.map(rec =>
        rec.id === recordingId ? { ...rec, title: newTitle } : rec
      );
      
      onUpdateNote(activeWorkspaceData.id, activeNoteData.id, {
        recordings: updatedRecordings,
        updatedAt: new Date()
      });
    }
  };

  if (!activeWorkspaceData || !activeNoteData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <h3 className="text-xl font-semibold mb-2">No Note Selected</h3>
          <p>Select or create a note to start writing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b px-8 py-4">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={activeNoteData.title}
            onChange={(e) =>
              onUpdateNote(activeWorkspaceData.id, activeNoteData.id, {
                title: e.target.value,
                updatedAt: new Date(),
              })
            }
            className="text-3xl font-bold bg-transparent border-none focus:outline-none flex-1"
            placeholder="Untitled Note..."
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRecorder(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
            >
              <Mic size={16} />
              <span>Record</span>
            </button>
            <button
              onClick={() => setShowRecordings(!showRecordings)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {showRecordings ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-sm text-gray-500 mt-2">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            Created: {new Date(activeNoteData.createdAt).toLocaleString()}
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            Updated: {new Date(activeNoteData.updatedAt).toLocaleString()}
          </div>
          {activeNoteData.recordings?.length > 0 && (
            <div className="flex items-center">
              <Mic size={14} className="mr-1" />
              {activeNoteData.recordings.length} Recording
              {activeNoteData.recordings.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Note Content */}
        <div className="flex-1 p-4">
          <textarea
            value={activeNoteData.content}
            onChange={(e) =>
              onUpdateNote(activeWorkspaceData.id, activeNoteData.id, {
                content: e.target.value,
                updatedAt: new Date(),
              })
            }
            className="w-full h-full resize-none focus:outline-none text-lg"
            placeholder="Start writing..."
          />
        </div>

        {/* Recordings Panel */}
        {showRecordings && activeNoteData.recordings && (
          <div className="w-80 border-l bg-gray-50 overflow-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Volume2 size={18} className="mr-2" />
                Recordings
              </h3>
            </div>
            <RecordingsPanel
              recordings={activeNoteData.recordings}
              onDelete={handleRecordingDelete}
              onRename={handleRecordingRename}
            />
          </div>
        )}
      </div>

      {/* Recording Modal */}
      {showRecorder && (
        <AudioRecorder
          onSave={handleRecordingSave}
          onClose={() => setShowRecorder(false)}
        />
      )}
    </div>
  );
};

export default NoteEditor;