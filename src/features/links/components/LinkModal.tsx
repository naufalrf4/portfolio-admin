'use client';

import { useState, useEffect } from 'react';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { ProfileLink, FormData } from '../types/links.types';
import { INITIAL_FORM_DATA } from '../constants/links.constants';
import { IconSelector } from './IconSelector';

interface LinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData) => Promise<{ success: boolean }>;
  editingLink?: ProfileLink | null;
}

export function LinkModal({ open, onOpenChange, onSubmit, editingLink }: LinkModalProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingLink) {
      setFormData({
        label: editingLink.label,
        url: editingLink.url,
        icon: editingLink.icon || '',
      });
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
  }, [editingLink, open]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await onSubmit(formData);
      if (result.success) {
        onOpenChange(false);
        setFormData(INITIAL_FORM_DATA);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={editingLink ? 'Edit Link' : 'Create Link'}
      description={
        editingLink
          ? 'Update your profile link details'
          : 'Add a new social or contact link to your profile'
      }
      size="default"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving} form="link-form">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : editingLink ? (
              'Update Link'
            ) : (
              'Create Link'
            )}
          </Button>
        </>
      }
    >
      <form id="link-form" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="label">Label *</Label>
            <Input
              id="label"
              name="label"
              value={formData.label}
              onChange={handleInputChange}
              placeholder="e.g., GitHub, Twitter, Email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              name="url"
              type="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://github.com/username"
              required
            />
          </div>

          <IconSelector
            value={formData.icon}
            onChange={(value) => setFormData((prev) => ({ ...prev, icon: value }))}
            labelText={formData.label}
            urlValue={formData.url}
          />
        </div>
      </form>
    </ResponsiveModal>
  );
}
