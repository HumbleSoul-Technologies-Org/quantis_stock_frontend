'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function Breadcrumb() {
  const pathname = usePathname();

  // Don't show breadcrumb on dashboard root
  if (pathname === '/dashboard') {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  
  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { href, label };
  });

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
      <Link href="/dashboard" className="hover:text-green-700">
        Home
      </Link>
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {index === breadcrumbs.length - 1 ? (
            <span className="text-gray-800 font-semibold">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-green-700">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
