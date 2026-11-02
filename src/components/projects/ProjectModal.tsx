'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { toast } from 'sonner';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    description: string | null;
    category: string;
    techStack: string[];
    liveUrl: string | null;
    repoUrl: string | null;
    featured: boolean;
    visible: boolean;
    order: number;
  } | null;
}

interface FormData {
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  techStack: string;
  liveUrl: string;
  repoUrl: string;
  featured: boolean;
  visible: boolean;
  order: number;
}

const initialFormData: FormData = {
  title: '',
  slug: '',
  summary: '',
  description: '',
  category: '',
  techStack: '',
  liveUrl: '',
  repoUrl: '',
  featured: false,
  visible: true,
  order: 0,
};

export function ProjectModal({ isOpen, onClose, onSuccess, project }: ProjectModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        slug: project.slug,
        summary: project.summary || '',
        description: project.description || '',
        category: project.category,
        techStack: project.techStack.join(', '),
        liveUrl: project.liveUrl || '',
        repoUrl: project.repoUrl || '',
        featured: project.featured,
        visible: project.visible,
        order: project.order,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [project, isOpen]);

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function handleInputChange(
    e: import('react').ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleTitleChange(e: import('react').ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: project ? prev.slug : generateSlug(title),
    }));
  }

  async function handleSubmit(e: import('react').FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        techStack: formData.techStack
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        liveUrl: formData.liveUrl || undefined,
        repoUrl: formData.repoUrl || undefined,
        description: formData.description || undefined,
      };

      const url = project ? `/api/v1/admin/projects/${project.id}` : '/api/v1/admin/projects';
      const method = project ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to save project');
      }

      toast.success(project ? 'Project updated successfully' : 'Project created successfully');
      onSuccess();

      if (!project && data.data?.id) {
        router.push(`/projects/${data.data.id}/edit`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save project');
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={project ? 'Edit Project' : 'Create New Project'}
      size="lg"
      footer={
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-2xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
            className="flex-1 rounded-2xl"
            form="project-form"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {project ? 'Updating...' : 'Creating...'}
              </>
            ) : project ? (
              'Update Project'
            ) : (
              'Create Project'
            )}
          </Button>
        </div>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="My Awesome Project"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="my-awesome-project"
              required
            />
          </div>
        </div>

        {}
        <div className="space-y-2">
          <Label htmlFor="summary">Summary *</Label>
          <Textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleInputChange}
            placeholder="A brief description of your project..."
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Short standfirst before the long-form content..."
            rows={4}
          />
        </div>

        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="Web App, Mobile, Backend..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="techStack">Tech Stack *</Label>
            <Input
              id="techStack"
              name="techStack"
              value={formData.techStack}
              onChange={handleInputChange}
              placeholder="React, Node.js, PostgreSQL"
              required
            />
            <p className="text-xs text-[var(--text-secondary)]">Comma-separated list</p>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="liveUrl">Live URL</Label>
            <Input
              id="liveUrl"
              name="liveUrl"
              type="url"
              value={formData.liveUrl}
              onChange={handleInputChange}
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repoUrl">Repository URL</Label>
            <Input
              id="repoUrl"
              name="repoUrl"
              type="url"
              value={formData.repoUrl}
              onChange={handleInputChange}
              placeholder="https://github.com/user/repo"
            />
          </div>
        </div>

        {}
        <div
          className="p-4 sm:p-6 rounded-2xl bg-[var(--bg-elevated)]"
          style={{
            boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
          }}
        >
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Settings</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {}
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 rounded-full bg-[var(--bg-elevated)] shadow-surface-sunken-sm peer-checked:bg-[var(--amber)] peer-checked:shadow-surface-sunken-sm transition-all duration-300"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-[var(--bg-elevated)] shadow-surface-raised peer-checked:translate-x-5 peer-checked:bg-white transition-all duration-300"></div>
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-[var(--amber)]" fill="currentColor" />
                  Featured
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="visible"
                    name="visible"
                    checked={formData.visible}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 rounded-full bg-[var(--bg-elevated)] shadow-surface-sunken-sm peer-checked:bg-[var(--teal)] peer-checked:shadow-surface-sunken-sm transition-all duration-300"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-[var(--bg-elevated)] shadow-surface-raised peer-checked:translate-x-5 peer-checked:bg-white transition-all duration-300"></div>
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-[var(--teal)]" />
                  Visible
                </span>
              </label>
            </div>

            {}
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, order: Math.max(0, prev.order - 1) }))
                  }
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)] text-lg font-semibold shadow-surface-raised hover:shadow-surface-raised active:shadow-surface-raised transition-all duration-200"
                >
                  −
                </button>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                  className="w-16 text-center px-2 py-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold shadow-surface-sunken-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, order: prev.order + 1 }))}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)] text-lg font-semibold shadow-surface-raised hover:shadow-surface-raised active:shadow-surface-raised transition-all duration-200"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">Lower numbers appear first</p>
            </div>
          </div>
        </div>
      </form>
    </ResponsiveModal>
  );
}
