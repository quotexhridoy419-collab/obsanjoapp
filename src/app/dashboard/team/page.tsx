
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Search, Share2, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth.tsx';
import { db } from '@/lib/firebase';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';

interface TeamMember {
  id: string; // mobile number
  level: number;
  totalRecharge: number;
}

const commissionRates = {
  level1: { rate: 0.15, text: '15%' },
  level2: { rate: 0.03, text: '3%' },
  level3: { rate: 0.02, text: '2%' },
};

const CommissionCard = ({ level, rate, members, income }: { level: string; rate: string; members: number; income: number }) => (
  <Card className="flex-1 text-center shadow">
    <CardContent className="p-4">
      <p className="text-sm font-medium text-muted-foreground">{level}</p>
      <p className="text-2xl font-bold text-primary">{rate}</p>
      <p className="text-sm text-muted-foreground mt-2">{members} জন সদস্য</p>
      <p className="text-sm font-semibold text-accent">আয়: ৳{income.toFixed(2)}</p>
    </CardContent>
  </Card>
);

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [teamData, setTeamData] = useState<TeamMember[]>([]);
  const [isTeamLoading, setIsTeamLoading] = useState(true);
  const { toast } = useToast();
  const { user: currentUser, refetchUser } = useAuth();

  useEffect(() => {
    const fetchTeamData = async () => {
        if (!currentUser) return;

        setIsTeamLoading(true);
        try {
            const usersRef = ref(db, 'users');
            
            const findReferrals = async (referrerIds: string[], level: number): Promise<TeamMember[]> => {
                if (level > 3 || referrerIds.length === 0) return [];
                
                let directReferrals: TeamMember[] = [];
                let nextReferrerIds: string[] = [];

                for (const referrerId of referrerIds) {
                    const referralsQuery = query(usersRef, orderByChild('referrerId'), equalTo(referrerId));
                    const snapshot = await get(referralsQuery);
                    
                    if (snapshot.exists()) {
                        const referralsData = snapshot.val();
                        for (const key in referralsData) {
                            const u = referralsData[key];
                            const rechargeHistory = u.rechargeHistory ? Object.values(u.rechargeHistory) : [];
                            const totalRecharge = rechargeHistory
                                .filter((t: any) => t.status === 'সফল')
                                .reduce((sum: number, t: any) => sum + t.amount, 0);
                            
                            directReferrals.push({ id: key, level, totalRecharge });
                            nextReferrerIds.push(key);
                        }
                    }
                }
                
                if(nextReferrerIds.length === 0) return directReferrals;

                const nestedReferrals = await findReferrals(nextReferrerIds, level + 1);

                return [...directReferrals, ...nestedReferrals];
            };
            
            const team = await findReferrals([currentUser.id], 1);
            setTeamData(team);
        } catch (error) {
            console.error("Error fetching team data:", error);
            toast({ variant: 'destructive', title: 'ত্রুটি', description: 'দলের তথ্য আনতে সমস্যা হয়েছে।' });
        } finally {
            setIsTeamLoading(false);
        }
    }
    if (currentUser) {
      fetchTeamData();
    }
  }, [currentUser, toast]);
  
  const filteredTeamData = useMemo(() => {
    if (!searchTerm) {
      return teamData;
    }
    return teamData.filter(member => member.id.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, teamData]);

  const teamStats = useMemo(() => {
    const stats = {
      level1: { members: 0, income: 0 },
      level2: { members: 0, income: 0 },
      level3: { members: 0, income: 0 },
    };
    if (currentUser && currentUser.commissionHistory) {
      const commissionHistory = Object.values(currentUser.commissionHistory);
      commissionHistory.forEach((record: any) => {
        if (record.level === 1) stats.level1.income += record.amount;
        if (record.level === 2) stats.level2.income += record.amount;
        if (record.level === 3) stats.level3.income += record.amount;
      });
    }
    teamData.forEach(member => {
        if (member.level === 1) stats.level1.members++;
        if (member.level === 2) stats.level2.members++;
        if (member.level === 3) stats.level3.members++;
    });
    return stats;
  }, [teamData, currentUser]);

  const handleCopyInviteLink = () => {
    if (!currentUser || !currentUser.referralCode) return;
    const inviteLink = `${window.location.origin}/signup?ref=${currentUser.referralCode}`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: 'লিঙ্ক কপি করা হয়েছে!',
      description: 'আপনার আমন্ত্রণ লিঙ্কটি সফলভাবে কপি করা হয়েছে।',
    });
  };

  const inviteLink = currentUser ? `${window.location.origin}/signup?ref=${currentUser.referralCode}` : '';

  if(isTeamLoading) {
    return <div className="flex items-center justify-center min-h-screen">লোড হচ্ছে...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center bg-primary p-4 text-primary-foreground">
        <Link href="/dashboard" className="text-primary-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="flex-grow text-center font-headline text-xl font-bold">আমার দল</h1>
        <div className="w-6"></div>
      </header>

      <main className="container mx-auto max-w-3xl p-4 space-y-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>আমন্ত্রণ লিঙ্ক</span>
              <Button variant="ghost" size="icon" onClick={handleCopyInviteLink}>
                <Share2 className="h-5 w-5" />
              </Button>
            </CardTitle>
            <CardDescription>
              আপনার বন্ধুদের আমন্ত্রণ জানাতে এবং কমিশন উপার্জন করতে আপনার লিঙ্কটি শেয়ার করুন।
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={inviteLink}
                className="bg-muted"
                placeholder={currentUser?.referralCode ? inviteLink : "লোড হচ্ছে..."}
              />
              <Button onClick={handleCopyInviteLink} disabled={!currentUser}>কপি করুন</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-center">
          <CommissionCard level="স্তর ১" rate={commissionRates.level1.text} members={teamStats.level1.members} income={teamStats.level1.income} />
          <CommissionCard level="স্তর ২" rate={commissionRates.level2.text} members={teamStats.level2.members} income={teamStats.level2.income} />
          <CommissionCard level="স্তর ৩" rate={commissionRates.level3.text} members={teamStats.level3.members} income={teamStats.level3.income} />
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users /> দলের সদস্যদের বিবরণ
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ব্যবহারকারী আইডি দিয়ে খুঁজুন..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>স্তর</TableHead>
                    <TableHead>ব্যবহারকারী আইডি</TableHead>
                    <TableHead className="text-right">মোট রিচার্জ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeamData.length > 0 ? (
                    filteredTeamData.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <Badge variant="outline">স্তর {member.level}</Badge>
                        </TableCell>
                        <TableCell>{member.id}</TableCell>
                        <TableCell className="text-right">
                           <div className="flex items-center justify-end gap-1">
                                <Wallet size={14} className={member.totalRecharge > 0 ? 'text-green-600' : 'text-muted-foreground'} />
                                <span className={member.totalRecharge > 0 ? 'text-green-600 font-semibold' : 'text-muted-foreground'}>
                                   ৳{member.totalRecharge.toFixed(2)}
                                </span>
                            </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        কোনো সদস্য পাওয়া যায়নি।
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
