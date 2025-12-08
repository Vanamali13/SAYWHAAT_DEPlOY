import React, { useState, useContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Button } from "../Components/ui/button";
import { Label } from "../Components/ui/label";
import { Textarea } from "../Components/ui/textarea";
import { Select, SelectItem } from "../Components/ui/select";
import { Plus, Trash2, Gift, Loader2 } from "lucide-react";

export default function CreateDonation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    donation_type: "garments",
    amount: "",
    items: [{ name: "", quantity: 1, category: "garments" }],
    garment_type: "",
    delivery_notes: "",
    scheduled_delivery: "",
    address: "", // Added address field
    join_pool: false // Added for money donations
  });

  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const createDonationMutation = useMutation({
    mutationFn: (donationData) => apiClient.post('/donations', donationData),
    onMutate: () => {
      setFeedback({ type: 'info', message: 'Submitting donation…' });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['donorDashboard'] });
      setFeedback({ type: 'success', message: 'Donation created successfully!' });
      try { alert('Donation created successfully!'); } catch (_) { }
      setTimeout(() => {
        setFeedback({ type: '', message: '' });
        navigate(createPageUrl("DonorDashboard"), {
          state: { flash: { type: 'success', message: 'Donation created successfully!' } },
          replace: true
        });
      }, 800);
    },
    onError: (error) => {
      let msg = 'Could not create donation.';
      if (error.response?.data?.msg) msg = error.response.data.msg;
      else if (error.response?.data?.error) msg = error.response.data.error;
      setFeedback({ type: 'error', message: `Error: ${msg}` });
    }
  });

  const handleAddItem = () => setFormData(prev => ({ ...prev, items: [...prev.items, { name: "", quantity: 1, category: "garments" }] }));
  const handleRemoveItem = (index) => setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  const handleItemChange = (index, field, value) => {
    const newItems = formData.items.map((item, i) => i === index ? { ...item, [field]: value } : item);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedback({ type: 'info', message: 'Submitting donation…' });
    if (!user) {
      setFeedback({ type: 'error', message: 'You must be logged in to donate.' });
      return;
    }

    const finalData = {
      ...formData,
      amount: formData.donation_type === 'money' && formData.amount ? parseFloat(formData.amount) : null,
      items: (formData.donation_type !== 'money') ? formData.items.filter(item => item.name) : [],
      garment_type: formData.donation_type === 'garments' ? formData.garment_type : null,
    };

    if (formData.donation_type === 'money') {
      delete finalData.items;
      delete finalData.garment_type; // Ensure garment_type is not sent for money donations
      delete finalData.scheduled_delivery; // Ensure scheduled_delivery is not sent for money donations

      const amountValue = parseFloat(formData.amount);
      if (amountValue >= 100 && amountValue <= 7000) {
        finalData.join_pool = true;
      } else if (amountValue > 7000) {
        finalData.join_pool = formData.join_pool; // Use user's selection
      } else {
        finalData.join_pool = false; // For amounts < 100
      }

      navigate('/payment', { state: { donationData: finalData } });
      return;
    } else {
      delete finalData.amount;
      delete finalData.join_pool; // Ensure join_pool is not sent for non-money donations
    }
    if (formData.donation_type !== 'garments') delete finalData.garment_type;

    // Ensure address and scheduled_delivery are included for non-money donations
    if (formData.donation_type !== 'money') {
      if (!finalData.address) {
        setFeedback({ type: 'error', message: 'Please provide a pickup address.' });
        return;
      }
      if (!finalData.scheduled_delivery) {
        setFeedback({ type: 'error', message: 'Please provide a preferred pickup time.' });
        return;
      }
    }

    createDonationMutation.mutate(finalData);
  };

  return (
    <div className="min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <Card className="backdrop-blur-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl text-zinc-900 dark:text-white">
              <Gift className="w-8 h-8 text-zinc-900 dark:text-white" />
              Create a New Donation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feedback.message && (
              <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${feedback.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>{feedback.message}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="donation_type" className="text-zinc-500 dark:text-zinc-400">Donation Type</Label>
                  <Select
                    id="donation_type"
                    onChange={e => setFormData(prev => ({ ...prev, donation_type: e.target.value }))}
                    value={formData.donation_type}
                    placeholder="Select a donation type"
                    className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                  >
                    <SelectItem value="garments">Garments</SelectItem>
                    <SelectItem value="money">Money</SelectItem>
                  </Select>
                </div>
              </div>

              {formData.donation_type === 'money' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-zinc-500 dark:text-zinc-400">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="e.g., 50.00"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                    />
                    {formData.amount && parseFloat(formData.amount) >= 100 && parseFloat(formData.amount) <= 7000 && (
                      <div className="flex items-center gap-2 p-2 mt-2 text-sm text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
                        <Gift className="w-4 h-4" />
                        <span>You will be entered into a donation pool!</span>
                      </div>
                    )}
                    {formData.amount && parseFloat(formData.amount) < 100 && (
                      <div className="flex items-center gap-2 p-2 mt-2 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800">
                        <span>Minimum donation amount is $100.</span>
                      </div>
                    )}
                  </div>

                  {formData.amount && parseFloat(formData.amount) > 7000 && (
                    <div className="space-y-2 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <Label className="text-zinc-900 dark:text-white font-medium">Donation Mode</Label>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="individual"
                            name="donation_mode"
                            value="individual"
                            checked={formData.join_pool === false}
                            onChange={() => setFormData(prev => ({ ...prev, join_pool: false }))}
                            className="w-4 h-4 text-blue-600 bg-zinc-100 border-zinc-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600"
                          />
                          <Label htmlFor="individual" className="text-zinc-700 dark:text-zinc-300 font-normal">Individual Donation</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="pool"
                            name="donation_mode"
                            value="pool"
                            checked={formData.join_pool === true}
                            onChange={() => setFormData(prev => ({ ...prev, join_pool: true }))}
                            className="w-4 h-4 text-blue-600 bg-zinc-100 border-zinc-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600"
                          />
                          <Label htmlFor="pool" className="text-zinc-700 dark:text-zinc-300 font-normal">Join a Donation Pool</Label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : formData.donation_type === 'garments' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="garment_type" className="text-zinc-500 dark:text-zinc-400">Type of Garments</Label>
                    <Select
                      id="garment_type"
                      onChange={e => setFormData(prev => ({ ...prev, garment_type: e.target.value }))}
                      value={formData.garment_type}
                      placeholder="Select who these garments are for"
                      className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                    >
                      <SelectItem value="children">Children</SelectItem>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                    </Select>
                  </div>

                  <div className="flex justify-between items-center">
                    <Label className="text-zinc-500 dark:text-zinc-400">Items to Donate</Label>
                    <Button type="button" variant="outline" onClick={handleAddItem} className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white">
                      <Plus className="w-4 h-4 mr-2" /> Add Item
                    </Button>
                  </div>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-end gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <div className="grid grid-cols-3 gap-4 flex-1">
                        <div className="space-y-2">
                          <Label htmlFor={`item-name-${index}`} className="text-sm text-zinc-500 dark:text-zinc-400">Item Name</Label>
                          <Input
                            id={`item-name-${index}`}
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            placeholder="e.g., Shirt, T-shirt, Pants"
                            className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`item-quantity-${index}`} className="text-sm text-zinc-500 dark:text-zinc-400">Quantity</Label>
                          <Input
                            id={`item-quantity-${index}`}
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`item-category-${index}`} className="text-sm text-zinc-500 dark:text-zinc-400">Category</Label>
                          <Input
                            id={`item-category-${index}`}
                            value={item.category}
                            onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                            className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveItem(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="grid md:grid-cols-2 gap-6">
                {formData.donation_type !== 'money' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-zinc-500 dark:text-zinc-400">Pickup Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Full address for pickup"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduled_delivery" className="text-zinc-500 dark:text-zinc-400">Preferred Pickup Date & Time</Label>
                      <Input
                        id="scheduled_delivery"
                        type="datetime-local"
                        value={formData.scheduled_delivery}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduled_delivery: e.target.value }))}
                        className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_notes" className="text-zinc-500 dark:text-zinc-400">Delivery Notes</Label>
                <Textarea
                  id="delivery_notes"
                  placeholder="Any special instructions for delivery..."
                  value={formData.delivery_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_notes: e.target.value }))}
                  className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>


              <div className="flex justify-end">
                <Button type="submit" size="lg" className="px-6 py-3 text-white dark:text-black bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-lg" disabled={createDonationMutation.isLoading || (formData.donation_type === 'money' && parseFloat(formData.amount || '0') < 100)} onClick={() => console.log('[CreateDonation] Submit button clicked')}>
                  {createDonationMutation.isLoading ? (
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  ) : (
                    <Gift className="w-6 h-6 mr-3" />
                  )}
                  {formData.donation_type === 'money' ? 'Donate Now' : 'Create Donation'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div >
  );
}