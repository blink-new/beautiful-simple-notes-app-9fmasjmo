
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { v4 as uuidv4 } from 'uuid';

export interface SupabaseNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  category_id: string;
  is_pinned: boolean;
  is_public: boolean;
  public_url?: string;
}

export interface SupabaseCategory {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

export function useSupabaseNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<SupabaseNote[]>([]);
  const [categories, setCategories] = useState<SupabaseCategory[]>([]);
  const [activeNote, setActiveNote] = useState<SupabaseNote | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notes and categories
  useEffect(() => {
    if (!user) {
      setNotes([]);
      setCategories([]);
      setActiveNote(null);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch notes
        const { data: notesData, error: notesError } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('is_pinned', { ascending: false })
          .order('updated_at', { ascending: false });

        if (notesError) throw notesError;
        setNotes(notesData as SupabaseNote[]);

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)
          .order('name', { ascending: true });

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData as SupabaseCategory[]);

        // Create default category if none exists
        if (categoriesData.length === 0) {
          const defaultCategory = {
            id: uuidv4(),
            name: 'General',
            color: '#3b82f6', // blue-500
            user_id: user.id,
          };

          const { error } = await supabase
            .from('categories')
            .insert(defaultCategory);

          if (!error) {
            setCategories([{ ...defaultCategory, created_at: new Date().toISOString() }]);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Create a new note
  const createNote = useCallback(async () => {
    if (!user) return;

    try {
      const defaultCategoryId = categories.length > 0 ? categories[0].id : null;
      
      const newNote: Partial<SupabaseNote> = {
        id: uuidv4(),
        title: 'Untitled Note',
        content: '',
        user_id: user.id,
        category_id: defaultCategoryId || '',
        is_pinned: false,
        is_public: false,
      };

      const { data, error } = await supabase
        .from('notes')
        .insert(newNote)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data as SupabaseNote, ...prev]);
      setActiveNote(data as SupabaseNote);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  }, [user, categories]);

  // Update a note
  const updateNote = useCallback(async (updatedNote: Partial<SupabaseNote> & { id: string }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({
          ...updatedNote,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedNote.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(prev => 
        prev.map(note => 
          note.id === updatedNote.id 
            ? { ...note, ...updatedNote, updated_at: new Date().toISOString() } 
            : note
        )
      );

      if (activeNote?.id === updatedNote.id) {
        setActiveNote(prev => 
          prev ? { ...prev, ...updatedNote, updated_at: new Date().toISOString() } : prev
        );
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  }, [user, activeNote]);

  // Delete a note
  const deleteNote = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== id));
      
      if (activeNote?.id === id) {
        setActiveNote(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }, [user, activeNote]);

  // Toggle pinned status
  const togglePinned = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const note = notes.find(n => n.id === id);
      if (!note) return;

      const { error } = await supabase
        .from('notes')
        .update({
          is_pinned: !note.is_pinned,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(prev => {
        const updatedNotes = prev.map(n => 
          n.id === id 
            ? { ...n, is_pinned: !n.is_pinned, updated_at: new Date().toISOString() } 
            : n
        );
        
        // Re-sort notes with pinned at top
        return [...updatedNotes].sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
      });

      if (activeNote?.id === id) {
        setActiveNote(prev => 
          prev ? { ...prev, is_pinned: !prev.is_pinned, updated_at: new Date().toISOString() } : prev
        );
      }
    } catch (error) {
      console.error('Error toggling pinned status:', error);
    }
  }, [user, notes, activeNote]);

  // Create a category
  const createCategory = useCallback(async (name: string, color: string) => {
    if (!user) return;

    try {
      const newCategory: Partial<SupabaseCategory> = {
        id: uuidv4(),
        name,
        color,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('categories')
        .insert(newCategory)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data as SupabaseCategory]);
      return data as SupabaseCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  }, [user]);

  // Update a category
  const updateCategory = useCallback(async (id: string, name: string, color: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('categories')
        .update({ name, color })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCategories(prev => 
        prev.map(category => 
          category.id === id 
            ? { ...category, name, color } 
            : category
        )
      );
    } catch (error) {
      console.error('Error updating category:', error);
    }
  }, [user]);

  // Delete a category
  const deleteCategory = useCallback(async (id: string) => {
    if (!user) return;

    try {
      // First, update all notes in this category to have no category
      const { error: updateError } = await supabase
        .from('notes')
        .update({ category_id: null })
        .eq('category_id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Then delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCategories(prev => prev.filter(category => category.id !== id));
      
      // Update notes state to reflect category change
      setNotes(prev => 
        prev.map(note => 
          note.category_id === id 
            ? { ...note, category_id: null } 
            : note
        )
      );

      // Update active note if needed
      if (activeNote?.category_id === id) {
        setActiveNote(prev => 
          prev ? { ...prev, category_id: null } : prev
        );
      }

      // Clear active category if it was deleted
      if (activeCategory === id) {
        setActiveCategory(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }, [user, activeNote, activeCategory]);

  // Filter notes based on search query and active category
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery 
      ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesCategory = activeCategory 
      ? note.category_id === activeCategory
      : true;
    
    return matchesSearch && matchesCategory;
  });

  return {
    notes: filteredNotes,
    categories,
    activeNote,
    activeCategory,
    searchQuery,
    isLoading,
    setActiveNote,
    setActiveCategory,
    setSearchQuery,
    createNote,
    updateNote,
    deleteNote,
    togglePinned,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}