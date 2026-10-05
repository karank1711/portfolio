import { Link } from 'react-router-dom';
import { Container } from '@/components/common/Container.jsx';

export default function NotFoundPage() {
  return (
    <Container className="py-28">
      <p className="text-xs uppercase tracking-[0.18em] text-faint">404</p>
      <h1 className="mt-3 font-serif text-5xl text-ink">This page is not on the site.</h1>
      <Link to="/" className="mt-6 inline-block text-sm text-ink underline-offset-4 hover:underline">Return home</Link>
    </Container>
  );
}
