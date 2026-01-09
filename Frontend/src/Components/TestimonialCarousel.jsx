import React, { useState, useEffect } from "react";

import { Quote, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

const TESTIMONIALS = [
    {
        id: 1,
        quote: "I never realized how easy it could be to help. The transparency of seeing exactly where my donation went changed everything for me.",
        author: "Jessica M.",
        role: "Regular Donor",
        initial: "J"
    },
    {
        id: 2,
        quote: "Receiving the winter clothes for my children was a blessing. The dignity and respect shown by the team was heartwarming.",
        author: "Fatima R.",
        role: "Beneficiary",
        initial: "F"
    },
    {
        id: 3,
        quote: "The verification process gave me total peace of mind. I know 100% of my contribution is making a real difference.",
        author: "David Chen",
        role: "Community Supporter",
        initial: "D"
    }
];

export default function TestimonialCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

    useEffect(() => {
        const timer = setInterval(next, 6000);
        return () => clearInterval(timer);
    }, []);

    const current = TESTIMONIALS[currentIndex];

    return (
        <div className="py-20 bg-zinc-50 dark:bg-zinc-950">
            <div className="max-w-4xl mx-auto px-6">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-8 text-blue-600 dark:text-blue-400">
                        <Quote className="w-8 h-8 fill-current" />
                    </div>

                    <div className="min-h-[200px] flex items-center justify-center">
                        <blockquote className="text-2xl md:text-3xl font-medium text-zinc-900 dark:text-white italic leading-relaxed">
                            "{current.quote}"
                        </blockquote>
                    </div>

                    <div className="mt-8 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500">
                            {current.initial}
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-zinc-900 dark:text-white">{current.author}</p>
                            <p className="text-sm text-zinc-500">{current.role}</p>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-12">
                        <Button variant="outline" size="icon" onClick={prev} className="rounded-full w-12 h-12 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={next} className="rounded-full w-12 h-12 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
