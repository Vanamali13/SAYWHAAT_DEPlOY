import React, { useState } from "react";
import api from "../api/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Button } from "../Components/ui/button";
import { Label } from "../Components/ui/label";
import { Textarea } from "../Components/ui/textarea";
import { Users, MapPin, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils/utils";

import { useToast } from "../context/ToastContext";

export default function RegisterReceiver() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    address: "",
    familySize: "",
    needsDescription: ""
  });
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createReceiverMutation = useMutation({
    mutationFn: async (receiverData) => {
      const response = await api.post('/receivers', receiverData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivers'] });
      setSuccess(true);
      setError(null);
      setTimeout(() => {
        navigate(createPageUrl("Home"));
      }, 2000);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || "An unexpected error occurred.";
      setError(errorMessage);
      setSuccess(false);
    }
  });

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setGettingLocation(false);
        },
        (error) => {
          addToast("Unable to get location. Please enable location services.", "error");
          setGettingLocation(false);
        }
      );
    } else {
      addToast("Geolocation is not supported by your browser", "error");
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    if (createReceiverMutation.isPending) return;
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!location.lat || !location.lng) {
      setError("Please capture your current location first");
      return;
    }

    const receiverData = {
      full_name: formData.fullName,
      phone_number: formData.phoneNumber,
      email: formData.email,
      address: formData.address,
      location_lat: location.lat,
      location_lng: location.lng,
      family_size: formData.familySize ? parseInt(formData.familySize) : null,
      needs_description: formData.needsDescription,
      verification_status: "pending"
    };

    createReceiverMutation.mutate(receiverData);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
            Register as Receiver
          </h1>
          <p className="text-gray-600 mt-2">Get verified to receive donations from our community</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 border-gray-200/80 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="w-6 h-6 text-blue-600" />
              Receiver Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Receiver registered successfully! You will be redirected shortly.</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="e.g. John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    disabled={createReceiverMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="e.g. +1234567890"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                    disabled={createReceiverMutation.isPending}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={createReceiverMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  placeholder="123 Main Street, Anytown, USA"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  disabled={createReceiverMutation.isPending}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="familySize">Family Size</Label>
                  <Input
                    id="familySize"
                    type="number"
                    placeholder="e.g. 4"
                    value={formData.familySize}
                    onChange={(e) => setFormData({ ...formData, familySize: e.target.value })}
                    disabled={createReceiverMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Location</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation || createReceiverMutation.isPending}
                  >
                    {gettingLocation ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                    {location.lat ? "Location Captured" : "Capture Location"}
                  </Button>
                  {location.lat && (
                    <p className="text-xs text-green-600 text-center">
                      Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="needsDescription">Describe Your Needs</Label>
                <Textarea
                  id="needsDescription"
                  placeholder="Briefly describe why you need assistance (e.g., affected by recent floods, unemployment)."
                  value={formData.needsDescription}
                  onChange={(e) => setFormData({ ...formData, needsDescription: e.target.value })}
                  disabled={createReceiverMutation.isPending}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createReceiverMutation.isPending}>
                {createReceiverMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}