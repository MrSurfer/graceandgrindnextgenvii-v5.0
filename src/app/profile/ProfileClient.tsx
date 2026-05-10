"use client";

import { useState } from "react";
import { applyForTeacher, requestAccountDeletion, updateProfile } from "./actions";
import { toast } from "sonner";
import { User as UserIcon, Mail, Shield, Save, Trash2, Loader2, Send, Globe, MessageCircle, Camera, Briefcase, AlignLeft, Bell, Key, CreditCard } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { useSession } from "@/components/providers/SupabaseProvider";
import { hasPermission } from "@/lib/permissions";

export default function ProfileClient({ 
  user,
  applicationStatus,
  lastUpdate
}: { 
  user: {
    name: string;
    email: string;
    image: string;
    role: string;
    displayRole: string;
    bio: string;
    website: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  applicationStatus?: string,
  lastUpdate?: Date
}) {
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.image);
  const [bio, setBio] = useState(user.bio || "");
  const [website, setWebsite] = useState(user.website || "");
  const [twitter, setTwitter] = useState(user.twitter || "");
  const [instagram, setInstagram] = useState(user.instagram || "");
  const [linkedin, setLinkedin] = useState(user.linkedin || "");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data: session } = useSession();
  const permissions = session?.user?.permissions || [];
  
  const diffDays = lastUpdate ? Math.ceil((new Date().getTime() - new Date(lastUpdate).getTime()) / (1000 * 3600 * 24)) : 0;
  const showApplyButton = !applicationStatus || (applicationStatus === "REJECTED" && diffDays >= 7);

  async function handleSaveProfile() {
    setIsSaving(true);
    try {
      const res = await updateProfile({ 
        name, 
        image, 
        bio, 
        website, 
        twitter, 
        instagram, 
        linkedin 
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleApply() {
    setLoading(true);
    try {
      const res = await applyForTeacher();
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message || "Application submitted successfully.");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to request account deletion? Your account will be disabled pending admin review.")) return;
    setDeleteLoading(true);
    try {
      const res = await requestAccountDeletion();
      if (res.error) {
        toast.error(res.error);
        setDeleteLoading(false);
      } else {
        toast.success("Account deletion requested. Logging out...");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (e) {
      toast.error("An unexpected error occurred.");
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-amber-500" /> Account Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </label>
              <div 
                className="text-gray-400 font-medium px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50 cursor-not-allowed truncate"
                title={user.email}
              >
                {user.email}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Role
              </label>
              <div className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-bold border ${
                user.role === "OWNER"
                  ? "bg-zinc-100 text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                : user.displayRole === "High Council" 
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/20" 
                  : user.role === "SUPER_ADMIN"
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/20"
                  : user.role === "ADMIN"
                  ? "bg-red-500/20 text-red-400 border-red-500/20"
                  : "bg-gray-800 text-gray-400 border-gray-700"
              }`}>
                {user.displayRole}
              </div>
            </div>
          </div>

          <div>
            <ImageUpload 
              value={image} 
              onChange={setImage} 
              label="Profile Picture" 
              bucket="user-assets"
            />
          </div>
        </div>

        {/* Security & Preferences Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Security & Preferences</h2>
              <p className="text-xs text-gray-500">Manage your account protection and alerts</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-200">Email Notifications</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Announcements, progress updates, and course news</div>
                </div>
              </div>
              <div className="w-10 h-5 bg-amber-500 rounded-full relative cursor-not-allowed opacity-50">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                  <Key className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-200">Password Management</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Change your password or enable 2FA</div>
                </div>
              </div>
              <button 
                onClick={() => toast.info("Password reset link sent to your email.")}
                className="text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors"
              >
                Update
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-200">Billing & Payment</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Manage your invoices and payment methods</div>
                </div>
              </div>
              <button 
                onClick={() => toast.info("Redirecting to billing portal...")}
                className="text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors"
              >
                Manage
              </button>
            </div>
          </div>
        </div>

        {/* Bio & Professional Details */}
        <div className="grid grid-cols-1 gap-6 mb-8 border-t border-gray-800 pt-8">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-amber-500" /> Professional Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the world about your parenting journey and expertise..."
              rows={4}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-amber-500 transition-colors resize-none text-sm leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" /> Personal Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5" /> Twitter (X)
              </label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="@username"
                className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Camera className="w-3.5 h-3.5" /> Instagram
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@username"
                className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" /> LinkedIn
              </label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/username"
                className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-800 pt-6">
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-bold px-6 py-2.5 rounded-lg transition-colors"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Update Profile
          </button>
        </div>
      </div>

      {!hasPermission(permissions, "teacher:dashboard") && !hasPermission(permissions, "admin:dashboard") && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-2">Become a Teacher</h2>
          <p className="text-gray-400 text-sm mb-6">Want to share your knowledge with the world? Apply to become a teacher on GraceAndGrind.</p>
          

          {!showApplyButton && applicationStatus === "PENDING" && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg px-4 py-3 text-sm font-medium">
              Your application is currently pending review.
            </div>
          )}

          {!showApplyButton && applicationStatus === "REJECTED" && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm font-medium">
              <p className="font-bold mb-1">Application not approved at this time.</p>
              <p className="opacity-80">You can re-apply in <span className="font-bold underline">{7 - diffDays} days</span>. Use this time to improve your portfolio!</p>
            </div>
          )}

          {showApplyButton && (
            <button
              onClick={handleApply}
              disabled={loading}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-bold px-6 py-3 rounded-xl transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {applicationStatus === "REJECTED" ? "Try Re-applying" : "Submit Application"}
            </button>
          )}
        </div>
      )}

      {(hasPermission(permissions, "teacher:dashboard") || hasPermission(permissions, "admin:dashboard")) && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-2 text-green-400 flex items-center gap-2">
            Teacher Status
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            You are an approved educator on GraceAndGrind. 
            {lastUpdate && (
              <span className="block mt-2 font-medium text-green-500/80">
                Member since {new Date(lastUpdate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
          </p>
          <div className="bg-green-500/10 border border-green-500/20 text-green-400/80 rounded-xl px-4 py-3 text-xs italic">
            You have full access to the teacher dashboard to create courses, lessons, and manage your content.
          </div>
        </div>
      )}

      <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-2 text-red-400">Danger Zone</h2>
        <p className="text-gray-400 text-sm mb-6">Once you request account deletion, your account will be disabled and queued for deletion by an administrator.</p>
        <button
          onClick={handleDelete}
          disabled={deleteLoading}
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 disabled:opacity-50 font-bold px-6 py-3 rounded-xl transition-colors"
        >
          {deleteLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
          Request Account Deletion
        </button>
      </div>
    </div>
  );
}
