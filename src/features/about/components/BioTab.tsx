'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAbout } from '../hooks/useAbout';
import { DraggableRoles } from './DraggableRoles';

export function BioTab() {
  const { data, updateAbout, saving } = useAbout();

  const [shortBio, setShortBio] = useState('');
  const [bio, setBio] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState('');
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [hasUnsavedChangesBio, setHasUnsavedChangesBio] = useState(false);
  const [hasUnsavedChangesRoles, setHasUnsavedChangesRoles] = useState(false);

  useEffect(() => {
    if (data) {
      let parsedBio = data.bio || '';
      if (typeof parsedBio === 'string' && parsedBio.trim().startsWith('{')) {
        try {
          const decodedBio = JSON.parse(parsedBio);
          parsedBio = typeof decodedBio === 'string' ? decodedBio : parsedBio;
        } catch {
          parsedBio = data.bio || '';
        }
      }
      setShortBio(data.shortBio || '');
      setBio(parsedBio);
      setRoles(data.roles || []);
      setHasUnsavedChangesBio(false);
      setHasUnsavedChangesRoles(false);
    }
  }, [data]);

  const saveBio = async (newBio: string) => {
    if (!data) return;

    setIsSavingBio(true);
    try {
      const bioString = typeof newBio === 'string' ? newBio : JSON.stringify(newBio);

      await updateAbout({
        fullName: data.fullName,
        email: data.email,
        shortBio,
        bio: bioString,
        roles: data.roles || [],
        tagline: data.tagline ?? undefined,
        phone: data.phone ?? undefined,
        location: data.location ?? undefined,
        avatarUrl: data.avatarUrl ?? undefined,
        resumeUrl: data.resumeUrl ?? undefined,
        skills: data.skills,
        experience: data.experience ?? undefined,
      });
      setHasUnsavedChangesBio(false);
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleBioChange = (newBio: string) => {
    setBio(newBio);
    setHasUnsavedChangesBio(true);
  };

  const handleShortBioChange = (newShortBio: string) => {
    setShortBio(newShortBio);
    setHasUnsavedChangesBio(true);
  };

  const handleSaveBio = () => {
    saveBio(bio);
  };

  const saveRoles = async () => {
    if (!data) return;

    const bioString = data.bio
      ? typeof data.bio === 'string'
        ? data.bio
        : JSON.stringify(data.bio)
      : undefined;

    await updateAbout({
      fullName: data.fullName,
      email: data.email,
      roles,
      tagline: data.tagline ?? undefined,
      shortBio: data.shortBio ?? undefined,
      bio: bioString,
      phone: data.phone ?? undefined,
      location: data.location ?? undefined,
      avatarUrl: data.avatarUrl ?? undefined,
      resumeUrl: data.resumeUrl ?? undefined,
      skills: data.skills,
      experience: data.experience ?? undefined,
    });

    setHasUnsavedChangesRoles(false);
  };

  const addRole = () => {
    const trimmedRole = roleInput.trim();
    if (trimmedRole && !roles.includes(trimmedRole)) {
      const newRoles = [...roles, trimmedRole];
      setRoles(newRoles);
      setRoleInput('');
      setHasUnsavedChangesRoles(true);
    }
  };

  const removeRole = (roleToRemove: string) => {
    const newRoles = roles.filter((r) => r !== roleToRemove);
    setRoles(newRoles);
    setHasUnsavedChangesRoles(true);
  };

  const handleRolesReorder = (reorderedRoles: string[]) => {
    setRoles(reorderedRoles);
    setHasUnsavedChangesRoles(true);
  };

  return (
    <div className="space-y-6">
      <Card className="card-inset">
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Bio</h3>
            <div className="flex items-center gap-3">
              {hasUnsavedChangesBio && !isSavingBio && (
                <span className="text-sm text-amber-600">Unsaved changes</span>
              )}
              {isSavingBio && (
                <span className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              )}
              <Button
                onClick={handleSaveBio}
                disabled={!hasUnsavedChangesBio || isSavingBio}
                size="sm"
                className="bg-[var(--teal)] hover:bg-accent text-on-accent disabled:bg-gray-300 disabled:text-gray-500"
              >
                {isSavingBio ? 'Saving...' : 'Save Bio'}
              </Button>
            </div>
          </div>
          <Textarea
            value={shortBio}
            onChange={(e) => handleShortBioChange(e.target.value)}
            placeholder="Write the short homepage and links intro here..."
            rows={4}
            className="resize-y mb-4"
          />
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            This short version is used on the homepage hero and links app.
          </p>
          <Textarea
            value={bio}
            onChange={(e) => handleBioChange(e.target.value)}
            placeholder="Write your detailed about-page bio here..."
            rows={12}
            className="resize-y"
          />
          <p className="text-xs text-[var(--text-secondary)] mt-3">
            Save both the short and detailed versions together from this tab.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Roles</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Drag to reorder. First role is your primary role. Click &quot;Save Roles&quot; to
                save.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {hasUnsavedChangesRoles && !saving && (
                <span className="text-sm text-amber-600">Unsaved changes</span>
              )}
              <Button
                onClick={saveRoles}
                disabled={!hasUnsavedChangesRoles || saving}
                size="sm"
                className="bg-[var(--teal)] hover:bg-accent text-on-accent disabled:bg-gray-300 disabled:text-gray-500"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Roles'}
              </Button>
            </div>
          </div>

          <DraggableRoles
            roles={roles}
            setRoles={handleRolesReorder}
            roleInput={roleInput}
            setRoleInput={setRoleInput}
            addRole={addRole}
            removeRole={removeRole}
          />
        </CardContent>
      </Card>
    </div>
  );
}
