'use client';

import { useState, useEffect } from 'react';
import { Loader2, Eye, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { FileUpload } from '@/components/upload/FileUpload';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { useAbout } from '../hooks/useAbout';
import { cn } from '@/lib/utils';

type PreviewType = 'image' | 'pdf';

interface PreviewState {
  url: string;
  type: PreviewType;
  title: string;
}

const buttonSurface = cn(
  'h-9 w-9 rounded-xl shrink-0',
  'bg-[var(--bg-elevated)] flex items-center justify-center',
  'shadow-surface-raised',
  'text-[var(--text-secondary)] transition-all duration-200',
  'hover:shadow-surface-raised',
  'hover:text-[var(--teal)]',
  'active:shadow-surface-raised',
  'focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/30'
);

export function PersonalInfoTab() {
  const { data, saving, updateAbout } = useAbout();

  const [fullName, setFullName] = useState('');
  const [tagline, setTagline] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handlePreview = (url: string, type: PreviewType, title: string) => {
    setPreview({ url, type, title });
  };

  const closePreview = () => {
    setPreview(null);
  };

  useEffect(() => {
    if (data) {
      setFullName(data.fullName || '');
      setTagline(data.tagline || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setLocation(data.location || '');
      setAvatarUrl(data.avatarUrl || '');
      setResumeUrl(data.resumeUrl || '');
      setHasUnsavedChanges(false);
    }
  }, [data]);

  const handleSave = async () => {
    if (!data) return;

    const bioString = data.bio
      ? typeof data.bio === 'string'
        ? data.bio
        : JSON.stringify(data.bio)
      : undefined;

    const success = await updateAbout({
      fullName,
      tagline: tagline || undefined,
      roles: data.roles || [],
      shortBio: data.shortBio ?? undefined,
      email,
      phone: phone || undefined,
      location: location || undefined,
      avatarUrl: avatarUrl || undefined,
      resumeUrl: resumeUrl || undefined,
      bio: bioString,
      skills: data.skills || [],
      experience: data.experience ?? undefined,
    });

    if (success) {
      setHasUnsavedChanges(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={tagline}
              onChange={(e) => {
                setTagline(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="Full-Stack Engineer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="San Francisco, CA"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Avatar</Label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <FileUpload
                  value={avatarUrl || null}
                  onChange={(url) => {
                    setAvatarUrl(url ?? '');
                    setHasUnsavedChanges(true);
                  }}
                  label=""
                  folder="about"
                  accept="image/jpeg,image/png,image/webp"
                  helperText=""
                  preview={false}
                />
              </div>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => handlePreview(avatarUrl, 'image', 'Avatar Preview')}
                  className={buttonSurface}
                  title="Preview avatar"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Resume/CV</Label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <FileUpload
                  value={resumeUrl || null}
                  onChange={(url) => {
                    setResumeUrl(url ?? '');
                    setHasUnsavedChanges(true);
                  }}
                  label=""
                  folder="resumes"
                  accept="application/pdf"
                  helperText=""
                  preview={false}
                />
              </div>
              {resumeUrl && (
                <button
                  type="button"
                  onClick={() => handlePreview(resumeUrl, 'pdf', 'Resume Preview')}
                  className={buttonSurface}
                  title="Preview resume"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 pt-4">
          {hasUnsavedChanges && !saving && (
            <span className="text-sm text-amber-600">Unsaved changes</span>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saving}
            className="bg-[var(--teal)] hover:bg-accent text-on-accent disabled:bg-gray-300 disabled:text-gray-500"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Personal Info'}
          </Button>
        </div>
      </CardContent>

      <ResponsiveModal
        open={!!preview}
        onOpenChange={(open) => !open && closePreview()}
        title={preview?.title || 'Preview'}
        description={preview?.type === 'image' ? 'Image preview' : 'PDF document preview'}
        size="xl"
      >
        <div className="flex items-center gap-2 mb-4">
          {preview?.type === 'image' ? (
            <ImageIcon className="w-5 h-5 text-[var(--teal)]" />
          ) : (
            <FileText className="w-5 h-5 text-[var(--teal)]" />
          )}
          <span className="text-sm text-[var(--text-secondary)]">
            {preview?.type === 'image' ? 'Image' : 'PDF Document'}
          </span>
        </div>
        <div className="rounded-xl overflow-hidden bg-bg-elevated">
          {preview?.type === 'image' ? (
            <img
              src={preview.url}
              alt="Preview"
              className="w-full h-auto max-h-[60vh] object-contain"
            />
          ) : (
            <iframe src={preview?.url} className="w-full h-[60vh] rounded-lg" title="PDF Preview" />
          )}
        </div>
      </ResponsiveModal>
    </Card>
  );
}
