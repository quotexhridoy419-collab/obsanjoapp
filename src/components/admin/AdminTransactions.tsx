
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from 'lucide-react';
import { db } from '@/lib/firebase';
import { ref, get, update } from 'firebase/database';

type Status = 'সফল' | 'ব্যর্থ' | 'প্রক্রিয়াধীন';

interface RechargeTransaction {
    id: string; // Unique key from Firebase
    userId: string;
    amount: number;
    trxId: string;
    date: string; // ISO string
    status: Status;
    type: 'recharge';
}

interface WithdrawalTransaction {
    id: string; // Unique key from Firebase
    userId: string;
    amount: number;
    date: string; // ISO string
    status: Status;
    type: 'withdrawal';
    charge: number;
    received: number;
    paymentMethod: string;
    accountNumber: string;
}

type Transaction = RechargeTransaction | WithdrawalTransaction;


const StatusBadge = ({ status }: { status: Status }) => {
  return (
    <Badge
      className={cn({
        'bg-green-100 text-green-800': status === 'সফল',
        'bg-red-100 text-red-800': status === 'ব্যর্থ',
        'bg-yellow-100 text-yellow-800': status === 'প্রক্রিয়াধীন',
      })}
    >
      {status}
    </Badge>
  );
};

interface AdminTransactionsPageProps {
    onStatusChange: () => void;
    filterType: 'recharge' | 'withdrawal';
    filterStatus: 'pending' | 'successful' | 'failed';
}

const WithdrawalsTable = ({ requests, showActions, onUpdate }: { requests: WithdrawalTransaction[], showActions: boolean, onUpdate?: (transaction: Transaction, newStatus: Status) => void }) => (
     <div className="overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Withdrawal</TableHead>
                    <TableHead>Charge (7%)</TableHead>
                    <TableHead>Receivable</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    {showActions && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {requests.map((req) => {
                    const reqDate = new Date(req.date);
                    const isValidDate = !isNaN(reqDate.getTime());
                    return (
                        <TableRow key={req.id}>
                            <TableCell>{req.userId}</TableCell>
                            <TableCell>৳{req.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-red-500">- ৳{(req.charge || 0).toFixed(2)}</TableCell>
                            <TableCell className="font-bold text-green-600">৳{(req.received || 0).toFixed(2)}</TableCell>
                            <TableCell>{req.paymentMethod} - {req.accountNumber}</TableCell>
                            <TableCell>{isValidDate ? reqDate.toLocaleString('en-US') : 'Invalid Date'}</TableCell>
                            <TableCell><StatusBadge status={req.status} /></TableCell>
                            {showActions && onUpdate && (
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onUpdate(req, 'সফল')}>
                                                Approve
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onUpdate(req, 'ব্যর্থ')} className="text-red-600">
                                                Fail
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            )}
                        </TableRow>
                    );
                })}
                {requests.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={showActions ? 8 : 7} className="text-center">No requests found.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
     </div>
);

const RechargesTable = ({ requests, showActions, onUpdate }: { requests: RechargeTransaction[], showActions: boolean, onUpdate?: (transaction: Transaction, newStatus: Status) => void }) => (
    <div className="overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    {showActions && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {requests.map((req) => {
                    const reqDate = new Date(req.date);
                    const isValidDate = !isNaN(reqDate.getTime());
                    return (
                        <TableRow key={req.id}>
                            <TableCell>{req.userId}</TableCell>
                            <TableCell>৳{req.amount}</TableCell>
                            <TableCell>{req.trxId}</TableCell>
                            <TableCell>{isValidDate ? reqDate.toLocaleString('en-US') : 'Invalid Date'}</TableCell>
                            <TableCell><StatusBadge status={req.status} /></TableCell>
                            {showActions && onUpdate && (
                                 <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onUpdate(req, 'সফল')}>
                                                Mark as Successful
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onUpdate(req, 'ব্যর্থ')} className="text-red-600">
                                                Mark as Failed
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            )}
                        </TableRow>
                    )
                })}
                {requests.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={showActions ? 6 : 5} className="text-center">No requests found.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
);


export default function AdminTransactionsPage({ onStatusChange, filterType, filterStatus }: AdminTransactionsPageProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const loadRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            const usersRef = ref(db, 'users');
            const snapshot = await get(usersRef);
            if (!snapshot.exists()) {
                setTransactions([]);
                return;
            }

            const usersData = snapshot.val();
            const allTransactions: Transaction[] = [];

            for (const userId in usersData) {
                const user = usersData[userId];
                
                if (user.rechargeHistory) {
                    for (const key in user.rechargeHistory) {
                        allTransactions.push({ ...user.rechargeHistory[key], id: key, userId: userId, type: 'recharge' });
                    }
                }
                if (user.withdrawalHistory) {
                    for (const key in user.withdrawalHistory) {
                        allTransactions.push({ ...user.withdrawalHistory[key], id: key, userId: userId, type: 'withdrawal' });
                    }
                }
            }
            
            allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setTransactions(allTransactions);
        } catch (error) {
            console.error("Error loading requests from Firebase:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load requests.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);
    
    const statusMap: Record<typeof filterStatus, Status> = {
        pending: 'প্রক্রিয়াধীন',
        successful: 'সফল',
        failed: 'ব্যর্থ',
    };
    
    const filteredData = useMemo(() => {
        const targetStatus = statusMap[filterStatus];
        return transactions.filter(t => t.type === filterType && t.status === targetStatus);
    }, [transactions, filterType, filterStatus, statusMap]);

    const handleUpdate = async (transaction: Transaction, newStatus: Status) => {
         if (transaction.status !== 'প্রক্রিয়াধীন') {
            toast({ variant: 'destructive', title: 'Error', description: "This request has already been processed."});
            return;
        }

        try {
            const userRef = ref(db, `users/${transaction.userId}`);
            const userSnapshot = await get(userRef);
            if (!userSnapshot.exists()) {
                 toast({ variant: 'destructive', title: 'Error', description: "User not found."});
                 return;
            }
            const userData = userSnapshot.val();
            const updates: { [key: string]: any } = {};

            if (transaction.type === 'recharge') {
                updates[`rechargeHistory/${transaction.id}/status`] = newStatus;
                if (newStatus === 'সফল') {
                     updates['rechargeBalance'] = (userData.rechargeBalance || 0) + transaction.amount;
                }
            } else if (transaction.type === 'withdrawal') {
                updates[`withdrawalHistory/${transaction.id}/status`] = newStatus;
                if (newStatus === 'ব্যর্থ') { // Return money on failure
                    updates['balance'] = (userData.balance || 0) + transaction.amount;
                }
            }
            
            await update(userRef, updates);
            toast({ title: 'Success', description: `Request has been marked as ${newStatus}.` });
            onStatusChange();

        } catch(error) {
             toast({ variant: 'destructive', title: 'Error', description: "Update failed." });
        }
    }
    
    if (isLoading) {
        return <div>Loading...</div>;
    }

    const showActions = filterStatus === 'pending';

    return (
        <Card>
            <CardContent className="p-4 md:p-6">
                 {filterType === 'recharge' ? (
                    <RechargesTable 
                        requests={filteredData as RechargeTransaction[]} 
                        showActions={showActions}
                        onUpdate={handleUpdate}
                    />
                 ) : (
                    <WithdrawalsTable 
                        requests={filteredData as WithdrawalTransaction[]} 
                        showActions={showActions}
                        onUpdate={handleUpdate}
                    />
                 )}
            </CardContent>
        </Card>
    );
}
