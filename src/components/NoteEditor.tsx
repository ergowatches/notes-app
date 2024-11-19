import React, { useState } from 'react';
import { Mic, Clock, Calendar, Volume2, Download, Edit2, Trash2 } from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
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
  
  const activeWorkspaceData = workspaces.find(w => w.id === activeWorkspace);
  const activeNoteData = activeWorkspaceData?.notes.find(n => n.id === activeNote);

  const handleRecordingSave = (audioUrl: string, duration: number, title: string) => {
    if (activeWorkspaceData && activeNoteData) {
      const newRecording: Recording = {
        id: Date.now().toString(),
        url: audioUrl,
        title,
        duration,
        createdAt: new Date()
      };

      onUpdateNote(activeWorkspaceData.id, activeNoteData.id, {
        recordings: [...(activeNoteData.recordings || []), newRecording],
        updatedAt: new Date()
      });
    }
    setShowRecorder(false);
  };

  const handleRecordingDelete = (recordingId: string) => {
    if (activeWorkspaceData && activeNoteData) {
      const updatedRecordings = activeNoteData.recordings.filter(r => r.id !== recordingId);
      onUpdateNote(activeWorkspaceData.id, activeNoteData.id, {
        recordings: updatedRecordings,
        updatedAt: new Date()
      });
    }
  };

  const handleRecordingRename = (recordingId: string, newTitle: string) => {
    if (activeWorkspaceData && activeNoteData) {
      const updatedRecordings = activeNoteData.recordings.map(r =>
        r.id === recordingId ? { ...r, title: newTitle } : r
      );
      onUpdateNote(activeWorkspaceData.id, activeNoteData.id, {
        recordings: updatedRecordings,
        updatedAt: new Date()
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!activeWorkspaceData || !activeNoteData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <h2 className="text-xl font-bold mb-2">No Note Selected</h2>
          <p>Select or create a note to start writing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={activeNoteData.title}
            onChange={(e) =>
              onUpdateNote(activeWorkspaceData.id, activeNoteData.id, {
                title: e.target.value,
                updatedAt: new Date(),
              })
            }
            className="text-2xl font-bold bg-transparent border-none focus:outline-none flex-1"
            placeholder="Untitled Note..."
          />
          <button
            onClick={() => setShowRecorder(true)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Mic size={18} />
            <span>Record</span>
          </button>
        </div>

        <div className="flex items-center space-x-6 text-sm text-gray-500">
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
              {activeNoteData.recordings.length} Recording{activeNoteData.recordings.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Note Content */}
        <div className="flex-1 p-6 overflow-auto">
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
        {showRecordings && activeNoteData.recordings && activeNoteData.recordings.length > 0 && (
          <div className="w-80 border-l bg-gray-50">
            <div className="p-4">
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <Volume2 size={18} className="mr-2" />
                Recordings
              </h3>

              <div className="space-y-4">
                {activeNoteData.recordings.map((recording) => (
                  <div
                    key={recording.id}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{recording.title}</span>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            const newTitle = prompt('Enter new title', recording.title);
                            if (newTitle) handleRecordingRename(recording.id, newTitle);
                          }}
                          className="p-1 hover:text-blue-600"
                          title="Rename"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = recording.url;
                            link.download = `${recording.title}.webm`;
                            link.click();
                          }}
                          className="p-1 hover:text-green-600"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => handleRecordingDelete(recording.id)}
                          className="p-1 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      Duration: {formatDuration(recording.duration)}
                      <span className="mx-2">•</span>
                      {new Date(recording.createdAt).toLocaleString()}
                    </div>
                    <audio
                      controls
                      src={recording.url}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
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