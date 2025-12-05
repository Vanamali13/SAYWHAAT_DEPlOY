import React, { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/apiClient";
import { AuthContext } from "../context/authContext";
import { Loader2, History, LayoutList, Plus } from "lucide-react";
import DonationCard from "../Components/donation/DonationCard";
import { Button } from "../Components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils/utils";
import { isToday } from "date-fns";

const DonationHistory = () => {
    const { user } = useContext(AuthContext);

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

                <div className="grid gap-6">
                    {donations && donations.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {donations.map((donation) => (
                                <DonationCard key={donation._id} donation={donation} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-zinc-100 dark:bg-zinc-950/30 rounded-xl border border-zinc-200 dark:border-zinc-800/50 border-dashed">
                            <div className="p-4 bg-white dark:bg-zinc-900/50 rounded-full inline-block mb-4">
                                <LayoutList className="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-500 font-medium">No donation history found</p>
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DonationHistory;
