import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar, Package, Eye } from "lucide-react";
import { Progress } from "../ui/progress";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils/utils";

const statusColors = {
  pending_approval: "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  pending: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  rejected: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  in_transit: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  delivered: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  confirmed: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
};

export default function DonationCard({ donation, proofCount }) {
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_approval': return 'Requested';
      case 'pending': return 'Accepted';
      case 'rejected': return 'Rejected';
      case 'in_transit': return 'In Transit';
      default: return status ? status.replace('_', ' ') : 'Unknown';
    }
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Donation #{donation.donationId || (donation._id ? donation._id.slice(-6).toUpperCase() : 'N/A')}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {donation.donation_type === 'money' ? 'Monetary Donation' : 'Item Donation'}
            </p>
          </div>
          <Badge className={`${statusColors[donation.status] || 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'} border`}>
            {getStatusLabel(donation.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Package className="w-4 h-4" />
            {donation.donation_type}
          </span>
          <span className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Calendar className="w-4 h-4" />
            {donation.created_date && !isNaN(new Date(donation.created_date).getTime())
              ? format(new Date(donation.created_date), "MMM d, yyyy")
              : (donation.createdAt && !isNaN(new Date(donation.createdAt).getTime())
                ? format(new Date(donation.createdAt), "MMM d, yyyy")
                : "Date N/A")}
          </span>
        </div>

        {donation.amount && (
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${donation.amount.toFixed(2)}
          </div>
        )}

        {donation.items && donation.items.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-500">Items:</p>
            {donation.items.slice(0, 2).map((item, idx) => (
              <p key={idx} className="text-sm text-zinc-700 dark:text-zinc-300">
                {item.quantity}x {item.name}
              </p>
            ))}
            {donation.items.length > 2 && (
              <p className="text-xs text-zinc-500">+{donation.items.length - 2} more items</p>
            )}
          </div>
        )}

        {donation.pool && (
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Pool: {donation.pool.title}</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {Math.round((donation.amount / donation.pool.target_amount) * 100)}% Contribution
              </span>
            </div>
            <Progress value={(donation.pool.current_amount / donation.pool.target_amount) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-zinc-400">
              <span>${donation.pool.current_amount} collected</span>
              <span>Target: ${donation.pool.target_amount}</span>
            </div>
          </div>
        )}

        {proofCount > 0 && (
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
            {proofCount} Proof{proofCount > 1 ? 's' : ''} Available
          </Badge>
        )}

        <Link to={`/donations/${donation._id || donation.id}`}>
          <Button variant="outline" className="w-full mt-2 group border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white">
            <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}