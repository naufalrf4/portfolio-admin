'use client';

import { Loader2, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PersonalInfoTab, BioTab, SkillsTab, ExperienceTab, useAbout } from '@/features/about';
import { AchievementsTab } from '@/features/about/components/AchievementsTab';

export function AboutPageContent() {
  const { loading } = useAbout();

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--teal)]" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHeader
        title="About Me"
        description="Manage your personal profile, background, and achievements."
        icon={<User />}
      />

      <div className="mt-6">
        <Tabs defaultValue="personal">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="bio">Bio</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <PersonalInfoTab />
          </TabsContent>

          <TabsContent value="bio">
            <BioTab />
          </TabsContent>

          <TabsContent value="skills">
            <SkillsTab />
          </TabsContent>

          <TabsContent value="experience">
            <ExperienceTab />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
