
import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { EmptyState } from './components/EmptyState';
import { useNotes } from './hooks/useNotes';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';

function App() {
  const {
    notes,
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
  } = useNotes();

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

  return (
    <motion.div 
      className="h-screen flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Toaster position="top-right" />
      
      <main className="flex-1 flex overflow-hidden">
        <Sidebar
          notes={notes}
          categories={categories}
          activeNote={activeNote}
          searchQuery={searchQuery}
          activeCategory={activeCategory}
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
            {notes.length === 0 ? (
              <EmptyState onCreateNote={() => createNote()} />
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