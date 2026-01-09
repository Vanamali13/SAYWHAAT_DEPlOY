import React from 'react';
import { Button } from './ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in"
                onClick={onClose}
            />

            {/* Modal Content - specialized wrapper to work with our simple Dialog components */}
            <DialogContent className="z-[101]">
                <DialogHeader>
                    <DialogTitle>Sign out</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to sign out of your account?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={onClose} className="border-zinc-200 dark:border-zinc-700">
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
                    >
                        Log out
                    </Button>
                </DialogFooter>
            </DialogContent>
        </>
    );
}
