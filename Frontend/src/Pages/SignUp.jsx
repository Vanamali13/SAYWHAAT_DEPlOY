import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Input } from '../Components/ui/input';
import { Button } from '../Components/ui/button';
import { Label } from '../Components/ui/label';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Select, SelectItem } from '../Components/ui/select';

export default function SignUp() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Donor',
    });
    const [error, setError] = useState('');

    const mutation = useMutation({
        mutationFn: (newUser) => api.post('/users/register', newUser),
        onSuccess: (data) => {
            // After successful signup, do NOT redirect immediately.
            // Instead, reload the page so the user can log in manually.
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        mutation.mutate({ name: formData.name, email: formData.email, password: formData.password, role: formData.role });
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
                                disabled={mutation.isPending}
                                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            />
                        </div>
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
                                disabled={mutation.isPending}
                                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-zinc-500 dark:text-zinc-400">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={mutation.isPending}
                                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-zinc-500 dark:text-zinc-400">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={mutation.isPending}
                                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            />
                        </div>
                        <Button type="submit" className="w-full font-semibold bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 py-3" disabled={mutation.isPending}>
                            {mutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </Button>
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
