import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Button } from '../Components/ui/button';
import { Badge } from '../Components/ui/badge';
import { Input } from '../Components/ui/input';
import { Label } from '../Components/ui/label';
import { Select, SelectItem } from '../Components/ui/select';
import { Loader2, Package, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function CreateBatch() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { addToast } = useToast();
    const [selectedItems, setSelectedItems] = useState([]); // Array of { ...item, batchQuantity }
    const [assignedStaff, setAssignedStaff] = useState('');
    const [notes, setNotes] = useState('');

    // Fetch available items
    const { data: availableItems, isLoading: loadingItems } = useQuery({
        queryKey: ['availableItems'],
        queryFn: async () => {
            const { data } = await apiClient.get('/admin/available-items');
            return data;
        },
    });

    // Fetch batch staff
    const { data: staffList } = useQuery({
        queryKey: ['batchStaff'],
        queryFn: async () => {
            const { data } = await apiClient.get('/admin/batch-staff');
            return data;
        },
    });

    const createBatchMutation = useMutation({
        mutationFn: async (batchData) => {
            const { data } = await apiClient.post('/admin/create-batch', batchData);
            return data;
        },
        onSuccess: () => {
            addToast('Batch created successfully!', 'success');
            queryClient.invalidateQueries(['availableItems']);
            navigate('/admin-dashboard');
        },
        onError: (err) => {
            addToast(err.response?.data?.msg || 'Failed to create batch', 'error');
        },
    });

    const handleAddItem = (item, quantity) => {
        if (quantity <= 0 || quantity > item.remaining_quantity) {
            addToast('Invalid quantity', 'error');
            return;
        }

        setSelectedItems(prev => {
            const newItems = [...prev];
            const existingIndex = newItems.findIndex(i => i.item_id === item.item_id && i.donation_id === item.donation_id);

            if (existingIndex >= 0) {
                // Update existing
                newItems[existingIndex].batchQuantity = quantity;
            } else {
                // Add new
                newItems.push({ ...item, batchQuantity: quantity });
            }
            return newItems;
        });
    };

    const handleRemoveItem = (index) => {
        setSelectedItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (selectedItems.length === 0) {
            addToast('Please add items to the batch', 'warning');
            return;
        }
        if (!assignedStaff) {
            addToast('Please assign a batch staff member', 'warning');
            return;
        }

        const payload = {
            items: selectedItems.map(i => ({
                donation_id: i.donation_id,
                item_id: i.item_id,
                item_name: i.item_name,
                quantity: parseInt(i.batchQuantity)
            })),
            assigned_to: assignedStaff,
            notes
        };

        createBatchMutation.mutate(payload);
    };

    if (loadingItems) {
        return (
            <div className="flex justify-center items-center h-screen bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Create New Batch</h1>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column: Available Items */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Package className="w-5 h-5" /> Available Inventory
                        </h2>
                        <div className="grid gap-4">
                            {availableItems && availableItems.length > 0 ? (
                                availableItems.map((item) => {
                                    // Check if already selected to adjust available quantity display potentially?
                                    // For simplicity, just show static list, maybe highlight if selected.
                                    const isSelected = selectedItems.find(i => i.item_id === item.item_id && i.donation_id === item.donation_id);
                                    const selectedQty = isSelected ? (parseInt(isSelected.batchQuantity) || 0) : 0;
                                    const availableToSelect = item.remaining_quantity - selectedQty;

                                    return (
                                        <Card key={`${item.donation_id}-${item.item_id}`} className={`bg-white dark:bg-zinc-900 ${isSelected ? 'border-blue-500 dark:border-blue-400 ring-1 ring-blue-500' : 'border-zinc-200 dark:border-zinc-800'}`}>
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-semibold text-lg">{item.item_name}</p>
                                                        <p className="text-sm text-zinc-500">Donor: {item.donor_name}</p>
                                                    </div>
                                                    <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                                        Available: {availableToSelect}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-2 mt-4">
                                                    <Input
                                                        type="number"
                                                        placeholder="Qty"
                                                        className="w-24 bg-white dark:bg-zinc-950"
                                                        min="1"
                                                        max={availableToSelect}
                                                        disabled={availableToSelect === 0}
                                                        id={`qty-${item.item_id}`}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        disabled={availableToSelect === 0}
                                                        onClick={() => {
                                                            const qtyInput = document.getElementById(`qty-${item.item_id}`);
                                                            const val = parseInt(qtyInput.value);
                                                            if (val) {
                                                                if (val > availableToSelect) {
                                                                    addToast(`Only ${availableToSelect} items available`, 'warning');
                                                                    return;
                                                                }
                                                                // We need to pass the cumulative quantity for the handler if updating, 
                                                                // OR handleAddItem logic needs to change.
                                                                // Current logic: handleAddItem REPLACES batchQuantity. 
                                                                // So we should add current selectedQty + new val.
                                                                handleAddItem(item, selectedQty + val);
                                                                qtyInput.value = ''; // Reset input
                                                            }
                                                        }}
                                                    >
                                                        <Plus className="w-4 h-4 mr-1" /> Add
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            ) : (
                                <p className="text-zinc-500">No items available for batching.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Batch Preview */}
                    <div className="space-y-6">
                        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 sticky top-6">
                            <CardHeader>
                                <CardTitle>Batch Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* Selected Items List */}
                                <div className="space-y-3">
                                    <Label>Selected Items</Label>
                                    {selectedItems.length > 0 ? (
                                        <div className="space-y-2 border rounded-md p-2 max-h-64 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
                                            {selectedItems.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-2 bg-white dark:bg-zinc-900 rounded border border-zinc-100 dark:border-zinc-800">
                                                    <div>
                                                        <p className="font-medium text-sm">{item.item_name}</p>
                                                        <p className="text-xs text-zinc-500">Qty: {item.batchQuantity}</p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-600 h-8 w-8 p-0"
                                                        onClick={() => handleRemoveItem(idx)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
                                            No items added yet
                                        </div>
                                    )}
                                </div>

                                {/* Assignment */}
                                <div className="space-y-2">
                                    <Label htmlFor="staff">Assign to Batch Staff</Label>
                                    <Select
                                        value={assignedStaff}
                                        onChange={(e) => setAssignedStaff(e.target.value)}
                                        placeholder="Select Staff Member"
                                    >
                                        {staffList && staffList.map(staff => (
                                            <SelectItem key={staff._id} value={staff._id}>{staff.name}</SelectItem>
                                        ))}
                                    </Select>
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Input
                                        id="notes"
                                        placeholder="Delivery instructions..."
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        className="bg-white dark:bg-zinc-950"
                                    />
                                </div>

                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
                                    onClick={handleSubmit}
                                    disabled={createBatchMutation.isPending || selectedItems.length === 0}
                                >
                                    {createBatchMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                                        </>
                                    ) : (
                                        <>
                                            Create Batch <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>

                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
