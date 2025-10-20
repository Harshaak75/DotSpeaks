import React, { useState, useEffect, Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

// --- Configuration for different toast types ---
const toastConfig: any = {
    success: {
        Icon: CheckCircle,
        barColor: 'bg-green-500',
        textColor: 'text-green-800',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
    },
    error: {
        Icon: XCircle,
        barColor: 'bg-red-500',
        textColor: 'text-red-800',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
    },
    info: {
        Icon: Info,
        barColor: 'bg-blue-500',
        textColor: 'text-blue-800',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
    },
    warning: {
        Icon: AlertTriangle,
        barColor: 'bg-yellow-500',
        textColor: 'text-yellow-800',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
    },
};

/**
 * A reusable toast notification component.
 * @param {object} props
 * @param {string} props.message The message to display.
 * @param {'success'|'error'|'info'|'warning'} [props.type='info'] The type of the toast.
 * @param {number} [props.duration=10000] The duration in milliseconds for the toast to be visible.
 * @param {() => void} props.onClose The function to call when the toast is closed.
 */
const ToastNotification = ({ message, type, duration = 4000, onClose }: any) => {
    const [isVisible, setIsVisible] = useState(false);
    
    const { Icon, barColor, textColor, bgColor, borderColor }: any = toastConfig[type];

    // --- Timer Logic ---
    useEffect(() => {
        // Mount animation
        setIsVisible(true);

        // Set timer to automatically close the toast
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        // Cleanup timer on unmount
        return () => {
            clearTimeout(timer);
        };
    }, [duration]);
    
    const handleClose = () => {
        setIsVisible(false);
        // Allow time for the leave animation before calling parent onClose
        setTimeout(onClose, 200); 
    };

    return (
        <div className="fixed top-4 right-4 w-full max-w-sm z-50">
            <Transition
                show={isVisible}
                as={Fragment}
                enter="transform ease-out duration-300 transition"
                enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                leave="transition ease-in duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className={`shadow-lg rounded-lg overflow-hidden border ${borderColor} ${bgColor}`}>
                    <div className="p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <Icon className={`h-6 w-6 ${textColor}`} aria-hidden="true" />
                            </div>
                            <div className="ml-3 w-0 flex-1 pt-0.5">
                                <p className={`text-sm font-medium ${textColor}`}>
                                    {message}
                                </p>
                            </div>
                            <div className="ml-4 flex-shrink-0 flex">
                                <button
                                    className={`inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none`}
                                    onClick={handleClose}
                                >
                                    <span className="sr-only">Close</span>
                                    <X className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 h-1">
                        <div
                            className={`${barColor} h-1`}
                            style={{ animation: `progress-bar ${duration}ms linear forwards` }}
                        ></div>
                    </div>
                </div>
            </Transition>
            
            {/* CSS Keyframes for the progress bar */}
            <style>{`
                @keyframes progress-bar {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

export default ToastNotification;
