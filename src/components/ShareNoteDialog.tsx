
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Share, Copy, Check, Link } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { SupabaseNote } from '../hooks/useSupabaseNotes';

interface ShareNoteDialogProps {
  note: SupabaseNote;
  onUpdateNote: (note: Partial<SupabaseNote> & { id: string }) => Promise<void>;
}

export function ShareNoteDialog({ note, onUpdateNote }: ShareNoteDialogProps) {
  const [isPublic, setIsPublic] = useState(note.is_public || false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareUrl = `${window.location.origin}/shared/${note.id}`;

  const handleTogglePublic = async () => {
    setIsLoading(true);
    try {
      await onUpdateNote({
        id: note.id,
        is_public: !isPublic
      });
      setIsPublic(!isPublic);
      if (!isPublic) {
        toast.success('Note is now public and can be shared');
      } else {
        toast.success('Note is now private');
      }
    } catch (error) {
      toast.error('Failed to update sharing settings');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-foreground">
          <Share size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Note</DialogTitle>
          <DialogDescription>
            Make your note public to share it with others.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <Switch
            id="public-mode"
            checked={isPublic}
            onCheckedChange={handleTogglePublic}
            disabled={isLoading}
          />
          <Label htmlFor="public-mode">Make note public</Label>
        </div>
        {isPublic && (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="share-link" className="sr-only">
                  Share link
                </Label>
                <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                  <div className="flex items-center justify-center h-10 w-10 text-muted-foreground">
                    <Link size={18} />
                  </div>
                  <Input
                    id="share-link"
                    value={shareUrl}
                    readOnly
                    className="border-0 focus-visible:ring-0"
                  />
                </div>
              </div>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Anyone with this link will be able to view this note, but not edit it.
            </p>
          </div>
        )}
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}