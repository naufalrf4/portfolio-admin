import {
  FolderKanban,
  Link,
  BookOpen,
  Calendar,
  User,
  BarChart3,
  FileText,
  MessagesSquare,
  Send,
} from 'lucide-react';
import type { QuickAction } from '../types';

export const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: <FolderKanban className="w-4 h-4" />,
    label: 'Add Project',
    href: '/projects',
    delay: 700,
  },
  {
    icon: <BookOpen className="w-4 h-4" />,
    label: 'Manage Publications',
    href: '/publications',
    delay: 750,
  },
  {
    icon: <Send className="w-4 h-4" />,
    label: 'Contact Hub',
    href: '/contacts',
    delay: 800,
  },
  {
    icon: <Calendar className="w-4 h-4" />,
    label: 'Booking Queue',
    href: '/contacts?tab=bookings',
    delay: 850,
  },
  {
    icon: <MessagesSquare className="w-4 h-4" />,
    label: 'NGL Inbox',
    href: '/contacts?tab=messages',
    delay: 900,
  },
  {
    icon: <Link className="w-4 h-4" />,
    label: 'Profile Links',
    href: '/links',
    delay: 950,
  },
  {
    icon: <MessagesSquare className="w-4 h-4" />,
    label: 'Guestbook',
    href: '/contacts?tab=guestbook',
    delay: 1000,
  },
  {
    icon: <User className="w-4 h-4" />,
    label: 'About Me',
    href: '/about',
    delay: 1050,
  },
  {
    icon: <BarChart3 className="w-4 h-4" />,
    label: 'Analytics',
    href: '/analytics',
    delay: 1100,
  },
  {
    icon: <FileText className="w-4 h-4" />,
    label: 'AI Service',
    href: '/knowledge',
    delay: 1150,
  },
  {
    icon: <MessagesSquare className="w-4 h-4" />,
    label: 'Chat Logs',
    href: '/chat-logs',
    delay: 1150,
  },
];
