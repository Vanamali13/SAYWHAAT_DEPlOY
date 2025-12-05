import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../Components/ui/card';
import { Button } from '../Components/ui/button';
import { CreditCard, Loader2, CheckCircle, ArrowLeft, DollarSign } from 'lucide-react';
import { createPageUrl } from '../utils/utils';

export default function Payment() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const donationData = location.state?.donationData;

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const createDonationMutation = useMutation({
        mutationFn: (data) => apiClient.post('/donations', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['donorDashboard'] });
            setIsSuccess(true);
            setTimeout(() => {
                navigate(createPageUrl("DonorDashboard"), {
                    state: { flash: { type: 'success', message: 'Payment successful! Donation created.' } },
                    replace: true
                });
            }, 2000);
        },
        onError: (error) => {
            setIsProcessing(false);
            alert('Payment failed. Please try again.');
            console.error(error);
        }
    });

    if (!donationData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Card className="w-full max-w-md p-6 text-center">
                    <p className="text-zinc-500 mb-4">No donation data found.</p>
                    <Button onClick={() => navigate(-1)}>Go Back</Button>
                </Card>
            </div>
        );
    }

    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate payment processing delay
        setTimeout(() => {
            createDonationMutation.mutate(donationData);
        }, 1500);
    };

    return (
        <div className="min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center transition-colors duration-300">
            <Card className="w-full max-w-md backdrop-blur-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl">
                <CardHeader className="text-center border-b border-zinc-100 dark:border-zinc-800 pb-6">
                    <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                        <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-white">Secure Payment</CardTitle>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Complete your donation securely</p>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">Donation Amount</span>
                            <span className="text-lg font-bold text-zinc-900 dark:text-white flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" />
                                {donationData.amount.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">Processing Fee</span>
                            <span className="text-sm font-medium text-zinc-900 dark:text-white">$0.00</span>
                        </div>
                        <div className="border-t border-zinc-200 dark:border-zinc-800 my-3"></div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-zinc-900 dark:text-white">Total</span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center">
                                <DollarSign className="w-5 h-5 mr-1" />
                                {donationData.amount.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-4 text-green-600 dark:text-green-400 animate-in fade-in zoom-in duration-300">
                            <CheckCircle className="w-12 h-12 mb-2" />
                            <p className="font-semibold">Payment Successful!</p>
                            <p className="text-sm text-zinc-500">Redirecting...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-md flex items-center gap-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                <div className="w-4 h-4 rounded-full border-2 border-blue-600 bg-blue-600"></div>
                                <span className="font-medium text-zinc-700 dark:text-zinc-200">Credit / Debit Card</span>
                            </div>
                            {/* Add more mock payment methods if needed */}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-2">
                    {!isSuccess && (
                        <>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 py-6 text-lg"
                                onClick={handlePayment}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    `Pay $${donationData.amount.toFixed(2)}`
                                )}
                            </Button>
                            <Button variant="ghost" className="w-full text-zinc-500 dark:text-zinc-400" onClick={() => navigate(-1)} disabled={isProcessing}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
                            </Button>
                        </>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
