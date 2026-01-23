'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (data: any) => void;
}

export default function ProfileModal({ isOpen, onClose, onUpdate }: ProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isRegistered, setIsRegistered] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    profileImage: ''
  });

  // Load from local storage on open
  React.useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('luxe_user_profile');
      if (stored) {
        setFormData(JSON.parse(stored));
        setIsRegistered(true);
      }
    }
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic size check (e.g. 4MB)
      if (file.size > 4 * 1024 * 1024) {
        alert("Image file is too large. Please choose a smaller image.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize image to reduce size for Firestore (max 1MB document limit)
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions (keep it small for base64 storage)
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress heavily to ensure it fits in Firestore
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            setFormData(prev => ({ ...prev, profileImage: dataUrl }));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('luxe_user_profile');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      bio: '',
      profileImage: ''
    });
    setIsRegistered(false);
    if (onUpdate) onUpdate(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    try {
      // Save to Firestore
      await addDoc(collection(db, "profiles"), {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Save to Local Storage for "Session"
      localStorage.setItem('luxe_user_profile', JSON.stringify(formData));
      setIsRegistered(true);
      if (onUpdate) onUpdate(formData);

      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 1500);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setStatus('error');
      // Show actual error message to help debug
      alert(`Error saving profile: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">My Profile</h2>
                  <p className="text-sm text-gray-400">Manage your personal information</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center justify-center gap-4 mb-8">
                  <div className="relative w-24 h-24 rounded-full bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden hover:border-emerald-500 transition-colors group">
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-gray-500 group-hover:text-emerald-500 transition-colors" size={32} />
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                   <p className="text-xs text-gray-400">Click to upload profile picture</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-600"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-600"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-600"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-600"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-500" size={18} />
                    <textarea
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-600 resize-none"
                      placeholder="Enter your full address..."
                    />
                  </div>
                </div>

                 <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Bio</label>
                  <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-600 resize-none"
                      placeholder="Tell us a bit about yourself..."
                    />
                </div>

                {/* Footer Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-800">
                   {isRegistered && (
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="px-4 py-3 rounded-lg border border-red-900/50 bg-red-900/10 text-red-500 font-medium hover:bg-red-900/20 transition-colors"
                    >
                      Sign Out
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || status === 'success'}
                    className={`flex-1 px-4 py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all ${
                      status === 'success' ? 'bg-green-600' : 
                      status === 'error' ? 'bg-red-600' :
                      'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'
                    }`}
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : status === 'success' ? (
                      <>
                        <CheckCircle size={20} /> Saved!
                      </>
                    ) : status === 'error' ? (
                      <>
                        <AlertCircle size={20} /> Failed
                      </>
                    ) : (
                      <>
                        <Save size={20} /> {isRegistered ? 'Update Profile' : 'Register Profile'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
