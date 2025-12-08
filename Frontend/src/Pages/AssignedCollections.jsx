import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/apiClient";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Button } from "../Components/ui/button";
import { Loader2, Truck, Calendar, MapPin, User, Package, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AssignedCollections() {
    const navigate = useNavigate();

    const { data: assignments, isLoading, isError, error } = useQuery({
        queryKey: ['myCollections'],
        queryFn: async () => {
            const { data } = await apiClient.get('/donations/my-collections');
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

    if (isError) {
        return (
            <div className="p-6 text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl m-6">
                Error loading assignments: {error.message}
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Truck className="w-8 h-8" /> Assigned Collections
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                        View and manage your assigned donation pickups.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments?.map(donation => (
                        <Card key={donation._id} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all duration-200 group">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                                        Pickup
                                    </Badge>
                                    <span className="text-xs font-mono text-zinc-400">#{donation.donationId || donation._id.slice(-6)}</span>
                                </div>
                                <CardTitle className="text-lg mt-2">
                                    {donation.donor?.name || 'Unknown Donor'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                        <span>{donation.address || 'No Address Provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 shrink-0" />
                                        <span>{donation.scheduled_delivery ? format(new Date(donation.scheduled_delivery), 'PP p') : 'No Date Set'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 shrink-0" />
                                        <span>{donation.items?.reduce((acc, item) => acc + item.quantity, 0) || 0} Items</span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full mt-2 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 transition-colors"
                                    onClick={() => navigate(`/donations/${donation._id}`)}
                                >
                                    View Details <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}

                    {assignments?.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                            <Truck className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
                            <p className="text-zinc-500 dark:text-zinc-400">No collections currently assigned to you.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
