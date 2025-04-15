
import { useState, useEffect } from 'react';
import { Note, Category } from '../types';
import { 
  loadNotes, 
  saveNotes, 
  loadCategories, 
  saveCategories, 
  generateId, 
  defaultCategories 
} from '../lib/store';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Load notes and categories from localStorage on initial render
  useEffect(() => {
    setNotes(loadNotes());
    setCategories(loadCategories());
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  // Create a new note
  const createNote = (category: string = 'personal') => {
    const newNote: Note = {
      id: generateId(),
      title: 'Untitled Note',
      content: '',
      category,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
    };
    
    setNotes(prevNotes => [newNote, ...prevNotes]);
    setActiveNote(newNote);
    return newNote;
  };

  // Update a note
  const updateNote = (updatedNote: Note) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === updatedNote.id 
          ? { ...updatedNote, updatedAt: new Date() } 
          : note
      )
    );
    
    if (activeNote?.id === updatedNote.id) {
      setActiveNote({ ...updatedNote, updatedAt: new Date() });
    }
  };

  // Delete a note
  const deleteNote = (id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    
    if (activeNote?.id === id) {
      setActiveNote(null);
    }
  };

  // Toggle pin status
  const togglePinned = (id: string) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === id 
          ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() } 
          : note
      )
    );
    
    if (activeNote?.id === id) {
      setActiveNote(prev => prev ? { ...prev, isPinned: !prev.isPinned, updatedAt: new Date() } : null);
    }
  };

  // Create a new category
  const createCategory = (name: string, color: string = '#64748b') => {
    const newCategory: Category = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      color,
    };
    
    setCategories(prevCategories => [...prevCategories, newCategory]);
    return newCategory;
  };

  // Delete a category and reassign its notes
  const deleteCategory = (id: string, reassignTo: string = 'personal') => {
    setCategories(prevCategories => 
      prevCategories.filter(category => category.id !== id)
    );
    
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.category === id 
          ? { ...note, category: reassignTo, updatedAt: new Date() } 
          : note
      )
    );
    
    if (activeCategory === id) {
      setActiveCategory(null);
    }
  };

  // Filter notes based on search query and active category
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery 
      ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesCategory = activeCategory 
      ? note.category === activeCategory 
      : true;
      
    return matchesSearch && matchesCategory;
  });

  // Sort notes: pinned first, then by updatedAt
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // First sort by pinned status
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Then sort by updatedAt (newest first)
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  return {
    notes: sortedNotes,
    categories,
    activeNote,
    searchQuery,
    activeCategory,
    setActiveNote,
    setSearchQuery,
    setActiveCategory,
    createNote,
    updateNote,
    deleteNote,
    togglePinned,
    createCategory,
    deleteCategory,
  };
}