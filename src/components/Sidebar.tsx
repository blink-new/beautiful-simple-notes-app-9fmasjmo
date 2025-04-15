
import { useState } from 'react';
import { Category, Note } from '../types';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { 
  Search, 
  Plus, 
  X, 
  PlusCircle, 
  Tag, 
  Folder, 
  Pin, 
  Trash2,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobile } from '../hooks/use-mobile';

interface SidebarProps {
  notes: Note[];
  categories: Category[];
  activeNote: Note | null;
  searchQuery: string;
  activeCategory: string | null;
  setSearchQuery: (query: string) => void;
  setActiveNote: (note: Note | null) => void;
  setActiveCategory: (category: string | null) => void;
  createNote: (category?: string) => Note;
  deleteNote: (id: string) => void;
  togglePinned: (id: string) => void;
}

export function Sidebar({
  notes,
  categories,
  activeNote,
  searchQuery,
  activeCategory,
  setSearchQuery,
  setActiveNote,
  setActiveCategory,
  createNote,
  deleteNote,
  togglePinned,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isMobile } = useMobile();
  
  // If on mobile and a note is active, collapse the sidebar
  const shouldCollapse = isMobile && activeNote !== null;

  const handleCreateNote = () => {
    const newNote = createNote(activeCategory || undefined);
    setActiveNote(newNote);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#64748b';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  return (
    <motion.div 
      className={cn(
        "flex flex-col border-r border-border h-full bg-sidebar-background",
        shouldCollapse || isCollapsed ? "w-0 sm:w-16 overflow-hidden" : "w-72"
      )}
      animate={{ 
        width: shouldCollapse || isCollapsed ? (isMobile ? 0 : 64) : 288
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <h1 className="text-xl font-semibold text-sidebar-foreground">Notes</h1>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground"
        >
          {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          <div className="px-4 pb-2 relative">
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-sidebar-accent text-sidebar-foreground"
            />
            <Search className="absolute left-7 top-2.5 h-4 w-4 text-sidebar-foreground opacity-50" />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-6 top-1.5 h-6 w-6"
                onClick={handleClearSearch}
              >
                <X size={14} />
              </Button>
            )}
          </div>

          <div className="px-4 py-2">
            <Button 
              onClick={handleCreateNote} 
              className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            >
              <Plus size={16} className="mr-2" /> New Note
            </Button>
          </div>

          <div className="px-4 py-2">
            <div className="flex items-center mb-2">
              <Tag size={16} className="mr-2 text-sidebar-foreground opacity-70" />
              <span className="text-sm font-medium text-sidebar-foreground">Categories</span>
            </div>
            <div className="space-y-1">
              <Button
                variant={activeCategory === null ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start text-sidebar-foreground"
                onClick={() => setActiveCategory(null)}
              >
                <Folder size={16} className="mr-2 opacity-70" />
                All Notes
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-sidebar-foreground"
                  onClick={() => setActiveCategory(category.id)}
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}

      <ScrollArea className="flex-1 px-4 py-2">
        <AnimatePresence>
          {!isCollapsed && notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={cn(
                  "p-3 mb-2 rounded-lg cursor-pointer group relative",
                  activeNote?.id === note.id
                    ? "bg-sidebar-accent"
                    : "hover:bg-sidebar-accent/50"
                )}
                onClick={() => setActiveNote(note)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-sidebar-foreground truncate pr-6">
                      {note.title || "Untitled Note"}
                    </h3>
                    <div className="flex items-center mt-1">
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: getCategoryColor(note.category) }}
                      />
                      <span className="text-xs text-sidebar-foreground opacity-70">
                        {getCategoryName(note.category)}
                      </span>
                    </div>
                    <p className="text-xs text-sidebar-foreground opacity-50 mt-1 line-clamp-2">
                      {note.content || "No content"}
                    </p>
                  </div>
                  {note.isPinned && (
                    <Pin size={14} className="text-sidebar-primary absolute top-3 right-3" />
                  )}
                </div>
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinned(note.id);
                    }}
                  >
                    <Pin size={14} className={note.isPinned ? "text-sidebar-primary" : ""} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {!isCollapsed && notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="bg-sidebar-accent/50 p-3 rounded-full mb-3">
              <PlusCircle size={24} className="text-sidebar-foreground opacity-50" />
            </div>
            <h3 className="font-medium text-sidebar-foreground mb-1">No notes found</h3>
            <p className="text-sm text-sidebar-foreground opacity-70 mb-4 max-w-[200px]">
              {searchQuery 
                ? "Try a different search term" 
                : activeCategory 
                  ? "No notes in this category" 
                  : "Create your first note to get started"}
            </p>
            {!searchQuery && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCreateNote}
                className="text-sidebar-foreground"
              >
                <Plus size={16} className="mr-2" /> New Note
              </Button>
            )}
          </div>
        )}
      </ScrollArea>
    </motion.div>
  );
}