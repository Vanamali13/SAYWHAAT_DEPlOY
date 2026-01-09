import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Input } from '../Components/ui/input';
import { Button } from '../Components/ui/button';
import { Label } from '../Components/ui/label';
import { Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Select, SelectItem } from '../Components/ui/select';

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export default function SignUp() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        password: '',
        confirmPassword: '',
        role: 'Donor',
        signupMethod: 'email' // 'email' or 'mobile'
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);
    const location = useLocation();

    const isSocialSignup = !!location.state?.socialUser;

    useEffect(() => {
        if (isSocialSignup) {
            setFormData(prev => ({
                ...prev,
                name: location.state.socialUser.name || '',
                email: location.state.socialUser.email || '',
                signupMethod: 'email'
            }));
            // Clear error message or set a welcome message
            setError("");
        }
    }, [location.state, isSocialSignup]);

    const mutation = useMutation({
        mutationFn: (newUser) => api.post('/users/register', newUser),
        onSuccess: (data) => {
            // After successful signup, reload to login
            window.location.href = '/login';
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || 'An error occurred during registration.';
            setError(errorMessage);
        },
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSocialLogin = async (provider) => {
        try {
            setSocialLoading(true);
            setError("");
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Send to backend (same endpoint as login, it handles registration too)
            const res = await api.post('/users/social-login', {
                email: user.email,
                name: user.displayName,
                providerId: user.providerId,
                role: formData.role // Include selected role
            });

            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                window.location.href = '/donordashboard';
            }
        } catch (err) {
            console.error("Social signup error:", err);
            setError(err.message || "Social signup failed");
        } finally {
            setSocialLoading(false);
        }
    };

    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSocialSignup) {
            /* Social Login Logic Omitted for brevity, keep existing if possible or copy back */
            /* Re-inserting existing Social Logic to be safe */
            setSocialLoading(true);
            try {
                // Complete social registration
                const res = await api.post('/users/social-login', {
                    email: location.state.socialUser.email,
                    name: location.state.socialUser.name,
                    providerId: location.state.socialUser.providerId,
                    role: formData.role
                });

                if (res.data.token) {
                    localStorage.setItem('token', res.data.token);
                    window.location.href = '/donordashboard';
                }
            } catch (err) {
                console.error("Social completion error:", err);
                setError(err.response?.data?.msg || "Failed to complete registration.");
            } finally {
                setSocialLoading(false);
            }
            return;
        }

        // Mobile Signup Flow
        if (formData.signupMethod === 'mobile') {
            if (otpSent) {
                // Verify OTP
                setLoading(true);
                setError("");
                try {
                    const res = await api.post('/users/verify-otp', {
                        identifier: formData.phone_number,
                        otp,
                        context: 'login' // This will return token and verify phone
                    });
                    if (res.data.token) {
                        localStorage.setItem('token', res.data.token);
                        window.location.href = '/donordashboard';
                    }
                } catch (err) {
                    setError(err.response?.data?.msg || "Invalid OTP");
                } finally {
                    setLoading(false);
                }
            } else {
                // Send OTP
                setLoading(true);
                setError("");
                try {
                    await api.post('/users/send-otp', {
                        identifier: formData.phone_number,
                        isSignup: true,
                        name: formData.name,
                        role: formData.role
                    });
                    setOtpSent(true);
                } catch (err) {
                    setError(err.response?.data?.msg || "Failed to send OTP");
                } finally {
                    setLoading(false);
                }
            }
            return;
        }

        // Email Signup Flow (Existing)
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');

        const payload = {
            name: formData.name,
            password: formData.password,
            role: formData.role,
            email: formData.email
        };
        mutation.mutate(payload);
    };

    return (
        <div className="w-full py-16 bg-zinc-50 dark:bg-zinc-950 min-h-screen flex items-center transition-colors duration-300">
            <Card className="max-w-md mx-auto backdrop-blur-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl w-full">
                <CardHeader>
                    <CardTitle className="text-2xl text-center font-bold text-zinc-900 dark:text-white">
                        Create a New Account
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                <span>{error}</span>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-zinc-500 dark:text-zinc-400">I am a</Label>
                            <Select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                placeholder="Select your role"
                                disabled={mutation.isPending}
                                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                            >
                                <SelectItem value="Donor">Donor</SelectItem>
                                <SelectItem value="Batch staff">Batch Staff</SelectItem>
                                <SelectItem value="Administrator">Administrator</SelectItem>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-zinc-500 dark:text-zinc-400">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={mutation.isPending || isSocialSignup}
                                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            />
                        </div>
                        <div className="space-y-4">
                            {!isSocialSignup && (
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-zinc-500 dark:text-zinc-400">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={mutation.isPending || isSocialSignup}
                                        className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                                    />
                                </div>
                            )}
                        </div>
                        {formData.signupMethod === 'mobile' && otpSent && (
                            <div className="space-y-2">
                                <Label htmlFor="otp" className="text-zinc-500 dark:text-zinc-400">Enter OTP</Label>
                                <Input
                                    id="otp"
                                    name="otp"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 tracking-widest text-center text-lg"
                                    maxLength={6}
                                />
                                <p className="text-xs text-center text-zinc-500">Check server console for OTP</p>
                            </div>
                        )}

                        {/* Show Password fields only if NOT social AND NOT mobile */}
                        {!isSocialSignup && formData.signupMethod !== 'mobile' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-zinc-500 dark:text-zinc-400">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required={!isSocialSignup && formData.signupMethod !== 'mobile'}
                                            disabled={mutation.isPending}
                                            className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-zinc-500 dark:text-zinc-400">Confirm Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required={!isSocialSignup && formData.signupMethod !== 'mobile'}
                                            disabled={mutation.isPending}
                                            className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 focus:outline-none"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                        <Button type="submit" className="w-full font-semibold bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 py-3" disabled={mutation.isPending || loading}>
                            {mutation.isPending || socialLoading || loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isSocialSignup ? 'Completing Registration...' : 'Processing...'}
                                </>
                            ) : (
                                isSocialSignup ? 'Continue' : (
                                    formData.signupMethod === 'mobile' ? (otpSent ? 'Verify & Register' : 'Get OTP') : 'Sign Up'
                                )
                            )}
                        </Button>

                        {!isSocialSignup && (
                            <>
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 dark:text-zinc-400">
                                            Or sign up with
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <Button variant="outline" type="button" className="w-full border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white" onClick={() => handleSocialLogin(googleProvider)} disabled={mutation.isPending || socialLoading}>
                                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                            <path
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                fill="#4285F4"
                                            />
                                            <path
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                fill="#34A853"
                                            />
                                            <path
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                fill="#FBBC05"
                                            />
                                            <path
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                fill="#EA4335"
                                            />
                                        </svg>
                                        Continue with Google
                                    </Button>
                                </div>
                            </>
                        )}
                    </form>
                    <p className="text-center text-sm text-zinc-600 dark:text-zinc-500 mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-zinc-900 dark:text-white hover:underline">
                            Log In
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
