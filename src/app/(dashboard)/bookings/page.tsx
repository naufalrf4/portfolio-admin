import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function BookingsPage() {
  redirect('/contacts?tab=bookings');
}
