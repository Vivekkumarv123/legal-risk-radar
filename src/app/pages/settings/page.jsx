"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Bell, Shield, Palette, Globe, Trash2, Loader2, Save, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function Settings() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState({
        name: "",
        email: "",
        notifications: {
            email: true,
            push: false,
            updates: true
        },
        privacy: {
            shareAnalytics: false,
            publicProfile: false
        },
        preferences: {
            theme: "light",
            language: "en"
        }
    });

    useEffect(() => {
        fetchUserSettings();
    }, []);

    const fetchUserSettings = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/user/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setSettings(prev => ({
                    ...prev,
                    name: data.user.name || "",
                    email: data.user.email || "",
                    ...data.settings
                }));
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                toast.success('Settings saved successfully');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Profile Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            <input
                                type="text"
                                value={settings.name}
                                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={settings.email}
                                disabled
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Bell className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Email Notifications</span>
                            <input
                                type="checkbox"
                                checked={settings.notifications.email}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, email: e.target.checked }
                                }))}
                                className="w-5 h-5 text-blue-600 rounded"
                            />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Push Notifications</span>
                            <input
                                type="checkbox"
                                checked={settings.notifications.push}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, push: e.target.checked }
                                }))}
                                className="w-5 h-5 text-blue-600 rounded"
                            />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Product Updates</span>
                            <input
                                type="checkbox"
                                checked={settings.notifications.updates}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, updates: e.target.checked }
                                }))}
                                className="w-5 h-5 text-blue-600 rounded"
                            />
                        </label>
                    </div>
                </div>

                {/* Privacy */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Privacy</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Share Analytics</span>
                            <input
                                type="checkbox"
                                checked={settings.privacy.shareAnalytics}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    privacy: { ...prev.privacy, shareAnalytics: e.target.checked }
                                }))}
                                className="w-5 h-5 text-blue-600 rounded"
                            />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Public Profile</span>
                            <input
                                type="checkbox"
                                checked={settings.privacy.publicProfile}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    privacy: { ...prev.privacy, publicProfile: e.target.checked }
                                }))}
                                className="w-5 h-5 text-blue-600 rounded"
                            />
                        </label>
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Palette className="w-5 h-5 text-orange-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                            <select
                                value={settings.preferences.theme}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    preferences: { ...prev.preferences, theme: e.target.value }
                                }))}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="auto">Auto</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                            <select
                                value={settings.preferences.language}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    preferences: { ...prev.preferences, language: e.target.value }
                                }))}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                                <option value="es">Spanish</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
