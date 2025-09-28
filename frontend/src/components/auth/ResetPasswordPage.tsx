import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; // Assuming you use React Router
import { Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../utils/api/Employees/api';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [token, setToken] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // On component mount, get the token from the URL query parameter
    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (!urlToken) {
            setError('Invalid or missing password reset token.');
        }
        setToken(urlToken);
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!password || !confirmPassword) {
            setError('Please fill in both password fields.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        if (!token) {
            setError('Invalid or missing password reset token.');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.auth.resetPassword.post(token, password);
            
            setSuccess('Your password has been reset successfully! You will be redirected to the login page shortly.');
            
            // Redirect to login after a short delay
            setTimeout(() => {
                navigate('/ClientLogin');
            }, 3000);

        } catch (err: any) {
            setError(err.message || 'Failed to reset password. The link may be invalid or expired.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <img src="https://i0.wp.com/dotspeaks.com/wp-content/uploads/2025/07/Dotspeaks-logo.png?fit=2560%2C591&ssl=1" alt="dotspeaks Logo" className="w-40 mx-auto" />
                    <h1 className="mt-4 text-2xl font-bold text-gray-900">Set a New Password</h1>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center text-sm">
                                    <AlertTriangle className="h-5 w-5 mr-2" />
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                                <div className="mt-1">
                                    <input 
                                        id="password" 
                                        name="password" 
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                        className="w-full p-3 border rounded-lg" 
                                        placeholder="Enter your new password"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                <div className="mt-1">
                                    <input 
                                        id="confirmPassword" 
                                        name="confirmPassword" 
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required 
                                        className="w-full p-3 border rounded-lg" 
                                        placeholder="Confirm your new password"
                                    />
                                </div>
                            </div>

                            <div>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting || !token}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center">
                            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                            <p className="mt-4 font-semibold text-gray-800">Success!</p>
                            <p className="mt-2 text-sm text-gray-600">{success}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;