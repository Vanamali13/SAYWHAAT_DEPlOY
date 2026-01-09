import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getDonorDetails } from "../api/adminApi";
import { Card, CardHeader, CardTitle, CardContent } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Badge } from "../Components/ui/badge";
import { Loader2, ArrowLeft, User, Mail, Phone, Calendar, Heart, Package } from "lucide-react";
import { format } from "date-fns";
import { useCurrency } from "../context/CurrencyContext";

export default function DonorDetailsAdmin() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { convert } = useCurrency();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["donor-details", id],
        queryFn: () => getDonorDetails(id),
    });

    if (isLoading) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="min-h-screen p-6 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <p className="text-red-500 mb-4">Failed to load donor details.</p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    const { donor, donations } = data;

    return (
        <div className="min-h-screen p-6 lg:p-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-900">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Donor Profile</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Detailed view and history</p>
                    </div>
                </div>

                {/* Profile Card */}
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <User className="w-5 h-5 text-pink-500" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Full Name</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-white">{donor.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Donor ID</p>
                            <p className="text-lg font-mono text-zinc-700 dark:text-zinc-300">{donor.donorId || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                <Mail className="w-4 h-4 text-zinc-500" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500">Email</p>
                                <p className="text-sm font-medium">{donor.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                <Phone className="w-4 h-4 text-zinc-500" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500">Phone</p>
                                <p className="text-sm font-medium">{donor.phone_number || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                <Calendar className="w-4 h-4 text-zinc-500" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500">Joined</p>
                                <p className="text-sm font-medium">{format(new Date(donor.createdAt), 'MMM do, yyyy')}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Donation History */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        Donation History
                    </h2>

                    {donations.length === 0 ? (
                        <Card className="p-12 flex flex-col items-center justify-center text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 border-dashed border-2 border-zinc-200 dark:border-zinc-800">
                            <Package className="w-12 h-12 mb-4 opacity-50" />
                            <p>No donations found for this donor.</p>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {donations.map((donation) => (
                                <Card key={donation._id} className="overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                    <div className="p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm text-zinc-500">#{donation.donationId || 'PENDING'}</span>
                                                <Badge variant={
                                                    donation.status === 'delivered' ? 'default' :
                                                        donation.status === 'rejected' ? 'destructive' :
                                                            'secondary'
                                                }>
                                                    {donation.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <h3 className="font-semibold text-lg">{donation.donation_type}</h3>
                                            <p className="text-sm text-zinc-500">
                                                {format(new Date(donation.createdAt), 'PPP')}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-xs text-zinc-500 uppercase font-medium">Amount</p>
                                                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                                    {convert(donation.amount)}
                                                </p>
                                            </div>

                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs text-zinc-500 uppercase font-medium">Items</p>
                                                <p className="font-medium">{donation.items?.length || 0} categories</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items expansion could go here */}
                                    {donation.items && donation.items.length > 0 && (
                                        <div className="bg-zinc-50 dark:bg-zinc-950/50 px-6 py-3 border-t border-zinc-100 dark:border-zinc-800">
                                            <div className="flex flex-wrap gap-2">
                                                {donation.items.map((item, idx) => (
                                                    <Badge key={idx} variant="outline" className="bg-white dark:bg-zinc-900">
                                                        {item.quantity} x {item.name} ({item.category})
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
