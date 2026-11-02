import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function GuestbookPage() {
  redirect('/contacts?tab=guestbook');
}
