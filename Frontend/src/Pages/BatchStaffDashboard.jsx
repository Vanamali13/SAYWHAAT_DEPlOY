import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getBatchStats } from "../api/batchStaffApi";
import { Card, CardContent } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { TrendingUp, CheckCircle, Loader2, Package, LayoutDashboard } from "lucide-react";
import { format } from 'date-fns';
import { useNavigate } from "react-router-dom";

export default function BatchStaffDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["batch-staff-stats"],
    queryFn: getBatchStats,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (isError) {
    return <div className="min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950 text-red-500 flex items-center justify-center">Failed to load stats.</div>;
  }

  return (
    <div className="p-6 lg:p-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-900">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Batch Staff Dashboard
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 flex items-center gap-2">
              Overview of your delivery performance
            </p>
          </div>
          <Badge variant="outline" className="px-4 py-1.5 text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-normal">
            {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: "Assigned Batches", value: stats?.assignedThisMonth ?? 0, icon: Package, color: "blue", gradient: "from-blue-500 to-blue-600", link: "/uploadproof" },
            { label: "Delivered Batches", value: stats?.delivered ?? 0, icon: CheckCircle, color: "green", gradient: "from-emerald-500 to-emerald-600", link: "/uploadproof" },
            { label: "Ongoing Batches", value: stats?.ongoing ?? 0, icon: TrendingUp, color: "yellow", gradient: "from-yellow-500 to-yellow-600", link: "/uploadproof" }
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

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5" /> Your Assignments
          </h2>
          <AssignedBatchesList />
        </div>
      </div>
    </div>
  );
}

function AssignedBatchesList() {
  const { data: batches, isLoading, error } = useQuery({
    queryKey: ['myBatches'],
    queryFn: async () => {
      const { data } = await import('../api/apiClient').then(m => m.default.get('/batches/my-batches'));
      return data;
    }
  });

  if (isLoading) return <div className="text-center p-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-500" /></div>;
  if (error) return <div className="text-center text-red-500 p-4">Failed to load batches</div>;
  if (!batches || batches.length === 0) return (
    <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500">
      No batches assigned currently.
    </div>
  );

  return (
    <div className="grid gap-4">
      {batches.map(batch => (
        <Card key={batch._id} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{batch.batchId}</h3>
                  <Badge variant={batch.status === 'delivered' ? 'default' : 'secondary'}
                    className={
                      batch.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        batch.status === 'in_transit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }
                  >
                    {batch.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-500">{format(new Date(batch.createdAt), 'PPP')}</p>
                {batch.notes && <p className="text-sm text-zinc-500 mt-1 italic">"{batch.notes}"</p>}
              </div>
            </div>

            <div className="space-y-2 mt-4 bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Items in Batch:</h4>
              <ul className="space-y-2">
                {batch.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {item.quantity} x {item.item_name}
                    </span>
                    <span className="text-zinc-400 text-xs">
                      (Item ID: {item.donation_id.slice(-6)}...)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
