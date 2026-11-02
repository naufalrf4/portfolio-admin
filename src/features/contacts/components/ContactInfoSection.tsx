import { Mail, Calendar, Hash } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/date';

interface ContactInfoSectionProps {
  email: string;
  createdAt: string;
  ipHash: string;
}

export function ContactInfoSection({ email, createdAt, ipHash }: ContactInfoSectionProps) {
  const formattedDate = formatDateTime(createdAt);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Mail className="h-4 w-4" />
            <span className="font-medium">Email</span>
          </div>
          <a href={`mailto:${email}`} className="text-[var(--teal)] hover:underline block">
            {email}
          </a>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Received</span>
          </div>
          <p className="text-[var(--text-primary)]">{formattedDate}</p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Hash className="h-4 w-4" />
          <span className="font-medium">IP Hash</span>
        </div>
        <p className="text-[var(--text-secondary)] text-sm font-mono">{ipHash}</p>
      </div>
    </div>
  );
}
