import React from "react";
import { Card } from "../ui/card";
import { TrendingUp, Heart, Users, Package } from "lucide-react";
import { motion } from "framer-motion";

export default function ImpactStats({ stats }) {
  const statCards = [
    {
      label: "Total Donations",
      value: stats.totalDonations || 0,
      icon: Package,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-zinc-900 border border-zinc-800"
    },
    {
      label: "Amount Donated",
      value: `$${(stats.totalAmount || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      bgColor: "bg-zinc-900 border border-zinc-800"
    },
    {
      label: "People Helped",
      value: stats.peopleHelped || 0,
      icon: Users,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-zinc-900 border border-zinc-800"
    },
    {
      label: "Confirmed Deliveries",
      value: stats.confirmedDeliveries || 0,
      icon: Heart,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-zinc-900 border border-zinc-800"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-zinc-900 border-zinc-800 shadow-lg overflow-hidden relative h-32">
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.color} rounded-bl-[32px] flex items-center justify-center shadow-lg`}>
              <stat.icon className="w-7 h-7 text-white" />
            </div>
            <div className="p-6 flex flex-col justify-center h-full">
              <p className="text-sm font-medium text-zinc-400 pr-10">{stat.label}</p>
              <p className="text-3xl font-bold text-white mt-1 tracking-tight">{stat.value}</p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}