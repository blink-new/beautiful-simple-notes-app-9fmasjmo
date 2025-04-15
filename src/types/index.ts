
export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  color?: string;
  isPinned?: boolean;
}

export type Category = {
  id: string;
  name: string;
  color: string;
}