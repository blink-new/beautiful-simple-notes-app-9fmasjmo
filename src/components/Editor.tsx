
import { useState, useEffect, useRef } from 'react';
import { Note, Category } from '../types';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Pin, 
  Save, 
  Trash2, 
  Clock, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useMobile } from '../hooks/use-mobile';

interface EditorProps {
  note: Note | null;
  categories: Category[];
  onUpdate: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePinned: (id: string) => void;
  onBack: () => void;
}

export function Editor({
  note,
  categories,
  onUpdate,
  onDelete,
  onTogglePinned,
  onBack,
}: EditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { isMobile } = useMobile();
  
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update local state when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
      setLastSaved(note.updatedAt);
    } else {
      setTitle('');
      setContent('');
      setCategory('');
      setLastSaved(null);
    }
  }, [note]);

  // Auto-focus the content area when a note is selected
  useEffect(() => {
    if (note && contentRef.current) {
      contentRef.current.focus();
    }
  }, [note]);

  // Auto-save changes after a delay
  useEffect(() => {
    if (!note) return;
    
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set a new timeout to save changes
    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 1000);
    
    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, category]);

  const handleSave = () => {
    if (!note) return;
    
    setIsSaving(true);
    
    const updatedNote: Note = {
      ...note,
      title: title || 'Untitled Note',
      content,
      category,
      updatedAt: new Date(),
    };
    
    onUpdate(updatedNote);
    setLastSaved(new Date());
    
    // Show saving indicator briefly
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };

  const handleDelete = () => {
    if (!note) return;
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
    }
  };

  const handleTogglePinned = () => {
    if (!note) return;
    onTogglePinned(note.id);
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">No Note Selected</h2>
          <p className="text-muted-foreground mb-6">
            Select a note from the sidebar or create a new one to get started.
          </p>
          {isMobile && (
            <Button onClick={onBack}>
              <ArrowLeft size={16} className="mr-2" /> Back to Notes
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      <div className="border-b border-border p-4 flex items-center justify-between">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={18} />
          </Button>
        )}
        
        <div className="flex items-center space-x-2 ml-auto">
          <AnimatePresence>
            {lastSaved && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center text-xs text-muted-foreground"
              >
                {isSaving ? (
                  <>
                    <Save size={14} className="mr-1 animate-pulse" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} className="mr-1 text-green-500" />
                    Saved {format(lastSaved, 'h:mm a')}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleTogglePinned}
            className={cn(note.isPinned && "text-primary")}
          >
            <Pin size={18} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-destructive"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl mx-auto">
          <Input
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Note"
            className="text-xl font-semibold border-none p-0 mb-4 focus-visible:ring-0 bg-transparent"
          />
          
          <div className="mb-4">
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-xs text-muted-foreground flex items-center mb-4">
            <Clock size={12} className="mr-1" />
            Created: {format(note.createdAt, 'MMM d, yyyy')}
            {note.createdAt.getTime() !== note.updatedAt.getTime() && (
              <span className="ml-3">
                • Updated: {format(note.updatedAt, 'MMM d, yyyy')}
              </span>
            )}
          </div>
          
          <Textarea
            ref={contentRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing..."
            className="min-h-[300px] resize-none border-none p-0 focus-visible:ring-0 bg-transparent"
          />
        </div>
      </div>
    </div>
  );
}