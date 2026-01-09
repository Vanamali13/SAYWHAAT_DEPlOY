import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import apiClient from "../api/apiClient";
import { Button } from "../Components/ui/button";
import { Badge } from "../Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils/utils";
import { Heart, Gift, Users, Shield, TrendingUp, CheckCircle } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

// New Components
import DonationTicker from "../Components/DonationTicker";
import ImpactCalculator from "../Components/ImpactCalculator";
import TestimonialCarousel from "../Components/TestimonialCarousel";
import { useCurrency } from "../context/CurrencyContext";

export default function Home() {
  const [isAuthenticated] = useState(false);
  const [stats, setStats] = useState({ donations: 0, receivers: 0, amount: 0 });
  const { theme } = useContext(ThemeContext);
  const { convert } = useCurrency();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselImages = [
    '/assets/carousel/video.mp4'
  ];

  const currentMedia = carouselImages[currentImageIndex] || carouselImages[0];

  // Parallax Scroll for Hero
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    if (carouselImages.length > 1) {
      const timer = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [carouselImages.length]);

  useEffect(() => {
    async function fetchStats() {
      try {
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 overflow-x-hidden">

      {/* 1. Hero Section with Parallax */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">

        {/* Background Layer (Fixed/Parallax) */}
        <div className="absolute inset-0 z-0 bg-zinc-900">
          {/* Dark Overlay placed above video */}
          <div className="absolute inset-0 bg-black/50 z-20" />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              {(currentMedia && (currentMedia.endsWith('.mp4') || currentMedia.endsWith('.webm'))) ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src={currentMedia} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={currentMedia}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="Background"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Foreground Content with Parallax Effect */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-8 pt-20 pb-40"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex justify-center mb-6 mt-16 md:mt-0">
              <img
                src="/assets/images/logo-dark.png"
                alt="Say Whatt Logo"
                className="h-72 w-auto object-contain opacity-90"
                style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}
              />
            </div>

            <div className="inline-block">
              <Badge variant="outline" className="!bg-black/40 !text-white !border-white/30 backdrop-blur-md px-6 py-2 text-sm font-medium shadow-sm">
                Transparent • Verified • Trustworthy
              </Badge>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white tracking-tight drop-shadow-2xl">
              Give with
              <span className="block text-white">
                Complete Confidence
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-100 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-medium">
              Connect directly with verified receivers. Get photo and video proof of every donation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              {isAuthenticated ? (
                <>
                  <Link to={createPageUrl("CreateDonation")}>
                    <Button size="lg" className="bg-white text-black hover:bg-zinc-200 shadow-xl px-8 py-6 text-lg border-2 border-transparent hover:scale-105 transition-all">
                      <Gift className="w-5 h-5 mr-2" />
                      Make a Donation
                    </Button>
                  </Link>
                  <Link to={createPageUrl("DonorDashboard")}>
                    <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/20 px-8 py-6 text-lg backdrop-blur-sm">
                      View My Impact
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to={createPageUrl("SignUp")}>
                  <Button
                    size="lg"
                    className="bg-white/10 backdrop-blur-md text-white border border-white/50 hover:bg-white/20 hover:border-white hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] px-8 py-6 text-lg transition-all w-full sm:w-auto hover:scale-105"
                  >
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* 2. Donation Ticker (Moved inside Hero) */}
        <div className="absolute bottom-0 left-0 w-full z-20">
          <DonationTicker />
        </div>
      </div>

      {/* 3. Stats Section */}
      {/* Adjusted margin to account for Ticker height if needed, or keep -mt-16 but ensure z-index is correct */}
      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Donations", value: stats.donations, icon: Gift },
            { label: "Verified Receivers", value: stats.receivers, icon: Users },
            { label: "Amount Donated", value: convert(stats.amount), icon: Heart }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="backdrop-blur-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-2xl h-full transform hover:-translate-y-1 transition-transform duration-300">
                <CardContent className="py-12 px-6 flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                    <stat.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">{stat.value}</p>
                  <p className="text-md text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wide">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 4. Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wide">
              Why Us
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-zinc-900 dark:text-white">
            Transparency at Core
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            We've redefined giving by ensuring you know exactly where your help goes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-zinc-200 dark:border-zinc-700">
                    <feature.icon className="w-8 h-8 text-zinc-900 dark:text-white" />
                  </div>
                  <CardTitle className="text-2xl text-zinc-900 dark:text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 5. Impact Calculator Section (New) */}
      <div className="bg-zinc-100 dark:bg-zinc-900/50 py-12">
        <ImpactCalculator />
      </div>

      {/* 6. Testimonials Section (New) */}
      <TestimonialCarousel />

      {/* CTA Section */}
      <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white transition-colors duration-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Ready to Change a Life?
          </h2>
          <p className="text-2xl text-zinc-600 dark:text-zinc-400 mb-10 font-light">
            Join thousands of transparent givers today.
          </p>
          {isAuthenticated ? (
            <Link to={createPageUrl("CreateDonation")}>
              <Button size="lg" className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-2xl px-10 py-8 text-xl rounded-full">
                Start Giving Now
              </Button>
            </Link>
          ) : (
            <Link to={createPageUrl("SignUp")}>
              <Button
                size="lg"
                className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-2xl px-10 py-8 text-xl rounded-full hover:scale-105 transition-transform"
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
