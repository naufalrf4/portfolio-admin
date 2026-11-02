import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function MessagesPage() {
  redirect('/contacts?tab=messages');
}
