'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FloatingActionButton } from '@/components/layout/FloatingActionButton';
import { useAbout } from '../hooks/useAbout';
import { filterExperienceByType } from '../utils/formatters';
import { ExperienceCard } from './ExperienceCard';
import { ExperienceModal } from './ExperienceModal';
import type { ExperienceItem, ExperienceType } from '../types/about.types';

type ExperienceSubTab = 'education' | 'work' | 'certification' | 'organizational';

const tabToType: Record<ExperienceSubTab, ExperienceType> = {
  education: 'Education',
  work: 'Work',
  certification: 'Certification',
  organizational: 'Organizational',
};

const tabConfig: Array<{
  value: ExperienceSubTab;
  label: string;
  mobileLabel: string;
  addLabel: string;
  emptyLabel: string;
}> = [
  {
    value: 'education',
    label: 'Education',
    mobileLabel: 'Edu',
    addLabel: 'Add Education',
    emptyLabel: 'No education added yet. Click the button above to add your first entry.',
  },
  {
    value: 'work',
    label: 'Work',
    mobileLabel: 'Work',
    addLabel: 'Add Work Experience',
    emptyLabel: 'No work experience added yet. Click the button above to add your first entry.',
  },
  {
    value: 'certification',
    label: 'Certifications',
    mobileLabel: 'Cert',
    addLabel: 'Add Certification',
    emptyLabel: 'No certifications added yet. Click the button above to add your first entry.',
  },
  {
    value: 'organizational',
    label: 'Organizational',
    mobileLabel: 'Org',
    addLabel: 'Add Organizational',
    emptyLabel:
      'No organizational experience added yet. Click the button above to add your first entry.',
  },
];

export function ExperienceTab() {
  const { data, updateAbout, saving } = useAbout();

  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [experienceSubTab, setExperienceSubTab] = useState<ExperienceSubTab>('education');
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<
    (ExperienceItem & { index?: number }) | null
  >(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (data) {
      setExperience(data.experience || []);
      setHasUnsavedChanges(false);
    }
  }, [data]);

  const handleAddExperience = (type: ExperienceType) => {
    setEditingExperience({
      type,
      title: '',
      organization: '',
      location: '',
      startDate: '',
      endDate: null,
      description: '',
      logoUrl: '',
      skills: [],
    });
    setIsExperienceModalOpen(true);
  };

  const handleEditExperience = (item: ExperienceItem, index: number) => {
    setEditingExperience({ ...item, index });
    setIsExperienceModalOpen(true);
  };

  const handleSaveExperience = async (item: ExperienceItem) => {
    let updatedExperience: ExperienceItem[];

    if (editingExperience?.index !== undefined) {
      updatedExperience = [...experience];
      updatedExperience[editingExperience.index] = item;
    } else {
      updatedExperience = [...experience, item];
    }

    setExperience(updatedExperience);
    setIsExperienceModalOpen(false);
    setEditingExperience(null);
    setHasUnsavedChanges(true);
  };

  const handleDeleteExperience = async (index: number) => {
    setExperience((currentExperience) =>
      currentExperience.filter((_, currentIndex) => currentIndex !== index)
    );
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!data) return;

    const bioString = data.bio
      ? typeof data.bio === 'string'
        ? data.bio
        : JSON.stringify(data.bio)
      : undefined;

    const success = await updateAbout({
      fullName: data.fullName,
      email: data.email,
      experience,
      roles: data.roles || [],
      tagline: data.tagline ?? undefined,
      shortBio: data.shortBio ?? undefined,
      bio: bioString,
      phone: data.phone ?? undefined,
      location: data.location ?? undefined,
      avatarUrl: data.avatarUrl ?? undefined,
      resumeUrl: data.resumeUrl ?? undefined,
      skills: data.skills,
    });

    if (success) {
      setHasUnsavedChanges(false);
    }
  };

  const renderTabContent = (tabValue: ExperienceSubTab) => {
    const config = tabConfig.find((tab) => tab.value === tabValue);
    const type = tabToType[tabValue];
    const items = experience
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.type === type);

    if (!config) {
      return null;
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>
            {config.label} ({filterExperienceByType(experience, type).length})
          </Label>
          <Button
            variant="primary"
            onClick={() => handleAddExperience(type)}
            size="sm"
            className="hidden md:flex"
          >
            <Plus className="h-4 w-4" />
            {config.addLabel}
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-secondary)]">{config.emptyLabel}</p>
        ) : (
          <div className="space-y-3">
            {items.map(({ item, index }) => (
              <ExperienceCard
                key={`${item.type}-${item.title}-${index}`}
                experience={item}
                onEdit={() => handleEditExperience(item, index)}
                onDelete={() => handleDeleteExperience(index)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardContent className="space-y-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Experience</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Add and manage your education, work, certifications, and organizational background.
                Click &quot;Save Changes&quot; to save.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && !saving ? (
                <span className="text-sm text-amber-600">Unsaved changes</span>
              ) : null}
              <Button
                onClick={handleSaveChanges}
                disabled={!hasUnsavedChanges || saving}
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-muted disabled:text-muted-foreground"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          <Tabs
            value={experienceSubTab}
            onValueChange={(value) => setExperienceSubTab(value as ExperienceSubTab)}
          >
            <TabsList className="mb-4 flex-wrap">
              {tabConfig.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.mobileLabel}</span>
                  <span className="ml-1">
                    ({filterExperienceByType(experience, tabToType[tab.value]).length})
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {tabConfig.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {renderTabContent(tab.value)}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <FloatingActionButton
        onClick={() => handleAddExperience(tabToType[experienceSubTab])}
        label="Add Experience"
      />

      <ExperienceModal
        open={isExperienceModalOpen}
        onOpenChange={setIsExperienceModalOpen}
        editingExperience={editingExperience}
        onSave={handleSaveExperience}
      />
    </>
  );
}
