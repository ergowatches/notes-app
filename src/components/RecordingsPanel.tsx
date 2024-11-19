import React from 'react';
import { Clock, Trash2, Edit2, Download } from 'lucide-react';
import type { Recording } from '../types';

interface RecordingsPanelProps {
  recordings: Recording[];
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

export const RecordingsPanel: React.FC<RecordingsPanelProps> = ({
  recordings,
  onDelete,
  onRename,
}) => {
  const formatDuration = (duration: number) => {
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (recordings.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No recordings yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recordings.map((recording) => (
        <div
          key={recording.id}
          className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{recording.title}</span>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  const newTitle = prompt('Enter new title', recording.title);
                  if (newTitle) onRename(recording.id, newTitle);
                }}
                className="p-1 hover:text-blue-600 transition-colors"
                title="Rename"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => onDelete(recording.id)}
                className="p-1 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-500 mb-2 flex items-center space-x-2">
            <Clock size={12} />
            <span>{formatDuration(recording.duration)}</span>
            <span>•</span>
            <span>{new Date(recording.createdAt).toLocaleString()}</span>
          </div>
          <audio
            controls
            src={recording.url}
            className="w-full"
          />
        </div>
      ))}
    </div>
  );
};