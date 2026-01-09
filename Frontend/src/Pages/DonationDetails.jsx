
import React, { useContext, useState } from "react";
import { AuthContext } from "../context/authContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Button } from "../Components/ui/button";
import { ArrowLeft, MapPin, Calendar, Package, User, Truck, CheckCircle, Clock, Trophy, Target, Users, Anchor, Tag, ShoppingCart, CreditCard, ExternalLink, Gift } from "lucide-react";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "../Components/ui/skeleton";

import ProofGallery from "../Components/donation/ProofGallery";

import { useToast } from "../context/ToastContext";

// Status Timeline Components
const TimelineStep = ({ title, date, status, isCompleted, isActive, isLast }) => (
  <div className="flex flex-col relative flex-1">
    <div className="flex items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-colors ${isCompleted ? 'bg-green-500 border-green-500 text-white' :
        isActive ? 'bg-blue-500 border-blue-500 text-white' :
          'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-300'
        }`}>
        {isCompleted ? <CheckCircle className="w-5 h-5" /> : isActive ? <Clock className="w-5 h-5" /> : <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />}
      </div>
      {!isLast && (
        <div className={`flex-1 h-1 mx-2 transition-colors ${isCompleted ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-800'
          }`} />
      )}
    </div>
    <div className="mt-2 pr-4">
      <p className={`text-sm font-semibold ${isCompleted ? 'text-green-600 dark:text-green-400' :
        isActive ? 'text-blue-600 dark:text-blue-400' :
          'text-zinc-500'
        }`}>{title}</p>
      {date && <p className="text-xs text-zinc-500 mt-1">{date}</p>}
    </div>
  </div>
);

export default function DonationDetails() {
  const { user } = useContext(AuthContext);
  const [actionLoading, setActionLoading] = useState(false);
  const { addToast } = useToast();
  const queryClient = useQueryClient(); // Need this to refresh data
  const navigate = useNavigate();
  // Support both query param ?id= and route param /:id
  const { id } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const donationId = id || urlParams.get('id');

  const { data: donation, isLoading, isError } = useQuery({
    queryKey: ['donation', donationId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/donations/${donationId}`);
      return data;
    },
    enabled: !!donationId
  });

  if (!donationId) return <div className="min-h-screen flex items-center justify-center">Invalid Donation ID</div>;

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !donation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-500">Error Loading Donation</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  // Helper to determine step status
  const getStepStatus = (stepName) => {
    const statusMap = {
      'submitted': 0,
      'approved': 1,
      'shipped': 2,
      'received': 3
    };

    // Shared Statuses
    if (stepName === 'submitted') return { isCompleted: donation.status !== 'pending_approval', isActive: donation.status === 'pending_approval' };

    // Logistics Flow Status Logic
    let currentValue = 0;
    // 'pending' status means Approved/Logistics Assigned
    if (donation.status === 'pending') currentValue = 1;
    if (donation.status === 'in_transit') currentValue = 2;
    if (donation.status === 'delivered' || donation.status === 'confirmed') currentValue = 3;

    const stepValue = statusMap[stepName];
    return {
      isCompleted: currentValue > stepValue,
      isActive: currentValue === stepValue
    };
  };

  const handleMarkReceived = async () => {
    if (!window.confirm("Are you sure you want to mark this donation as received at the warehouse?")) return;

    setActionLoading(true);
    try {
      await apiClient.post(`/admin/donations/${donationId}/receive`);
      // Refresh data
      queryClient.invalidateQueries(['donation', donationId]);
      // addToast('Donation marked as received!', 'success');
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <ArrowLeft className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Donation Details</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-xs text-zinc-500 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">
                  #{donation.donationId || donation._id.slice(-6).toUpperCase()}
                </span>
                <span className="text-sm text-zinc-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {format(new Date(donation.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
          <div>
            <Badge className={`text-sm px-4 py-1.5 uppercase tracking-wide font-semibold shadow-sm ${donation.status === 'delivered' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200' :
                donation.status === 'in_transit' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200' :
                  'bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-zinc-200'
              }`}>
              {donation.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* --- Content based on Donation Type --- */}

        {/* 1. GARMENTS VIEW */}
        {donation.donation_type === 'garments' && (
          <div className="grid gap-8">
            {/* Timeline Card */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
              <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                <CardTitle className="text-lg">Tracking Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="flex flex-col md:flex-row justify-between gap-6 overflow-x-auto">
                  <TimelineStep
                    title="Submitted"
                    date={format(new Date(donation.createdAt), 'MMM d')}
                    {...getStepStatus('submitted')}
                  />

                  {donation.warehouse_info && (
                    <>
                      <TimelineStep
                        title="Logistics Assigned"
                        date={donation.status !== 'pending_approval' ? 'Approved' : 'Pending'}
                        {...getStepStatus('approved')}
                      />
                      <TimelineStep
                        title="In Transit"
                        date={donation.status === 'in_transit' ? 'On the way' : ''}
                        {...getStepStatus('shipped')}
                      />
                      <TimelineStep
                        title="Received at Hub"
                        isLast
                        {...getStepStatus('received')}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Admin Action: Mark as Received */}
            {user?.role === 'Administrator' && (donation.status === 'pending' || donation.status === 'in_transit') && (
              <Card className="border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-600" /> Admin Action</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Has this shipment arrived securely at the warehouse?</p>
                  <Button
                    onClick={handleMarkReceived}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {actionLoading ? <Clock className="w-4 h-4 animate-spin mr-2" /> : <Package className="w-4 h-4 mr-2" />}
                    Mark as Received at Warehouse
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Logistics & NFC Info (When Assigned) */}
            {(donation.warehouse_info || donation.nfc_info) && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                  <Truck className="w-5 h-5 text-blue-500" /> Logistics & Fulfillment
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Warehouse Location */}
                  {donation.warehouse_info && (
                    <Card className="group hover:border-blue-400 transition-colors duration-300 bg-gradient-to-br from-white to-blue-50/50 dark:from-zinc-900 dark:to-blue-900/10 border-zinc-200 dark:border-zinc-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base text-zinc-700 dark:text-zinc-300">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Anchor className="w-4 h-4" />
                          </div>
                          Shipping Destination
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{donation.warehouse_info.name}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">{donation.warehouse_info.address}</p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-zinc-500">
                            <User className="w-3 h-3" /> {donation.warehouse_info.contact}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30"
                          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(donation.warehouse_info.address)}`, '_blank')}
                        >
                          <MapPin className="w-4 h-4" /> View on Maps
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* NFC Dealer Info */}
                  {donation.nfc_info && (
                    <Card className="group hover:border-amber-400 transition-colors duration-300 bg-gradient-to-br from-white to-amber-50/50 dark:from-zinc-900 dark:to-amber-900/10 border-zinc-200 dark:border-zinc-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base text-zinc-700 dark:text-zinc-300">
                          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <Tag className="w-4 h-4" />
                          </div>
                          NFC Tags Required
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-start p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-amber-100 dark:border-amber-900/50">
                          <div>
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Nearest Dealer</p>
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{donation.nfc_info.dealer_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Cost</p>
                            <p className="font-bold text-amber-600 text-lg">₹{donation.nfc_info.total_cost}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {donation.nfc_info.amazon_link && (
                            <Button className="w-full bg-[#FF9900]/90 hover:bg-[#FF9900] text-white shadow-sm border-none h-9 text-xs font-medium"
                              onClick={() => window.open(donation.nfc_info.amazon_link, '_blank')}>
                              <ShoppingCart className="w-3 h-3 mr-2" /> Amazon
                            </Button>
                          )}
                          {donation.nfc_info.flipkart_link && (
                            <Button className="w-full bg-[#2874f0]/90 hover:bg-[#2874f0] text-white shadow-sm border-none h-9 text-xs font-medium"
                              onClick={() => window.open(donation.nfc_info.flipkart_link, '_blank')}>
                              <ExternalLink className="w-3 h-3 mr-2" /> Flipkart
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* NFC Imprint Data - Full Width */}
                {donation.nfc_info && (
                  <Card className="overflow-hidden border-violet-200 dark:border-violet-800 bg-white dark:bg-zinc-900">
                    <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />
                    <CardHeader className="bg-violet-50/30 dark:bg-violet-900/10 pb-4 border-b border-violet-100 dark:border-violet-900/50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-violet-900 dark:text-violet-300">
                          <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
                            <User className="w-4 h-4" />
                          </div>
                          NFC Imprint Data
                        </CardTitle>
                        <Badge variant="outline" className="border-violet-200 text-violet-600 bg-violet-50">
                          Action Required
                        </Badge>
                      </div>
                      <CardDescription className="ml-11">Provide these details to the NFC dealer for programming.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-6 pt-6">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-zinc-500 uppercase">Donor Name</p>
                        <p className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">{donation.donor?.name || 'Anonymous'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-zinc-500 uppercase">Contact</p>
                        <p className="text-zinc-700 dark:text-zinc-300 font-medium">{donation.donor?.email}</p>
                        <p className="text-sm text-zinc-500">{donation.donor?.phone_number}</p>
                      </div>
                      <div className="space-y-2 bg-violet-50 dark:bg-violet-900/20 p-3 rounded-lg border border-violet-100 dark:border-violet-800/50">
                        <p className="text-xs font-medium text-violet-600 dark:text-violet-400 uppercase flex items-center gap-1">
                          <Gift className="w-3 h-3" /> Wish Message
                        </p>
                        <p className="italic text-zinc-700 dark:text-zinc-300 text-sm">"{donation.wish_message || 'Best Wishes!'}"</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Pickup Details */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5" /> Pickup Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-zinc-400 mt-1" />
                      <div>
                        <p className="font-medium">Scheduled Time</p>
                        <p className="text-zinc-500">
                          {donation.scheduled_delivery
                            ? format(new Date(donation.scheduled_delivery), 'PPpp')
                            : "Not scheduled yet"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-zinc-400 mt-1" />
                      <div>
                        <p className="font-medium">Pickup Address</p>
                        <p className="text-zinc-500">{donation.address || "No address provided"}</p>
                      </div>
                    </div>
                  </div>


                </CardContent>
              </Card>

              {/* Items List */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" /> Donation Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {donation.items?.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-zinc-500 capitalize">{item.category}</p>
                        </div>
                        <Badge variant="outline">{item.quantity} units</Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 2. MONEY VIEW */}
        {donation.donation_type === 'money' && (
          <div className="grid gap-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Contribution Card */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-900/10 border-green-200 dark:border-green-800/30">
                <CardHeader>
                  <CardTitle className="text-green-800 dark:text-green-400">Contribution Summary</CardTitle>
                  <CardDescription>Thank you for your generosity!</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-green-700 dark:text-green-400 mb-2">
                    ${donation.amount?.toLocaleString()}
                  </div>
                  <p className="text-green-600 dark:text-green-500">
                    Donated on {format(new Date(donation.createdAt), 'MMMM do, yyyy')}
                  </p>
                </CardContent>
              </Card>

              {/* Pool Information (if applicable) */}
              {donation.pool ? (
                <Card className="relative overflow-hidden border-blue-200 dark:border-blue-900">
                  {/* Top Contributor Badge */}
                  {donation.isTopContributor && (
                    <div className="absolute top-0 right-0 p-4">
                      <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 border-yellow-500 shadow-lg gap-1">
                        <Trophy className="w-3 h-3" /> Top Contributor
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      {donation.pool.title}
                    </CardTitle>
                    <CardDescription>This donation supports this automated pool</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-600 dark:text-zinc-400">Pool Progress</span>
                        <span className="font-medium">{Math.round((donation.pool.current_amount / donation.pool.target_amount) * 100)}%</span>
                      </div>
                      <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, (donation.pool.current_amount / donation.pool.target_amount) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg">
                      <div>
                        <p className="text-xs text-zinc-500 uppercase">Pool Target</p>
                        <p className="font-semibold">${donation.pool.target_amount?.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-500 uppercase">Total Raised</p>
                        <p className="font-semibold text-blue-600">${donation.pool.current_amount?.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="text-sm text-zinc-500 text-center pt-2">
                      You are contributor <b>#{donation.poolRank}</b> out of <b>{donation.poolTotalDonors}</b> donors!
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-full text-zinc-500">
                    This donation was not assigned to a specific pool.
                  </CardContent>
                </Card>
              )}
            </div>

            {/* [ADMIN ONLY] Pool Donors List */}
            {donation.poolDonationsList && donation.poolDonationsList.length > 0 && (
              <Card className="mt-8 border-violet-200 dark:border-violet-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-violet-500" />
                    Pool Donors (Admin View)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
                    <table className="w-full text-sm">
                      <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Donor Name</th>
                          <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Amount</th>
                          <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {donation.poolDonationsList.map((d) => (
                          <tr key={d._id} className={d._id === donation._id ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}>
                            <td className="px-4 py-3 font-medium">
                              {d.donorName}
                              {d._id === donation._id && <Badge variant="outline" className="ml-2 text-xs border-blue-200 text-blue-600">Current</Badge>}
                            </td>
                            <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">
                              ${d.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-zinc-500">
                              {format(new Date(d.date), 'MMM d, yyyy')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Proof Gallery for all types */}
        {donation.proof_sent && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Impact Proof</h2>
            <ProofGallery proofs={[]} donationId={donation._id} /> {/* ProofGallery handles fetch internally or we pass props if needed */}
          </div>
        )}

      </div>
    </div>
  );
}
