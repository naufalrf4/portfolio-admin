import { db } from '@/lib/db';
import {
  projects,
  blogLink,
  guestbookEntries,
  anonymousMessages,
  profileLinks,
} from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { NextResponse } from 'next/server';

export const GET = withAdminAuth(async () => {
  try {
    const [
      [{ total: totalProjects }],
      [{ total: visibleProjects }],
      [{ total: totalBlogLinks }],
      [{ total: visibleBlogLinks }],
      [{ total: totalGuestbookEntries }],
      [{ total: visibleGuestbookEntries }],
      [{ total: totalMessages }],
      [{ total: unreadMessages }],
      [{ total: totalProfileLinks }],
      [{ total: visibleProfileLinks }],
    ] = await Promise.all([
      db.select({ total: count() }).from(projects),
      db.select({ total: count() }).from(projects).where(eq(projects.visible, true)),
      db.select({ total: count() }).from(blogLink),
      db.select({ total: count() }).from(blogLink).where(eq(blogLink.visible, true)),
      db.select({ total: count() }).from(guestbookEntries),
      db
        .select({ total: count() })
        .from(guestbookEntries)
        .where(eq(guestbookEntries.visible, true)),
      db.select({ total: count() }).from(anonymousMessages),
      db
        .select({ total: count() })
        .from(anonymousMessages)
        .where(eq(anonymousMessages.read, false)),
      db.select({ total: count() }).from(profileLinks),
      db.select({ total: count() }).from(profileLinks).where(eq(profileLinks.visible, true)),
    ]);

    const stats = {
      projects: {
        total: totalProjects,
        visible: visibleProjects,
        hidden: totalProjects - visibleProjects,
      },
      blogLinks: {
        total: totalBlogLinks,
        visible: visibleBlogLinks,
        hidden: totalBlogLinks - visibleBlogLinks,
      },
      guestbook: {
        total: totalGuestbookEntries,
        visible: visibleGuestbookEntries,
        hidden: totalGuestbookEntries - visibleGuestbookEntries,
      },
      messages: {
        total: totalMessages,
        unread: unreadMessages,
        read: totalMessages - unreadMessages,
      },
      profileLinks: {
        total: totalProfileLinks,
        visible: visibleProfileLinks,
        hidden: totalProfileLinks - visibleProfileLinks,
      },
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
});
