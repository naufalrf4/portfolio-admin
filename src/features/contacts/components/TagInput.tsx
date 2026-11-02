'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  tags,
  onTagsChange,
  placeholder = 'Enter keyword and press Enter',
}: TagInputProps) {
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    const keyword = newKeyword.trim().toLowerCase();
    if (!keyword) {
      toast.error('Keyword cannot be empty');
      return;
    }
    if (tags.includes(keyword)) {
      toast.error('Keyword already exists');
      return;
    }
    onTagsChange([...tags, keyword]);
    setNewKeyword('');
  };

  const handleRemoveKeyword = (keyword: string) => {
    onTagsChange(tags.filter((k) => k !== keyword));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <Button variant="outline" onClick={handleAddKeyword} type="button">
          Add
        </Button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((keyword) => (
            <div
              key={keyword}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-elevated)] text-sm"
              style={{
                boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
              }}
            >
              <span className="text-[var(--text-primary)]">{keyword}</span>
              <button
                onClick={() => handleRemoveKeyword(keyword)}
                className="text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                aria-label={`Remove ${keyword}`}
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
