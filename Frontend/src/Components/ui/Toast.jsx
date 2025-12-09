import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Toast = ({ message, type = 'info', onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Trigger animation
        setVisible(true);
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300); // Allow exit animation
    }

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'error':
                return 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
            case 'warning':
                return 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
            default:
                return 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5" />;
            case 'error': return <AlertCircle className="w-5 h-5" />;
            case 'warning': return <AlertTriangle className="w-5 h-5" />;
            default: return <Info className="w-5 h-5" />;
        }
    }

    return (
        <div className={`pointer-events-auto flex items-center gap-3 p-4 rounded-lg shadow-lg border min-w-[300px] max-w-sm ${getTypeStyles()} transition-all duration-300 animate-in slide-in-from-right fade-in`}>
            <div className="shrink-0">{getIcon()}</div>
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button onClick={handleClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                <X className="w-4 h-4 opacity-70" />
            </button>
        </div>
    );
};
