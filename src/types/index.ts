export interface Workspace {
    id: string;
    name: string;
    notes: Note[];
  }
  
  export interface Note {
    id: string;
    title: string;
    content: string;
    recordings: Recording[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Recording {
    id: string;
    url: string;
    title: string;
    duration: number;
    createdAt: Date;
  }