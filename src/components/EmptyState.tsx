
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  onCreateNote: () => void;
}

export function EmptyState({ onCreateNote }: EmptyStateProps) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-full text-center p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-md">
        <div className="bg-primary/10 p-4 rounded-full inline-block mb-6">
          <PlusCircle size={40} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Welcome to Notes</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Create your first note to get started. Your notes will be saved to the cloud and accessible from anywhere.
        </p>
        <Button size="lg" onClick={onCreateNote}>
          <PlusCircle size={18} className="mr-2" /> Create Your First Note
        </Button>
      </div>
    </motion.div>
  );
}