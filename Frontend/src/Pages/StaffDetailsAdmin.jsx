import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStaffDetails } from "../api/adminApi";
import { Card, CardHeader, CardTitle, CardContent } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Badge } from "../Components/ui/badge";
import { Loader2, ArrowLeft, User, Mail, Phone, Calendar, Truck, CheckCircle2, CircleDashed } from "lucide-react";
import { format } from "date-fns";

export default function StaffDetailsAdmin() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("all"); // all, active, completed

    const { data, isLoading, isError } = useQuery({
        queryKey: ["staff-details", id],
        queryFn: () => getStaffDetails(id),
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
                <p className="text-red-500 mb-4">Failed to load staff details.</p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    const { staff, batches } = data;

    // Filter batches
    const filteredBatches = batches.filter(batch => {
        if (activeTab === "all") return true;
        if (activeTab === "active") return batch.status !== "delivered"; // assuming 'delivered' is completed
        if (activeTab === "completed") return batch.status === "delivered";
        return true;
    });

    return (
        <div className="min-h-screen p-6 lg:p-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-900">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Staff Profile</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Batch assignments and history</p>
                    </div>
                </div>

                {/* Profile Card */}
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Full Name</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-white">{staff.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Role</p>
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                {staff.role}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                <Mail className="w-4 h-4 text-zinc-500" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500">Email</p>
                                <p className="text-sm font-medium">{staff.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                <Phone className="w-4 h-4 text-zinc-500" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500">Phone</p>
                                <p className="text-sm font-medium">{staff.phone_number || 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Batches Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Truck className="w-5 h-5 text-blue-500" />
                            Assigned Batches
                        </h2>

                        <div className="flex gap-2">
                            <Button
                                variant={activeTab === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('all')}
                            >
                                All
                            </Button>
                            <Button
                                variant={activeTab === 'active' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('active')}
                            >
                                Active
                            </Button>
                            <Button
                                variant={activeTab === 'completed' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActiveTab('completed')}
                            >
                                Completed
                            </Button>
                        </div>
                    </div>

                    {filteredBatches.length === 0 ? (
                        <Card className="p-12 flex flex-col items-center justify-center text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 border-dashed border-2 border-zinc-200 dark:border-zinc-800">
                            <Truck className="w-12 h-12 mb-4 opacity-50" />
                            <p>No batches found for this filter.</p>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {filteredBatches.map((batch) => (
                                <Card key={batch._id} className="overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row gap-4 justify-between md:items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-mono font-semibold text-lg">{batch.batchId}</h3>
                                                    <Badge className={
                                                        batch.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                                                            batch.status === 'in_transit' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                                                                'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                                                    }>
                                                        {batch.status.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-zinc-500">
                                                    Assigned on {format(new Date(batch.createdAt), 'PPP')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-lg p-4 mb-4">
                                            <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">Items in Batch</p>
                                            <ul className="space-y-2">
                                                {batch.items && batch.items.map((item, idx) => (
                                                    <li key={idx} className="flex justify-between text-sm">
                                                        <span>{item.quantity} x {item.item_name}</span>
                                                        <span className="text-zinc-500">
                                                            from {item.donor_name || 'Donor'}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {batch.notes && (
                                            <div className="text-sm text-zinc-600 dark:text-zinc-400 bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded border border-yellow-100 dark:border-yellow-900/20">
                                                <span className="font-semibold">Note:</span> {batch.notes}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
