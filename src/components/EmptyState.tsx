
import { Button } from "./ui/button";
import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  isLoading?: boolean;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  isLoading = false,
}: EmptyStateProps) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-full p-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-md space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center"
        >
          <PlusCircle className="w-12 h-12 text-primary" />
        </motion.div>
        
        <motion.h3 
          className="text-2xl font-bold tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {title}
        </motion.h3>
        
        <motion.p 
          className="text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {description}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Button 
            onClick={onAction} 
            disabled={isLoading}
            className="mt-4"
            size="lg"
          >
            {isLoading ? "Loading..." : actionLabel}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}