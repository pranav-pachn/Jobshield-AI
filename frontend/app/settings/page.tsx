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

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {/* ── Profile ─────────────────────────────────────── */}
        <Card className="glass-card border border-white/10">
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
              <div className="flex items-center gap-6 p-4 rounded-lg bg-white/5 border border-white/10">
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
                  <h3 className="text-lg font-semibold text-foreground">{user?.name || "User"}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Verified Account</Badge>
                    <Badge variant="outline" className="border-primary/20 text-primary">
                      {user?.id ? `ID: ${user.id.slice(0, 8)}...` : "Loading..."}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="border-primary/20 hover:bg-primary/10"
                >
                  {isEditingProfile ? <><X className="h-4 w-4 mr-2" />Cancel</> : <><Edit3 className="h-4 w-4 mr-2" />Edit Profile</>}
                </Button>
              </div>

              {/* Editable form */}
              {isEditingProfile && (
                <div className="space-y-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <h4 className="text-sm font-semibold text-blue-400">Edit Profile</h4>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData((p) => ({ ...p, name: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 bg-background border border-white/10 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed</p>
                  </div>
                </div>
              )}

              {/* Static account details */}
              <div className="space-y-0 divide-y divide-white/5">
                {[
                  { label: "User ID", value: user?.id ? `${user.id.slice(0, 8)}...` : "Loading...", badge: false },
                  { label: "Account Type", value: "Premium", badge: true, badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
                  { label: "Account Status", value: "Active", badge: true },
                  { label: "Member Since", value: "January 15, 2024", badge: false },
                ].map((field, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <p className="text-sm font-medium text-muted-foreground">{field.label}</p>
                    {field.badge
                      ? <Badge className={field.badgeColor || "bg-green-500/10 text-green-400 border-green-500/20"}>{field.value}</Badge>
                      : <p className="text-foreground font-mono text-sm">{field.value}</p>
                    }
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Notifications ────────────────────────────────── */}
        <Card className="glass-card border border-white/10">
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
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors cursor-pointer"
                  onClick={() => handleToggle(n.id as keyof typeof settings)}
                >
                  <div className="flex-1 pointer-events-none">
                    <p className="font-medium text-foreground">{n.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.description}</p>
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
        <Card className="glass-card border border-white/10">
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
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors cursor-pointer"
                onClick={() => handleToggle("twoFactorEnabled")}
              >
                <div className="flex-1 pointer-events-none">
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Add an extra layer of security to your account</p>
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
                className="w-full justify-start border-white/10 hover:bg-white/5"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                <Shield className="h-4 w-4 mr-2" />
                {showPasswordForm ? "Cancel Password Change" : "Change Password"}
              </Button>

              {/* Password form */}
              {showPasswordForm && (
                <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-3">
                  <h4 className="text-sm font-semibold text-amber-400">Change Password</h4>
                  {[
                    { label: "Current Password", key: "current" },
                    { label: "New Password",     key: "next" },
                    { label: "Confirm New Password", key: "confirm" },
                  ].map(({ label, key }) => (
                    <div key={key} className="relative">
                      <label className="text-sm font-medium text-muted-foreground">{label}</label>
                      <div className="relative mt-1">
                        <input
                          type={showPw ? "text" : "password"}
                          value={passwordData[key as keyof typeof passwordData]}
                          onChange={(e) => setPasswordData((p) => ({ ...p, [key]: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 bg-background border border-white/10 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder={label}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
        <Card className="glass-card border border-white/10">
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
                className="w-full justify-start border-white/10 hover:bg-white/5"
                onClick={handleDownloadData}
                disabled={isDownloadingData}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloadingData ? "Preparing Download..." : "Download Your Data"}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-white/10 hover:bg-white/5"
                onClick={() => window.open("/privacy-policy", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Privacy Policy
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-white/10 hover:bg-white/5"
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
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions — proceed with caution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start border-red-500/20 text-red-400 hover:bg-red-500/10"
                onClick={handleLogoutAllSessions}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout All Sessions
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-red-500/40 text-red-400 hover:bg-red-500/10"
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
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Settings saved!
              </span>
            )}
            {!saveSuccess && (
              <p className="text-sm text-muted-foreground">
                {isEditingProfile ? "Review your changes before saving" : "Save profile and notification preferences"}
              </p>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </AuthGuard>
  );
}
