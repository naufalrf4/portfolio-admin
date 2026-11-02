'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { FileUpload } from '@/components/upload/FileUpload';
import {
  parseMonthDate,
  formatMonthDate,
  getTitleLabel,
  getOrganizationLabel,
} from '../utils/formatters';
import type { ExperienceItem, ExperienceType } from '../types/about.types';

interface ExperienceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingExperience: (ExperienceItem & { index?: number }) | null;
  onSave: (item: ExperienceItem) => void;
}

export function ExperienceModal({
  open,
  onOpenChange,
  editingExperience,
  onSave,
}: ExperienceModalProps) {
  const [type, setType] = useState<ExperienceType>('Work');
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isCurrentPosition, setIsCurrentPosition] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (!editingExperience) {
      return;
    }

    setType(editingExperience.type);
    setTitle(editingExperience.title);
    setOrganization(editingExperience.organization);
    setLocation(editingExperience.location || '');
    setStartDate(editingExperience.startDate);
    setEndDate(editingExperience.endDate || null);
    setDescription(editingExperience.description || '');
    setLogoUrl(editingExperience.logoUrl || '');
    setIsCurrentPosition(!editingExperience.endDate);
    setSkills(editingExperience.skills || []);
    setSkillInput('');
  }, [editingExperience]);

  const titlePlaceholderByType: Record<ExperienceType, string> = {
    Education: 'Bachelor of Computer Science',
    Work: 'Senior Software Engineer',
    Organizational: 'Community Lead',
    Certification: 'AWS Academy Cloud Architecting',
  };

  const organizationPlaceholderByType: Record<ExperienceType, string> = {
    Education: 'University Name',
    Work: 'Company Name',
    Organizational: 'Organization Name',
    Certification: 'Issuing Organization',
  };

  const addSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (!trimmedSkill || skills.includes(trimmedSkill)) {
      return;
    }

    setSkills((currentSkills) => [...currentSkills, trimmedSkill]);
    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills((currentSkills) => currentSkills.filter((skill) => skill !== skillToRemove));
  };

  const handleSave = () => {
    if (!title || !organization || !startDate) {
      toast.error('Please fill in required fields');
      return;
    }

    const startDateObj = new Date(startDate);
    const endDateObj = endDate ? new Date(endDate) : null;

    if (endDateObj && startDateObj >= endDateObj) {
      toast.error('End date must be after start date');
      return;
    }

    const newItem: ExperienceItem = {
      type,
      title,
      organization,
      location: location || '',
      startDate,
      endDate: isCurrentPosition ? null : endDate,
      description: description || '',
      logoUrl: logoUrl || '',
      skills: skills.length > 0 ? skills : undefined,
    };

    onSave(newItem);
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={`${editingExperience?.index !== undefined ? 'Edit' : 'Add'} ${type || 'Experience'}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="exp-type">
            Type <span className="text-red-500">*</span>
          </Label>
          <Select value={type} onValueChange={(value: ExperienceType) => setType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Work">Work</SelectItem>
              <SelectItem value="Organizational">Organizational</SelectItem>
              <SelectItem value="Certification">Certification</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exp-title">
            {getTitleLabel(type)} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="exp-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={titlePlaceholderByType[type]}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exp-organization">
            {getOrganizationLabel(type)} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="exp-organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder={organizationPlaceholderByType[type]}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exp-location">Location</Label>
          <Input
            id="exp-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="San Francisco, CA"
          />
        </div>

        <div className="space-y-2">
          <FileUpload
            value={logoUrl || null}
            onChange={(url) => setLogoUrl(url ?? '')}
            label="Organization Logo"
            folder="about"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            helperText="Upload company, institution, community, or issuer logo (recommended: 200x200px)"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="exp-start">
              Start Date <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              value={parseMonthDate(startDate)}
              onChange={(date) => setStartDate(formatMonthDate(date))}
              placeholder="Select start date"
              format="MMM yyyy"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exp-end">End Date</Label>
            <DatePicker
              value={!isCurrentPosition && endDate ? parseMonthDate(endDate) : null}
              onChange={(date) => setEndDate(formatMonthDate(date))}
              placeholder="Select end date"
              disabled={isCurrentPosition}
              format="MMM yyyy"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
          <Checkbox
            id="current-position"
            checked={isCurrentPosition}
            onCheckedChange={(checked) => {
              setIsCurrentPosition(checked === true);
              if (checked) {
                setEndDate(null);
              }
            }}
            className="border-blue-400 data-[state=checked]:bg-blue-500 data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600"
          />
          <label
            htmlFor="current-position"
            className="cursor-pointer text-sm font-medium text-blue-700"
          >
            This entry is current or ongoing
          </label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exp-desc">Description</Label>
          <Textarea
            id="exp-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your role, focus, results, or what this certification covered..."
            rows={4}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="exp-skill-input">Skills / Topics</Label>
          <div className="flex gap-2">
            <Input
              id="exp-skill-input"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Add tools, skills, or certification topics"
            />
            <Button type="button" onClick={addSkill} disabled={!skillInput.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div
                  key={skill}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--text-primary)] shadow-surface-raised"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-[var(--text-secondary)] transition-colors hover:text-red-500"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </ResponsiveModal>
  );
}
