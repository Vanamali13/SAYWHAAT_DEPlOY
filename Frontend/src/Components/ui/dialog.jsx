import React from 'react';

const Dialog = ({ children }) => <div>{children}</div>;
const DialogTrigger = ({ children }) => <div>{children}</div>;
const DialogContent = ({ children }) => <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-lg duration-200 sm:rounded-lg md:w-full">{children}</div>;
const DialogHeader = ({ children }) => <div className="flex flex-col space-y-1.5 text-center sm:text-left">{children}</div>;
const DialogTitle = ({ children }) => <h3 className="text-lg font-semibold leading-none tracking-tight text-zinc-900 dark:text-zinc-50">{children}</h3>;
const DialogDescription = ({ children }) => <p className="text-sm text-zinc-500 dark:text-zinc-400">{children}</p>;
const DialogFooter = ({ children }) => <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">{children}</div>;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};
