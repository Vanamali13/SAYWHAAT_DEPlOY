import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Badge } from "../Components/ui/badge";
import { Checkbox } from "../Components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../Components/ui/tabs";
import { Loader2, Truck, Calendar, MapPin, User, CheckCircle } from "lucide-react";

import { useToast } from "../context/ToastContext";

export default function AssignCollection() {
    const queryClient = useQueryClient();
    const { addToast } = useToast();
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [selectedDonation, setSelectedDonation] = useState(null);

    const { data: pendingDonations, isLoading: pendingLoading, isError: isPendingError, error: pendingError } = useQuery({
        queryKey: ['pendingCollections'],
        queryFn: async () => {
            const { data } = await apiClient.get('/admin/collections/pending');
            return data;
        }
    });

    // Fetch Batch Staff
    const { data: batchStaff, isLoading: staffLoading } = useQuery({
        queryKey: ['batchStaff', selectedDonation?.scheduled_delivery],
        queryFn: async () => {
            let url = '/admin/batch-staff';
            if (selectedDonation?.scheduled_delivery) {
                url += `?date=${encodeURIComponent(selectedDonation.scheduled_delivery)}`;
            }
            const { data } = await apiClient.get(url);
            return data;
        },
        enabled: !!selectedDonation
    });

    const assignMutation = useMutation({
        mutationFn: async ({ donationId, staffIds }) => {
            await apiClient.post(`/admin/collections/${donationId}/assign`, { staffIds });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingCollections'] });
            addToast("Collection assigned successfully!", "success");
            setSelectedDonation(null);
            setSelectedStaff([]);
        },
        onError: (err) => {
            console.error(err);
            addToast("Failed to assign collection.", "error");
        }
    });

    const handleStaffToggle = (staffId) => {
        setSelectedStaff(prev =>
            prev.includes(staffId) ? prev.filter(id => id !== staffId) : [...prev, staffId]
        );
    };

    const handleAssign = () => {
        if (!selectedDonation || selectedStaff.length === 0) return;
        assignMutation.mutate({ donationId: selectedDonation._id, staffIds: selectedStaff });
    };

    if (pendingLoading || staffLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (isPendingError) {
        return (
            <div className="p-6 text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl m-6">
                Error loading pending collections: {pendingError.message}
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Truck className="w-8 h-8" /> Assign Collections
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                        Manage pickup assignments for approved donations.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* List of Pending Donations */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5" /> Pending Pickups
                            <Badge variant="secondary">{pendingDonations?.length || 0}</Badge>
                        </h2>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                            {pendingDonations?.map(donation => (
                                <Card
                                    key={donation._id}
                                    className={`cursor-pointer transition-all hover:border-blue-400 ${selectedDonation?._id === donation._id ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'bg-white dark:bg-zinc-900'}`}
                                    onClick={() => {
                                        setSelectedDonation(donation);
                                        setSelectedStaff([]); // Reset staff selection on new donation select
                                    }}
                                >
                                    <CardContent className="p-4">
                                        <p className="font-medium text-sm">Donation #{donation.donationId || donation._id.slice(-6)}</p>
                                        <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                            <User className="w-3 h-3" /> {donation.donor?.name || 'Unknown Donor'}
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {donation.address ? (donation.address.length > 30 ? donation.address.substring(0, 30) + '...' : donation.address) : 'No Address'}
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {donation.scheduled_delivery ? format(new Date(donation.scheduled_delivery), 'PP p') : 'No Date Set'}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {pendingDonations?.length === 0 && (
                                <p className="text-sm text-zinc-500 italic">No pending collections found.</p>
                            )}
                        </div>
                    </div>

                    {/* Assignment Panel */}
                    <div className="lg:col-span-2">
                        {selectedDonation ? (
                            <Card className="bg-white dark:bg-zinc-900 h-full">
                                <CardHeader>
                                    <CardTitle>Assign Staff</CardTitle>
                                    <CardDescription>Select one or more staff members to collect this donation.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-800 space-y-2">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-xs text-zinc-500 uppercase font-semibold">Donor</span>
                                                <p className="font-medium">{selectedDonation.donor?.name}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-zinc-500 uppercase font-semibold">Pickup Time</span>
                                                <p className="font-medium">{selectedDonation.scheduled_delivery ? format(new Date(selectedDonation.scheduled_delivery), 'PPP p') : 'N/A'}</p>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <span className="text-xs text-zinc-500 uppercase font-semibold">Address</span>
                                                <p className="font-medium">{selectedDonation.address || 'N/A'}</p>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <span className="text-xs text-zinc-500 uppercase font-semibold">Items</span>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                    {selectedDonation.items?.map(i => `${i.quantity} x ${i.name}`).join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-3">Available Batch Staff</h3>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {batchStaff?.map(staff => (
                                                <div
                                                    key={staff._id}
                                                    className={`flex items-center space-x-3 p-3 rounded-md border cursor-pointer transition-colors ${selectedStaff.includes(staff._id) ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800'}`}
                                                    onClick={() => handleStaffToggle(staff._id)}
                                                >
                                                    <Checkbox
                                                        checked={selectedStaff.includes(staff._id)}
                                                        onCheckedChange={() => handleStaffToggle(staff._id)}
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{staff.name}</p>
                                                        <p className="text-xs text-zinc-500">{staff.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button
                                            onClick={handleAssign}
                                            disabled={selectedStaff.length === 0 || assignMutation.isLoading}
                                            className="w-full sm:w-auto"
                                        >
                                            {assignMutation.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Assign {selectedStaff.length} Staff Member{selectedStaff.length !== 1 ? 's' : ''}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                <Truck className="w-16 h-16 text-zinc-200 dark:text-zinc-700 mb-4" />
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No Donation Selected</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mt-2">
                                    Select a pending donation from the list on the left to view details and assign staff.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
