import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Badge } from '../Components/ui/badge';
import { Loader2, Package, Truck, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function AssignedBatches() {
    const { data: batches, isLoading, error } = useQuery({
        queryKey: ['myBatches'],
        queryFn: async () => {
            const { data } = await apiClient.get('/batches/my-batches');
            return data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-zinc-50 dark:bg-zinc-950 text-red-500">
                Failed to load batches. Please try again later.
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-900">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Package className="w-8 h-8" /> Assigned Batches
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                            Manage and track your delivery assignments
                        </p>
                    </div>
                </div>

                {batches && batches.length > 0 ? (
                    <div className="grid gap-6">
                        {batches.map((batch) => (
                            <Card key={batch._id} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                            <Truck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold">{batch.batchId}</CardTitle>
                                            <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" /> Created {format(new Date(batch.createdAt), 'PPP')}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge
                                        className={`px-3 py-1 text-sm font-medium ${batch.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' :
                                                batch.status === 'in_transit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' :
                                                    'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                            }`}
                                    >
                                        {batch.status ? batch.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="mt-4">
                                    {batch.notes && (
                                        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-md">
                                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                <span className="font-semibold">Note:</span> {batch.notes}
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Items in Batch</h3>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {batch.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                                    <div>
                                                        <p className="font-medium">{item.item_name}</p>
                                                        <p className="text-xs text-zinc-500">From: {item.donor_name}</p>
                                                    </div>
                                                    <Badge variant="outline" className="bg-white dark:bg-zinc-900">
                                                        x{item.quantity}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <Package className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No Batches Assigned</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2">You don't have any delivery assignments yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
