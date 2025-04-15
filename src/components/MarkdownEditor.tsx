
import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '../lib/utils';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeTab === "write" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeTab]);

  return (
    <div className={cn("flex flex-col", className)}>
      <Tabs defaultValue="write" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-2">
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <div className="text-xs text-muted-foreground">
            Supports Markdown
          </div>
        </div>
        
        <TabsContent value="write" className="mt-0">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[300px] resize-none border-none p-0 focus-visible:ring-0 bg-transparent"
          />
        </TabsContent>
        
        <TabsContent value="preview" className="mt-0">
          <div className="min-h-[300px] prose dark:prose-invert prose-sm sm:prose-base max-w-none">
            {content ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">{placeholder}</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}