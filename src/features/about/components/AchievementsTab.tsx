'use client';

import { useState, useEffect, type FormEvent } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  GripVertical,
  AlertTriangle,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Award,
  Link2,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { FileUpload } from '@/components/upload/FileUpload';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { logger } from '@/lib/utils/logger';
import { getPlatformFromUrl } from '@/features/shared/utils';
import { truncateUrl } from '@/lib/utils/string';

interface Achievement {
  id: string;
  name: string;
  location: string;
  monthYear: string;
  photos: string[];
  description: string | null;
  externalUrl: string | null;
  visible: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const sunkenSurface =
  'shadow-surface-raised';
const cardSurface =
  'shadow-surface-raised';

interface AchievementFormData {
  name: string;
  location: string;
  monthYear: string;
  photos: string[];
  description: string;
  externalUrl: string;
}

export function AchievementsTab() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewAchievement, setPreviewAchievement] = useState<Achievement | null>(null);
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AchievementFormData>({
    name: '',
    location: '',
    monthYear: '',
    photos: [],
    description: '',
    externalUrl: '',
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const res = await fetch('/api/v1/admin/achievements');
      const data = await res.json();
      if (data.success && data.data) {
        const achievementsList = data.data.achievements || data.data;
        setAchievements(Array.isArray(achievementsList) ? achievementsList : []);
      }
    } catch (error) {
      logger.error('Failed to fetch achievements', error);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const url = editingId
      ? `/api/v1/admin/achievements/${editingId}`
      : '/api/v1/admin/achievements';

    const method = editingId ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        fetchAchievements();
        handleCloseModal();
      }
    } catch (error) {
      logger.error('Failed to save achievement', error);
    }
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingId(achievement.id);
    setFormData({
      name: achievement.name,
      location: achievement.location,
      monthYear: achievement.monthYear,
      photos: achievement.photos,
      description: achievement.description || '',
      externalUrl: achievement.externalUrl || '',
    });
    setIsModalOpen(true);
  };

  const handlePreview = (achievement: Achievement) => {
    setPreviewAchievement(achievement);
    setPreviewPhotoIndex(0);
    setIsPreviewModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      const res = await fetch(`/api/v1/admin/achievements/${deletingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchAchievements();
      }
    } catch (error) {
      logger.error('Failed to delete achievement', error);
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      location: '',
      monthYear: '',
      photos: [],
      description: '',
      externalUrl: '',
    });
  };

  const handlePhotoChange = (url: string | null, index: number) => {
    const newPhotos = [...formData.photos];
    if (url) {
      newPhotos[index] = url;
    } else {
      newPhotos.splice(index, 1);
    }
    setFormData({ ...formData, photos: newPhotos });
  };

  const addPhotoSlot = () => {
    setFormData({ ...formData, photos: [...formData.photos, ''] });
  };

  const footer = (
    <>
      <Button type="button" variant="ghost" onClick={handleCloseModal}>
        Cancel
      </Button>
      <Button
        type="submit"
        form="achievement-form"
        className="bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {editingId ? 'Update' : 'Create'}
      </Button>
    </>
  );

  if (loading) {
    return <div>Loading achievements...</div>;
  }

  return (
    <div className="space-y-6 relative min-h-[400px]">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Achievements</h2>
        {}
        <Button
          onClick={() => setIsModalOpen(true)}
          className="hidden md:flex bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Achievement
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={cn(
              'bg-[var(--bg-elevated)] rounded-2xl overflow-hidden',
              cardSurface,
              'transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1',
              !achievement.visible && 'opacity-60'
            )}
          >
            {}
            <div className="relative w-full h-40 bg-accent/5 overflow-hidden">
              {achievement.photos.length > 0 ? (
                <>
                  <Image
                    src={achievement.photos[0]}
                    alt={achievement.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  {achievement.photos.length > 1 && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-bg-elevated text-xs font-medium text-foreground">
                      +{achievement.photos.length - 1} more
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-[var(--text-secondary)]" />
                </div>
              )}
            </div>

            {}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="cursor-grab">
                    <GripVertical className="w-4 h-4 text-[var(--text-secondary)]" />
                  </div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)] line-clamp-1">
                    {achievement.name}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] mb-2">
                {achievement.location} • {achievement.monthYear}
              </p>

              {achievement.description && (
                <p className="text-xs text-[var(--text-primary)] line-clamp-2 mb-3">
                  {achievement.description}
                </p>
              )}

              {achievement.externalUrl && (
                <a
                  href={achievement.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs hover:underline truncate mb-3"
                  style={{ color: getPlatformFromUrl(achievement.externalUrl).color }}
                >
                  <Link2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">{truncateUrl(achievement.externalUrl)}</span>
                </a>
              )}

              {}
              <div className="flex items-center justify-end gap-1 pt-2 border-t border-line">
                <button
                  onClick={() => handlePreview(achievement)}
                  className={cn(
                    'p-2 rounded-lg transition-all duration-200',
                    'hover:bg-bg-elevated',
                    sunkenSurface
                  )}
                  title="Preview"
                >
                  <Eye className="w-4 h-4 text-[var(--teal)]" />
                </button>
                <button
                  onClick={() => handleEdit(achievement)}
                  className={cn(
                    'p-2 rounded-lg transition-all duration-200',
                    'hover:bg-bg-elevated',
                    sunkenSurface
                  )}
                  title="Edit"
                >
                  <Pencil className="w-4 h-4 text-[var(--teal)]" />
                </button>
                <button
                  onClick={() => handleDelete(achievement.id)}
                  className={cn(
                    'p-2 rounded-lg transition-all duration-200',
                    'hover:bg-red-100',
                    sunkenSurface
                  )}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {achievements.length === 0 && (
          <div className="col-span-full">
            <div className={cn('bg-[var(--bg-elevated)] rounded-[var(--radius-container)] p-12 text-center', cardSurface)}>
              <div
                className={cn(
                  'w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center',
                  sunkenSurface
                )}
              >
                <Award className="w-10 h-10 text-[var(--text-secondary)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Achievements Yet</h3>
              <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                Start showcasing your accomplishments by adding your first achievement. Click the +
                button to get started.
              </p>
            </div>
          </div>
        )}
      </div>

      {}
      <button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          'fixed bottom-20 right-6 w-14 h-14 rounded-full md:hidden',
          'bg-accent text-accent-foreground',
          'shadow-lg shadow-[var(--teal)]/30',
          'hover:shadow-xl hover:shadow-[var(--teal)]/40 hover:scale-105',
          'active:scale-95 transition-all duration-200',
          'flex items-center justify-center z-50'
        )}
        title="Add Achievement"
      >
        <Plus className="w-6 h-6" />
      </button>

      <ResponsiveModal
        open={isModalOpen}
        onOpenChange={(open) => !open && handleCloseModal()}
        title={editingId ? 'Edit Achievement' : 'Add Achievement'}
        description="Manage achievement details"
        footer={footer}
        size="lg"
      >
        <form id="achievement-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className={cn(
                'w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/20',
                sunkenSurface
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className={cn(
                  'w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)]',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/20',
                  sunkenSurface
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Month & Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.monthYear}
                onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                placeholder="e.g., January 2024"
                required
                className={cn(
                  'w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)]',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/20',
                  sunkenSurface
                )}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={cn(
                'w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/20 resize-none',
                sunkenSurface
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">External URL</label>
            <input
              type="url"
              value={formData.externalUrl}
              onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
              placeholder="https://..."
              className={cn(
                'w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/20',
                sunkenSurface
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Photos</label>
            <div className="space-y-3">
              {formData.photos.map((photo, index) => (
                <FileUpload
                  key={index}
                  value={photo || null}
                  onChange={(url) => handlePhotoChange(url, index)}
                  label={`Photo ${index + 1}`}
                  folder="achievements"
                  accept="image/jpeg,image/png,image/webp"
                  preview={false}
                />
              ))}
              <Button type="button" variant="outline" onClick={addPhotoSlot} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Photo
              </Button>
            </div>
          </div>
        </form>
      </ResponsiveModal>

      {}
      <ResponsiveModal
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeleteModalOpen(false);
            setDeletingId(null);
          }
        }}
        title="Delete Achievement"
        description="Are you sure you want to delete this achievement?"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-on-error"
            >
              Delete
            </Button>
          </>
        }
        size="sm"
      >
        <div className="flex items-center gap-4 py-4">
          <div className={cn('p-3 rounded-xl bg-red-100', sunkenSurface)}>
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            This action cannot be undone. The achievement and all its photos will be permanently
            removed.
          </p>
        </div>
      </ResponsiveModal>

      {}
      <ResponsiveModal
        open={isPreviewModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsPreviewModalOpen(false);
            setPreviewAchievement(null);
          }
        }}
        title={previewAchievement?.name || 'Achievement Preview'}
        size="lg"
        footer={
          previewAchievement?.externalUrl ? (
            <a
              href={previewAchievement.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <ExternalLink className="w-4 h-4" />
                View Certificate
              </Button>
            </a>
          ) : undefined
        }
      >
        {previewAchievement && (
          <div className="space-y-6">
            {}
            {previewAchievement.photos.length > 0 && (
              <div className="space-y-4">
                <div
                  className={cn(
                    'relative aspect-video rounded-xl overflow-hidden',
                    sunkenSurface
                  )}
                >
                  <Image
                    src={previewAchievement.photos[previewPhotoIndex]}
                    alt={previewAchievement.name}
                    fill
                    className="object-contain"
                    sizes="800px"
                  />

                  {previewAchievement.photos.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setPreviewPhotoIndex(
                            (prev) =>
                              (prev - 1 + previewAchievement.photos.length) %
                              previewAchievement.photos.length
                          )
                        }
                        className={cn(
                          'absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center bg-bg-elevated transition-all hover:scale-105',
                          cardSurface
                        )}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          setPreviewPhotoIndex(
                            (prev) => (prev + 1) % previewAchievement.photos.length
                          )
                        }
                        className={cn(
                          'absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center bg-bg-elevated transition-all hover:scale-105',
                          cardSurface
                        )}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-bg-elevated text-sm font-medium">
                        {previewPhotoIndex + 1} / {previewAchievement.photos.length}
                      </div>
                    </>
                  )}
                </div>

                {}
                {previewAchievement.photos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {previewAchievement.photos.map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPreviewPhotoIndex(idx)}
                        className={cn(
                          'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all',
                          idx === previewPhotoIndex
                            ? 'ring-2 ring-[var(--teal)] scale-105'
                            : 'opacity-60 hover:opacity-100'
                        )}
                      >
                        <Image
                          src={photo}
                          alt={`Thumbnail ${idx + 1}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {}
            <div className="flex flex-wrap gap-3">
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm',
                  sunkenSurface
                )}
              >
                <MapPin className="w-4 h-4 text-[var(--teal)]" />
                <span className="text-[var(--text-secondary)]">{previewAchievement.location}</span>
              </div>
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm',
                  sunkenSurface
                )}
              >
                <Calendar className="w-4 h-4 text-[var(--teal)]" />
                <span className="text-[var(--text-secondary)]">{previewAchievement.monthYear}</span>
              </div>
            </div>

            {}
            {previewAchievement.description && (
              <div className={cn('rounded-xl p-4', sunkenSurface)}>
                <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                  {previewAchievement.description}
                </p>
              </div>
            )}
          </div>
        )}
      </ResponsiveModal>
    </div>
  );
}
