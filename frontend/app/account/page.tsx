"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Chrome, Mail, Lock, Shield, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { PasswordInput } from "@/components/ui/password-input";

interface AccountData {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  hasPassword: boolean;
  hasGoogleAuth: boolean;
  googleId?: string;
  createdAt: string;
  lastPasswordChange?: string;
  securityLevel: 'low' | 'medium' | 'high';
}

export default function AccountPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?next=/account');
      return;
    }

    fetchAccountData();
  }, [isAuthenticated, router]);

  const fetchAccountData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/auth/account`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch account data');
      }

      const data = await response.json();
      setAccountData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setError(null);
    setSuccessMessage(null);
    setPasswordErrors({});

    const errors: typeof passwordErrors = {};

    if (!currentPassword.trim()) {
      errors.current = "Current password is required";
    }

    if (!newPassword.trim()) {
      errors.new = "New password is required";
    } else if (newPassword.length < 6) {
      errors.new = "Password must be at least 6 characters";
    }

    if (!confirmPassword.trim()) {
      errors.confirm = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      errors.confirm = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/auth/password`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to change password');
      }

      setSuccessMessage('Password changed successfully!');
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Refresh account data
      await fetchAccountData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    if (!confirm('Are you sure you want to unlink your Google account? You will need to use email login to access your account.')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/auth/google`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to unlink Google account');
      }

      setSuccessMessage('Google account unlinked successfully!');
      await fetchAccountData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlink Google account');
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getSecurityLevelIcon = (level: string) => {
    switch (level) {
      case 'high': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <AlertCircle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <main className="relative w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-blue-400 mb-3">⚡</div>
          <p className="text-slate-400">Loading account data...</p>
        </div>
      </main>
    );
  }

  if (!accountData) {
    return (
      <main className="relative w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Failed to load account data'}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-200 hover:scale-105 group mb-4"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Account Settings
            <span className="block text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mt-1">
              Manage your authentication methods
            </span>
          </h1>
        </div>

        {/* Success/Error messages */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {successMessage}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Account Overview */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
              <div className="relative px-8 py-6 bg-gradient-to-br from-slate-950/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-blue-500/20 shadow-2xl">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  Profile Overview
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Email</p>
                    <p className="text-white font-medium">{accountData.email}</p>
                  </div>
                  
                  {accountData.name && (
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Name</p>
                      <p className="text-white font-medium">{accountData.name}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Security Level</p>
                    <div className="flex items-center gap-2">
                      {getSecurityLevelIcon(accountData.securityLevel)}
                      <span className={`font-medium capitalize ${getSecurityLevelColor(accountData.securityLevel)}`}>
                        {accountData.securityLevel}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Member Since</p>
                    <p className="text-white font-medium">
                      {new Date(accountData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Authentication Methods */}
            <div className="group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 via-blue-600 to-green-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
              <div className="relative px-8 py-6 bg-gradient-to-br from-slate-950/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-green-500/20 shadow-2xl">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-400" />
                  Authentication Methods
                </h2>
                
                <div className="space-y-3">
                  {/* Email/Password */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">Email & Password</p>
                        <p className="text-slate-400 text-sm">
                          {accountData.hasPassword ? 'Enabled' : 'Not set up'}
                        </p>
                      </div>
                    </div>
                    {accountData.hasPassword ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>

                  {/* Google */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <Chrome className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">Google Sign-In</p>
                        <p className="text-slate-400 text-sm">
                          {accountData.hasGoogleAuth ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    {accountData.hasGoogleAuth ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleUnlinkGoogle}
                          className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          Unlink
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/auth/google`}
                          className="text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        >
                          Connect
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="space-y-6">
            {accountData.hasPassword && (
              <div className="group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
                <div className="relative px-8 py-6 bg-gradient-to-br from-slate-950/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-purple-400" />
                    Change Password
                  </h2>
                  
                  <div className="space-y-4">
                    <PasswordInput
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={setCurrentPassword}
                      disabled={isChangingPassword}
                      error={passwordErrors.current}
                    />
                    
                    <PasswordInput
                      placeholder="New password"
                      value={newPassword}
                      onChange={setNewPassword}
                      disabled={isChangingPassword}
                      error={passwordErrors.new}
                    />
                    
                    <PasswordInput
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      disabled={isChangingPassword}
                      error={passwordErrors.confirm}
                    />
                    
                    <Button
                      onClick={handlePasswordChange}
                      disabled={isChangingPassword}
                      className="w-full h-11 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-all duration-300"
                    >
                      {isChangingPassword ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⚡</span>
                          Changing password...
                        </span>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Recommendations */}
            <div className="group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
              <div className="relative px-8 py-6 bg-gradient-to-br from-slate-950/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-yellow-500/20 shadow-2xl">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  Security Recommendations
                </h2>
                
                <div className="space-y-3">
                  {!accountData.hasPassword && (
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <p className="text-yellow-400 text-sm">
                        💡 Add a password to enable email login as a backup authentication method
                      </p>
                    </div>
                  )}
                  
                  {!accountData.hasGoogleAuth && (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <p className="text-blue-400 text-sm">
                        🔗 Connect your Google account for faster sign-in
                      </p>
                    </div>
                  )}
                  
                  {accountData.securityLevel === 'high' && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <p className="text-green-400 text-sm">
                        ✅ Your account has excellent security with multiple authentication methods
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
