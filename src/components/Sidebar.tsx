import React, { useState } from 'react';
import { Settings, Search, ChevronDown, ChevronRight, Trash2, Plus, FolderClosed } from 'lucide-react';
import type { Workspace } from '../types';

interface SidebarProps {
  workspaces: Workspace[];
  activeWorkspace: string | null;
  activeNote: string | null;
  onAddWorkspace: (name: string) => void;
  onSelectWorkspace: (id: string) => void;
  onAddNote: (workspaceId: string) => void;
  onSelectNote: (workspaceId: string, noteId: string) => void;
  onDeleteNote: (workspaceId: string, noteId: string) => void;
  onDeleteWorkspace: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  workspaces,
  activeWorkspace,
  activeNote,
  onAddWorkspace,
  onSelectWorkspace,
  onAddNote,
  onSelectNote,
  onDeleteNote,
  onDeleteWorkspace,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());

  const toggleWorkspace = (id: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedWorkspaces(newExpanded);
  };

  return (
    <div className="w-72 border-r border-gray-200 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Notes</h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Workspaces List */}
      <div className="flex-1 overflow-auto px-2 py-3">
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="mb-2">
            <div 
              className={`flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors
                         ${activeWorkspace === workspace.id ? 'bg-blue-50' : ''}`}
            >
              <button
                onClick={() => toggleWorkspace(workspace.id)}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
              >
                {expandedWorkspaces.has(workspace.id) ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
              <FolderClosed className="w-4 h-4 text-gray-500 mx-2" />
              <span
                className="flex-1 cursor-pointer text-sm font-medium text-gray-700"
                onClick={() => {
                  onSelectWorkspace(workspace.id);
                  setExpandedWorkspaces(new Set([...expandedWorkspaces, workspace.id]));
                }}
              >
                {workspace.name}
              </span>
              <button
                onClick={() => onDeleteWorkspace(workspace.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded-md transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {expandedWorkspaces.has(workspace.id) && (
              <div className="ml-9 mt-1 space-y-1">
                {workspace.notes.map((note) => (
                  <div
                    key={note.id}
                    className={`flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors group
                              ${activeNote === note.id ? 'bg-blue-50' : ''}`}
                    onClick={() => onSelectNote(workspace.id, note.id)}
                  >
                    <span className="flex-1 text-sm text-gray-600 cursor-pointer">
                      {note.title || 'Untitled Note'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(workspace.id, note.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded-md transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => onAddNote(workspace.id)}
                  className="flex items-center w-full p-2 text-gray-500 hover:bg-gray-100 rounded-md text-sm transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <button
          onClick={() => {
            const name = prompt('Enter workspace name');
            if (name) onAddWorkspace(name);
          }}
          className="flex items-center justify-center w-full p-2 bg-blue-500 hover:bg-blue-600 
                     text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Workspace
        </button>
      </div>
    </div>
  );
};