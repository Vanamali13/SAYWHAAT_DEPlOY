import React, { useContext } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { createPageUrl } from '../utils/utils';

export default function Footer() {
    const { theme } = useContext(ThemeContext);
    const { code, changeCurrency, availableCurrencies } = useCurrency();
    const logoSrc = theme === 'dark' ? '/assets/images/logo-dark.png' : '/assets/images/logo-light.png';

    return (
        <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link to={createPageUrl("home")} className="flex items-center gap-2">
                            <img src={logoSrc} alt="Say Whatt Logo" className="h-8 w-auto object-contain" />
                            <span className="font-bold text-xl text-zinc-900 dark:text-white">Say Whatt?</span>
                        </Link>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                            Empowering transparent giving with verified receivers and real-time proof of impact.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <li><Link to={createPageUrl("home")} className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/login" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Login</Link></li>
                            <li><Link to="/signup" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Sign Up</Link></li>
                            <li><Link to="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">About Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Contact Us</h3>
                        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>support@saywhatt.com</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>123 Charity Lane, Goodville</span>
                            </li>
                        </ul>
                    </div>

                    {/* Social & Newsletter */}
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Follow Us</h3>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                <Linkedin className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-zinc-200 dark:border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-zinc-500 dark:text-zinc-500">© {new Date().getFullYear()} Say Whatt. All rights reserved.</p>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Currency:</span>
                        <select
                            value={code}
                            onChange={(e) => changeCurrency(e.target.value)}
                            className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-md text-sm text-zinc-700 dark:text-zinc-300 px-2 py-1 focus:ring-2 focus:ring-pink-500 cursor-pointer"
                        >
                            {availableCurrencies.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </footer>
    );
}
