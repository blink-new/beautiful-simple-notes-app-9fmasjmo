
import { Note, Category } from '../types';

// Default categories
export const defaultCategories: Category[] = [
  { id: 'personal', name: 'Personal', color: '#f87171' },
  { id: 'work', name: 'Work', color: '#60a5fa' },
  { id: 'ideas', name: 'Ideas', color: '#4ade80' },
  { id: 'tasks', name: 'Tasks', color: '#facc15' },
];

// Local storage keys
const NOTES_STORAGE_KEY = 'notes-app-notes';
const CATEGORIES_STORAGE_KEY = 'notes-app-categories';

// Load notes from local storage
export const loadNotes = (): Note[] => {
  const storedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
  if (storedNotes) {
    try {
      const parsedNotes = JSON.parse(storedNotes);
      return parsedNotes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to parse notes from localStorage:', error);
      return [];
    }
  }
  return [];
};

// Save notes to local storage
export const saveNotes = (notes: Note[]): void => {
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
};

// Load categories from local storage
export const loadCategories = (): Category[] => {
  const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
  if (storedCategories) {
    try {
      return JSON.parse(storedCategories);
    } catch (error) {
      console.error('Failed to parse categories from localStorage:', error);
      return defaultCategories;
    }
  }
  return defaultCategories;
};

// Save categories to local storage
export const saveCategories = (categories: Category[]): void => {
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
};

// Generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};