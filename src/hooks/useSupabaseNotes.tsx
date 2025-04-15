
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface SupabaseNote {
  id: string;
  title: string;
  content: string;
  category_id: string;
  user_id: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes and categories when user changes
  useEffect(() => {
    if (!user) {
      setNotes([]);
      setCategories([]);
      setActiveNote(null);
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load categories first
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)
          .order('name');

        if (categoriesError) throw categoriesError;

        // If no categories exist, create default ones
        if (categoriesData.length === 0) {
          const defaultCategories = [
            { id: uuidv4(), name: 'Personal', color: '#f87171', user_id: user.id },
            { id: uuidv4(), name: 'Work', color: '#60a5fa', user_id: user.id },
            { id: uuidv4(), name: 'Ideas', color: '#4ade80', user_id: user.id },
            { id: uuidv4(), name: 'Tasks', color: '#facc15', user_id: user.id },
          ];

          const { data: insertedCategories, error: insertError } = await supabase
            .from('categories')
            .insert(defaultCategories)
            .select();

          if (insertError) throw insertError;
          setCategories(insertedCategories || defaultCategories);
        } else {
          setCategories(categoriesData);
        }

        // Load notes
        const { data: notesData, error: notesError } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (notesError) throw notesError;
        setNotes(notesData);
      } catch (error: any) {
        toast.error(`Error loading data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Set up realtime subscriptions
    const notesSubscription = supabase
      .channel('notes-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotes(prev => [payload.new as SupabaseNote, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotes(prev => 
              prev.map(note => 
                note.id === payload.new.id ? (payload.new as SupabaseNote) : note
              )
            );
            if (activeNote?.id === payload.new.id) {
              setActiveNote(payload.new as SupabaseNote);
            }
          } else if (payload.eventType === 'DELETE') {
            setNotes(prev => prev.filter(note => note.id !== payload.old.id));
            if (activeNote?.id === payload.old.id) {
              setActiveNote(null);
            }
          }
        }
      )
      .subscribe();

    const categoriesSubscription = supabase
      .channel('categories-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCategories(prev => [...prev, payload.new as SupabaseCategory]);
          } else if (payload.eventType === 'UPDATE') {
            setCategories(prev => 
              prev.map(category => 
                category.id === payload.new.id ? (payload.new as SupabaseCategory) : category
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setCategories(prev => prev.filter(category => category.id !== payload.old.id));
            if (activeCategory === payload.old.id) {
              setActiveCategory(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notesSubscription);
      supabase.removeChannel(categoriesSubscription);
    };
  }, [user]);

  // Create a new note
  const createNote = async (categoryId: string = '') => {
    if (!user) {
      toast.error('You must be signed in to create notes');
      return null;
    }

    // If no category is specified, use the first available one
    const targetCategoryId = categoryId || (categories.length > 0 ? categories[0].id : null);
    
    if (!targetCategoryId) {
      toast.error('No category available. Please create a category first.');
      return null;
    }

    const newNote: Omit<SupabaseNote, 'created_at' | 'updated_at'> = {
      id: uuidv4(),
      title: 'Untitled Note',
      content: '',
      category_id: targetCategoryId,
      user_id: user.id,
      is_pinned: false,
    };

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert(newNote)
        .select()
        .single();

      if (error) throw error;
      
      // Optimistic update
      const createdNote = data as SupabaseNote;
      setActiveNote(createdNote);
      return createdNote;
    } catch (error: any) {
      toast.error(`Error creating note: ${error.message}`);
      return null;
    }
  };

  // Update a note
  const updateNote = async (updatedNote: Partial<SupabaseNote> & { id: string }) => {
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
    } catch (error: any) {
      toast.error(`Error updating note: ${error.message}`);
    }
  };

  // Delete a note
  const deleteNote = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      if (activeNote?.id === id) {
        setActiveNote(null);
      }
    } catch (error: any) {
      toast.error(`Error deleting note: ${error.message}`);
    }
  };

  // Toggle pin status
  const togglePinned = async (id: string) => {
    if (!user) return;

    const noteToUpdate = notes.find(note => note.id === id);
    if (!noteToUpdate) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({
          is_pinned: !noteToUpdate.is_pinned,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error: any) {
      toast.error(`Error updating note: ${error.message}`);
    }
  };

  // Create a new category
  const createCategory = async (name: string, color: string = '#64748b') => {
    if (!user) {
      toast.error('You must be signed in to create categories');
      return null;
    }

    const newCategory = {
      id: uuidv4(),
      name,
      color,
      user_id: user.id,
    };

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(newCategory)
        .select()
        .single();

      if (error) throw error;
      return data as SupabaseCategory;
    } catch (error: any) {
      toast.error(`Error creating category: ${error.message}`);
      return null;
    }
  };

  // Delete a category and reassign its notes
  const deleteCategory = async (id: string, reassignTo: string) => {
    if (!user || categories.length <= 1) {
      toast.error('You must keep at least one category');
      return;
    }

    try {
      // First update all notes in this category to the new category
      const { error: updateError } = await supabase
        .from('notes')
        .update({ category_id: reassignTo })
        .eq('category_id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Then delete the category
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      if (activeCategory === id) {
        setActiveCategory(null);
      }
    } catch (error: any) {
      toast.error(`Error deleting category: ${error.message}`);
    }
  };

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

  // Sort notes: pinned first, then by updatedAt
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // First sort by pinned status
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    
    // Then sort by updatedAt (newest first)
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return {
    notes: sortedNotes,
    categories,
    activeNote,
    searchQuery,
    activeCategory,
    isLoading,
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