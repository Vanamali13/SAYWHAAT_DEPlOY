import React, { useState, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Button } from "../Components/ui/button";

import { Label } from "../Components/ui/label";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
      // The redirection is now handled by a useEffect in a parent component
      // that listens for changes in the user state.
      // This avoids race conditions where navigation happens before
      // the user state is fully propagated.
    } catch (err) {
      setError("Invalid credentials or server error.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full py-16 bg-zinc-950 min-h-screen flex items-center">
      <Card className="max-w-md mx-auto backdrop-blur-sm bg-zinc-900 border-zinc-800 shadow-xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-white">
            Login to Your Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400">Email Address</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-400">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
                className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
              />
            </div>
            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full font-semibold bg-white text-black hover:bg-zinc-200 py-3" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
          <p className="text-center text-sm text-zinc-500 mt-4">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-white hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
