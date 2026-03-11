import React, { useState } from 'react';
import { db } from '../utils/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { fetchGitHubUserData } from '../utils/githubapi';

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim()) return;

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            // 1. Check if user already exists in Firestore to prevent duplicates
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", username.trim()));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                throw new Error("This user's building is already in the city!");
            }

            // 2. Fetch data from GitHub API
            const userData = await fetchGitHubUserData(username.trim());

            // 3. Save to Firestore
            const docRef = await addDoc(collection(db, "users"), userData);

            setSuccess(`Successfully added ${userData.username} to GitHub City!`);

            // Notify parent component to update standard UI logic
            if (onUserAdded) {
                onUserAdded(userData);
            }

            // Close modal after brief delay
            setTimeout(() => {
                setUsername('');
                setSuccess('');
                onClose();
            }, 2000);

        } catch (err) {
            setError(err.message || 'Failed to add user. Please check the username and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a24] border border-blue-500/30 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Build Your House</h2>
                <p className="text-gray-400 mb-6 text-sm">
                    Enter a GitHub username to construct a new building in the city. Its size, color, and design will be based on their GitHub stats!
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            GitHub Username
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                github.com/
                            </span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="torvalds"
                                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg py-2 pl-24 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded p-3">
                            ⚠️ {error}
                        </div>
                    )}

                    {success && (
                        <div className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded p-3">
                            ✅ {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !username.trim()}
                        className={`w-full py-2.5 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all
              ${isLoading || !username.trim()
                                ? 'bg-gray-700 cursor-not-allowed hidden'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] shadow-lg shadow-blue-500/25'}`}
                        style={{ display: isLoading || !username.trim() ? 'none' : 'flex' }}
                    >
                        Construct Building
                    </button>

                    {isLoading && (
                        <button
                            type="button"
                            disabled
                            className="w-full py-2.5 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all bg-gray-700 cursor-not-allowed"
                        >
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Analyzing GitHub Data...
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;
