"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings, Bell, Lock, User, Mail, Shield, Save,
  LogOut, Camera, Edit3, Download, ExternalLink, Trash2,
  Eye, EyeOff, CheckCircle2, X,
} from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { getBackendUrl } from "@/lib/apiConfig";
const backendUrl = getBackendUrl();

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  /* ── profile ─────────────────────────────── */
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  /* ── toggles ─────────────────────────────── */
  const [settings, setSettings] = useState({
    emailNotifications: true,
    threatAlerts: true,
    weeklyReport: true,
    twoFactorEnabled: false,
    darkMode: true,
  });

  /* ── password change ─────────────────────── */
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState("");

  /* ── UI state ─────────────────────────────── */
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);

  /* ── helpers ─────────────────────────────── */
  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaveSuccess(false);
  };

  const getInitials = (name: string, email: string) => {
    if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    return email.slice(0, 2).toUpperCase();
  };

  /* ── Save profile + preferences ─────────── */
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await fetch(`${backendUrl}/api/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: profileData.name,
          preferences: {
            emailNotifications: settings.emailNotifications,
            threatAlerts: settings.threatAlerts,
            weeklyReport: settings.weeklyReport,
            twoFactorEnabled: settings.twoFactorEnabled,
          },
        }),
      });
      setSaveSuccess(true);
      setIsEditingProfile(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // silently fail – user already sees fallback
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Change password ─────────────────────── */
  const handleChangePassword = async () => {
    setPwError("");
    if (!passwordData.current) { setPwError("Current password is required."); return; }
    if (passwordData.next.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (passwordData.next !== passwordData.confirm) { setPwError("Passwords do not match."); return; }

    setIsSaving(true);
    try {
      const res = await fetch(`${backendUrl}/api/users/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: passwordData.current, newPassword: passwordData.next }),
      });
      if (!res.ok) {
        const d = await res.json();
        setPwError(d.message || "Failed to change password.");
      } else {
        setShowPasswordForm(false);
        setPasswordData({ current: "", next: "", confirm: "" });
        alert("Password changed successfully!");
      }
    } catch {
      setPwError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Download data ───────────────────────── */
  const handleDownloadData = async () => {
    setIsDownloadingData(true);
    try {
      const res = await fetch(`${backendUrl}/api/users/export-data`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `jobshield_data_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert("Could not export data at this time. Please try again.");
      }
    } catch {
      alert("Network error during data export.");
    } finally {
      setIsDownloadingData(false);
    }
  };

  /* ── Logout all sessions ─────────────────── */
  const handleLogoutAllSessions = async () => {
    if (!confirm("This will log you out of all devices. Continue?")) return;
    try {
      await fetch(`${backendUrl}/api/auth/logout-all`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      logout();
      router.push("/login");
    }
  };

  /* ── Delete account ──────────────────────── */
  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    const confirmed = confirm(
      "Are you absolutely sure? This will permanently delete your account and all data. This cannot be undone."
    );
    if (!confirmed) return;
    try {
      await fetch(`${backendUrl}/api/users/account`, {
        method: "DELETE",
        credentials: "include",
      });
      logout();
      router.push("/");
    } catch {
      alert("Failed to delete account. Please contact support.");
    }
  };

  /* ── Avatar upload ───────────────────────── */
  const handleAvatarClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("avatar", file);
      try {
        await fetch(`${backendUrl}/api/users/avatar`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        alert("Profile photo updated! Refresh to see the change.");
      } catch {
        alert("Failed to upload photo.");
      }
    };
    input.click();
  };

  return (
    <AuthGuard>
      <div className="flex w-full flex-col gap-8">
        {/* Page Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0b1220] border border-slate-800 shadow-inner">
              <Settings className="h-6 w-6 text-slate-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-100">Settings</h1>
              <p className="text-slate-400">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {/* ── Profile ─────────────────────────────────────── */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Profile Information
            </CardTitle>
            <CardDescription>Your personal account details and profile settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Avatar + info row */}
              <div className="flex items-center gap-6 p-4 rounded-lg bg-[#0b1220] border border-slate-800 shadow-inner">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.avatar} alt={user?.name || user?.email} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-lg font-semibold">
                      {getInitials(user?.name || "", user?.email || "")}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAvatarClick}
                    title="Change profile photo"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-background border-primary/20 hover:bg-primary/10"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-100">{user?.name || "User"}</h3>
                  <p className="text-sm font-mono text-slate-400">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20 shadow-[0_0_10px_rgba(0,255,136,0.1)]">Verified Account</Badge>
                    <Badge variant="outline" className="border-slate-700 text-slate-400 font-mono">
                      {user?.id ? `ID: ${user.id.slice(0, 8)}...` : "Loading..."}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="border-slate-700 hover:bg-slate-800 text-slate-300"
                >
                  {isEditingProfile ? <><X className="h-4 w-4 mr-2" />Cancel</> : <><Edit3 className="h-4 w-4 mr-2" />Edit Profile</>}
                </Button>
              </div>

              {/* Editable form */}
              {isEditingProfile && (
                <div className="space-y-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <h4 className="text-sm font-semibold text-blue-400">Edit Profile</h4>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData((p) => ({ ...p, name: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 bg-black/50 border border-slate-800 rounded-lg text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full mt-1 px-3 py-2 bg-[#05080f] border border-slate-800 rounded-lg text-slate-500 cursor-not-allowed font-mono"
                    />
                    <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">Email address cannot be changed</p>
                  </div>
                </div>
              )}

              {/* Static account details */}
              <div className="space-y-0 divide-y divide-slate-800">
                {[
                  { label: "User ID", value: user?.id ? `${user.id.slice(0, 8)}...` : "Loading...", badge: false },
                  { label: "Account Type", value: "Premium", badge: true, badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
                  { label: "Account Status", value: "Active", badge: true },
                  { label: "Member Since", value: "January 15, 2024", badge: false },
                ].map((field, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{field.label}</p>
                    {field.badge
                      ? <Badge className={field.badgeColor || "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20"}>{field.value}</Badge>
                      : <p className="text-slate-300 font-mono text-sm">{field.value}</p>
                    }
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Notifications ────────────────────────────────── */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-500" />
              Notifications
            </CardTitle>
            <CardDescription>Control how you receive alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: "emailNotifications", title: "Email Notifications", description: "Receive email updates about your account activity" },
                { id: "threatAlerts",       title: "Threat Alerts",        description: "Get immediate notifications for high-risk threats" },
                { id: "weeklyReport",       title: "Weekly Report",        description: "Receive a summary of threats detected this week" },
              ].map((n) => (
                <div
                  key={n.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-[#0b1220] border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer shadow-inner"
                  onClick={() => handleToggle(n.id as keyof typeof settings)}
                >
                  <div className="flex-1 pointer-events-none">
                    <p className="font-bold text-slate-200 text-sm">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={settings[n.id as keyof typeof settings] as boolean}
                      onChange={() => handleToggle(n.id as keyof typeof settings)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Security ─────────────────────────────────────── */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-500" />
              Security
            </CardTitle>
            <CardDescription>Manage your security and privacy settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 2FA toggle */}
              <div
                className="flex items-center justify-between p-4 rounded-lg bg-[#0b1220] border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer shadow-inner"
                onClick={() => handleToggle("twoFactorEnabled")}
              >
                <div className="flex-1 pointer-events-none">
                  <p className="font-bold text-slate-200 text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-400 mt-0.5">Add an extra layer of security to your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={settings.twoFactorEnabled}
                    onChange={() => handleToggle("twoFactorEnabled")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>

              {/* Change password button */}
              <Button
                variant="outline"
                className="w-full justify-start border-slate-800 hover:bg-slate-800 text-slate-300"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                <Shield className="h-4 w-4 mr-2" />
                {showPasswordForm ? "Cancel Password Change" : "Change Password"}
              </Button>

              {/* Password form */}
              {showPasswordForm && (
                <div className="p-4 rounded-lg bg-[#0b1220] border border-slate-800 shadow-inner space-y-3">
                  <h4 className="text-sm font-bold text-amber-400">Change Password</h4>
                  {[
                    { label: "Current Password", key: "current" },
                    { label: "New Password",     key: "next" },
                    { label: "Confirm New Password", key: "confirm" },
                  ].map(({ label, key }) => (
                    <div key={key} className="relative">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</label>
                      <div className="relative mt-1">
                        <input
                          type={showPw ? "text" : "password"}
                          value={passwordData[key as keyof typeof passwordData]}
                          onChange={(e) => setPasswordData((p) => ({ ...p, [key]: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 bg-black/50 border border-slate-800 rounded-lg text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all font-mono"
                          placeholder={label}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  {pwError && <p className="text-xs text-red-400">{pwError}</p>}
                  <Button
                    onClick={handleChangePassword}
                    disabled={isSaving}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                  >
                    {isSaving ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              )}

              {/* Last login */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div>
                  <p className="font-medium text-blue-400">Last Login</p>
                  <p className="text-sm text-blue-300/70">March 15, 2024 at 10:30 AM (EST)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Privacy & Data ───────────────────────────────── */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              Privacy &amp; Data
            </CardTitle>
            <CardDescription>Manage your data and privacy preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start border-slate-800 hover:bg-slate-800 text-slate-300"
                onClick={handleDownloadData}
                disabled={isDownloadingData}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloadingData ? "Preparing Download..." : "Download Your Data"}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-slate-800 hover:bg-slate-800 text-slate-300"
                onClick={() => window.open("/privacy-policy", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Privacy Policy
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-slate-800 hover:bg-slate-800 text-slate-300"
                onClick={() => window.open("/terms-of-service", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Terms of Service
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Danger Zone ──────────────────────────────────── */}
        <Card className="glass-card border border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-500 font-bold">Danger Zone</CardTitle>
            <CardDescription className="text-red-400/80">Irreversible actions — proceed with caution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
                onClick={handleLogoutAllSessions}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout All Sessions
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-red-500/40 text-red-500 hover:bg-red-500/10 hover:border-red-500/50"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>

              {/* Delete confirm prompt */}
              {showDeleteConfirm && (
                <div className="mt-3 p-4 rounded-lg border border-red-500/40 bg-red-500/10 space-y-3">
                  <p className="text-sm text-red-400 font-semibold">
                    ⚠ This will permanently delete your account and all associated data. This cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-white/10 hover:bg-white/5"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                      onClick={handleDeleteAccount}
                    >
                      Yes, Delete Everything
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Save Bar ─────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-sm text-[#00ff88] font-bold">
                <CheckCircle2 className="h-4 w-4" />
                Settings saved!
              </span>
            )}
            {!saveSuccess && (
              <p className="text-sm font-mono text-slate-500">
                {isEditingProfile ? "Review your changes before saving" : "Save profile and notification preferences"}
              </p>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#00ff88] hover:bg-[#00cc6a] text-black font-bold tracking-wide hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all px-8 h-12"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </AuthGuard>
  );
}
