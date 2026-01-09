import React, { useState } from "react";
import { Slider } from "./ui/slider";
import { Heart, Utensils, BookOpen, Shirt } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "../context/CurrencyContext";

const IMPACT_TIERS = [
    { max: 20, label: "Warm Meals", icon: Utensils, countMultiplier: 0.5, unit: "meals" },
    { max: 50, label: "School Supplies", icon: BookOpen, countMultiplier: 0.2, unit: "kits" },
    { max: 100, label: "Winter Garments", icon: Shirt, countMultiplier: 0.1, unit: "items" },
    { max: 1000, label: "Families Supported", icon: Heart, countMultiplier: 0.05, unit: "families" },
];

export default function ImpactCalculator() {
    const { symbol, rate, convert } = useCurrency();
    const [amount, setAmount] = useState(50); // This is in LOCAL CURRENCY now

    // Convert local amount back to USD to calculate impact logic (since tiers are USD based)
    const usdAmount = amount / rate;

    const currentTier = IMPACT_TIERS.find(t => usdAmount <= t.max) || IMPACT_TIERS[IMPACT_TIERS.length - 1];
    const calculatedCount = Math.floor(usdAmount * currentTier.countMultiplier);
    const impactCount = amount > 0 ? Math.max(1, calculatedCount) : 0;

    // Adjust slider max based on rate (approx $500 equivalent)
    const maxVal = Math.ceil(500 * rate / 10) * 10;
    const stepVal = Math.ceil(10 * rate);

    return (
        <div className="w-full max-w-4xl mx-auto py-12">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">See Your Power</h2>
                <p className="text-zinc-600 dark:text-zinc-400">Slide to see how much change you can create today.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800">
                {/* Input Section */}
                <div className="space-y-8">
                    <div className="text-center">
                        <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            {/* Manual format to control decimals */}
                            {symbol}{amount.toLocaleString()}
                        </span>
                        <p className="text-sm text-zinc-500 mt-2 font-medium uppercase tracking-wide">Donation Amount ({symbol})</p>
                    </div>

                    <Slider
                        defaultValue={[50]}
                        value={[amount]}
                        max={maxVal}
                        step={stepVal}
                        onValueChange={(vals) => setAmount(vals[0])}
                        className="w-full py-4"
                    />

                    <div className="flex justify-between text-xs text-zinc-400 font-medium px-1">
                        <span>{convert(10)}</span>
                        <span>{convert(250)}</span>
                        <span>{convert(500)}+</span>
                    </div>
                </div>

                {/* Result Section */}
                <div className="relative h-64 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    {/* Background decorative blob */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentTier.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                            className="relative z-10 flex flex-col items-center text-center"
                        >
                            <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-full shadow-lg flex items-center justify-center mb-6">
                                <currentTier.icon className="w-10 h-10 text-blue-500" />
                            </div>
                            <div>
                                {amount > 0 ? (
                                    <>
                                        <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">Provides enough for</p>
                                        <h3 className="text-4xl font-bold text-zinc-900 dark:text-white mt-1">
                                            {impactCount} {currentTier.label}
                                        </h3>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">Every dollar counts</p>
                                        <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">
                                            Start Your Impact
                                        </h3>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
