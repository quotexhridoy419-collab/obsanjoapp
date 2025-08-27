
'use client';

import { useState, useEffect, useRef } from 'react';
import InvestmentCard from '@/components/InvestmentCard';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Landmark, Gift, Headset, CircleDollarSign, ArrowDownCircle } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import Link from 'next/link';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { cn } from '@/lib/utils';


interface QuickNavItem {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  label: string;
  href: string;
}

const quickNavItems: QuickNavItem[] = [
  { icon: Wallet, label: 'জমা', href: '/dashboard/recharge' },
  { icon: Landmark, label: 'উত্তলন', href: '/dashboard/withdraw' },
  { icon: Gift, label: 'বোনাস', href: '/dashboard/bonus' },
  { icon: Headset, label: 'সেবা', href: '/dashboard/service' },
];

const QuickNavButton = ({ item }: { item: QuickNavItem }) => (
  <Link href={item.href} className="flex flex-col items-center gap-2 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-200 ease-in-out hover:scale-110">
      <item.icon className="h-7 w-7" />
    </div>
    <span className="text-sm font-medium text-foreground">{item.label}</span>
  </Link>
);

const defaultBanner = 'https://firebasestorage.googleapis.com/v0/b/nurislam5.appspot.com/o/images%20(2).jpeg?alt=media&token=1b5d48e6-0de7-428e-bb92-039150276d4a';

export default function DashboardPage() {
  const { user: userData } = useAuth();
  const [banners, setBanners] = useState<string[]>([]);
  const [investmentOpportunities, setInvestmentOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  useEffect(() => {
    const fetchContent = async () => {
        setIsLoading(true);
        try {
            const contentRef = ref(db, 'siteContent');
            const snapshot = await get(contentRef);
            
            let finalBanners = [defaultBanner];
            let finalInvestments: any[] = [];

            if (snapshot.exists()) {
                const content = snapshot.val();
                const bannerUrls = content.banners 
                    ? Object.values(content.banners).filter(url => typeof url === 'string' && url)
                    : [];
                if (bannerUrls.length > 0) {
                    finalBanners = bannerUrls as string[];
                }
                
                finalInvestments = content.investments ? Object.values(content.investments) : [];
            }
            
            setBanners(finalBanners);
            setInvestmentOpportunities(finalInvestments);
        } catch (error) {
            console.error("Error fetching site content:", error);
            setBanners([defaultBanner]);
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchContent();
  }, []);
  
  const balances = {
      main: userData?.balance || 0,
      recharge: userData?.rechargeBalance || 0
  };
  
  const purchasedInvestmentIds = userData?.investments ? Object.values(userData.investments).map((inv: any) => inv.id) : [];

  return (
    <div className="bg-background">
      <div className="w-full p-4">
        {isLoading ? (
            <div className="w-full aspect-[16/9] bg-muted rounded-lg animate-pulse"></div>
        ) : (
            banners && banners.length > 0 && (
                <Carousel
                    plugins={[plugin.current]}
                    className="w-full rounded-lg overflow-hidden"
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                    opts={{ loop: true }}
                >
                    <CarouselContent>
                        {banners.map((src, index) => (
                            <CarouselItem key={index}>
                                <div className="relative w-full aspect-[16/9] bg-muted">
                                    <Image
                                        src={src}
                                        alt={`Banner Image ${index + 1}`}
                                        fill
                                        priority={index === 0}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover"
                                        data-ai-hint="farm banner"
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            )
        )}
      </div>

      <div className="container relative z-10 mx-auto max-w-3xl px-4">
        <Card className={cn(banners.length > 0 ? "-mt-12" : "mt-4", "rounded-xl p-4 shadow-lg")}>
          <div className="flex items-center justify-around">
            {quickNavItems.map((item) => (
              <QuickNavButton key={item.label} item={item} />
            ))}
          </div>
        </Card>
        
        <Card className="mt-4 shadow-lg">
            <CardContent className="grid grid-cols-2 gap-4 p-4 text-center">
                <div>
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <CircleDollarSign size={16} />
                        <span className="text-sm">উত্তোলন ব্যালেন্স</span>
                    </div>
                    <p className="text-xl font-bold text-primary">৳{balances.main.toFixed(2)}</p>
                </div>
                 <div>
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <ArrowDownCircle size={16} />
                        <span className="text-sm">রিচার্জ ব্যালেন্স</span>
                    </div>
                    <p className="text-xl font-bold text-accent">৳{balances.recharge.toFixed(2)}</p>
                </div>
            </CardContent>
        </Card>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="text-center p-8 text-muted-foreground">প্যাকেজ লোড হচ্ছে...</div>
          ) : investmentOpportunities.length > 0 ? (
            investmentOpportunities.map((item) => (
              <InvestmentCard 
                  key={item.id} 
                  {...item}
                  quotaCurrent={1} // Assuming quota is always 1 for now
                  quotaMax={1}
                  initialRechargeBalance={balances.recharge}
                  isInitiallyPurchased={purchasedInvestmentIds.includes(item.id)}
              />
            ))
          ) : (
            <Card className="text-center p-8">
              <p className="text-muted-foreground">শীঘ্রই নতুন বিনিয়োগের সুযোগ যোগ করা হবে।</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
