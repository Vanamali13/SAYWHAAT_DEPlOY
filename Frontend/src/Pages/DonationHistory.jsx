import React, { useContext, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/apiClient";
import { AuthContext } from "../context/authContext";
import { Loader2, History, LayoutList, Plus, Search, Filter, X } from "lucide-react";
import DonationCard from "../Components/donation/DonationCard";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Select, SelectItem } from "../Components/ui/select";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils/utils";
import { isToday } from "date-fns";

const DonationHistory = () => {
    const { user } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    const { data: donations, isLoading, isError } = useQuery({
        queryKey: ['donationHistory', user?.role, user?.email],
        queryFn: async () => {
            if (user?.role === 'Administrator') {
                const { data } = await apiClient.get("/admin/donations");
                // Filter for donations that are processed (not pending) and NOT from today
                // (Today's processed donations are shown in DonationRequests)
                return data.filter(d => d.status !== 'pending_approval' && !isToday(new Date(d.updatedAt)));
            } else {
                const { data } = await apiClient.get('/donations');
                return data;
            }
        },
        enabled: !!user,
    });

    // Filter Logic
    const filteredDonations = useMemo(() => {
        if (!donations) return [];

        return donations.filter(donation => {
            // Search Filter
            const matchesSearch = 
                searchQuery === "" ||
                donation._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                donation.donor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                donation.donor?.email?.toLowerCase().includes(searchQuery.toLowerCase());

            // Status Filter
            const matchesStatus = 
                statusFilter === "all" || 
                donation.status === statusFilter;

            // Type Filter
            const matchesType = 
                typeFilter === "all" || 
                donation.donation_type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [donations, searchQuery, statusFilter, typeFilter]);

    const clearFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setTypeFilter("all");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (isError) {
        return <div className="min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950 text-red-500 flex items-center justify-center">Failed to load donation history.</div>;
    }

    return (
        <div className="min-h-screen p-6 lg:p-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-900">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
                            Donation History
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 flex items-center gap-2">
                            View and track all your past contributions
                        </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <History className="w-6 h-6 text-blue-500" />
                    </div>
                </div>

                {/* Filters Section (Only for Admins) */}
                {user?.role === 'Administrator' && (
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-zinc-500 uppercase tracking-wider">
                            <Filter className="w-4 h-4" /> Filters
                        </div>
                        <div className="grid md:grid-cols-4 gap-4">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                <Input 
                                    placeholder="Search by Donor Name, Email or ID..." 
                                    className="pl-9 bg-zinc-50 dark:bg-zinc-950"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="w-full">
                                <Select 
                                    value={statusFilter} 
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    placeholder="Status"
                                    className="w-full"
                                >
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending (Approved)</SelectItem>
                                    <SelectItem value="in_transit">In Transit</SelectItem>
                                    <SelectItem value="delivered">Delivered/Received</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                </Select>
                            </div>
                            <div className="w-full">
                                <Select 
                                    value={typeFilter} 
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    placeholder="Type"
                                    className="w-full"
                                >
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="garments">Garments</SelectItem>
                                    <SelectItem value="money">Money</SelectItem>
                                </Select>
                            </div>
                        </div>
                        {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                            <div className="flex justify-end">
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-zinc-500 hover:text-red-500">
                                    <X className="w-4 h-4 mr-2" /> Clear Filters
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid gap-6">
                    {filteredDonations && filteredDonations.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredDonations.map((donation) => (
                                <DonationCard key={donation._id} donation={donation} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-zinc-100 dark:bg-zinc-950/30 rounded-xl border border-zinc-200 dark:border-zinc-800/50 border-dashed">
                            <div className="p-4 bg-white dark:bg-zinc-900/50 rounded-full inline-block mb-4">
                                <LayoutList className="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-500 font-medium">No donations found matching your criteria.</p>
                            {user?.role === 'Donor' && (
                                <div className="mt-6">
                                    <Link to={createPageUrl("CreateDonation")}>
                                        <Button variant="outline" className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Make a Donation
                                        </Button>
                                    </Link>
                                </div>
                            )}
                            {user?.role === 'Administrator' && (searchQuery || statusFilter !== 'all') && (
                                <Button variant="link" onClick={clearFilters} className="mt-2 text-blue-500">
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DonationHistory;
