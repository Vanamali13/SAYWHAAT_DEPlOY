import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";
import { format } from "date-fns";
import { Loader2, ThumbsUp, ThumbsDown, Check, X, Clock, LayoutList, User, Mail, Package, DollarSign, Calendar, Box } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Badge } from "../Components/ui/badge";

// API function to get all donations for the admin view
const getAllDonations = async () => {
    const { data } = await apiClient.get("/admin/donations");
    return data;
};

// Re-usable approve/reject mutations
const approveDonation = async (donationId) => {
    const { data } = await apiClient.post(`/admin/donations/${donationId}/approve`);
    return data;
};

const rejectDonation = async (donationId) => {
    const { data } = await apiClient.post(`/admin/donations/${donationId}/reject`);
    return data;
};

const DonationCard = ({ donation, onApprove, onReject, isLoading }) => {
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending_approval':
                return <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-500/20 px-2 py-0.5 text-xs"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border-red-200 dark:border-red-500/20 px-2 py-0.5 text-xs"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="outline" className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500 border-green-200 dark:border-green-500/20 px-2 py-0.5 text-xs"><Check className="w-3 h-3 mr-1" />Accepted</Badge>;
        }
    };

    return (
        <div className="group p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-900/40 hover:bg-white/80 dark:hover:bg-zinc-900/80 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm relative overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                    </div>
                    <div className="overflow-hidden min-w-0">
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 truncate">{donation.donor.name}</h4>
                        <p className="text-xs text-zinc-500 flex items-center gap-1 truncate"><Mail className="w-3 h-3 shrink-0" /> {donation.donor.email}</p>
                    </div>
                </div>
                <div className="shrink-0">
                    {getStatusBadge(donation.status)}
                </div>
            </div>

            {/* Content */}
            <div className="space-y-3 bg-zinc-50/50 dark:bg-zinc-950/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/50 relative z-10 flex-1">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 font-medium">Type</span>
                    <span className="text-zinc-700 dark:text-zinc-200 font-semibold capitalize">{donation.donation_type}</span>
                </div>
                {donation.amount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500 font-medium">Amount</span>
                        <span className="text-zinc-700 dark:text-zinc-200 font-semibold flex items-center"><DollarSign className="w-3 h-3 mr-1" />{donation.amount}</span>
                    </div>
                )}
                {donation.items?.length > 0 && (
                    <div className="text-sm pt-2 border-t border-zinc-200 dark:border-zinc-800/50 mt-2">
                        <span className="text-zinc-500 font-medium block mb-2 flex items-center gap-1"><Box className="w-3 h-3" /> Items</span>
                        <div className="flex flex-wrap gap-1.5">
                            {donation.items.map((item, idx) => (
                                <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 text-xs border border-zinc-200 dark:border-zinc-700/50">
                                    {item.name}
                                    {item.quantity > 1 && <span className="ml-1.5 text-zinc-500 text-[10px]">x{item.quantity}</span>}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            {onApprove && onReject && (
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/50 relative z-10">
                    <Button size="sm" className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex-1" onClick={() => onApprove(donation._id)} disabled={isLoading}>
                        <ThumbsUp className="w-3.5 h-3.5 mr-1.5" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="h-9 bg-red-600 hover:bg-red-700 text-white shadow-sm flex-1" onClick={() => onReject(donation._id)} disabled={isLoading}>
                        <ThumbsDown className="w-3.5 h-3.5 mr-1.5" /> Reject
                    </Button>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-2 relative z-10">
                <p className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(donation.createdAt), 'MMM d, yyyy • h:mm a')}
                </p>
                {donation.donationId && (
                    <p className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">{donation.donationId}</p>
                )}
            </div>
        </div>
    );
};

const RequestCategory = ({ title, donations, onApprove, onReject, isLoadingMutations }) => {
    const getHeaderColor = () => {
        switch (title) {
            case 'Pending Approval': return 'text-yellow-600 dark:text-yellow-500';
            case 'Accepted': return 'text-emerald-600 dark:text-emerald-500';
            case 'Rejected': return 'text-red-600 dark:text-red-500';
            default: return 'text-zinc-900 dark:text-white';
        }
    };

    const getHeaderIcon = () => {
        switch (title) {
            case 'Pending Approval': return <Clock className="w-5 h-5" />;
            case 'Accepted': return <Check className="w-5 h-5" />;
            case 'Rejected': return <X className="w-5 h-5" />;
            default: return null;
        }
    };

    return (
        <Card className="bg-white/30 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 py-4 px-5">
                <CardTitle className={`text-base font-semibold ${getHeaderColor()} flex items-center gap-2.5`}>
                    {getHeaderIcon()}
                    {title}
                    <Badge variant="secondary" className="ml-auto bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 font-mono text-xs">{donations.length}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {donations.length > 0 ? (
                        donations.map(donation => (
                            <div key={donation._id} className="relative group/card">
                                <DonationCard
                                    donation={donation}
                                    onApprove={title === 'Pending Approval' ? onApprove : undefined}
                                    onReject={title === 'Pending Approval' ? onReject : undefined}
                                    isLoading={isLoadingMutations}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12 px-4 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4">
                                <LayoutList className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-sm font-medium text-zinc-400">No requests in this category.</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-1">New requests will appear here.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};


export default function DonationRequests() {
    const queryClient = useQueryClient();

    const { data: donations, isLoading, isError } = useQuery({
        queryKey: ["allDonations"],
        queryFn: getAllDonations,
    });

    const approveMutation = useMutation({
        mutationFn: approveDonation,
        onSuccess: () => queryClient.invalidateQueries(["allDonations"]),
    });

    const rejectMutation = useMutation({
        mutationFn: rejectDonation,
        onSuccess: () => queryClient.invalidateQueries(["allDonations"]),
    });

    if (isLoading) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (isError) {
        return <div className="min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950 text-red-500 flex items-center justify-center">Failed to load donation requests.</div>;
    }

    const pending = donations?.filter(d => d.status === 'pending_approval') || [];
    const accepted = donations?.filter(d => d.status !== 'pending_approval' && d.status !== 'rejected') || [];
    const rejected = donations?.filter(d => d.status === 'rejected') || [];

    const isLoadingMutations = approveMutation.isPending || rejectMutation.isPending;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col h-screen overflow-hidden transition-colors duration-300">
            <div className="flex-none p-6 lg:p-8 border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-xl z-20">
                <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Donation Requests</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">Manage and track all donation statuses</p>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <LayoutList className="w-5 h-5 text-purple-500" />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden p-6 lg:p-8">
                <div className="max-w-[1800px] mx-auto h-full grid lg:grid-cols-3 gap-6">
                    <RequestCategory
                        title="Pending Approval"
                        donations={pending}
                        onApprove={approveMutation.mutate}
                        onReject={rejectMutation.mutate}
                        isLoadingMutations={isLoadingMutations}
                    />
                    <RequestCategory title="Accepted" donations={accepted} />
                    <RequestCategory title="Rejected" donations={rejected} />
                </div>
            </div>
        </div>
    );
}
