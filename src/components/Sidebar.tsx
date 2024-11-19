import React from 'react';
import { Settings, Search, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import type { Workspace } from '../types';

interface SidebarProps {
  workspaces: Workspace[];
  activeWorkspace: string | null;
  activeNote: string | null;
  onAddWorkspace: (name: string) => void;
  onSelectWorkspace: (id: string) => void;
  onAddNote: (workspaceId: string) => void;
  onSelectNote: (workspaceId: string, noteId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  workspaces,
  activeWorkspace,
  activeNote,
  onAddWorkspace,
  onSelectWorkspace,
  onAddNote,
  onSelectNote,
}) => {
  return (
    <div className="w-64 min-w-64 border-r border-gray-200 flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Notes</h1>
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="mb-2">
            <div
              className={`flex items-center p-2 rounded-lg cursor-pointer ${
                activeWorkspace === workspace.id ? 'bg-blue-50' : 'hover:bg-gray-100'
              }`}
              onClick={() => onSelectWorkspace(workspace.id)}
            >
              {activeWorkspace === workspace.id ? (
                <ChevronDown size={16} className="mr-2 text-gray-500" />
              ) : (
                <ChevronRight size={16} className="mr-2 text-gray-500" />
              )}
              <span className="font-medium">{workspace.name}</span>
            </div>

            {activeWorkspace === workspace.id && (
              <div className="ml-6 mt-1 space-y-1">
                {workspace.notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-2 rounded-lg cursor-pointer ${
                      activeNote === note.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => onSelectNote(workspace.id, note.id)}
                  >
                    {note.title}
                  </div>
                ))}
                <button
                  onClick={() => onAddNote(workspace.id)}
                  className="flex items-center w-full p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Plus size={16} className="mr-2" />
                  New Note
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {
            const name = prompt('Enter workspace name');
            if (name) onAddWorkspace(name);
          }}
          className="flex items-center justify-center w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus size={16} className="mr-2" />
          New Workspace
        </button>
      </div>
    </div>
  );
};