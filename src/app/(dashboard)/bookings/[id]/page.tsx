import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBookingById } from '@/features/bookings/services';
import { BookingDetailPageContent } from './BookingDetailPageContent';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) {
    return {
      title: 'Booking Not Found',
    };
  }

  return {
    title: `Booking - ${booking.name}`,
    description: `Booking appointment for ${booking.name} on ${booking.date} at ${booking.time}`,
  };
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) {
    notFound();
  }

  return <BookingDetailPageContent initialBooking={booking} />;
}
