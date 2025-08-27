
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { db } from '@/lib/firebase';
import { ref, update } from 'firebase/database';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে।',
  }),
  paymentMethod: z.enum(['bKash', 'Nagad'], {
    required_error: 'একটি পেমেন্ট পদ্ধতি নির্বাচন করুন।',
  }),
  accountNumber: z.string().regex(/^01[3-9]\d{8}$/, {
    message: 'অনুগ্রহ করে একটি সঠিক ১১-সংখ্যার মোবাইল নম্বর দিন।',
  }),
});

export default function AddCardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading, refetchUser } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      accountNumber: '',
    },
  });

  useEffect(() => {
    if (user && user.bankCard) {
        form.reset(user.bankCard);
    }
  }, [form, user]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'ত্রুটি',
            description: 'ব্যবহারকারী লগইন করেননি।',
        });
        return;
    }

    try {
        const userRef = ref(db, `users/${user.id}`);
        await update(userRef, { bankCard: values });
        refetchUser();
        toast({
          title: 'সফল',
          description: 'আপনার ব্যাংক কার্ড সফলভাবে যোগ করা হয়েছে।',
        });
        router.push('/dashboard/withdraw');
    } catch(error) {
        toast({
            variant: 'destructive',
            title: 'ত্রুটি',
            description: 'কার্ড যোগ করতে সমস্যা হয়েছে।',
        });
    }
  }
  
  if (isLoading) {
      return <div className="text-center p-8">লোড হচ্ছে...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center bg-primary p-4 text-primary-foreground">
        <Link href="/dashboard/withdraw" className="text-primary-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="flex-grow text-center font-headline text-xl font-bold">ব্যাংক কার্ড যোগ করুন</h1>
        <div className="w-6"></div>
      </header>

      <main className="container mx-auto max-w-3xl p-4">
        <Card>
          <CardHeader>
            <CardTitle>আপনার অ্যাকাউন্টের বিবরণ দিন</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>আপনার নাম</FormLabel>
                      <FormControl>
                        <Input placeholder="সম্পূর্ণ নাম লিখুন" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>পেমেন্ট পদ্ধতি</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="একটি পদ্ধতি নির্বাচন করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bKash">bKash</SelectItem>
                          <SelectItem value="Nagad">Nagad</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>অ্যাকাউন্ট নম্বর</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="বিকাশ/নগদ নম্বর" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-12 text-lg font-bold">
                  কার্ড যোগ করুন
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
