
import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { useSupabaseNotes } from "./hooks/useSupabaseNotes";
import { AuthForm } from "./components/auth/AuthForm";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { Toaster } from "./components/ui/sonner";
import { EmptyState } from "./components/EmptyState";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function App() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const {
    notes,
    categories,
    activeNote,
    searchQuery,
    activeCategory,
    isLoading: isNotesLoading,
    setActiveNote,
    setSearchQuery,
    setActiveCategory,
    createNote,
    updateNote,
    deleteNote,
    togglePinned,
  } = useSupabaseNotes();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-muted/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 space-y-6 bg-background rounded-lg shadow-lg border"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-center">Notes App</h1>
            <p className="text-center text-muted-foreground mt-2">
              Sign in to access your notes
            </p>
          </motion.div>
          <AuthForm />
        </motion.div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        notes={notes}
        categories={categories || []} 
        activeNote={activeNote}
        searchQuery={searchQuery}
        activeCategory={activeCategory}
        isLoading={isNotesLoading}
        setSearchQuery={setSearchQuery}
        setActiveNote={setActiveNote}
        setActiveCategory={setActiveCategory}
        createNote={createNote}
        deleteNote={deleteNote}
        togglePinned={togglePinned}
      />
      <main className="flex-1 overflow-hidden">
        {isNotesLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : notes.length === 0 ? (
          <EmptyState
            title="No notes yet"
            description="Create your first note to get started"
            actionLabel="Create Note"
            onAction={() => createNote()}
            isLoading={isNotesLoading}
          />
        ) : !activeNote ? (
          <EmptyState
            title="Select a note"
            description="Choose a note from the sidebar or create a new one"
            actionLabel="Create Note"
            onAction={() => createNote()}
            isLoading={isNotesLoading}
          />
        ) : (
          <Editor
            note={activeNote}
            categories={categories || []}
            onUpdate={updateNote}
            onDelete={deleteNote}
            onTogglePinned={togglePinned}
          />
        )}
      </main>
      <Toaster />
    </div>
  );
}

export default App;