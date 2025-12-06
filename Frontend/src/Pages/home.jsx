import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import apiClient from "../api/apiClient";
import { Button } from "../Components/ui/button";
import { Badge } from "../Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils/utils";
import { Heart, Gift, Users, Shield, TrendingUp, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  // For now, use static stats and unauthenticated state to avoid errors
  const [isAuthenticated] = useState(false);
  const [stats, setStats] = useState({ donations: 0, receivers: 0, amount: 0 });
  const { theme } = useContext(ThemeContext);
  const logoSrc = theme === 'dark' ? '/assets/images/logo-dark.png' : '/assets/images/logo-light.png';

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch donations and receivers from backend
        const [donationsRes, receiversRes] = await Promise.all([
          apiClient.get('/donations'),
          apiClient.get('/receivers/verified')
        ]);
        const donations = donationsRes.data || [];
        const receivers = receiversRes.data || [];
        const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
        setStats({
          donations: donations.length,
          receivers: receivers.length,
          amount: totalAmount
        });
      } catch (err) {
        setStats({ donations: 0, receivers: 0, amount: 0 });
      }
    }
    fetchStats();
  }, []);

  const features = [
    {
      icon: Shield,
      title: "100% Transparent",
      description: "Every donation is tracked with photo/video proof delivered to your email"
    },
    {
      icon: CheckCircle,
      title: "Verified Receivers",
      description: "All receivers are verified with location and contact details"
    },
    {
      icon: TrendingUp,
      title: "Real Impact",
      description: "See exactly where your donation goes and who it helps"
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
        <div className="absolute inset-0 bg-grid-black/[0.05] dark:bg-grid-white/[0.05] bg-[size:40px_40px]" />
        <div className="relative max-w-7xl mx-auto px-6 pt-4 pb-24 md:pt-10 md:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            {/* Main Logo in Hero */}
            <div className="flex justify-center mb-0">
              <img src={logoSrc} alt="Say Whatt Logo" className="h-96 w-auto object-contain" />
            </div>

            <div className="inline-block">
              <Badge variant="outline" className="bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-700 backdrop-blur-md px-6 py-2 text-sm font-medium shadow-lg hover:bg-white dark:hover:bg-zinc-800 transition-all">
                Transparent • Verified • Trustworthy
              </Badge>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-zinc-900 dark:text-white">
              Give with
              <span className="block text-zinc-500 dark:text-zinc-400">
                Complete Confidence
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Connect directly with verified receivers. Get photo and video proof of every donation.
              Experience transparent giving like never before.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              {isAuthenticated ? (
                <>
                  <Link to={createPageUrl("CreateDonation")}>
                    <Button size="lg" className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-2xl px-8 py-6 text-lg">
                      <Gift className="w-5 h-5 mr-2" />
                      Make a Donation
                    </Button>
                  </Link>
                  <Link to={createPageUrl("DonorDashboard")}>
                    <Button size="lg" variant="outline" className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-8 py-6 text-lg backdrop-blur-sm">
                      View My Impact
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to={createPageUrl("SignUp")}>
                  <Button
                    size="lg"
                    className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-2xl px-8 py-6 text-lg"
                  >
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Donations", value: stats.donations, icon: Gift },
            { label: "Verified Receivers", value: stats.receivers, icon: Users },
            { label: "Amount Donated", value: `$${stats.amount.toFixed(0)}`, icon: Heart }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="backdrop-blur-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-2xl h-full">
                <CardContent className="py-12 px-6 flex flex-col items-center justify-center h-full">
                  <stat.icon className="w-12 h-12 mb-6 text-zinc-900 dark:text-white" />
                  <p className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">{stat.value}</p>
                  <p className="text-md text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-zinc-900 dark:text-white">
            Why Choose Say Whatt?
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Experience a new standard of transparent, verified, and impactful giving
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 backdrop-blur-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 shadow-lg border border-zinc-200 dark:border-zinc-700">
                    <feature.icon className="w-8 h-8 text-zinc-900 dark:text-white" />
                  </div>
                  <CardTitle className="text-2xl text-zinc-900 dark:text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
            Join our community of transparent givers today
          </p>
          {isAuthenticated ? (
            <Link to={createPageUrl("CreateDonation")}>
              <Button size="lg" className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-2xl px-8 py-6 text-lg">
                Start Giving Now
              </Button>
            </Link>
          ) : (
            <Link to={createPageUrl("SignUp")}>
              <Button
                size="lg"
                className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-2xl px-8 py-6 text-lg"
              >
                Sign Up Now
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
