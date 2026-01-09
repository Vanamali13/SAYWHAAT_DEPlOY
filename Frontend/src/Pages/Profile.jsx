import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import apiClient from '../api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Input } from '../Components/ui/input';
import { Button } from '../Components/ui/button';
import { Label } from '../Components/ui/label';
import { Badge } from '../Components/ui/badge';
import { User, Mail, Phone, Shield, Loader2, Save, MapPin } from 'lucide-react';

export default function Profile() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        address: '',
        role: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
                address: user.address || '',
                role: user.role || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { data } = await apiClient.put('/users/me', {
                name: formData.name,
                phone_number: formData.phone_number,
                address: formData.address
            });

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            // Optionally update context user here if needed, but page reload or re-fetch might be simpler
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const { login } = useContext(AuthContext); // To refresh user data if needed? We might need to reload page.

    const handleVerifyClick = async () => {
        setOtpLoading(true);
        try {
            await apiClient.post('/users/send-otp', { identifier: formData.phone_number });
            setOtpModalOpen(true);
            setOtp("");
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to send OTP' });
        } finally {
            setOtpLoading(false);
        }
    };

    const handleOtpVerify = async () => {
        setOtpLoading(true);
        try {
            await apiClient.post('/users/verify-otp', {
                identifier: formData.phone_number,
                otp,
                context: 'verification'
            });
            setOtpModalOpen(false);
            setMessage({ type: 'success', text: 'Phone number verified!' });
            // Reload to update context
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.msg || "Invalid OTP");
        } finally {
            setOtpLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 lg:p-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
            {/* OTP Modal - Simple implementation using fixed overlay since Dialog component might need more setup */}
            {otpModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle>Verify Phone Number</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-zinc-500">
                                Enter the 6-digit code sent to {formData.phone_number} (check console)
                            </p>
                            <Input
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="123456"
                                className="text-center tracking-widest text-lg"
                                maxLength={6}
                            />
                            <div className="flex gap-2 justify-end">
                                <Button variant="ghost" onClick={() => setOtpModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleOtpVerify} disabled={otpLoading}>
                                    {otpLoading ? "Verifying..." : "Verify"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="max-w-2xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-900">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Profile Settings</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your account details</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <User className="w-6 h-6 text-blue-500" />
                    </div>
                </div>

                <Card className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-xl backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl text-zinc-900 dark:text-white">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-900 dark:text-white">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <Input
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="pl-10 bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-zinc-500">Email cannot be changed</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-zinc-900 dark:text-white">Role</Label>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-zinc-500" />
                                    <Badge variant="outline" className="text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700">
                                        {formData.role}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-zinc-900 dark:text-white">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="pl-10 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-blue-500/20 focus:border-blue-500/50"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone_number" className="text-zinc-900 dark:text-white">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <Input
                                        id="phone_number"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        className="pl-10 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-blue-500/20 focus:border-blue-500/50"
                                        placeholder="Enter your phone number"
                                    />
                                    {user?.isPhoneVerified && formData.phone_number === user.phone_number && (
                                        <Badge className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-100 text-green-700 hover:bg-green-100 border-green-200 pointer-events-none">
                                            Verified
                                        </Badge>
                                    )}
                                    {(!user?.isPhoneVerified || formData.phone_number !== user.phone_number) && formData.phone_number.length > 9 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleVerifyClick()}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 mr-1"
                                        >
                                            Verify
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-zinc-900 dark:text-white">Default Pickup Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full min-h-[80px] pl-10 pt-2 bg-white dark:bg-zinc-900/50 border rounded-md border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-blue-500/20 focus:border-blue-500/50 text-sm"
                                        placeholder="Enter your default pickup address"
                                    />
                                </div>
                            </div>

                            {message.text && (
                                <div className={`p-3 rounded-md text-sm ${message.type === 'success'
                                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50 shadow-sm backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl text-red-700 dark:text-red-400">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Delete Account</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                    Permanently delete your account and all associated data.
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-700 text-white shrink-0"
                                onClick={() => setDeleteModalOpen(true)}
                            >
                                Delete Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Account Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl scale-100 animate-in fade-in zoom-in-95 duration-200">
                        <CardHeader>
                            <CardTitle className="text-xl text-red-600 dark:text-red-500 flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Delete Account
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg">
                                <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                                    Warning: This action is irreversible.
                                </p>
                                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                                    All your data including donations, badges, and history will be permanently removed.
                                </p>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Are you absolutely sure you want to proceed?
                            </p>
                            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    onClick={async () => {
                                        try {
                                            await apiClient.delete('/users/me');
                                            localStorage.removeItem('token');
                                            window.location.href = '/login';
                                        } catch (err) {
                                            setDeleteModalOpen(false);
                                            alert("Failed to delete account: " + (err.response?.data?.msg || err.message));
                                        }
                                    }}
                                >
                                    Yes, Delete My Account
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )
            }
        </div >
    );
}
