
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { SupabaseCategory } from '../hooks/useSupabaseNotes';
import { CirclePicker } from 'react-color';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => Promise<SupabaseCategory | null>;
  title: string;
  initialName?: string;
  initialColor?: string;
}

export function CategoryDialog({
  isOpen,
  onClose,
  onSave,
  title,
  initialName = '',
  initialColor = '#64748b',
}: CategoryDialogProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setColor(initialColor);
      setError('');
    }
  }, [isOpen, initialName, initialColor]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await onSave(name.trim(), color);
      if (result) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  // Color options
  const colors = [
    '#f87171', // red
    '#fb923c', // orange
    '#facc15', // yellow
    '#4ade80', // green
    '#60a5fa', // blue
    '#a78bfa', // purple
    '#f472b6', // pink
    '#64748b', // slate
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              disabled={isLoading}
              className="focus-ring"
              autoFocus
            />
            {error && (
              <motion.p 
                className="text-sm text-destructive mt-1"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {error}
              </motion.p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="pt-2">
              <CirclePicker
                color={color}
                onChange={(color) => setColor(color.hex)}
                colors={colors}
                circleSize={28}
                circleSpacing={12}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}