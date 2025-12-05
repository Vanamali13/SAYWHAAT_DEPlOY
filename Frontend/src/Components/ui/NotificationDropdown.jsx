import React, { useState, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { AuthContext } from '../../context/authContext';
import { Button } from './button';
import { format } from 'date-fns';

const NotificationDropdown = ({ align = 'right' }) => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications', user?._id],
        queryFn: async () => {
            const { data } = await apiClient.get('/notifications');
            return data;
        },
        enabled: !!user,
        refetchInterval: 30000, // Poll every 30 seconds
    });

    const markReadMutation = useMutation({
        mutationFn: async (id) => {
            await apiClient.put(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
        },
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkRead = (id) => {
        markReadMutation.mutate(id);
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950" />
                )}
            </Button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 w-80 max-h-[80vh] overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-[100] p-2`}>
                        <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-2 flex justify-between items-center">
                            <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">Notifications</h3>
                            {notifications.length > 0 && (
                                <Button variant="ghost" size="sm" className="h-6 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300" onClick={() => notifications.forEach(n => !n.read && handleMarkRead(n._id))}>
                                    Mark all read
                                </Button>
                            )}
                        </div>
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                                No notifications
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`p-3 rounded-lg text-sm transition-colors ${notification.read ? 'bg-transparent opacity-60' : 'bg-blue-50 dark:bg-blue-900/20'}`}
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="text-zinc-800 dark:text-zinc-200 leading-snug">
                                                {notification.message}
                                            </p>
                                            {!notification.read && (
                                                <button
                                                    onClick={() => handleMarkRead(notification._id)}
                                                    className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 p-1 rounded"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-400 mt-1">
                                            {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
