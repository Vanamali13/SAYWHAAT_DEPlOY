import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUsersByRole } from "../api/adminApi";
import { Card } from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Search, Users, Mail, Phone, Loader2 } from "lucide-react";

export default function BatchStaffList() {
  const { data: staff, isLoading, isError } = useQuery({
    queryKey: ["batch-staff-list"],
    queryFn: () => getUsersByRole("Batch staff"),
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const filteredStaff = useMemo(() => {
    if (!staff) return [];
    return staff.filter(s => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.phone_number || "").toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter ? s.name.toLowerCase().startsWith(filter.toLowerCase()) : true;
      return matchesSearch && matchesFilter;
    });
  }, [staff, search, filter]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (isError) {
    return <div className="min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950 text-red-500 flex items-center justify-center">Failed to load batch staff.</div>;
  }

  return (
    <div className="min-h-screen p-6 lg:p-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-900">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Batch Staff List</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage and view all registered batch staff members</p>
          </div>
          <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-blue-500/20 focus:border-blue-500/50"
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="h-10 px-3 rounded-md bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 min-w-[120px]"
          >
            <option value="">All</option>
            {Array.from(new Set((staff || []).map(s => s.name[0]?.toUpperCase()))).sort().map(letter => (
              <option key={letter} value={letter}>{letter}</option>
            ))}
          </select>
        </div>

        <Card className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead>
                <tr className="bg-zinc-100/80 dark:bg-zinc-900/80">
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                      <p className="text-lg font-medium mb-1">No batch staff found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : filteredStaff.map(staff => (
                  <tr key={staff._id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-medium text-sm">
                          {staff.name[0]?.toUpperCase()}
                        </div>
                        <span className="text-zinc-900 dark:text-zinc-200 font-medium">{staff.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {staff.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {staff.phone_number || 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
