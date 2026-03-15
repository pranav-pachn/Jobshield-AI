"use client";

import { useState } from "react";
import { Settings, Bell, Lock, User, Mail, Shield, Save, LogOut, Camera, Edit3 } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  const { user } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
  });
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    threatAlerts: true,
    weeklyReport: true,
    twoFactorEnabled: false,
    darkMode: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleProfileUpdate = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      console.log("Settings saved:", settings);
      console.log("Profile updated:", profileData);
      setIsEditingProfile(false);
    }, 1000);
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <AuthGuard>
      <div className="space-y-8 max-w-4xl">
        {/* Page Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <Card className="glass-card border border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your personal account details and profile settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Profile Avatar Section */}
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
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-background border-primary/20 hover:bg-primary/10"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {user?.name || "User"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                      Verified Account
                    </Badge>
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
                  <Edit3 className="h-4 w-4 mr-2" />
                  {isEditingProfile ? "Cancel" : "Edit Profile"}
                </Button>
              </div>

              {/* Editable Profile Fields */}
              {isEditingProfile && (
                <div className="space-y-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <h4 className="text-sm font-semibold text-blue-400">Edit Profile</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleProfileUpdate("name", e.target.value)}
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
                        placeholder="Email cannot be changed"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Details */}
              <div className="space-y-4">
                {[
                  { label: "User ID", value: user?.id ? `${user.id.slice(0, 8)}...` : "Loading...", badge: false },
                  { label: "Account Type", value: "Premium", badge: true, badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
                  { label: "Account Status", value: "Active", badge: true },
                  { label: "Member Since", value: "January 15, 2024", editable: false },
                ].map((field, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {field.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {field.badge ? (
                        <Badge className={field.badgeColor || "bg-green-500/10 text-green-400 border-green-500/20"}>
                          {field.value}
                        </Badge>
                      ) : (
                        <p className="text-foreground font-mono text-sm">{field.value}</p>
                      )}
                      {field.editable && (
                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="glass-card border border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-500" />
              Notifications
            </CardTitle>
            <CardDescription>
              Control how you receive alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "emailNotifications",
                  title: "Email Notifications",
                  description: "Receive email updates about your account activity",
                },
                {
                  id: "threatAlerts",
                  title: "Threat Alerts",
                  description: "Get immediate notifications for high-risk threats",
                },
                {
                  id: "weeklyReport",
                  title: "Weekly Report",
                  description: "Receive a summary of threats detected this week",
                },
              ].map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.description}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={settings[notification.id as keyof typeof settings] as boolean}
                      onChange={() => handleToggle(notification.id as keyof typeof settings)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="glass-card border border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-500" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your security and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorEnabled}
                    onChange={() => handleToggle("twoFactorEnabled")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Change Password
              </Button>

              <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div>
                  <p className="font-medium text-blue-400">
                    Last Login
                  </p>
                  <p className="text-sm text-blue-300/70">
                    March 15, 2024 at 10:30 AM (EST)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Data */}
        <Card className="glass-card border border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              Privacy & Data
            </CardTitle>
            <CardDescription>
              Manage your data and privacy preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Download Your Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Terms of Service
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="glass-card border border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start border-red-500/20 text-red-400 hover:bg-red-500/10">
                <LogOut className="h-4 w-4 mr-2" />
                Logout All Sessions
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <p className="text-sm text-muted-foreground">
            {isEditingProfile ? "Review your changes before saving" : "Changes are saved automatically"}
          </p>
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
