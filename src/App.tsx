
import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { EmptyState } from './components/EmptyState';
import { AuthForm } from './components/auth/AuthForm';
import { UserMenu } from './components/layout/UserMenu';
import { useSupabaseNotes } from './hooks/useSupabaseNotes';
import { useAuth } from './hooks/useAuth';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    notes,
    categories,
    activeNote,
    searchQuery,
    activeCategory,
    isLoading: notesLoading,
    setActiveNote,
    setSearchQuery,
    setActiveCategory,
    createNote,
    updateNote,
    deleteNote,
    togglePinned,
  } = useSupabaseNotes();

  const [isLoaded, setIsLoaded] = useState(false);

  // Add a small delay to allow for smooth animations on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const handleBackToList = () => {
    setActiveNote(null);
  };

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show auth form if user is not logged in
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center p-4 bg-background">
        <Toaster position="top-right" />
        <AuthForm />
      </div>
    );
  }

  return (
    <motion.div 
      className="h-screen flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Toaster position="top-right" />
      
      <header className="border-b border-border p-2 flex items-center justify-between">
        <h1 className="text-xl font-semibold ml-4">Notes</h1>
        <UserMenu user={user} />
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        <Sidebar
          notes={notes}
          categories={categories}
          activeNote={activeNote}
          searchQuery={searchQuery}
          activeCategory={activeCategory}
          isLoading={notesLoading}
          setSearchQuery={setSearchQuery}
          setActiveNote={setActiveNote}
          setActiveCategory={setActiveCategory}
          createNote={createNote}
          deleteNote={deleteNote}
          togglePinned={togglePinned}
        />
        
        {isLoaded && (
          <motion.div 
            className="flex-1 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {notesLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : notes.length === 0 ? (
              <EmptyState onCreateNote={() => createNote(activeCategory || undefined)} />
            ) : (
              <Editor
                note={activeNote}
                categories={categories}
                onUpdate={updateNote}
                onDelete={deleteNote}
                onTogglePinned={togglePinned}
                onBack={handleBackToList}
              />
            )}
          </motion.div>
        )}
      </main>
    </motion.div>
  );
}

export default App;