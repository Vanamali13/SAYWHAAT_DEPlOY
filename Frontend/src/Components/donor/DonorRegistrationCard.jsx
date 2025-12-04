import React, { useState } from "react";
import apiClient from "../../api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { UserPlus, Loader2 } from "lucide-react";

export default function DonorRegistrationCard({ onComplete }) {
  const [phone_number, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // NEW: Call the local backend endpoint
      await apiClient.post('/donors/register', { phone_number });
      alert(`Registration successful!`);
      onComplete && onComplete();
    } catch (error) {
      alert(`Error: ${error.response?.data?.msg || "Registration failed."}`);
    }
    setIsLoading(false);
  };

  return (
    <Card className="backdrop-blur-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl text-zinc-900 dark:text-white">
          <UserPlus className="w-6 h-6 text-zinc-900 dark:text-white" />
          Register as Donor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-zinc-500 dark:text-zinc-400">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 234 567 8900"
              value={phone_number}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
          </div>
          <Button type="submit" className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200" disabled={isLoading}>
            {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registering...</>) : ("Complete Registration")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}