
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, LogOut, Users, Wallet, Settings, Menu, Landmark, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';

const adminNavItems = [
    { href: '/admin/dashboard', icon: Home, label: 'ড্যাশবোর্ড' },
    { href: '/admin/users', icon: Users, label: 'ব্যবহারকারী পরিচালনা' },
    { href: '/admin/transactions?type=recharge&status=pending', icon: Landmark, label: 'পেন্ডিং রিচার্জ' },
    { href: '/admin/transactions?type=recharge&status=successful', icon: Landmark, label: 'সফল রিচার্জ' },
    { href: '/admin/transactions?type=recharge&status=failed', icon: Landmark, label: 'ব্যর্থ রিচার্জ' },
    { href: '/admin/transactions?type=withdrawal&status=pending', icon: Landmark, label: 'পেন্ডিং উত্তোলন' },
    { href: '/admin/transactions?type=withdrawal&status=successful', icon: Landmark, label: 'সফল উত্তোলন' },
    { href: '/admin/transactions?type=withdrawal&status=failed', icon: Landmark, label: 'ব্যর্থ উত্তোলন' },
    { href: '/admin/payment-methods', icon: Wallet, label: 'পেমেন্ট মেথড' },
    { href: '/admin/investments', icon: Briefcase, label: 'ইনভেস্টমেন্ট সেটিংস' },
    { href: '/admin/settings', icon: Settings, label: 'সেটিংস' },
];


const AdminSidebar = ({ isMobile = false, onLinkClick }: { isMobile?: boolean, onLinkClick?: () => void }) => {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        router.push('/admin/login');
    }

    return (
        <aside className={cn(
            "bg-card border-r border-border flex-col",
            isMobile ? "flex w-full" : "w-64 hidden md:flex"
        )}>
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-primary">অ্যাডমিন প্যানেল</h2>
            </div>
            <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
                <ul className="space-y-2">
                    {adminNavItems.map((item) => {
                        let isTransactionActive = false;
                        if (typeof window !== 'undefined') {
                            const fullPath = `${pathname}${window.location.search}`;
                            isTransactionActive = item.href.startsWith('/admin/transactions') && fullPath === item.href;
                        }


                        return (
                            <li key={item.label}>
                                <Link href={item.href} className={cn(
                                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                                    pathname === item.href || isTransactionActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                )}
                                onClick={onLinkClick}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>
            <div className="p-4 border-t">
                 <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left text-red-500 hover:bg-red-500/10">
                    <LogOut className="h-5 w-5" />
                    <span>লগ আউট</span>
                </button>
            </div>
        </aside>
    );
};

const MobileHeader = () => {
    const [open, setOpen] = useState(false);
    return (
         <header className="md:hidden flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-full max-w-xs">
                     <SheetTitle className="sr-only">Admin Menu</SheetTitle>
                    <AdminSidebar isMobile={true} onLinkClick={() => setOpen(false)} />
                </SheetContent>
            </Sheet>
            <div className="flex-1">
                 <h2 className="text-lg font-bold text-primary">অ্যাডমিন প্যানেল</h2>
            </div>
        </header>
    )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (adminLoggedIn === 'true') {
        setIsAuthenticated(true);
    } else {
        setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) return; // Wait for initial check

    if (!isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isAuthenticated, pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return <Loader />;
  }
  
  if (!isAuthenticated) {
     return null; // Redirecting...
  }

  return (
    <>
      <div className="flex min-h-screen bg-muted/40">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
            <MobileHeader />
            <main className="flex-grow p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </>
  );
}
