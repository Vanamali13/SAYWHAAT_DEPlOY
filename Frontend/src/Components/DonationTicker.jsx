import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Gift } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";

const MOCK_DONATIONS = [
    { name: "Sarah J.", action: "donated $50", type: "money" },
    { name: "Mike T.", action: "gave 5 shirts", type: "items" },
    { name: "Anonymous", action: "supported a family", type: "money" },
    { name: "Emily R.", action: "donated $100", type: "money" },
    { name: "David K.", action: "gave winter jackets", type: "items" },
    { name: "Jessica L.", action: "donated $25", type: "money" },
    { name: "Tom H.", action: "gave school supplies", type: "items" },
    { name: "Alex P.", action: "donated $200", type: "money" },
];

export default function DonationTicker() {
    const { convert } = useCurrency();

    // Helper to replace $XX with localized currency
    const formatAction = (action) => {
        return action.replace(/\$(\d+)/g, (match, p1) => {
            return convert(parseInt(p1));
        });
    }

    useEffect(() => {
        // Calculate roughly the width needed based on items
        // This is valid enough for now, or just use a very large negative X value
    }, []);

    return (
        <div className="bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800 py-3 overflow-hidden relative flex items-center z-20">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-zinc-900 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-zinc-900 to-transparent z-10" />

            <div className="flex gap-4 items-center">
                <span className="text-pink-500 font-bold text-xs uppercase tracking-wider px-4 shrink-0 border-r border-zinc-200 dark:border-zinc-800">
                    Live Feed
                </span>

                <div className="flex overflow-hidden w-full mask-linear-fade">
                    <motion.div
                        className="flex gap-12 whitespace-nowrap"
                        animate={{ x: [0, -1000] }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 20,
                                ease: "linear",
                            },
                        }}
                    >
                        {/* Duplicated list for seamless loop */}
                        {[...MOCK_DONATIONS, ...MOCK_DONATIONS, ...MOCK_DONATIONS].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-zinc-300">
                                <div className={`p-1 rounded-full ${item.type === 'money' ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'}`}>
                                    {item.type === 'money' ? <Heart className="w-3 h-3" /> : <Gift className="w-3 h-3" />}
                                </div>
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</span>
                                <span className="text-zinc-500 dark:text-zinc-400">{formatAction(item.action)}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
