import { useEffect, useState } from 'react';
import { HOME_SLUG } from './content';

export const href = (slug: string): string => `#/${slug}`;

const current = () => decodeURIComponent(location.hash.replace(/^#\/?/, '')) || HOME_SLUG;

/** Hash routing: no dependency, and deep links survive GitHub Pages without a 404 shim. */
export function useRoute(): string {
  const [slug, setSlug] = useState(current);
  useEffect(() => {
    const onChange = () => {
      setSlug(current());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return slug;
}
