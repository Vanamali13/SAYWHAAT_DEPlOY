import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";
import { format } from "date-fns";
import { Loader2, ThumbsUp, ThumbsDown, Check, X, Clock, LayoutList, User, Mail, Package, DollarSign, Calendar } from "lucide-react";
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

const DonationCard = ({ donation }) => {
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending_approval':
                return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20"><Check className="w-3 h-3 mr-1" />Accepted</Badge>;
        }
    };

    return (
        <div className="group p-5 border border-zinc-800 rounded-xl bg-zinc-950/50 hover:bg-zinc-900/80 transition-all duration-200 hover:border-zinc-700 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <User className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-zinc-200">{donation.donor.name}</h4>
                        <p className="text-xs text-zinc-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {donation.donor.email}</p>
                    </div>
                </div>
                {getStatusBadge(donation.status)}
            </div>

            <div className="space-y-3 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Type</span>
                    <span className="text-zinc-200 font-medium capitalize">{donation.donation_type}</span>
                </div>
                {donation.amount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Amount</span>
                        <span className="text-zinc-200 font-medium flex items-center"><DollarSign className="w-3 h-3 mr-1" />{donation.amount}</span>
                    </div>
                )}
                {donation.items?.length > 0 && (
                    <div className="text-sm">
                        <span className="text-zinc-500 block mb-1">Items</span>
                        <div className="flex flex-wrap gap-1">
                            {donation.items.map((item, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
                                    <Package className="w-3 h-3 mr-1 text-zinc-500" />
                                    {item.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800/50">
                <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(donation.createdAt), 'PPp')}
                </p>
                {donation.donationId && (
                    <p className="text-xs font-mono text-blue-500/70 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{donation.donationId}</p>
                )}
            </div>
        </div>
    );
};

const RequestCategory = ({ title, donations, onApprove, onReject, isLoadingMutations }) => {
    const getHeaderColor = () => {
        switch (title) {
            case 'Pending Approval': return 'text-yellow-500';
            case 'Accepted': return 'text-green-500';
            case 'Rejected': return 'text-red-500';
            default: return 'text-white';
        }
    };

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl overflow-hidden backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="border-b border-zinc-800 bg-zinc-900/50">
                <CardTitle className={`text-lg font-semibold ${getHeaderColor()} flex items-center gap-2`}>
                    {title === 'Pending Approval' && <Clock className="w-5 h-5" />}
                    {title === 'Accepted' && <Check className="w-5 h-5" />}
                    {title === 'Rejected' && <X className="w-5 h-5" />}
                    {title}
                    <Badge variant="secondary" className="ml-auto bg-zinc-800 text-zinc-400">{donations.length}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[calc(100vh-300px)] custom-scrollbar">
                {donations.length > 0 ? (
                    donations.map(donation => (
                        <div key={donation._id} className="relative">
                            <DonationCard donation={donation} />
                            {title === 'Pending Approval' && (
                                <div className="absolute bottom-4 right-4 flex space-x-2">
                                    <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20" onClick={() => onApprove(donation._id)} disabled={isLoadingMutations}>
                                        <ThumbsUp className="w-3 h-3 mr-1" /> Approve
                                    </Button>
                                    <Button size="sm" variant="destructive" className="h-8 bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-200" onClick={() => onReject(donation._id)} disabled={isLoadingMutations}>
                                        <ThumbsDown className="w-3 h-3 mr-1" /> Reject
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12 border-2 border-dashed border-zinc-800/50 rounded-xl bg-zinc-950/30">
                        <LayoutList className="w-10 h-10 mb-3 opacity-20" />
                        <p>No requests in this category.</p>
                    </div>
                )}
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
            <div className="min-h-screen p-6 flex items-center justify-center bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (isError) {
        return <div className="min-h-screen p-6 bg-zinc-950 text-red-500 flex items-center justify-center">Failed to load donation requests.</div>;
    }

    const pending = donations?.filter(d => d.status === 'pending_approval') || [];
    const accepted = donations?.filter(d => d.status !== 'pending_approval' && d.status !== 'rejected') || [];
    const rejected = donations?.filter(d => d.status === 'rejected') || [];

    const isLoadingMutations = approveMutation.isPending || rejectMutation.isPending;

    return (
        <div className="min-h-screen p-6 lg:p-8 bg-zinc-950 text-zinc-100">
            <div className="max-w-[1600px] mx-auto h-full flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-900 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Donation Requests</h1>
                        <p className="text-zinc-400 mt-2">Manage and track all donation statuses</p>
                    </div>
                    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                        <LayoutList className="w-6 h-6 text-purple-500" />
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 flex-1">
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
