import React, { useContext, useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { AuthContext } from "../context/authContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Badge } from "../Components/ui/badge";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils/utils";
import { User, Mail, Phone, Award, Plus, Loader2, LayoutDashboard } from "lucide-react";
import { format } from 'date-fns';

import DonorRegistrationCard from "../Components/donor/DonorRegistrationCard";
import ImpactStats from "../Components/donor/ImpactStats";
import DonationCard from "../Components/donation/DonationCard";

const DonorDashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (location.state?.flash) {
      setFlash(location.state.flash);
      // Clear the flash from history state so it doesn't persist on refresh
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['donorDashboard', user?.email],
    queryFn: async () => {
      // NEW: Single, efficient API call
      const { data } = await apiClient.get('/users/dashboard');
      return data;
    },
    enabled: !!user,
  });

  if (isLoading || !dashboardData) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  const { needsRegistration, donor, stats, recentDonations } = dashboardData;

  if (needsRegistration) {
    return (
      <div className="min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-2xl mx-auto pt-12">
          {/* The registration card will now call our local backend */}
          <DonorRegistrationCard onComplete={refetch} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {flash && (
          <div className={`p-4 rounded-lg border flex items-center gap-3 ${flash.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${flash.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {flash.message}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-900">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 flex items-center gap-2">
              Welcome back, <span className="text-zinc-700 dark:text-zinc-200 font-medium">{user.full_name}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden md:flex px-4 py-1.5 text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-normal">
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </Badge>
            <Link to={createPageUrl("CreateDonation")}>
              <Button size="lg" className="px-6 py-2.5 text-white dark:text-black bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-lg shadow-zinc-900/20 transition-all hover:scale-105 active:scale-95">
                <Plus className="w-5 h-5 mr-2" />
                New Donation
              </Button>
            </Link>
          </div>
        </div>

        {/* Donor Info Card */}
        <Card className="backdrop-blur-sm bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-lg">
          <CardHeader className="border-b border-zinc-200 dark:border-zinc-800/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-zinc-700 dark:text-zinc-200">
              <Award className="w-5 h-5 text-purple-500" /> Donor Profile
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
                  <p className="font-medium text-zinc-700 dark:text-zinc-200">{donor.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <Mail className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-0.5">Email</p>
                  <p className="font-medium text-zinc-700 dark:text-zinc-200">{donor.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <Phone className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-0.5">Phone</p>
                  <p className="font-medium text-zinc-700 dark:text-zinc-200">{donor.phone_number || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800/50 flex justify-end">
              <span className="text-xs text-zinc-500 dark:text-zinc-600 font-mono">ID: {donor.donorId}</span>
            </div>
          </CardContent>
        </Card>

        {/* Impact Stats */}
        <ImpactStats stats={stats} />

        {/* Recent Donations */}
        <Card className="backdrop-blur-sm bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <CardTitle className="text-xl text-zinc-900 dark:text-white flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-blue-500" />
              Recent Donations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {recentDonations && recentDonations.length > 0 ? (
              <div className="space-y-4">
                {recentDonations.map(donation => (
                  <DonationCard key={donation._id} donation={donation} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-zinc-100 dark:bg-zinc-950/30 rounded-xl border border-zinc-200 dark:border-zinc-800/50 border-dashed">
                <div className="p-4 bg-white dark:bg-zinc-900/50 rounded-full inline-block mb-4">
                  <Plus className="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
                </div>
                <p className="text-zinc-600 dark:text-zinc-500 font-medium">No donations yet</p>
                <p className="text-zinc-500 dark:text-zinc-600 text-sm mt-1 mb-6">Start your journey by making your first donation today.</p>
                <Link to={createPageUrl("CreateDonation")}>
                  <Button variant="outline" className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white">
                    Make a Donation
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DonorDashboard;