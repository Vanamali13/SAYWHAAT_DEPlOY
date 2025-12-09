
import React from "react";
import base44 from "../api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Button } from "../Components/ui/button";
import { ArrowLeft, MapPin, Calendar, Package, User, Mail, Phone, Truck } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils/utils";
import { Skeleton } from "../Components/ui/skeleton";

import ProofGallery from "../Components/donation/ProofGallery";

const statusColors = {
  pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  in_transit: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  delivered: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800",
  confirmed: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-800"
};

export default function DonationDetails() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const donationId = urlParams.get('id');

  const { data: donation, isLoading: donationLoading } = useQuery({
    queryKey: ['donation', donationId],
    queryFn: async () => {
      const donations = await base44.entities.Donation.list();
      return donations.find(d => d.id === donationId);
    },
    enabled: !!donationId
  });

  const { data: receiver, isLoading: receiverLoading } = useQuery({
    queryKey: ['receiver', donation?.receiver_id],
    queryFn: async () => {
      if (!donation?.receiver_id) return null;
      const receivers = await base44.entities.Receiver.list();
      return receivers.find(r => r.id === donation.receiver_id);
    },
    enabled: !!donation?.receiver_id
  });

  const { data: proofs = [] } = useQuery({
    queryKey: ['proofs', donationId],
    queryFn: () => base44.entities.DonationProof.filter({ donation_id: donationId }),
    enabled: !!donationId,
    initialData: []
  });

  if (!donationId) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500 dark:text-zinc-400">No donation selected</p>
      </div>
    );
  }

  const isLoading = donationLoading || receiverLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64 bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-64 w-full bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-48 w-full bg-zinc-200 dark:bg-zinc-800" /> {/* Skeleton for receiver card */}
          <Skeleton className="h-96 w-full bg-zinc-200 dark:bg-zinc-800" /> {/* Skeleton for proofs gallery */}
        </div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500 dark:text-zinc-400">Donation not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("DonorDashboard"))}
            className="border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
              Donation Details
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">Complete donation information and delivery proofs</p>
          </div>
        </div>

        {/* Donation Info */}
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-zinc-900/90 border-zinc-200/80 dark:border-zinc-800/80 shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl text-zinc-900 dark:text-white">Donation Information</CardTitle>
              <Badge className={`${statusColors[donation.status]} border text-base px-4 py-2`}>
                {donation.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Donor ID</p>
                  <Badge variant="outline" className="text-base px-4 py-2 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
                    {donation.donor_id}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Donation Type</p>
                    <p className="font-medium capitalize text-zinc-900 dark:text-white">{donation.donation_type}</p>
                  </div>
                </div>
                {donation.amount && (
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Amount</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">${donation.amount.toFixed(2)}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Created Date</p>
                    <p className="font-medium text-zinc-900 dark:text-white">{format(new Date(donation.created_date), "PPP")}</p>
                  </div>
                </div>
                {donation.scheduled_delivery && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Scheduled Delivery</p>
                      <p className="font-medium text-zinc-900 dark:text-white">{format(new Date(donation.scheduled_delivery), "PPP")}</p>
                    </div>
                  </div>
                )}
                {donation.actual_delivery && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Actual Delivery</p>
                      <p className="font-medium text-zinc-900 dark:text-white">{format(new Date(donation.actual_delivery), "PPpp")}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>



            {donation.assigned_staff && donation.assigned_staff.length > 0 && (
              <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="font-semibold mb-3 text-zinc-900 dark:text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-zinc-500" /> Collection Staff Assigned
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {/* Assuming populated or we need to fetch. For now, assuming simply displaying count or we need to update usage */}
                  {donation.assigned_staff.map((staffId, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 flex items-center gap-3">
                      <User className="w-8 h-8 p-1.5 bg-blue-100 text-blue-600 rounded-full" />
                      <div>
                        <p className="font-medium text-sm text-zinc-900 dark:text-white">Staff Member</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Assigned for pickup</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {donation.items && donation.items.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-zinc-900 dark:text-white">Donated Items</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {donation.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <p className="font-medium text-zinc-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Quantity: {item.quantity} • Category: {item.category}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {donation.delivery_notes && (
              <div>
                <h3 className="font-semibold mb-2 text-zinc-900 dark:text-white">Delivery Notes</h3>
                <p className="text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">{donation.delivery_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Receiver Info */}
        {receiver && (
          <Card className="backdrop-blur-sm bg-white/90 dark:bg-zinc-900/90 border-zinc-200/80 dark:border-zinc-800/80 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-zinc-900 dark:text-white">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Receiver Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Full Name</p>
                    <p className="font-medium text-lg text-zinc-900 dark:text-white">{receiver.full_name}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mt-1" />
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Address</p>
                      <p className="font-medium text-zinc-900 dark:text-white">{receiver.address}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Phone</p>
                      <p className="font-medium text-zinc-900 dark:text-white">{receiver.phone_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Email</p>
                      <p className="font-medium text-zinc-900 dark:text-white">{receiver.email}</p>
                    </div>
                  </div>
                </div>
              </div>
              {receiver.family_size && (
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Family Size</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{receiver.family_size} members</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delivery Proofs */}
        <ProofGallery proofs={proofs} />
      </div>
    </div >
  );
}
