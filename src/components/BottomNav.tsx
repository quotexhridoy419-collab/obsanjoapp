
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Landmark, Users, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'হোম' },
  { href: '/dashboard/investments', icon: Landmark, label: 'বিনিয়োগ' },
  { href: '/dashboard/team', icon: Users, label: 'দল' },
  { href: '/dashboard/profile', icon: UserCircle, label: 'আমার প্রোফাইল' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-card shadow-t-md">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary',
                isActive && 'text-primary'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="font-body">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
