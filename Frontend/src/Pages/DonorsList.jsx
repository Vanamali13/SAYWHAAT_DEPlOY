import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUsersByRole } from "../api/adminApi";
import { Card } from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Link } from "react-router-dom";
import { Search, Users, Mail, Phone, Loader2, Heart } from "lucide-react";

export default function DonorsList() {
  const { data: donors, isLoading, isError } = useQuery({
    queryKey: ["donors-list"],
    queryFn: () => getUsersByRole("Donor"),
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const filteredDonors = useMemo(() => {
    if (!donors) return [];
    return donors.filter(donor => {
      const matchesSearch =
        donor.name.toLowerCase().includes(search.toLowerCase()) ||
        donor.email.toLowerCase().includes(search.toLowerCase()) ||
        (donor.phone_number || "").toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter ? donor.name.toLowerCase().startsWith(filter.toLowerCase()) : true;
      return matchesSearch && matchesFilter;
    });
  }, [donors, search, filter]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (isError) {
    return <div className="min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950 text-red-500 flex items-center justify-center">Failed to load donors.</div>;
  }

  return (
    <div className="min-h-screen p-6 lg:p-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-900">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Donors List</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">View and manage registered donors</p>
          </div>
          <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <Heart className="w-6 h-6 text-pink-500" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-pink-500/20 focus:border-pink-500/50"
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="h-10 px-3 rounded-md bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/50 min-w-[120px]"
          >
            <option value="">All</option>
            {Array.from(new Set((donors || []).map(d => d.name[0]?.toUpperCase()))).sort().map(letter => (
              <option key={letter} value={letter}>{letter}</option>
            ))}
          </select>
        </div>

        {/* Desktop Table View */}
        <Card className="hidden md:block bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden backdrop-blur-sm">
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
                {filteredDonors.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                      <p className="text-lg font-medium mb-1">No donors found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : filteredDonors.map(donor => (
                  <tr
                    key={donor._id}
                    className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/80 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/admin/donors/${donor._id}`} // Using onClick for cleaner table structure, or use Link wrapping cells
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/admin/donors/${donor._id}`} className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 font-medium text-sm">
                          {donor.name[0]?.toUpperCase()}
                        </div>
                        <span className="text-zinc-900 dark:text-zinc-200 font-medium group-hover:text-pink-600 transition-colors">{donor.name}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {donor.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {donor.phone_number || 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Mobile Card View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredDonors.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-lg font-medium mb-1">No donors found</p>
              <p className="text-sm">Try adjusting your search</p>
            </div>
          ) : (
            filteredDonors.map(donor => (
              <Link key={donor._id} to={`/admin/donors/${donor._id}`}>
                <Card className="p-4 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm active:scale-95 transition-transform">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 font-bold">
                      {donor.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-white">{donor.name}</h3>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-zinc-400" />
                      <span className="truncate">{donor.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-zinc-400" />
                      <span>{donor.phone_number || 'N/A'}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
