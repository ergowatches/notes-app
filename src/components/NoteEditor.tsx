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

  if (!activeWorkspaceData || !activeNoteData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <h2 className="text-2xl font-bold mb-3">No Note Selected</h2>
          <p className="text-gray-400">Select or create a note to start writing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-6 bg-white">
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
            className="text-3xl font-bold bg-transparent border-none focus:outline-none flex-1"
            placeholder="Untitled Note..."
          />
          <button
            onClick={() => setShowRecorder(true)}
            className="btn-record"
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
            <button 
              onClick={() => setShowRecordings(!showRecordings)}
              className="flex items-center text-blue-500 hover:text-blue-600"
            >
              <Volume2 size={14} className="mr-1" />
              {activeNoteData.recordings.length} Recording{activeNoteData.recordings.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Note Content */}
        <div className="flex-1 overflow-auto">
          <textarea
            value={activeNoteData.content}
            onChange={(e) =>
              onUpdateNote(activeWorkspaceData.id, activeNoteData.id, {
                content: e.target.value,
                updatedAt: new Date(),
              })
            }
            className="note-content"
            placeholder="Start writing..."
          />
        </div>

        {/* Recordings Panel */}
        {showRecordings && activeNoteData.recordings && activeNoteData.recordings.length > 0 && (
          <div className="w-96 border-l border-gray-200 bg-gray-50 overflow-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold flex items-center mb-6">
                <Volume2 size={18} className="mr-2" />
                Recordings
              </h3>

              <div className="space-y-4">
                {activeNoteData.recordings.map((recording) => (
                  <div key={recording.id} className="recording-item group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{recording.title}</span>
                      <div className="recording-controls flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const newTitle = prompt('Enter new title', recording.title);
                            if (newTitle) {
                              onUpdateNote(activeWorkspaceData.id, activeNoteData.id, {
                                recordings: activeNoteData.recordings.map(r =>
                                  r.id === recording.id ? { ...r, title: newTitle } : r
                                )
                              });
                            }
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-full"
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
                          className="p-1.5 hover:bg-gray-100 rounded-full"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => {
                            onUpdateNote(activeWorkspaceData.id, activeNoteData.id, {
                              recordings: activeNoteData.recordings.filter(r => r.id !== recording.id)
                            });
                          }}
                          className="p-1.5 hover:bg-red-100 hover:text-red-500 rounded-full"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      {new Date(recording.createdAt).toLocaleString()}
                    </div>
                    <audio
                      controls
                      src={recording.url}
                      className="custom-audio-player"
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
          onSave={(audioUrl, duration, title) => {
            const newRecording: Recording = {
              id: Date.now().toString(),
              url: audioUrl,
              title,
              duration,
              createdAt: new Date(),
            };
            onUpdateNote(activeWorkspaceData.id, activeNoteData.id, {
              recordings: [...(activeNoteData.recordings || []), newRecording],
              updatedAt: new Date(),
            });
            setShowRecorder(false);
          }}
          onClose={() => setShowRecorder(false)}
        />
      )}
    </div>
  );
}