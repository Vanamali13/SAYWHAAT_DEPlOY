import React, { useState, useEffect, useContext } from 'react'; // Added useContext
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../Components/ui/card';
import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Label } from '../Components/ui/label';
import { Loader2, AlertTriangle, CheckCircle, Mail, Phone, LogOut } from 'lucide-react'; // Added LogOut
import apiClient from '../api/apiClient';
import { AuthContext } from '../context/authContext'; // Import AuthContext

export default function MandatoryUpdateModal({ user, onComplete }) {
    const { logout } = useContext(AuthContext); // Get logout function
    const [step, setStep] = useState('input'); // 'input', 'otp'
    const [missingType, setMissingType] = useState(null); // 'email' or 'phone_number'
    const [inputValue, setInputValue] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        // Determine what is missing and NOT verified
        if (!user.email || !user.isEmailVerified) {
            setMissingType('email');
        } else if (!user.phone_number) {
            setMissingType('phone_number');
        }
    }, [user]);

    const handleAction = async () => {
        if (!inputValue) {
            setError(`Please enter your ${missingType === 'email' ? 'email' : 'phone number'}`);
            return;
        }
        setLoading(true);
        setError("");

        try {
            // Update Profile with new info
            await apiClient.put('/users/me', {
                [missingType]: inputValue
            });

            if (missingType === 'email') {
                // For Email, we still require verification
                await apiClient.post('/users/send-otp', { identifier: inputValue });
                setStep('otp');
            } else {
                // For Phone, just save and complete (No OTP per user request)
                onComplete();
            }
        } catch (err) {
            const msg = err.response?.data?.msg || "Failed to update profile.";
            setError(msg);
            if (err.response?.status === 401 || msg.includes('Token is not valid')) {
                // optionally auto-logout
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }
        setLoading(true);
        setError("");
        try {
            // Verify OTP (Email only now)
            await apiClient.post('/users/verify-otp', {
                identifier: inputValue,
                otp,
                context: 'verification'
            });

            onComplete();
        } catch (err) {
            setError(err.response?.data?.msg || "Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    // If nothing missing (shouldn't happen if parent checks properly), return null
    if (!missingType) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <Card className="w-full max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-2xl relative overflow-hidden">
                {/* Top Red Bar for urgency */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />

                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-zinc-900 dark:text-white">
                        <AlertTriangle className="text-red-500 w-6 h-6" />
                        Action Required
                    </CardTitle>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        To secure your account, we need you to verify your {missingType === 'email' ? 'Email Address' : 'Mobile Number'}.
                    </p>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm rounded-md border border-red-100 dark:border-red-900/20">
                            {error}
                        </div>
                    )}

                    {step === 'input' ? (
                        <div className="space-y-2">
                            <Label htmlFor="inputVal" className="text-zinc-700 dark:text-zinc-300">
                                {missingType === 'email' ? 'Enter Email Address' : 'Enter Mobile Number'}
                            </Label>
                            <div className="relative">
                                {missingType === 'email' ? (
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                ) : (
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                )}
                                <Input
                                    id="inputVal"
                                    type={missingType === 'email' ? 'email' : 'tel'}
                                    placeholder={missingType === 'email' ? 'john@example.com' : '9876543210'}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="otp" className="text-zinc-700 dark:text-zinc-300">
                                Enter Verification Code
                            </Label>
                            <p className="text-xs text-zinc-500">
                                Sent to: <span className="font-semibold">{inputValue}</span>
                            </p>
                            <Input
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="XXXXXX"
                                className="text-center tracking-widest text-lg"
                                maxLength={6}
                            />
                            <div className="flex justify-center">
                                <Button variant="link" size="sm" onClick={() => setStep('input')} className="text-zinc-500">
                                    Change {missingType === 'email' ? 'email' : 'number'}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col gap-2">
                    {step === 'input' ? (
                        <Button className="w-full" onClick={handleAction} disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {missingType === 'email' ? 'Send OTP' : 'Save Number'}
                        </Button>
                    ) : (
                        <Button className="w-full" onClick={handleVerifyOtp} disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Verify & Continue
                        </Button>
                    )}

                    <Button variant="ghost" size="sm" onClick={() => { logout(); window.location.href = '/login'; }} className="text-zinc-500 hover:text-red-500">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
