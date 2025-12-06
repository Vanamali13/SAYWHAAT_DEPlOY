import React, { useState, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Button } from "../Components/ui/button";

import { Label } from "../Components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import apiClient from "../api/apiClient";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  // We still need this for context updates if possible, or we manually trigger it
  // Actually, AuthContext.login usually calls the API. 
  // We might need to manually update the token in localStorage and AuthContext.
  // Let's assume AuthContext exposes a way to set user, or we reload/redirect.
  // For now, let's just use localStorage and reload which is a common pattern if context isn't exposed.
  // Better: useContext(AuthContext) possibly has a 'setUser' or we can just call login() with the token?
  // Checking AuthContext... likely it just has login(email, password).
  // We'll handle token storage manually here and then redirect.

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true);
      setError("");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Send to backend
      try {
        const res = await apiClient.post('/users/social-login', {
          email: user.email,
          name: user.displayName,
          providerId: user.providerId
        });

        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          window.location.href = '/donordashboard';
        }
      } catch (backendErr) {
        if (backendErr.response && backendErr.response.status === 404) {
          // User not found, redirect to signup to select role
          navigate('/signup', {
            state: {
              socialUser: {
                email: user.email,
                name: user.displayName,
                providerId: user.providerId
              }
            }
          });
          return;
        }
        throw backendErr;
      }
    } catch (err) {
      console.error("Social login error:", err);
      setError(err.message || "Social login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError("Invalid credentials or server error.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full py-16 bg-zinc-50 dark:bg-zinc-950 min-h-screen flex items-center transition-colors duration-300">
      <Card className="max-w-md mx-auto backdrop-blur-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-zinc-900 dark:text-white">
            Login to Your Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-500 dark:text-zinc-400">Email Address or Phone Number</Label>
              <Input
                id="email"
                type="text"
                name="email"
                placeholder="you@example.com or +1234567890"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-500 dark:text-zinc-400">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 pr-10"
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
            {error && <div className="text-red-500 dark:text-red-400 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full font-semibold bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 py-3" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 dark:text-zinc-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button variant="outline" type="button" className="w-full border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white" onClick={() => handleSocialLogin(googleProvider)} disabled={loading}>
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
          </form>
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-500 mt-4">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-zinc-900 dark:text-white hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
