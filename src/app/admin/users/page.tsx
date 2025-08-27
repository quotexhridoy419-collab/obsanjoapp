
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, Edit, Trash2, Save, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { db } from '@/lib/firebase';
import { ref, get, update, remove } from 'firebase/database';

interface User {
  id: string; // Mobile number
  fullName: string;
  balance: number;
  rechargeBalance: number;
  password?: string;
}

export default function AdminUsersPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const usersRef = ref(db, 'users');
            const snapshot = await get(usersRef);
            if (snapshot.exists()) {
                const usersData = snapshot.val();
                const usersList = Object.keys(usersData).map(key => ({
                    id: key,
                    ...usersData[key]
                }));
                setUsers(usersList);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error("Error fetching users from Firebase:", error);
            toast({ variant: 'destructive', title: 'ত্রুটি', description: 'ব্যবহারকারীদের তথ্য আনতে সমস্যা হয়েছে।' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const filteredUsers = useMemo(() => {
        return users.filter(user => user.id.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [users, searchTerm]);

    const handleEdit = (user: User) => {
        setEditingUser({ ...user });
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;

        try {
            const userRef = ref(db, `users/${editingUser.id}`);
            const updates: Partial<User> = {
                balance: Number(editingUser.balance) || 0,
                rechargeBalance: Number(editingUser.rechargeBalance) || 0,
            };
            if (editingUser.password) {
                updates.password = editingUser.password;
            }
            await update(userRef, updates);

            loadUsers();
            setEditingUser(null);
            toast({
                title: 'সফল',
                description: `ব্যবহারকারী ${editingUser.id} এর তথ্য আপডেট করা হয়েছে।`,
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'ত্রুটি',
                description: 'ব্যবহারকারীর তথ্য আপডেট করতে সমস্যা হয়েছে।',
            });
        }
    };
    
    const handleDeleteUser = async (userToDelete: User) => {
        try {
            const userRef = ref(db, `users/${userToDelete.id}`);
            await remove(userRef);
            loadUsers();
            toast({
                title: 'সফল',
                description: `ব্যবহারকারী ${userToDelete.id} কে মুছে ফেলা হয়েছে।`,
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'ত্রুটি',
                description: 'ব্যবহারকারীকে মুছতে সমস্যা হয়েছে।',
            });
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editingUser) return;
        const { name, value } = e.target;
        setEditingUser({ ...editingUser, [name]: value });
    };

    return (
        <div className="flex flex-col gap-6">
            <header>
                 <h1 className="text-3xl font-bold tracking-tight">ব্যবহারকারী পরিচালনা</h1>
                <p className="text-muted-foreground">ব্যবহারকারীদের তথ্য দেখুন, সম্পাদনা করুন বা মুছুন।</p>
            </header>
            <Card>
                <CardHeader>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="ব্যবহারকারী আইডি দিয়ে খুঁজুন..."
                            className="w-full pl-8 sm:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div>লোড হচ্ছে...</div>
                    ) : (
                    <div className="w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>আইডি</TableHead>
                                    <TableHead>নাম</TableHead>
                                    <TableHead>উত্তোলন ব্যালেন্স</TableHead>
                                    <TableHead>রিচার্জ ব্যালেন্স</TableHead>
                                    <TableHead>কার্যক্রম</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.id}</TableCell>
                                        <TableCell>{user.fullName}</TableCell>
                                        <TableCell>
                                            {editingUser?.id === user.id ? (
                                                <Input name="balance" type="number" value={editingUser.balance} onChange={handleInputChange} className="w-24" />
                                            ) : (
                                                `৳${(user.balance || 0).toFixed(2)}`
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingUser?.id === user.id ? (
                                                <Input name="rechargeBalance" type="number" value={editingUser.rechargeBalance} onChange={handleInputChange} className="w-24" />
                                            ) : (
                                                `৳${(user.rechargeBalance || 0).toFixed(2)}`
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingUser?.id === user.id ? (
                                                <div className="flex items-center gap-2">
                                                    <Input name="password" placeholder="নতুন পাসওয়ার্ড" onChange={handleInputChange} className="w-32" />
                                                    <Button size="icon" variant="ghost" onClick={handleSaveEdit}><Save className="h-4 w-4 text-green-600" /></Button>
                                                    <Button size="icon" variant="ghost" onClick={handleCancelEdit}><X className="h-4 w-4" /></Button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Button size="icon" variant="outline" onClick={() => handleEdit(user)}><Edit className="h-4 w-4" /></Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="icon" variant="outline"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    এই ব্যবহারকারীকে মুছে ফেলা হলে তা আর পুনরুদ্ধার করা যাবে না।
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteUser(user)} className="bg-destructive hover:bg-destructive/90">
                                                                    মুছে ফেলুন
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
