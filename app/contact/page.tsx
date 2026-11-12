import type { Metadata } from 'next';
import Contact from '@/components/Contact';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Tell us what you are building and who it is for. We reply to every enquiry within two working days.',
};

export default function ContactPage() {
  return <Contact standalone />;
}
