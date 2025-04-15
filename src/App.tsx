
import React, { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { useSupabaseNotes } from "./hooks/useSupabaseNotes";
import { AuthPage } from "./pages/AuthPage";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { Toaster } from "./components/ui/sonner";
import { EmptyState } from "./components/EmptyState";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeProvider } from "./lib/theme-provider";
import { SharedNotePage } from "./pages/SharedNotePage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function NotesApp() {
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
    return <AuthPage />;
  }

  const handleBackToNotes = () => {
    setActiveNote(null);
  };

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
            onBack={handleBackToNotes}
          />
        )}
      </main>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<NotesApp />} />
          <Route path="/shared/:noteId" element={<SharedNotePage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;