'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Save, Upload, Mail, Camera, Sparkles, MapPin, Lock, LogOut, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (profile: any) => void;
  userProfile?: any;
  onLogout?: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onUpdate, userProfile, onLogout }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('select');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
      setAddress(userProfile.address || '');
      setGender(userProfile.gender || 'select');
      setPassword(userProfile.password || '');
      setProfileImage(userProfile.profileImage || '');
      setCoverPhoto(userProfile.coverPhoto || '');
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network delay for effect
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const updatedProfile = { 
      ...(userProfile || {}),
      name, 
      email,
      address,
      gender,
      password,
      profileImage,
      coverPhoto
    };

    try {
      localStorage.setItem('luxe_user_profile', JSON.stringify(updatedProfile));
      
      // Save to Firebase for Admin Panel
      await addDoc(collection(db, "users"), {
        ...updatedProfile,
        createdAt: serverTimestamp(),
        role: "user"
      });

      onUpdate(updatedProfile);
      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert('Failed to save profile. Storage quota might be exceeded.');
    }
    
    setIsLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover' = 'profile') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 2 * 1024 * 1024) {
        alert("Image file is too large. Please choose an image smaller than 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'profile') setProfileImage(reader.result as string);
        else setCoverPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-gray-900/95 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 absolute top-0 left-0 right-0 z-50">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow-md">
                <Sparkles className="text-emerald-400" size={20} />
                Edit Profile
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white rounded-full hover:bg-black/20 transition-colors backdrop-blur-sm"
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6 pt-0">
               {/* Cover Photo - Full Width via negative margins */}
               <div className="relative h-48 -mx-8 bg-gray-800 group overflow-hidden">
                {coverPhoto ? (
                  <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-emerald-900 to-gray-900 flex items-center justify-center">
                    <ImageIcon className="text-emerald-500/20" size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <label className="bg-black/50 text-white px-4 py-2 rounded-full cursor-pointer hover:bg-black/70 flex items-center gap-2 backdrop-blur-sm border border-white/10">
                     <Camera size={20} />
                     <span>Edit Cover Photo</span>
                     <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'cover')} />
                   </label>
                </div>
               </div>

               <div className="relative -mt-20 mb-8 pl-4">
                  <div className="relative group inline-block">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-900 shadow-xl relative bg-gray-800 ring-4 ring-emerald-500/30 group-hover:ring-emerald-400 transition-all">
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-800">
                                <User size={48} />
                            </div>
                        )}
                    </div>
                    
                    <label className="absolute bottom-2 right-2 z-20 bg-emerald-500 text-white p-2.5 rounded-full cursor-pointer shadow-lg hover:bg-emerald-400 transition-colors hover:scale-105 active:scale-95 border-2 border-gray-900">
                        <Camera size={18} />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'profile')} />
                    </label>
                  </div>
               </div>

               <div className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">Full Name</label>
                     <div className="relative group">
                       <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                       <input 
                          type="text" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                          placeholder="What should we call you?"
                       />
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">Email Address</label>
                     <div className="relative group">
                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                       <input 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                          placeholder="your@email.com"
                       />
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">Address</label>
                     <div className="relative group">
                       <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                       <input 
                          type="text" 
                          value={address} 
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                          placeholder="Your address"
                       />
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">Gender</label>
                       <div className="relative group">
                         <select 
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none"
                         >
                           <option value="select" disabled>Select</option>
                           <option value="male">Male</option>
                           <option value="female">Female</option>
                           <option value="other">Other</option>
                         </select>
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                           <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                         </div>
                       </div>
                     </div>

                     <div className="space-y-2">
                       <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">Password</label>
                       <div className="relative group">
                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                         <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                            placeholder="••••••••"
                         />
                       </div>
                     </div>
                   </div>
               </div>
               
               <div className="space-y-3 pt-2">
                 <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                   {isLoading ? (
                     <>
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Saving...
                     </>
                   ) : (
                     <>
                       <Save size={18} />
                       Save Changes
                     </>
                   )}
                 </button>

                 {onLogout && (
                   <button
                    type="button"
                    onClick={() => {
                      if(confirm('Are you sure you want to sign out?')) {
                        onLogout();
                      }
                    }}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3.5 rounded-xl transition-all border border-red-500/20 flex items-center justify-center gap-2"
                   >
                     <LogOut size={18} />
                     Sign Out
                   </button>
                 )}
               </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;