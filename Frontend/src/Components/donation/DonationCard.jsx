import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar, Package, Eye } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils/utils";

const statusColors = {
  pending: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
  in_transit: "bg-blue-900/30 text-blue-400 border-blue-800",
  delivered: "bg-green-900/30 text-green-400 border-green-800",
  confirmed: "bg-purple-900/30 text-purple-400 border-purple-800"
};

export default function DonationCard({ donation, proofCount }) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-white">Donation #{donation.donationId || (donation._id ? donation._id.slice(-6).toUpperCase() : 'N/A')}</h3>
            <p className="text-sm text-zinc-400 mt-1">
              {donation.donation_type === 'money' ? 'Monetary Donation' : 'Item Donation'}
            </p>
          </div>
          <Badge className={`${statusColors[donation.status] || 'bg-zinc-800 text-zinc-400 border-zinc-700'} border`}>
            {donation.status ? donation.status.replace('_', ' ') : 'Unknown'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-zinc-400">
            <Package className="w-4 h-4" />
            {donation.donation_type}
          </span>
          <span className="flex items-center gap-2 text-zinc-400">
            <Calendar className="w-4 h-4" />
            {donation.created_date && !isNaN(new Date(donation.created_date).getTime())
              ? format(new Date(donation.created_date), "MMM d, yyyy")
              : (donation.createdAt && !isNaN(new Date(donation.createdAt).getTime())
                ? format(new Date(donation.createdAt), "MMM d, yyyy")
                : "Date N/A")}
          </span>
        </div>

        {donation.amount && (
          <div className="text-2xl font-bold text-blue-400">
            ${donation.amount.toFixed(2)}
          </div>
        )}

        {donation.items && donation.items.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-500">Items:</p>
            {donation.items.slice(0, 2).map((item, idx) => (
              <p key={idx} className="text-sm text-zinc-300">
                {item.quantity}x {item.name}
              </p>
            ))}
            {donation.items.length > 2 && (
              <p className="text-xs text-zinc-500">+{donation.items.length - 2} more items</p>
            )}
          </div>
        )}

        {proofCount > 0 && (
          <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-800">
            {proofCount} Proof{proofCount > 1 ? 's' : ''} Available
          </Badge>
        )}

        <Link to={createPageUrl(`DonationDetails?id=${donation._id || donation.id}`)}>
          <Button variant="outline" className="w-full mt-2 group border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
            <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}