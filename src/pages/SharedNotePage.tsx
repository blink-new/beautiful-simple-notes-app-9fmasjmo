
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SupabaseNote } from '../hooks/useSupabaseNotes';
import { Button } from '../components/ui/button';
import { Loader2, ArrowLeft, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { format } from 'date-fns';
import { ThemeToggle } from '../components/ThemeToggle';

export function SharedNotePage() {
  const { noteId } = useParams<{ noteId: string }>();
  const [note, setNote] = useState<SupabaseNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSharedNote() {
      if (!noteId) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('id', noteId)
          .eq('is_public', true)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          setError('Note not found or not public');
        } else {
          setNote(data as SupabaseNote);
        }
      } catch (err: any) {
        console.error('Error fetching shared note:', err);
        setError(err.message || 'Failed to load note');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSharedNote();
  }, [noteId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="text-center max-w-md p-8">
          <div className="bg-muted/50 p-4 rounded-full mb-4 inline-block">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Note Not Available</h1>
          <p className="text-muted-foreground mb-6">
            {error || "This note doesn't exist or is not shared publicly."}
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft size={16} className="mr-2" /> Go to Notes
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link to="/" className="flex items-center">
            <ArrowLeft size={16} className="mr-2" />
            Back to Notes
          </Link>
        </Button>
        <ThemeToggle />
      </header>
      
      <main className="max-w-3xl mx-auto p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{note.title}</h1>
          <div className="text-sm text-muted-foreground">
            Last updated: {format(new Date(note.updated_at), 'MMMM d, yyyy')}
          </div>
        </div>
        
        <div className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
          >
            {note.content || "No content"}
          </ReactMarkdown>
        </div>
      </main>
    </div>
  );
}