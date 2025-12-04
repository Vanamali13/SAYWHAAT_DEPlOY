import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Button } from "../Components/ui/button";
import { Loader2, User, Mail, Phone, Award, Users, Package, CheckCircle, TrendingUp, ThumbsUp, ThumbsDown, LayoutDashboard, Layers } from "lucide-react";
import apiClient from "../api/apiClient";
import { format } from 'date-fns';
import { getAdminStats } from "../api/adminApi";

// API functions for the new workflow
const getPendingDonations = async () => {
  const { data } = await apiClient.get("/admin/pending-donations");
  return data;
};

const approveDonation = async (donationId) => {
  const { data } = await apiClient.post(`/admin/donations/${donationId}/approve`);
  return data;
};

const rejectDonation = async (donationId) => {
  const { data } = await apiClient.post(`/admin/donations/${donationId}/reject`);
  return data;
};


const PendingDonations = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);

  const { data: pendingDonations, isLoading } = useQuery({
    queryKey: ["pendingDonations"],
    queryFn: getPendingDonations,
  });

  const approveMutation = useMutation({
    mutationFn: approveDonation,
    onSuccess: () => {
      queryClient.invalidateQueries(["pendingDonations"]);
      queryClient.invalidateQueries(["admin-dashboard-stats"]); // Also refresh stats
    },
    onError: (err) => setError(err.response?.data?.msg || "Failed to approve."),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectDonation,
    onSuccess: () => {
      queryClient.invalidateQueries(["pendingDonations"]);
    },
    onError: (err) => setError(err.response?.data?.msg || "Failed to reject."),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-zinc-400" /></div>;
  }

  return (
    <Card className="backdrop-blur-sm bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <CardTitle className="text-xl text-zinc-900 dark:text-white flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-blue-500" />
          Pending Donation Approvals
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {error && <p className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 p-3 rounded-md mb-4 border border-red-200 dark:border-red-900/50">{error}</p>}
        {pendingDonations && pendingDonations.length > 0 ? (
          <div className="grid gap-4">
            {pendingDonations.map((donation) => (
              <div key={donation._id} className="group p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 hover:bg-white dark:hover:bg-zinc-900/80 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-6 justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <User className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-zinc-900 dark:text-white text-lg">{donation.donor.name}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {donation.donor.email}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {donation.donor.phone_number || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 pl-14">
                      <div className="bg-white dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/50">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Donation Type</p>
                        <p className="text-zinc-700 dark:text-zinc-200 capitalize font-medium">{donation.donation_type}</p>
                      </div>
                      {donation.amount && (
                        <div className="bg-white dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/50">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Amount</p>
                          <p className="text-zinc-700 dark:text-zinc-200 font-medium">${donation.amount}</p>
                        </div>
                      )}
                      {donation.items && donation.items.length > 0 && (
                        <div className="bg-white dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/50 sm:col-span-2">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Items</p>
                          <p className="text-zinc-700 dark:text-zinc-200 text-sm">
                            {donation.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-zinc-500 pl-14">
                      Submitted on {format(new Date(donation.createdAt), 'PPP')}
                    </p>
                  </div>

                  <div className="flex lg:flex-col items-center lg:items-end justify-end gap-3 min-w-[140px]">
                    <Button
                      size="sm"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
                      onClick={() => approveMutation.mutate(donation._id)}
                      disabled={approveMutation.isPending}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                      onClick={() => rejectMutation.mutate(donation._id)}
                      disabled={rejectMutation.isPending}
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-zinc-100 dark:bg-zinc-950/30 rounded-xl border border-zinc-200 dark:border-zinc-800/50 border-dashed">
            <CheckCircle className="w-12 h-12 text-zinc-400 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-600 dark:text-zinc-500 font-medium">No pending approvals</p>
            <p className="text-zinc-500 dark:text-zinc-600 text-sm mt-1">All caught up! New donations will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch pools for the Active Pools card
  const { data: pools } = useQuery({
    queryKey: ['pools'],
    queryFn: async () => {
      const { data } = await apiClient.get('/pools');
      return data;
    },
  });

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: getAdminStats,
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }
  if (isError || !stats) {
    return <div className="min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950 text-red-500 flex items-center justify-center">Failed to load admin stats.</div>;
  }

  return (
    <div className="min-h-screen p-6 lg:p-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-900">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 flex items-center gap-2">
              Welcome back, <span className="text-zinc-700 dark:text-zinc-200 font-medium">{user?.name || user?.full_name || 'Admin'}</span>
            </p>
          </div>
          <Badge variant="outline" className="px-4 py-1.5 text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-normal">
            {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </Badge>
        </div>

        {/* Admin Info Card */}
        <Card className="backdrop-blur-sm bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-lg">
          <CardHeader className="border-b border-zinc-200 dark:border-zinc-800/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-zinc-700 dark:text-zinc-200">
              <Award className="w-5 h-5 text-blue-500" /> Admin Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <User className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-0.5">Name</p>
                  <p className="font-medium text-zinc-700 dark:text-zinc-200">{user?.name || user?.full_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <Mail className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-0.5">Email</p>
                  <p className="font-medium text-zinc-700 dark:text-zinc-200">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <Phone className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-0.5">Phone</p>
                  <p className="font-medium text-zinc-700 dark:text-zinc-200">{user?.phone_number || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800/50 flex justify-end">
              <span className="text-xs text-zinc-500 dark:text-zinc-600 font-mono">ID: {user?._id}</span>
            </div>
          </CardContent>
        </Card>

        {/* Admin Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[
              { label: "Active Donors", value: stats.activeDonors, icon: Users, color: "blue", gradient: "from-blue-500 to-blue-600", link: "/donorslist" },
              { label: "Active Batch Staff", value: stats.activeBatchStaff, icon: Users, color: "green", gradient: "from-emerald-500 to-emerald-600", link: "/batchstafflist" },
              { label: "Batches to be Assigned", value: stats.toBeAssigned, icon: Package, color: "orange", gradient: "from-orange-500 to-orange-600", link: "/donation-requests" },
              { label: "Batches Delivered", value: stats.delivered, icon: CheckCircle, color: "pink", gradient: "from-pink-500 to-pink-600", link: "/donation-requests" },
              { label: "Active Pools", value: pools?.filter(p => p.status === 'active').length || 0, icon: Layers, color: "purple", gradient: "from-purple-500 to-purple-600", link: "/pools" }
            ].map((stat, idx) => (
              <Card
                key={idx}
                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg overflow-hidden relative h-32 cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => navigate(stat.link)}
              >
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-bl-[32px] flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="p-6 flex flex-col justify-center h-full">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 pr-10">{stat.label}</p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-1 tracking-tight">{stat.value}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pending Donations Component */}
        <PendingDonations />
      </div>
    </div>
  );
}