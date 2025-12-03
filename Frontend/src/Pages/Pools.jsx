import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import { Textarea } from "../Components/ui/textarea";
import { Loader2, Users, DollarSign, Layers, Plus, X } from "lucide-react";

export default function Pools() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newPool, setNewPool] = useState({ title: "", description: "", target_amount: "" });

    const { data: pools, isLoading, isError } = useQuery({
        queryKey: ['pools'],
        queryFn: async () => {
            const { data } = await apiClient.get('/pools');
            return data;
        },
    });

    const createPoolMutation = useMutation({
        mutationFn: (poolData) => apiClient.post('/pools', poolData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pools'] });
            setIsCreateOpen(false);
            setNewPool({ title: "", description: "", target_amount: "" });
        },
    });

    const handleCreatePool = (e) => {
        e.preventDefault();
        createPoolMutation.mutate({
            ...newPool,
            target_amount: newPool.target_amount ? parseFloat(newPool.target_amount) : undefined
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (isError) {
        return <div className="min-h-screen p-6 bg-zinc-950 text-red-500 flex items-center justify-center">Failed to load pools.</div>;
    }

    const activePoolsCount = pools?.filter(p => p.status === 'active').length || 0;

    return (
        <div className="min-h-screen p-6 lg:p-8 bg-zinc-950 text-zinc-100 relative">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-900">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            Donation Pools
                        </h1>
                        <p className="text-zinc-400 mt-2">
                            Manage and track collective donation efforts
                        </p>
                    </div>

                    <Button onClick={() => setIsCreateOpen(true)} className="bg-white text-black hover:bg-zinc-200">
                        <Plus className="w-4 h-4 mr-2" /> Create Pool
                    </Button>
                </div>

                {/* Custom Modal */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-4 text-zinc-400 hover:text-white"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>

                            <h2 className="text-lg font-semibold text-white mb-4">Create New Pool</h2>

                            <form onSubmit={handleCreatePool} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Pool Title</Label>
                                    <Input
                                        id="title"
                                        value={newPool.title}
                                        onChange={e => setNewPool({ ...newPool, title: e.target.value })}
                                        className="bg-zinc-950 border-zinc-800 text-white"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={newPool.description}
                                        onChange={e => setNewPool({ ...newPool, description: e.target.value })}
                                        className="bg-zinc-950 border-zinc-800 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="target">Target Amount ($)</Label>
                                    <Input
                                        id="target"
                                        type="number"
                                        value={newPool.target_amount}
                                        onChange={e => setNewPool({ ...newPool, target_amount: e.target.value })}
                                        className="bg-zinc-950 border-zinc-800 text-white"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-white text-black hover:bg-zinc-200" disabled={createPoolMutation.isLoading}>
                                        {createPoolMutation.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Pool"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Stats Overview */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Active Pools</CardTitle>
                            <Layers className="w-4 h-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{activePoolsCount}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pools List */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pools?.map((pool) => (
                        <Card key={pool._id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg text-white">{pool.title}</h3>
                                        <p className="text-xs text-zinc-500 mt-1 font-mono">{pool.poolId}</p>
                                    </div>
                                    <Badge variant="outline" className={pool.status === 'active' ? 'text-green-400 border-green-900 bg-green-900/20' : 'text-zinc-400 border-zinc-700'}>
                                        {pool.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-zinc-400 line-clamp-2">{pool.description || "No description provided."}</p>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1">
                                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" /> Collected
                                        </p>
                                        <p className="text-lg font-semibold text-white">${pool.current_amount?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                                            <Users className="w-3 h-3" /> Members
                                        </p>
                                        <p className="text-lg font-semibold text-white">{pool.members?.length || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {pools?.length === 0 && (
                        <div className="col-span-full text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                            No pools found. Create one to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
